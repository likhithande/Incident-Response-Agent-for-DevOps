import json
from typing import List, Dict, Any, Optional
import groq
from app.config import settings, logger
from app.models import Incident, RetrievedMemoryItem, IncidentAnalysis, HistoricalContextItem

class LLMService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.client: Optional[groq.Groq] = None
        self._init_client()

    def _init_client(self):
        """Initialize the Groq client if an API key is available."""
        if self.api_key:
            try:
                self.client = groq.Groq(api_key=self.api_key)
                logger.info(f"Groq LLM client initialized with model '{self.model}'")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self.client = None
        else:
            logger.info("No GROQ_API_KEY set. Operating in high-precision simulated LLM fallback mode.")
            self.client = None

    def update_config(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """Update Groq configuration dynamically."""
        if api_key:
            self.api_key = api_key
        if model:
            self.model = model
        self._init_client()

    def analyze_incident(
        self,
        incident: Incident,
        retrieved_memories: List[RetrievedMemoryItem],
        with_memory: bool = True
    ) -> IncidentAnalysis:
        """Analyze an incident using either Groq LLM or high-fidelity deterministic engine."""
        
        # Try real Groq API if client is ready
        if self.client and self.api_key:
            try:
                return self._call_groq(incident, retrieved_memories, with_memory)
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}. Falling back to deterministic analysis engine.")
                return self._fallback_analysis(incident, retrieved_memories, with_memory)
        
        # Fallback analysis
        return self._fallback_analysis(incident, retrieved_memories, with_memory)

    def _call_groq(
        self,
        incident: Incident,
        retrieved_memories: List[RetrievedMemoryItem],
        with_memory: bool
    ) -> IncidentAnalysis:
        """Call Groq API with structured JSON output."""
        
        system_prompt = (
            "You are OpsMemory, an AI Incident Response Agent designed for DevOps and SRE teams.\n"
            "Your job is to analyze production incidents and formulate structured, evidence-based recommendations.\n"
            "Return ONLY a valid JSON object matching the requested schema. No markdown formatting around the JSON.\n"
            "The JSON must have the following keys:\n"
            "{\n"
            '  "summary": string,\n'
            '  "likely_root_cause": string,\n'
            '  "confidence": "HIGH" | "MEDIUM" | "LOW",\n'
            '  "recommended_investigation": string[],\n'
            '  "recommended_resolution": string[],\n'
            '  "warnings": string[],\n'
            '  "historical_context": [{"incident_id": string, "service": string, "relevance_explanation": string, "key_takeaways": string}],\n'
            '  "reasoning_summary": string\n'
            "}\n"
            "RULES:\n"
            "- Do NOT expose hidden chain-of-thought.\n"
            "- Clearly distinguish current observations from historical evidence.\n"
            "- Do not claim certainty when evidence is insufficient.\n"
        )

        if with_memory:
            system_prompt += (
                "- You have access to persistent Hindsight memories from past incidents.\n"
                "- Correlate the current symptoms and logs with these historical memories.\n"
                "- If a historical memory matches (e.g. INC-001), explicitly cite it in 'historical_context' and use its proven runbook and resolution to provide specific recommendations.\n"
            )
        else:
            system_prompt += (
                "- You are running in STATELESS mode WITHOUT persistent memory.\n"
                "- You have NO knowledge of previous incidents or past postmortems.\n"
                "- Provide only general, standard troubleshooting steps (e.g. check logs, inspect CPU/memory, check database connectivity).\n"
            )

        # Build prompt payload
        incident_payload = {
            "incident_id": incident.incident_id,
            "service": incident.service,
            "severity": incident.severity,
            "symptoms": incident.symptoms,
            "error_logs": incident.error_logs,
            "status": incident.status
        }

        user_content = f"CURRENT INCIDENT:\n{json.dumps(incident_payload, indent=2)}\n\n"

        if with_memory and retrieved_memories:
            memories_payload = [
                {
                    "memory_id": m.id,
                    "incident_id": m.incident_id,
                    "service": m.service,
                    "root_cause": m.root_cause,
                    "resolution": m.resolution,
                    "lessons_learned": m.lessons_learned,
                    "relevance_score": m.score
                }
                for m in retrieved_memories
            ]
            user_content += f"RETRIEVED HINDSIGHT HISTORICAL MEMORIES:\n{json.dumps(memories_payload, indent=2)}\n"
        elif with_memory:
            user_content += "RETRIEVED HINDSIGHT HISTORICAL MEMORIES: No historical incidents matched.\n"
        else:
            user_content += "MEMORY STATUS: Disabled (Stateless analysis).\n"

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=1500
        )

        content = response.choices[0].message.content
        data = json.loads(content)
        return IncidentAnalysis(**data)

    def _fallback_analysis(
        self,
        incident: Incident,
        retrieved_memories: List[RetrievedMemoryItem],
        with_memory: bool
    ) -> IncidentAnalysis:
        """Deterministic, production-grade analysis engine for demo resilience and comparison."""
        
        # 1. WITHOUT MEMORY: Standard generic advice
        if not with_memory:
            return IncidentAnalysis(
                summary=f"Incident {incident.incident_id} detected on {incident.service} with severity {incident.severity}. Running in stateless mode without past incident memory.",
                likely_root_cause=f"Potential application degradation, unhandled exception, or upstream dependency failure in {incident.service}.",
                confidence="LOW",
                recommended_investigation=[
                    "Check general application logs in the centralized logging tool.",
                    "Verify connectivity between the application server and its database or cache.",
                    "Inspect CPU, RAM, and disk utilization on the host or container instances.",
                    "Review recent deployment history and configuration changes in git.",
                    "Check network latency and firewall rules between microservices."
                ],
                recommended_resolution=[
                    "Restart the affected service instances to clear transient thread locks or leaks.",
                    "If errors persist, consider rolling back the most recent release.",
                    "Contact the on-call engineer or team lead for further manual triage."
                ],
                warnings=[
                    "Analysis generated WITHOUT Hindsight persistent memory.",
                    "No historical postmortems or runbooks were consulted.",
                    "Blind service restarts may temporarily mask the underlying root cause."
                ],
                historical_context=[],
                reasoning_summary="Based solely on surface-level symptoms and error strings without historical context. Recommendations are general best practices for web service triage."
            )

        # 2. WITH HINDSIGHT MEMORY: Contextual analysis correlated with retrieved memories
        top_mem = retrieved_memories[0] if retrieved_memories else None

        # Scenario: Payment API DB Connection Pool Exhaustion (INC-001)
        if top_mem and ("payment" in incident.service.lower() or "connection pool" in top_mem.root_cause.lower() or "503" in " ".join(incident.symptoms)):
            return IncidentAnalysis(
                summary=(
                    f"Current incident on {incident.service} exhibits HTTP 503 errors and database timeouts, "
                    f"matching the historical failure pattern documented in {top_mem.incident_id}."
                ),
                likely_root_cause=(
                    "Database connection pool exhaustion under elevated traffic, where all pool connections "
                    "are occupied and incoming threads exceed the connection acquisition timeout limit."
                ),
                confidence="HIGH",
                recommended_investigation=[
                    "Check active database connection count vs max configured pool size in Payment API metrics.",
                    "Query pg_stat_activity on PostgreSQL/RDS to verify whether the database server has capacity or if connections are idle-in-transaction.",
                    "Inspect checkout API request volume (RPS) to confirm if a traffic burst exceeded pool dimensioning.",
                    "Inspect HikariCP / DB pool metrics for 'pending_threads' and 'connection_wait_time_ms'."
                ],
                recommended_resolution=[
                    "Verify database CPU and IOPS utilization; if healthy (<50%), increase max connection pool capacity (e.g. from 50 to 150) in service configuration.",
                    "Deploy updated configuration and perform a zero-downtime rolling restart of Payment API pods.",
                    "Monitor 5xx error rate and pool saturation in Datadog/Prometheus until error rate drops below 0.01%."
                ],
                warnings=[
                    "Do NOT arbitrarily increase pool size beyond database server max_connections limit.",
                    "Ensure database server CPU and RAM headroom are confirmed before scaling client pool sizes.",
                    "Consider enabling a circuit breaker on checkout requests to prevent cascading thread starvation."
                ],
                historical_context=[
                    HistoricalContextItem(
                        incident_id=top_mem.incident_id,
                        service=top_mem.service,
                        relevance_explanation=(
                            f"Retrieved from Hindsight memory bank '{settings.HINDSIGHT_BANK_ID}'. "
                            f"Historical incident {top_mem.incident_id} presented identical HTTP 503 errors, high P99 latency, "
                            "and database connection acquisition timeouts caused by pool saturation."
                        ),
                        key_takeaways=(
                            f"Historical resolution: {top_mem.resolution} "
                            f"Lesson learned: {top_mem.lessons_learned}"
                        )
                    )
                ],
                reasoning_summary=(
                    f"Current observations (HTTP 503, database timeout) closely mirror historical incident {top_mem.incident_id}. "
                    "Historical evidence indicates the database instance itself was healthy while client pool threads were saturated. "
                    "Recommendation directly applies the verified runbook from INC-001 rather than generic blind restarts."
                )
            )

        # Generic scenario when other memories match
        hist_contexts = []
        for mem in retrieved_memories[:2]:
            hist_contexts.append(
                HistoricalContextItem(
                    incident_id=mem.incident_id,
                    service=mem.service,
                    relevance_explanation=f"Correlated via Hindsight memory bank. Symptoms and error logs share high semantic affinity with {mem.incident_id}.",
                    key_takeaways=f"Historical root cause was: '{mem.root_cause}'. Resolution applied: '{mem.resolution[:120]}...'"
                )
            )

        return IncidentAnalysis(
            summary=f"Incident {incident.incident_id} on {incident.service} analyzed against Hindsight persistent memory. Found {len(retrieved_memories)} relevant past postmortems.",
            likely_root_cause=f"Probable recurrence of pattern observed in {top_mem.incident_id if top_mem else 'historical records'}: {top_mem.root_cause if top_mem else 'Resource exhaustion or configuration mismatch'}.",
            confidence="MEDIUM" if top_mem else "LOW",
            recommended_investigation=[
                f"Verify parameters identified in past incident {top_mem.incident_id if top_mem else 'runbooks'}.",
                "Check system metrics specific to the identified subsystem.",
                "Compare current environment telemetry against the postmortem incident timeline."
            ],
            recommended_resolution=[
                f"Apply proven resolution from {top_mem.incident_id if top_mem else 'historical runbook'}: {top_mem.resolution[:140] if top_mem else 'Standard fix'}.",
                "Perform rolling restart of affected components if configuration change is applied.",
                "Verify service telemetry returns to baseline."
            ],
            warnings=[
                f"Recommendation guided by historical postmortem {top_mem.incident_id if top_mem else 'records'}.",
                "Confirm environment state matches historical preconditions before applying destructive changes."
            ],
            historical_context=hist_contexts,
            reasoning_summary=f"Retrieved memories from Hindsight provided specific root cause hypotheses and proven operational runbooks, reducing triage time compared to blind exploration."
        )

# Global singleton
llm_service = LLMService()
