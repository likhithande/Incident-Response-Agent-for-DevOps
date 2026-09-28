import {
  Incident,
  IncidentAnalysisResponse,
  IncidentResolutionRequest,
  IncidentResolutionResponse,
  MemorySeedResponse,
  MemoryStatusResponse,
  HealthResponse,
  TimelineEvent,
  RetrievedMemoryItem,
  TopologyResponse,
  RunbookExecuteRequest,
  RunbookExecuteResponse,
  AnalyticsResponse,
  ChaosScenario,
  MemoryGraphResponse,
  CanaryRolloutState,
  HypothesisEvaluationResponse,
  WarRoomChatResponse,
  SwarmTriageResponse,
  SentinelResponse,
  PostmortemReportResponse
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) throw new Error(`Failed to load incidents: ${res.statusText}`);
  return res.json();
}

export async function fetchIncident(incidentId: string): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
  if (!res.ok) throw new Error(`Failed to fetch incident ${incidentId}: ${res.statusText}`);
  return res.json();
}

export async function createIncident(incident: Incident): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incident),
  });
  if (!res.ok) throw new Error(`Failed to create incident: ${res.statusText}`);
  return res.json();
}

export async function analyzeIncident(incident: Incident, withMemory: boolean): Promise<IncidentAnalysisResponse> {
  const res = await fetch(`${API_BASE}/incidents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident, with_memory: withMemory }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Analysis request failed');
  }
  return res.json();
}

export async function resolveIncident(payload: IncidentResolutionRequest): Promise<IncidentResolutionResponse> {
  const res = await fetch(`${API_BASE}/incidents/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Resolution submission failed');
  }
  return res.json();
}

export async function seedMemories(): Promise<MemorySeedResponse> {
  const res = await fetch(`${API_BASE}/memory/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Failed to seed memories: ${res.statusText}`);
  return res.json();
}

export async function fetchMemoryStatus(): Promise<MemoryStatusResponse> {
  const res = await fetch(`${API_BASE}/memory/status`);
  if (!res.ok) throw new Error(`Failed to get memory status: ${res.statusText}`);
  return res.json();
}

export async function recallMemoryDirect(query: string): Promise<RetrievedMemoryItem[]> {
  const res = await fetch(`${API_BASE}/memory/recall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit: 4 }),
  });
  if (!res.ok) throw new Error(`Direct recall failed: ${res.statusText}`);
  const data = await res.json();
  return data.results;
}

export async function fetchTimeline(): Promise<TimelineEvent[]> {
  const res = await fetch(`${API_BASE}/timeline`);
  if (!res.ok) throw new Error(`Failed to fetch timeline: ${res.statusText}`);
  return res.json();
}

export async function updateConfigKeys(keys: {
  hindsight_api_key?: string;
  groq_api_key?: string;
  groq_model?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/config/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keys),
  });
  if (!res.ok) throw new Error(`Failed to update keys: ${res.statusText}`);
  return res.json();
}

export async function fetchTopology(service?: string): Promise<TopologyResponse> {
  const url = service ? `${API_BASE}/topology?service=${encodeURIComponent(service)}` : `${API_BASE}/topology`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch topology: ${res.statusText}`);
  return res.json();
}

export async function executeRunbookStep(payload: RunbookExecuteRequest): Promise<RunbookExecuteResponse> {
  const res = await fetch(`${API_BASE}/runbook/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Runbook step execution failed');
  }
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.statusText}`);
  return res.json();
}

export async function fetchChaosScenarios(): Promise<ChaosScenario[]> {
  const res = await fetch(`${API_BASE}/chaos/scenarios`);
  if (!res.ok) throw new Error(`Failed to fetch chaos scenarios: ${res.statusText}`);
  return res.json();
}

export async function fetchMemoryGraph(): Promise<MemoryGraphResponse> {
  const res = await fetch(`${API_BASE}/memory/graph`);
  if (!res.ok) throw new Error(`Failed to fetch memory brain graph: ${res.statusText}`);
  return res.json();
}

export async function fetchCanaryState(incidentId: string = 'INC-001'): Promise<CanaryRolloutState> {
  const res = await fetch(`${API_BASE}/pilot/canary?incident_id=${encodeURIComponent(incidentId)}`);
  if (!res.ok) throw new Error(`Failed to fetch canary state: ${res.statusText}`);
  return res.json();
}

export async function advanceCanary(action: 'start' | 'advance' | 'rollback', incidentId: string = 'INC-001', stage?: number): Promise<CanaryRolloutState> {
  const res = await fetch(`${API_BASE}/pilot/canary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident_id: incidentId, action, stage }),
  });
  if (!res.ok) throw new Error(`Canary action ${action} failed: ${res.statusText}`);
  return res.json();
}

export async function evaluateHypotheses(incidentId: string = 'INC-001', service: string = 'Payment API'): Promise<HypothesisEvaluationResponse> {
  const res = await fetch(`${API_BASE}/incidents/hypotheses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident_id: incidentId, service }),
  });
  if (!res.ok) throw new Error(`Hypothesis evaluation failed: ${res.statusText}`);
  return res.json();
}

export async function sendWarRoomChat(userMessage: string, incidentId: string = 'INC-001'): Promise<WarRoomChatResponse> {
  const res = await fetch(`${API_BASE}/warroom/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_message: userMessage, incident_id: incidentId }),
  });
  if (!res.ok) throw new Error(`War room chat failed: ${res.statusText}`);
  return res.json();
}

export async function runSwarmTriage(incidentId: string = 'INC-001', service: string = 'Payment API'): Promise<SwarmTriageResponse> {
  const res = await fetch(`${API_BASE}/swarm/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident_id: incidentId, service }),
  });
  if (!res.ok) throw new Error(`Swarm triage failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSentinelAnomalies(): Promise<SentinelResponse> {
  const res = await fetch(`${API_BASE}/sentinel/anomalies`);
  if (!res.ok) throw new Error(`Failed to load sentinel anomalies: ${res.statusText}`);
  return res.json();
}

export async function generatePostmortemReport(incidentId: string = 'INC-001', service: string = 'Payment API'): Promise<PostmortemReportResponse> {
  const res = await fetch(`${API_BASE}/postmortem/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident_id: incidentId, service }),
  });
  if (!res.ok) throw new Error(`Postmortem report generation failed: ${res.statusText}`);
  return res.json();
}


