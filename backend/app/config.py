import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
DATA_DIR = ROOT_DIR / "data"
SAMPLE_INCIDENTS_PATH = DATA_DIR / "sample_incidents.json"

# Load environment variables from backend/.env or root .env
env_paths = [BASE_DIR / ".env", ROOT_DIR / ".env"]
for env_file in env_paths:
    if env_file.exists():
        load_dotenv(env_file)
        break

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("opsmemory")

class Settings:
    # Hindsight Configuration
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY", "").strip()
    HINDSIGHT_API_URL: str = os.getenv("HINDSIGHT_API_URL", "https://api.hindsight.vectorize.io").strip()
    HINDSIGHT_BANK_ID: str = os.getenv("HINDSIGHT_BANK_ID", "ops-memory").strip()

    # Groq LLM Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

    # App settings
    PROJECT_NAME: str = "OpsMemory"
    PROJECT_TAGLINE: str = "An AI Incident Response Agent that remembers how production incidents were solved."
    VERSION: str = "1.0.0"

    # Paths
    SAMPLE_DATA_PATH: Path = SAMPLE_INCIDENTS_PATH
    FRONTEND_DIST: Path = ROOT_DIR / "frontend" / "dist"

settings = Settings()

