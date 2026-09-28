from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Incident(BaseModel):
    incident_id: str = Field(..., description="Unique identifier for the incident, e.g. INC-001")
    service: str = Field(..., description="Target service or microservice name")
    severity: str = Field("HIGH", description="Severity level: CRITICAL, HIGH, MEDIUM, LOW")
    timestamp: Optional[str] = Field(None, description="ISO timestamp of when the incident occurred")
    symptoms: List[str] = Field(default_factory=list, description="Observed operational symptoms")
    error_logs: List[str] = Field(default_factory=list, description="Relevant error logs and stack traces")
    root_cause: Optional[str] = Field(None, description="Identified root cause (for resolved incidents)")
    investigation_steps: Optional[List[str]] = Field(default_factory=list, description="Steps taken during triage")
    resolution_steps: Optional[List[str]] = Field(default_factory=list, description="Steps executed to fix")
    runbook: Optional[List[str]] = Field(default_factory=list, description="Operational runbook procedure")
    lessons_learned: Optional[List[str]] = Field(default_factory=list, description="Postmortem preventative learnings")
    status: str = Field("ACTIVE", description="Status: ACTIVE, INVESTIGATING, RESOLVED")

class HistoricalContextItem(BaseModel):
    incident_id: str = Field(..., description="Incident ID referenced")
    service: str = Field(..., description="Service of the referenced historical incident")
    relevance_explanation: str = Field(..., description="Explanation of why this historical memory applies")
    key_takeaways: str = Field(..., description="Resolution or root cause insight applied to current incident")

class IncidentAnalysis(BaseModel):
    summary: str = Field(..., description="Executive summary of the incident assessment")
    likely_root_cause: str = Field(..., description="Most probable root cause based on evidence")
    confidence: str = Field(..., description="Confidence level: HIGH, MEDIUM, LOW")
    recommended_investigation: List[str] = Field(default_factory=list, description="Step-by-step diagnostic actions")
    recommended_resolution: List[str] = Field(default_factory=list, description="Actionable remediation steps")
    warnings: List[str] = Field(default_factory=list, description="Operational cautions and risks")
    historical_context: List[HistoricalContextItem] = Field(default_factory=list, description="References to past memories that influenced the recommendation")
    reasoning_summary: str = Field(..., description="Evidence-based reasoning summary distinguishing observations from historical facts")

class RetrievedMemoryItem(BaseModel):
    id: str = Field(..., description="Hindsight memory item ID")
    incident_id: str = Field(..., description="Incident ID associated with this memory")
    service: str = Field(..., description="Service name")
    root_cause: str = Field(..., description="Root cause preserved in memory")
    resolution: str = Field(..., description="Resolution steps preserved in memory")
    lessons_learned: str = Field(..., description="Lessons learned from postmortem")
    summary: str = Field(..., description="Synthesized summary of the memory")
    raw_text: str = Field(..., description="Full text retained in Hindsight")
    score: Optional[float] = Field(None, description="Retrieval relevance score if available")
    context: Optional[str] = Field(None, description="Context tag used during retain")
    tags: Optional[List[str]] = Field(default_factory=list, description="Tags associated with memory")
    timestamp: Optional[str] = Field(None, description="Timestamp of memory creation")
    source: str = Field("hindsight", description="Memory provider source: hindsight-cloud or local-bank")

class IncidentAnalysisRequest(BaseModel):
    incident: Incident
    with_memory: bool = Field(True, description="Toggle between Hindsight persistent memory and stateless LLM")

class IncidentAnalysisResponse(BaseModel):
    with_memory: bool
    analysis: IncidentAnalysis
    retrieved_memories: List[RetrievedMemoryItem]
    recall_query_used: str
    memory_engine: str
    memory_status: str
    processing_time_ms: float

class IncidentResolutionRequest(BaseModel):
    incident_id: str
    actual_root_cause: str
    resolution: str
    outcome: str
    lessons_learned: str

class IncidentResolutionResponse(BaseModel):
    success: bool
    message: str
    retained_memory_id: Optional[str] = None
    incident: Incident

class MemorySeedResponse(BaseModel):
    success: bool
    message: str
    count: int
    memories_loaded: List[str]

class MemoryRecallRequest(BaseModel):
    query: str
    service: Optional[str] = None
    limit: Optional[int] = 5

class MemoryRecallResponse(BaseModel):
    query: str
    results: List[RetrievedMemoryItem]
    count: int

class MemoryStatusResponse(BaseModel):
    cloud_connected: bool
    bank_id: str
    api_url: str
    has_api_key: bool
    groq_configured: bool
    groq_model: str
    retained_count: int
    mode: str
    version: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    hindsight_status: str
    groq_status: str
    memory_bank: str
    total_incidents: int
    timestamp: str

class ApiKeyUpdateRequest(BaseModel):
    hindsight_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    groq_model: Optional[str] = None

class RunbookExecuteRequest(BaseModel):
    incident_id: str
    step_title: str
    step_type: str = Field("investigation", description="investigation or resolution")
    service: Optional[str] = None

class RunbookExecuteResponse(BaseModel):
    success: bool
    step_title: str
    command_executed: str
    terminal_output: str
    duration_ms: int
    status: str
    safety_checks: str
    evidence_found: Optional[str] = None

class TopologyNode(BaseModel):
    id: str
    name: str
    type: str  # gateway, service, database, broker, external
    status: str  # healthy, degraded, critical
    latency_ms: int
    error_rate: float
    description: str

class TopologyEdge(BaseModel):
    source: str
    target: str
    protocol: str
    health: str

class TopologyResponse(BaseModel):
    nodes: List[TopologyNode]
    edges: List[TopologyEdge]
    impacted_services: List[str]
    blast_radius_score: int

