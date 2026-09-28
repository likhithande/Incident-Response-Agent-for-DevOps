from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings, logger
from app.routes.health import router as health_router
from app.routes.incidents import router as incidents_router
from app.hindsight_service import hindsight_service
from app.incident_agent import incident_agent

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("==================================================")
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"{settings.PROJECT_TAGLINE}")
    logger.info("==================================================")
    
    # Auto-seed initial sample incidents into memory on startup so demo works immediately
    try:
        if settings.SAMPLE_DATA_PATH.exists():
            seed_res = hindsight_service.seed_from_file(str(settings.SAMPLE_DATA_PATH))
            logger.info(f"Startup memory status: {seed_res['message']}")
            incident_agent.record_timeline_event(
                event_type="system_startup",
                incident_id="SYSTEM",
                description=f"OpsMemory initialized with {seed_res['count']} baseline incident memories"
            )
    except Exception as e:
        logger.warning(f"Could not auto-seed on startup: {e}")

    health = hindsight_service.check_health()
    logger.info(f"Hindsight Engine Mode: {health['mode']} (Cloud connected: {health['cloud_connected']})")
    
    yield
    # Shutdown sequence
    logger.info(f"Shutting down {settings.PROJECT_NAME}...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_TAGLINE,
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under /api
app.include_router(health_router, prefix="/api")
app.include_router(incidents_router, prefix="/api")

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount static assets if build exists or can be created
if settings.FRONTEND_DIST.exists():
    assets_dir = settings.FRONTEND_DIST / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str = ""):
    # 1. Do not catch-all for unknown API routes; return standard 404
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail=f"API endpoint '/{full_path}' not found")
    
    # 2. Check if a specific file in dist exists (e.g. favicon.svg, icons.svg, assets)
    if full_path:
        file_path = settings.FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
    
    # 3. Serve index.html for root and SPA client-side routes
    index_file = settings.FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    
    # 4. Fallback information if frontend is not yet built
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "status": "ready",
        "hindsight_bank": settings.HINDSIGHT_BANK_ID,
        "docs": "/docs",
        "health": "/api/health",
        "message": "Frontend build not found. Run 'python run.py' or 'npm run build' in frontend directory."
    }

if __name__ == "__main__":
    import sys
    from pathlib import Path
    backend_dir = Path(__file__).resolve().parent.parent
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
