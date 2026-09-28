import time
import json
import datetime
from datetime import timezone
from typing import List, Dict, Any, Optional
from app.config import settings, logger
from app.models import (
    Incident,
    IncidentAnalysisRequest,
    IncidentAnalysisResponse,
    IncidentResolutionRequest,
    IncidentResolutionResponse,
    RetrievedMemoryItem
)
from app.hindsight_service import hindsight_service
from app.llm_service import llm_service

class IncidentAgent:
    def __init__(self):
        self.incidents_store: Dict[str, Incident] = {}
        self.timeline_events: List[Dict[str, Any]] = []
        self._load_initial_incidents()

    def _load_initial_incidents(self):
        """Load sample incidents into memory."""
        try:
            if settings.SAMPLE_DATA_PATH.exists():
                with open(settings.SAMPLE_DATA_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        inc = Incident(**item)
                        self.incidents_store[inc.incident_id] = inc
                logger.info(f"Loaded {len(self.incidents_store)} incidents into IncidentAgent store.")
        except Exception as e:
            logger.error(f"Error loading initial incidents: {e}")

    def list_incidents(self) -> List[Incident]:
        """Return list of all incidents."""
        return list(self.incidents_store.values())

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        """Fetch incident by ID."""
        return self.incidents_store.get(incident_id)

    def create_incident(self, incident: Incident) -> Incident:
        """Create or register a new incident."""
        if not incident.timestamp:
            incident.timestamp = datetime.datetime.now(timezone.utc).isoformat()
        self.incidents_store[incident.incident_id] = incident
        
        self.record_timeline_event(
            event_type="incident_created",
            incident_id=incident.incident_id,
            description=f"New incident {incident.incident_id} registered on {incident.service} (Severity: {incident.severity})"
        )
        return incident

    def record_timeline_event(self, event_type: str, incident_id: str, description: str, details: Optional[Dict[str, Any]] = None):
        """Record an event in the memory timeline."""
        event = {
            "timestamp": datetime.datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "incident_id": incident_id,
            "description": description,
            "details": details or {}
        }
        self.timeline_events.insert(0, event)
        # Keep last 50 events
        if len(self.timeline_events) > 50:
            self.timeline_events.pop()

    def get_timeline(self) -> List[Dict[str, Any]]:
        """Return global memory timeline."""
        return self.timeline_events

    def analyze(self, request: IncidentAnalysisRequest) -> IncidentAnalysisResponse:
        """Execute the complete multi-step Incident Response Agent analysis."""
        start_time = time.time()
        incident = request.incident
        with_memory = request.with_memory

        # Ensure incident is registered in store
        self.incidents_store[incident.incident_id] = incident

        logger.info(f"Agent analyzing incident {incident.incident_id} ({incident.service}) [with_memory={with_memory}]")

        retrieved_memories: List[RetrievedMemoryItem] = []
        recall_query = ""

        if with_memory:
            # STEP 1 & 2: Understand incident & build meaningful recall query for Hindsight
            recall_query = hindsight_service.build_recall_query(incident)
            logger.info(f"Executing Hindsight recall with query: '{recall_query}'")

            # Retrieve relevant historical memories from Hindsight
            retrieved_memories = hindsight_service.recall_memories(query=recall_query, limit=4)
            
            self.record_timeline_event(
                event_type="memory_retrieved",
                incident_id=incident.incident_id,
                description=f"Recalled {len(retrieved_memories)} historical postmortem memories from Hindsight for {incident.service}",
                details={
                    "recall_query": recall_query,
                    "recalled_incident_ids": [m.incident_id for m in retrieved_memories]
                }
            )
        else:
            logger.info("Stateless mode: Skipping Hindsight memory retrieval.")
            self.record_timeline_event(
                event_type="stateless_analysis",
                incident_id=incident.incident_id,
                description=f"Stateless analysis invoked without Hindsight memory retrieval"
            )

        # STEPS 3-7: Compare current incident with memories, identify root cause, generate investigation & resolution
        analysis = llm_service.analyze_incident(
            incident=incident,
            retrieved_memories=retrieved_memories,
            with_memory=with_memory
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        self.record_timeline_event(
            event_type="recommendation_generated",
            incident_id=incident.incident_id,
            description=f"Generated {'contextual' if with_memory else 'generic'} recommendation with {analysis.confidence} confidence in {elapsed_ms}ms",
            details={
                "likely_root_cause": analysis.likely_root_cause,
                "confidence": analysis.confidence,
                "influenced_by": [ctx.incident_id for ctx in analysis.historical_context]
            }
        )

        health = hindsight_service.check_health()
        memory_engine = "Hindsight Cloud API" if health["cloud_connected"] else "Hindsight Local Memory Engine"
        memory_status = "Connected to Cloud" if health["cloud_connected"] else "Operational (Local Persistent Store)"

        return IncidentAnalysisResponse(
            with_memory=with_memory,
            analysis=analysis,
            retrieved_memories=retrieved_memories,
            recall_query_used=recall_query,
            memory_engine=memory_engine,
            memory_status=memory_status,
            processing_time_ms=elapsed_ms
        )

    def resolve(self, request: IncidentResolutionRequest) -> IncidentResolutionResponse:
        """STEPS 8 & 9: Record actual resolution and retain knowledge into Hindsight."""
        inc = self.incidents_store.get(request.incident_id)
        if not inc:
            # Create a placeholder incident if not found
            inc = Incident(
                incident_id=request.incident_id,
                service="Production Service",
                severity="HIGH",
                symptoms=["Reported operational disruption"],
                error_logs=[]
            )

        # Update incident with resolution fields
        inc.root_cause = request.actual_root_cause
        inc.resolution_steps = [s.strip() for s in request.resolution.split("\n") if s.strip()]
        inc.lessons_learned = [s.strip() for s in request.lessons_learned.split("\n") if s.strip()]
        if request.outcome:
            inc.lessons_learned.append(f"Outcome: {request.outcome}")
        inc.status = "RESOLVED"
        self.incidents_store[inc.incident_id] = inc

        # STEP 9: Retain into Hindsight persistent memory
        memory_id = hindsight_service.retain_incident(inc)

        self.record_timeline_event(
            event_type="incident_resolved",
            incident_id=inc.incident_id,
            description=f"Incident {inc.incident_id} marked as RESOLVED",
            details={"root_cause": request.actual_root_cause}
        )

        self.record_timeline_event(
            event_type="resolution_retained",
            incident_id=inc.incident_id,
            description=f"Resolution knowledge retained into Hindsight bank '{settings.HINDSIGHT_BANK_ID}' (Memory ID: {memory_id})",
            details={
                "memory_id": memory_id,
                "service": inc.service,
                "root_cause": request.actual_root_cause,
                "resolution": request.resolution
            }
        )

        logger.info(f"Resolution for {inc.incident_id} retained in Hindsight. Future incidents will recall this knowledge.")

        return IncidentResolutionResponse(
            success=True,
            message=f"Incident {inc.incident_id} successfully resolved and retained into Hindsight persistent memory.",
            retained_memory_id=memory_id,
            incident=inc
        )

# Global singleton agent
incident_agent = IncidentAgent()
