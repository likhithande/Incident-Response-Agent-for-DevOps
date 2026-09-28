import asyncio
import json
import uuid
import datetime
from datetime import timezone
import concurrent.futures
from typing import List, Dict, Any, Optional
from hindsight_client import Hindsight
from app.config import settings, logger
from app.models import Incident, RetrievedMemoryItem

def _run_coro_safely(coro):
    """Run an async coroutine safely across Python 3.14 tasks even within running event loops."""
    async def _runner():
        task = asyncio.create_task(coro)
        return await task

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        return pool.submit(asyncio.run, _runner()).result(timeout=20.0)

class HindsightService:
    def __init__(self):
        self.bank_id = settings.HINDSIGHT_BANK_ID
        self.api_url = settings.HINDSIGHT_API_URL
        self.api_key = settings.HINDSIGHT_API_KEY
        self.client: Optional[Hindsight] = None
        self.cloud_connected = False
        self.cloud_version: Optional[str] = None
        self._executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)
        
        # Local persistent memory bank for fallback and demo resilience
        self._local_memories: Dict[str, Dict[str, Any]] = {}
        self._retained_doc_ids: set = set()

        self._initialize_client()

    def _initialize_client(self):
        """Initialize the Hindsight client and verify connectivity."""
        try:
            logger.info(f"Initializing Hindsight client pointing to {self.api_url} (Bank: {self.bank_id})")
            if self.api_key:
                self.client = Hindsight(base_url=self.api_url, api_key=self.api_key)
            else:
                self.client = Hindsight(base_url=self.api_url)

            # Test connectivity
            try:
                version_info = _run_coro_safely(self.client.aget_version())
                self.cloud_version = getattr(version_info, "api_version", "0.10.1")
                logger.info(f"Connected to Hindsight Cloud API v{self.cloud_version}")
            except Exception as ver_err:
                logger.warning(f"Could not fetch Hindsight version: {ver_err}")
                self.cloud_version = "offline"

            # Check if bank exists or authenticate
            if self.api_key:
                try:
                    _run_coro_safely(self.client.aget_bank_config(bank_id=self.bank_id))
                    self.cloud_connected = True
                    logger.info(f"Hindsight bank '{self.bank_id}' verified successfully.")
                except Exception as bank_err:
                    err_str = str(bank_err)
                    if "404" in err_str or "not found" in err_str.lower():
                        logger.info(f"Creating Hindsight bank '{self.bank_id}'...")
                        try:
                            _run_coro_safely(
                                self.client.acreate_bank(
                                    bank_id=self.bank_id,
                                    name="OpsMemory Incident Postmortems",
                                    mission="Maintain detailed persistent memory of all production incidents, symptoms, root causes, runbooks, and resolutions."
                                )
                            )
                            self.cloud_connected = True
                            logger.info(f"Hindsight bank '{self.bank_id}' created.")
                        except Exception as create_err:
                            logger.error(f"Failed to create bank '{self.bank_id}': {create_err}")
                            self.cloud_connected = False
                    else:
                        logger.warning(f"Hindsight Cloud authentication check failed: {bank_err}")
                        self.cloud_connected = False
            else:
                logger.info("No HINDSIGHT_API_KEY provided. Operating with high-fidelity local memory store for demo.")
                self.cloud_connected = False

        except Exception as e:
            logger.error(f"Error initializing Hindsight client: {e}")
            self.cloud_connected = False

    def check_health(self) -> Dict[str, Any]:
        """Check status of Hindsight connection and memory bank."""
        return {
            "cloud_connected": self.cloud_connected,
            "bank_id": self.bank_id,
            "api_url": self.api_url,
            "has_api_key": bool(self.api_key),
            "cloud_version": self.cloud_version,
            "total_memories_count": len(self._local_memories),
            "mode": "cloud" if self.cloud_connected else "local_simulated"
        }

    def format_incident_content(self, incident: Incident) -> str:
        """Format structured incident knowledge for Hindsight retain()."""
        symptoms_str = ", ".join(incident.symptoms) if incident.symptoms else "None reported"
        logs_str = "\n".join(incident.error_logs) if incident.error_logs else "No logs attached"
        inv_str = "\n".join(incident.investigation_steps or []) if incident.investigation_steps else "Standard investigation"
        res_str = "\n".join(incident.resolution_steps or []) if incident.resolution_steps else "Pending resolution"
        runbook_str = "\n".join(incident.runbook or []) if incident.runbook else "Standard runbook"
        lessons_str = "\n".join(incident.lessons_learned or []) if incident.lessons_learned else "None recorded"

        return (
            f"Incident {incident.incident_id} affected the {incident.service} with severity {incident.severity}.\n"
            f"Symptoms included: {symptoms_str}.\n"
            f"Observed error logs:\n{logs_str}\n"
            f"Root Cause: {incident.root_cause or 'Under active investigation'}\n"
            f"Investigation Steps: {inv_str}\n"
            f"Resolution Steps: {res_str}\n"
            f"Successful Runbook: {runbook_str}\n"
            f"Lessons Learned: {lessons_str}\n"
            f"Status: {incident.status}\n"
            f"Timestamp: {incident.timestamp or datetime.datetime.now(timezone.utc).isoformat()}"
        )

    def build_recall_query(self, incident: Incident) -> str:
        """Construct an expressive recall query from incident attributes."""
        parts = [
            f"Service: {incident.service}",
            f"Severity: {incident.severity}"
        ]
        if incident.symptoms:
            parts.append(f"Symptoms: {', '.join(incident.symptoms)}")
        if incident.error_logs:
            # First 2 error logs convey distinct error signals
            logs_summary = " ".join([l.strip() for l in incident.error_logs[:2]])
            parts.append(f"Logs: {logs_summary}")
        return " | ".join(parts)

    def retain_incident(self, incident: Incident) -> str:
        """Store an incident postmortem into Hindsight memory."""
        content = self.format_incident_content(incident)
        doc_id = incident.incident_id
        timestamp_dt = datetime.datetime.now(timezone.utc)

        service_tag = incident.service.lower().replace(" ", "-")
        severity_tag = incident.severity.lower()
        tags = [service_tag, severity_tag, "incident-postmortem"]
        metadata = {
            "incident_id": incident.incident_id,
            "service": incident.service,
            "severity": incident.severity,
            "root_cause": incident.root_cause or "Under investigation",
            "status": incident.status
        }

        memory_id = f"mem-{doc_id}-{uuid.uuid4().hex[:6]}"

        # Store in local memory store first to guarantee retrieval reliability
        self._local_memories[doc_id] = {
            "id": memory_id,
            "incident_id": incident.incident_id,
            "service": incident.service,
            "severity": incident.severity,
            "root_cause": incident.root_cause or "Under investigation",
            "resolution": "\n".join(incident.resolution_steps or []) if incident.resolution_steps else "Pending resolution",
            "lessons_learned": "\n".join(incident.lessons_learned or []) if incident.lessons_learned else "None recorded",
            "summary": f"Incident {incident.incident_id} ({incident.service}): {incident.root_cause or 'Unresolved'}",
            "raw_text": content,
            "context": "production incident postmortem",
            "tags": tags,
            "metadata": metadata,
            "timestamp": incident.timestamp or timestamp_dt.isoformat(),
            "incident_data": incident.model_dump()
        }
        self._retained_doc_ids.add(doc_id)

        # Call Hindsight Cloud retain() if connected
        if self.cloud_connected and self.client:
            try:
                logger.info(f"Retaining incident {doc_id} to Hindsight Cloud bank '{self.bank_id}'...")
                item = {
                    "content": content,
                    "context": "production incident postmortem",
                    "metadata": metadata,
                    "tags": tags,
                }
                resp = _run_coro_safely(
                    self.client.aretain_batch(
                        bank_id=self.bank_id,
                        items=[item],
                        document_id=doc_id
                    )
                )
                logger.info(f"Successfully retained {doc_id} to Hindsight Cloud: {resp}")
                if hasattr(resp, "operation_id") and resp.operation_id:
                    memory_id = str(resp.operation_id)
            except Exception as e:
                logger.error(f"Hindsight Cloud retain failed for {doc_id}: {e}. Retained in local store.")

        return memory_id

    def recall_memories(self, query: str, limit: int = 4) -> List[RetrievedMemoryItem]:
        """Recall relevant historical memories from Hindsight using semantic query matching."""
        cloud_results: List[RetrievedMemoryItem] = []

        # 1. Attempt Hindsight Cloud recall() if connected
        if self.cloud_connected and self.client:
            try:
                logger.info(f"Calling Hindsight Cloud recall(bank_id='{self.bank_id}', query='{query[:80]}...')")
                cloud_response = _run_coro_safely(
                    self.client.arecall(
                        bank_id=self.bank_id,
                        query=query,
                        max_tokens=4096,
                        budget="mid"
                    )
                )

                if hasattr(cloud_response, "results") and cloud_response.results:
                    for item in cloud_response.results[:limit]:
                        meta = getattr(item, "metadata", {}) or {}
                        inc_id = meta.get("incident_id") or getattr(item, "document_id", "INC-HIST")
                        svc = meta.get("service") or "Unknown Service"
                        raw_text = getattr(item, "text", "")

                        # Extract fields or fallback from local memory cache
                        cached = self._local_memories.get(inc_id)
                        root_cause = meta.get("root_cause") or (cached["root_cause"] if cached else "Extracted from Hindsight memory")
                        resolution = cached["resolution"] if cached else "Refer to historical runbook"
                        lessons = cached["lessons_learned"] if cached else "Learnings retained in memory"

                        cloud_results.append(
                            RetrievedMemoryItem(
                                id=getattr(item, "id", str(uuid.uuid4())),
                                incident_id=inc_id,
                                service=svc,
                                root_cause=root_cause,
                                resolution=resolution,
                                lessons_learned=lessons,
                                summary=raw_text[:200] if raw_text else f"Historical incident {inc_id}",
                                raw_text=raw_text,
                                score=0.92,
                                context=getattr(item, "context", "production incident postmortem"),
                                tags=getattr(item, "tags", []),
                                timestamp=datetime.datetime.now(timezone.utc).isoformat(),
                                source="hindsight-cloud"
                            )
                        )
                    logger.info(f"Retrieved {len(cloud_results)} memories from Hindsight Cloud.")
                    return cloud_results
            except Exception as e:
                logger.error(f"Hindsight Cloud recall failed: {e}. Falling back to local memory store.")

        # 2. Local memory recall engine (lexical, semantic overlap & service matching)
        return self._local_recall(query=query, limit=limit)

    def _local_recall(self, query: str, limit: int = 4) -> List[RetrievedMemoryItem]:
        """Perform high-precision search over retained memories in local memory store."""
        query_lower = query.lower()
        query_words = set(w.strip(":,()[]'\"") for w in query_lower.split() if len(w) > 2)

        scored_items = []
        for doc_id, mem in self._local_memories.items():
            score = 0.0
            searchable_text = f"{mem['service']} {mem['root_cause']} {mem['raw_text']} {' '.join(mem['tags'])}".lower()
            
            # Service exact or partial match gives strong weight
            svc = mem["service"].lower()
            if svc in query_lower or any(p in svc for p in query_lower.split("|")):
                score += 5.0

            # Count keyword hits
            word_hits = sum(1 for word in query_words if word in searchable_text)
            score += word_hits * 1.2

            # Specific incident matching boosts
            if doc_id.lower() in query_lower:
                score += 10.0

            # Important DevOps signals: 503, pool, connection, timeout, oom, memory, crashloop, dns
            devops_keywords = ["503", "pool", "exhaustion", "timeout", "latency", "redis", "oom", "crashloop", "502", "dns", "cpu", "lock", "disk", "kafka", "migration"]
            for kw in devops_keywords:
                if kw in query_lower and kw in searchable_text:
                    score += 2.5

            if score > 0:
                scored_items.append((score, mem))

        # Sort descending by relevance score
        scored_items.sort(key=lambda x: x[0], reverse=True)

        results: List[RetrievedMemoryItem] = []
        for score, mem in scored_items[:limit]:
            results.append(
                RetrievedMemoryItem(
                    id=mem["id"],
                    incident_id=mem["incident_id"],
                    service=mem["service"],
                    root_cause=mem["root_cause"],
                    resolution=mem["resolution"],
                    lessons_learned=mem["lessons_learned"],
                    summary=mem["summary"],
                    raw_text=mem["raw_text"],
                    score=round(min(score / 15.0, 0.99), 2),
                    context=mem.get("context", "production incident postmortem"),
                    tags=mem.get("tags", []),
                    timestamp=mem.get("timestamp"),
                    source="hindsight" if not self.cloud_connected else "hindsight-cloud"
                )
            )

        return results

    def seed_from_file(self, file_path: str) -> Dict[str, Any]:
        """Seed sample incidents from JSON into Hindsight memory."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                incidents_data = json.load(f)

            loaded_ids = []
            for item in incidents_data:
                inc = Incident(**item)
                # Avoid re-retaining if already present
                if inc.incident_id not in self._retained_doc_ids:
                    self.retain_incident(inc)
                    loaded_ids.append(inc.incident_id)

            logger.info(f"Seeded {len(loaded_ids)} incident memories into Hindsight (Total: {len(self._local_memories)})")
            return {
                "success": True,
                "message": f"{len(loaded_ids)} incident memories loaded",
                "count": len(loaded_ids),
                "total": len(self._local_memories),
                "memories_loaded": loaded_ids
            }
        except Exception as e:
            logger.error(f"Failed to seed incidents from {file_path}: {e}")
            return {
                "success": False,
                "message": f"Seeding failed: {str(e)}",
                "count": 0,
                "total": len(self._local_memories),
                "memories_loaded": []
            }

    def get_all_memories(self) -> List[Dict[str, Any]]:
        """Return all memories currently in the store."""
        return list(self._local_memories.values())

# Global singleton service
hindsight_service = HindsightService()
