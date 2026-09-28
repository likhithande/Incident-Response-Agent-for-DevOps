export interface Incident {
  incident_id: string;
  service: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp?: string;
  symptoms: string[];
  error_logs: string[];
  root_cause?: string;
  investigation_steps?: string[];
  resolution_steps?: string[];
  runbook?: string[];
  lessons_learned?: string[];
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
}

export interface HistoricalContextItem {
  incident_id: string;
  service: string;
  relevance_explanation: string;
  key_takeaways: string;
}

export interface IncidentAnalysis {
  summary: string;
  likely_root_cause: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_investigation: string[];
  recommended_resolution: string[];
  warnings: string[];
  historical_context: HistoricalContextItem[];
  reasoning_summary: string;
}

export interface RetrievedMemoryItem {
  id: string;
  incident_id: string;
  service: string;
  root_cause: string;
  resolution: string;
  lessons_learned: string;
  summary: string;
  raw_text: string;
  score?: number;
  context?: string;
  tags?: string[];
  timestamp?: string;
  source: string;
}

export interface IncidentAnalysisResponse {
  with_memory: boolean;
  analysis: IncidentAnalysis;
  retrieved_memories: RetrievedMemoryItem[];
  recall_query_used: string;
  memory_engine: string;
  memory_status: string;
  processing_time_ms: number;
}

export interface IncidentResolutionRequest {
  incident_id: string;
  actual_root_cause: string;
  resolution: string;
  outcome: string;
  lessons_learned: string;
}

export interface IncidentResolutionResponse {
  success: boolean;
  message: string;
  retained_memory_id?: string;
  incident: Incident;
}

export interface MemorySeedResponse {
  success: boolean;
  message: string;
  count: number;
  memories_loaded: string[];
}

export interface MemoryStatusResponse {
  cloud_connected: boolean;
  bank_id: string;
  api_url: string;
  has_api_key: boolean;
  groq_configured: boolean;
  groq_model: string;
  retained_count: number;
  mode: string;
  version?: string;
}

export interface HealthResponse {
  status: string;
  hindsight_status: string;
  groq_status: string;
  memory_bank: string;
  total_incidents: number;
  timestamp: string;
}

export interface TimelineEvent {
  timestamp: string;
  event_type: string;
  incident_id: string;
  description: string;
  details?: Record<string, any>;
}

export interface RunbookExecuteRequest {
  incident_id: string;
  step_title: string;
  step_type?: 'investigation' | 'resolution';
  service?: string;
}

export interface RunbookExecuteResponse {
  success: boolean;
  step_title: string;
  command_executed: string;
  terminal_output: string;
  duration_ms: number;
  status: string;
  safety_checks: string;
  evidence_found?: string;
}

export interface TopologyNode {
  id: string;
  name: string;
  type: 'gateway' | 'service' | 'database' | 'broker' | 'external';
  status: 'healthy' | 'degraded' | 'critical';
  latency_ms: number;
  error_rate: number;
  description: string;
}

export interface TopologyEdge {
  source: string;
  target: string;
  protocol: string;
  health: 'healthy' | 'degraded' | 'critical';
}

export interface TopologyResponse {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  impacted_services: string[];
  blast_radius_score: number;
}

export interface ServiceMetricItem {
  service: string;
  incidents_count: number;
  mttr_mins: number;
  status: string;
  sla_percentage: number;
}

export interface AnalyticsResponse {
  total_incidents: number;
  resolved_incidents: number;
  mttr_without_memory_min: number;
  mttr_with_memory_min: number;
  mttr_reduction_pct: number;
  downtime_saved_hours: number;
  cost_saved_usd: number;
  memory_attribution_rate_pct: number;
  recurring_preventions_count: number;
  services: ServiceMetricItem[];
}

export interface ChaosScenario {
  id: string;
  title: string;
  service: string;
  severity: string;
  symptoms: string[];
  error_logs: string[];
  description: string;
  historical_link: string;
}

// -------------------------------------------------------------
// Neural Memory Brain Graph Types
// -------------------------------------------------------------
export interface MemoryGraphNode {
  id: string;
  label: string;
  type: 'incident' | 'cluster' | 'service' | 'learning';
  cluster: string;
  service: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  root_cause?: string;
  relevance: number;
  x: number;
  y: number;
}

export interface MemoryGraphEdge {
  source: string;
  target: string;
  weight: number;
  relation: string;
}

export interface MemoryGraphResponse {
  nodes: MemoryGraphNode[];
  edges: MemoryGraphEdge[];
  clusters: string[];
  total_memories_indexed: number;
}