class ServiceMetricItem(BaseModel):
    service: str
    incidents_count: int
    mttr_mins: int
    status: str
    sla_percentage: float

class AnalyticsResponse(BaseModel):
    total_incidents: int
    resolved_incidents: int
    mttr_without_memory_min: int
    mttr_with_memory_min: int
    mttr_reduction_pct: int
    downtime_saved_hours: float
    cost_saved_usd: int
    memory_attribution_rate_pct: float
    recurring_preventions_count: int
    services: List[ServiceMetricItem]

class ChaosScenario(BaseModel):
    id: str
    title: str
    service: str
    severity: str
    symptoms: List[str]
    error_logs: List[str]
    description: str
    historical_link: str

# -------------------------------------------------------------
# Neural Memory Graph Models
# -------------------------------------------------------------

class MemoryGraphNode(BaseModel):
    id: str
    label: str
    type: str  # 'incident', 'cluster', 'service', 'learning'
    cluster: str
    service: str
    severity: Optional[str] = None
    root_cause: Optional[str] = None
    relevance: float
    x: float
    y: float

class MemoryGraphEdge(BaseModel):
    source: str
    target: str
    weight: float
    relation: str

class MemoryGraphResponse(BaseModel):
    nodes: List[MemoryGraphNode]
    edges: List[MemoryGraphEdge]
    clusters: List[str]
    total_memories_indexed: int

# -------------------------------------------------------------
# Autonomous SRE Pilot & Canary Rollout Models
# -------------------------------------------------------------

class CanaryStage(BaseModel):
    stage_number: int
    name: str
    traffic_percentage: int
    duration_sec: int
    status: str  # 'pending', 'active', 'passed', 'failed'
    p99_latency_ms: int
    error_rate: float
    health_verdict: str

class CanaryRolloutState(BaseModel):
    incident_id: str
    service: str
    active_stage: int
    total_stages: int
    current_traffic_percent: int
    overall_status: str  # 'STANDBY', 'CANARY_RUNNING', 'CANARY_VERIFIED', 'FLEET_PROMOTED', 'ROLLED_BACK'
    stages: List[CanaryStage]
    rollback_ready: bool
    automated_safety_checks: List[str]
    telemetry_summary: str

class CanaryActionRequest(BaseModel):
    incident_id: str
    action: str  # 'start', 'advance', 'rollback'
    stage: Optional[int] = None

# -------------------------------------------------------------
# Counterfactual Hypothesis Explorer Models
# -------------------------------------------------------------

class HypothesisItem(BaseModel):
    id: str
    title: str
    probability_score: int
    status: str  # 'CONFIRMED', 'UNLIKELY', 'REJECTED'
    hindsight_precedent: str
    supporting_signals: List[str]
    contradicting_signals: List[str]
    recommendation: str

class HypothesisEvaluationResponse(BaseModel):
    incident_id: str
    primary_hypothesis_id: str
    hypotheses: List[HypothesisItem]
    confidence_spread: str
    reasoning: str

# -------------------------------------------------------------
# War Room Live AI Agent Chat Models
# -------------------------------------------------------------

class WarRoomChatMessage(BaseModel):
    id: str
    sender: str  # 'SRE On-Call', 'OpsMemory Agent', 'Monitoring Bot'
    sender_type: str  # 'human', 'agent', 'system'
    timestamp: str
    message: str
    cited_incident_id: Optional[str] = None
    badge: Optional[str] = None

class WarRoomChatRequest(BaseModel):
    incident_id: str
    user_message: str

class WarRoomChatResponse(BaseModel):
    reply: str
    cited_incident_id: Optional[str] = None
    suggested_action: Optional[str] = None
    retrieved_memory_count: int

# -------------------------------------------------------------
# Autonomous SRE Multi-Agent Swarm Models
# -------------------------------------------------------------

class SwarmAgentMessage(BaseModel):
    id: str
    agent_name: str
    agent_role: str
    agent_avatar: str
    phase: str
    thought_trace: str
    output_message: str
    status: str  # 'THINKING', 'DISPATCHED', 'VERIFIED'
    evidence_tag: Optional[str] = None

class SwarmTriageResponse(BaseModel):
    incident_id: str
    service: str
    swarm_status: str
    overall_confidence: int
    agents_involved: int
    messages: List[SwarmAgentMessage]
    consensus_root_cause: str
    consensus_action: str
    hindsight_memory_cited: str

# -------------------------------------------------------------
# Proactive AI Sentinel & Anomaly Radar Models
# -------------------------------------------------------------

class SentinelAnomalyItem(BaseModel):
    id: str
    service: str
    metric_target: str
    severity: str
    current_value: str
    projected_outage_time: str
    hindsight_pattern_match: str
    confidence_score: int
    preventative_action: str
    status: str  # 'MONITORING', 'PREDICTED', 'AUTO_SCALED'

class SentinelResponse(BaseModel):
    total_anomalies: int
    monitored_services: int
    prevention_rate_pct: float
    active_threats: List[SentinelAnomalyItem]

# -------------------------------------------------------------
# Enterprise Postmortem & Five-Whys RCA Report Models
# -------------------------------------------------------------

class FiveWhysItem(BaseModel):
    level: int
    question: str
    answer: str

class PostmortemReportResponse(BaseModel):
    incident_id: str
    service: str
    title: str
    author: str
    status: str
    duration_min: int
    mttr_saved_min: int
    cost_saved_usd: int
    executive_summary: str
    root_cause_analysis: str
    five_whys: List[FiveWhysItem]
    timeline_summary: List[str]
    hindsight_knowledge_delta: str
    markdown_content: str



