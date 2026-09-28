import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.hindsight_service import hindsight_service
from app.config import settings

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "hindsight_status" in data
    assert data["memory_bank"] == "ops-memory"

def test_list_incidents():
    response = client.get("/api/incidents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Check INC-001 is present
    inc_ids = [inc["incident_id"] for inc in data]
    assert "INC-001" in inc_ids

def test_get_incident_by_id():
    response = client.get("/api/incidents/INC-001")
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "INC-001"
    assert data["service"] == "Payment API"
    assert data["severity"] == "CRITICAL"

def test_seed_memory():
    response = client.post("/api/memory/seed")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "memories" in data["message"] or "loaded" in data["message"]

def test_memory_status():
    response = client.get("/api/memory/status")
    assert response.status_code == 200
    data = response.json()
    assert data["bank_id"] == "ops-memory"
    assert "retained_count" in data

def test_memory_recall_direct():
    query_payload = {
        "query": "Service: Payment API | Symptoms: HTTP 503, database connection pool exhaustion",
        "limit": 3
    }
    response = client.post("/api/memory/recall", json=query_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] > 0
    # Top result should be INC-001
    top_inc = data["results"][0]
    assert top_inc["incident_id"] == "INC-001"

def test_analyze_with_hindsight_memory():
    """Verify that analysis with memory cites INC-001 and gives specific pool recommendations."""
    payload = {
        "incident": {
            "incident_id": "INC-NEW-99",
            "service": "Payment API",
            "severity": "CRITICAL",
            "symptoms": ["HTTP 503 Service Unavailable", "High latency", "Database connection timeout"],
            "error_logs": ["Timeout waiting for database connection from pool"]
        },
        "with_memory": True
    }
    response = client.post("/api/incidents/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["with_memory"] is True
    assert len(data["retrieved_memories"]) > 0
    # Verified that INC-001 was retrieved
    assert any(m["incident_id"] == "INC-001" for m in data["retrieved_memories"])
    
    # Analysis must have high confidence and cite the historical context
    analysis = data["analysis"]
    assert "connection pool" in analysis["likely_root_cause"].lower() or "database" in analysis["likely_root_cause"].lower()
    assert len(analysis["historical_context"]) > 0
    assert analysis["historical_context"][0]["incident_id"] == "INC-001"
    assert len(analysis["recommended_investigation"]) > 0
    assert len(analysis["recommended_resolution"]) > 0

def test_analyze_without_memory_stateless():
    """Verify that analysis WITHOUT memory gives generic advice and no historical context."""
    payload = {
        "incident": {
            "incident_id": "INC-NEW-99",
            "service": "Payment API",
            "severity": "CRITICAL",
            "symptoms": ["HTTP 503 Service Unavailable", "High latency", "Database connection timeout"],
            "error_logs": ["Timeout waiting for database connection from pool"]
        },
        "with_memory": False
    }
    response = client.post("/api/incidents/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["with_memory"] is False
    assert len(data["retrieved_memories"]) == 0
    analysis = data["analysis"]
    assert analysis["confidence"] == "LOW"
    assert len(analysis["historical_context"]) == 0

def test_resolve_and_retain_learning_flow():
    """Verify the Learning Flow: engineer records resolution, retains to Hindsight, and it can be recalled."""
    # 1. Resolve an incident
    resolve_payload = {
        "incident_id": "INC-TEST-LEARN",
        "actual_root_cause": "Misconfigured JVM garbage collection pause times causing stop-the-world stalls.",
        "resolution": "Switched from ParallelGC to ZGC with -XX:+UseZGC and adjusted max heap to 8GB.",
        "outcome": "P99 response time dropped from 3500ms to 45ms immediately.",
        "lessons_learned": "High-throughput microservices require low-latency garbage collectors like ZGC."
    }
    res_response = client.post("/api/incidents/resolve", json=resolve_payload)
    assert res_response.status_code == 200
    res_data = res_response.json()
    assert res_data["success"] is True
    assert res_data["retained_memory_id"] is not None

    # 2. Verify that a query about JVM garbage collection stalls now recalls INC-TEST-LEARN from Hindsight!
    recall_res = client.post("/api/memory/recall", json={"query": "JVM garbage collection pause times stop-the-world ZGC", "limit": 2})
    assert recall_res.status_code == 200
    recall_data = recall_res.json()
    assert any(m["incident_id"] == "INC-TEST-LEARN" for m in recall_data["results"])

def test_topology_endpoint():
    response = client.get("/api/topology?service=Payment%20API")
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) >= 5
    assert len(data["edges"]) >= 5
    assert data["blast_radius_score"] > 0
    # Payment API node should be critical
    payment_node = next(n for n in data["nodes"] if n["id"] == "payment-api")
    assert payment_node["status"] == "critical"

def test_runbook_execution_endpoint():
    payload = {
        "incident_id": "INC-001",
        "step_title": "Inspect active connections with pg_stat_activity",
        "step_type": "investigation"
    }
    response = client.post("/api/runbook/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "pg_stat_activity" in data["command_executed"]
    assert "active" in data["terminal_output"]
    assert data["status"] == "VERIFIED"

def test_analytics_endpoint():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["total_incidents"] >= 10
    assert data["mttr_reduction_pct"] > 50
    assert data["cost_saved_usd"] > 100000

def test_chaos_scenarios_endpoint():
    response = client.get("/api/chaos/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert any(s["service"] == "Payment API" for s in data)

def test_memory_brain_graph_endpoint():
    response = client.get("/api/memory/graph")
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) >= 10
    assert len(data["edges"]) >= 10
    assert "Resource Pool" in data["clusters"]
    assert any(n["id"] == "INC-001" for n in data["nodes"])

def test_canary_pilot_lifecycle_endpoint():
    # 1. Fetch initial state
    res_get = client.get("/api/pilot/canary?incident_id=INC-001")
    assert res_get.status_code == 200
    state = res_get.json()
    assert state["incident_id"] == "INC-001"
    assert len(state["stages"]) == 4

    # 2. Start canary
    res_start = client.post("/api/pilot/canary", json={"incident_id": "INC-001", "action": "start"})
    assert res_start.status_code == 200
    assert res_start.json()["overall_status"] == "CANARY_RUNNING"
    assert res_start.json()["current_traffic_percent"] == 10

    # 3. Advance to 50%
    res_adv = client.post("/api/pilot/canary", json={"incident_id": "INC-001", "action": "advance"})
    assert res_adv.status_code == 200
    assert res_adv.json()["current_traffic_percent"] == 50

    # 4. Trigger auto-rollback guardrail
    res_roll = client.post("/api/pilot/canary", json={"incident_id": "INC-001", "action": "rollback"})
    assert res_roll.status_code == 200
    assert res_roll.json()["overall_status"] == "ROLLED_BACK"
    assert res_roll.json()["current_traffic_percent"] == 0

def test_hypotheses_evaluation_endpoint():
    payload = {"incident_id": "INC-001", "service": "Payment API"}
    response = client.post("/api/incidents/hypotheses", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["primary_hypothesis_id"] == "hyp-db-pool"
    assert len(data["hypotheses"]) == 3
    confirmed = next(h for h in data["hypotheses"] if h["status"] == "CONFIRMED")
    assert confirmed["id"] == "hyp-db-pool"
    assert confirmed["probability_score"] > 90

def test_warroom_chat_endpoint():
    payload = {"incident_id": "INC-001", "user_message": "What happened in INC-001 previously?"}
    response = client.post("/api/warroom/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "INC-001" in data["reply"] or data["cited_incident_id"] == "INC-001"
    assert data["retrieved_memory_count"] >= 1