// -------------------------------------------------------------
// Autonomous Canary Rollout Types
// -------------------------------------------------------------
export interface CanaryStage {
  stage_number: number;
  name: string;
  traffic_percentage: number;
  duration_sec: number;
  status: 'pending' | 'active' | 'passed' | 'failed';
  p99_latency_ms: number;
  error_rate: number;
  health_verdict: string;
}

export interface CanaryRolloutState {
  incident_id: string;
  service: string;
  active_stage: number;
  total_stages: number;
  current_traffic_percent: number;
  overall_status: 'STANDBY' | 'CANARY_RUNNING' | 'CANARY_VERIFIED' | 'FLEET_PROMOTED' | 'ROLLED_BACK';
  stages: CanaryStage[];
  rollback_ready: boolean;
  automated_safety_checks: string[];
  telemetry_summary: string;
}

export interface CanaryActionRequest {
  incident_id: string;
  action: 'start' | 'advance' | 'rollback';
  stage?: number;
}

// -------------------------------------------------------------
// Counterfactual Hypothesis Explorer Types
// -------------------------------------------------------------
export interface HypothesisItem {
  id: string;
  title: string;
  probability_score: number;
  status: 'CONFIRMED' | 'UNLIKELY' | 'REJECTED';
  hindsight_precedent: string;
  supporting_signals: string[];
  contradicting_signals: string[];
  recommendation: string;
}

export interface HypothesisEvaluationResponse {
  incident_id: string;
  primary_hypothesis_id: string;
  hypotheses: HypothesisItem[];
  confidence_spread: string;
  reasoning: string;
}

// -------------------------------------------------------------
// War Room AI Agent Chat Types
// -------------------------------------------------------------
export interface WarRoomChatMessage {
  id: string;
  sender: string;
  sender_type: 'human' | 'agent' | 'system';
  timestamp: string;
  message: string;
  cited_incident_id?: string;
  suggested_action?: string;
  badge?: string;
  isActionExecuted?: boolean;
  actionOutput?: string;
}

export interface WarRoomChatRequest {
  incident_id: string;
  user_message: string;
}

export interface WarRoomChatResponse {
  reply: string;
  cited_incident_id?: string;
  suggested_action?: string;
  retrieved_memory_count: number;
}

// -------------------------------------------------------------
// Autonomous SRE Multi-Agent Swarm Types
// -------------------------------------------------------------
export interface SwarmAgentMessage {
  id: string;
  agent_name: string;
  agent_role: string;
  agent_avatar: string;
  phase: string;
  thought_trace: string;
  output_message: string;
  status: 'THINKING' | 'DISPATCHED' | 'VERIFIED';
  evidence_tag?: string;
}

export interface SwarmTriageResponse {
  incident_id: string;
  service: string;
  swarm_status: string;
  overall_confidence: number;
  agents_involved: number;
  messages: SwarmAgentMessage[];
  consensus_root_cause: string;
  consensus_action: string;
  hindsight_memory_cited: string;
}

// -------------------------------------------------------------
// Proactive AI Sentinel & Anomaly Radar Types
// -------------------------------------------------------------
export interface SentinelAnomalyItem {
  id: string;
  service: string;
  metric_target: string;
  severity: string;
  current_value: string;
  projected_outage_time: string;
  hindsight_pattern_match: string;
  confidence_score: number;
  preventative_action: string;
  status: 'MONITORING' | 'PREDICTED' | 'AUTO_SCALED';
}

export interface SentinelResponse {
  total_anomalies: number;
  monitored_services: number;
  prevention_rate_pct: number;
  active_threats: SentinelAnomalyItem[];
}

// -------------------------------------------------------------
// Enterprise Postmortem & Five-Whys RCA Report Types
// -------------------------------------------------------------
export interface FiveWhysItem {
  level: number;
  question: string;
  answer: string;
}

export interface PostmortemReportResponse {
  incident_id: string;
  service: string;
  title: string;
  author: string;
  status: string;
  duration_min: number;
  mttr_saved_min: number;
  cost_saved_usd: number;
  executive_summary: string;
  root_cause_analysis: string;
  five_whys: FiveWhysItem[];
  timeline_summary: string[];
  hindsight_knowledge_delta: string;
  markdown_content: string;
}

export type ActiveWorkspaceView = 
  | 'war-room' 
  | 'topology' 
  | 'analytics' 
  | 'neural-graph' 
  | 'canary-pilot' 
  | 'swarm' 
  | 'sentinel' 
  | 'postmortem' 
  | 'chaos';


