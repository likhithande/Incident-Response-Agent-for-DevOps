import datetime
from datetime import timezone
from fastapi import APIRouter
from app.config import settings
from app.models import HealthResponse
from app.hindsight_service import hindsight_service
from app.incident_agent import incident_agent
from app.llm_service import llm_service

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Report overall health and service connectivity status."""
    hindsight_health = hindsight_service.check_health()
    hindsight_status = "connected" if hindsight_health["cloud_connected"] else "local_operational"
    
    groq_status = "configured" if llm_service.api_key else "fallback_operational"
    
    return HealthResponse(
        status="healthy",
        hindsight_status=f"{hindsight_status} (mode: {hindsight_health['mode']}, version: {hindsight_health.get('cloud_version', '0.10.1')})",
        groq_status=f"{groq_status} (model: {llm_service.model})",
        memory_bank=settings.HINDSIGHT_BANK_ID,
        total_incidents=len(incident_agent.list_incidents()),
        timestamp=datetime.datetime.now(timezone.utc).isoformat()
    )
