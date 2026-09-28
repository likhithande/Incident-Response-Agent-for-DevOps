#!/usr/bin/env python3
"""
OpsMemory: Unified Runner Script
Runs the entire OpsMemory application (Frontend React UI + FastAPI Backend)
under a single unified localhost URL: http://localhost:8000
"""

import os
import sys
import time
import shutil
import argparse
import threading
import subprocess
import webbrowser
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"
INDEX_HTML = FRONTEND_DIST / "index.html"


def build_frontend():
    """Build the frontend React Vite bundle into frontend/dist."""
    print("\n[OpsMemory] Building frontend bundle with Vite...")
    npm_cmd = shutil.which("npm") or shutil.which("npm.cmd")
    if not npm_cmd:
        print("[OpsMemory] ERROR: 'npm' is not found in PATH.")
        print("[OpsMemory] Please install Node.js / npm to build the frontend.")
        sys.exit(1)

    try:
        # Check if node_modules exists
        if not (FRONTEND_DIR / "node_modules").exists():
            print("[OpsMemory] Installing frontend dependencies (npm install)...")
            subprocess.run([npm_cmd, "install"], cwd=str(FRONTEND_DIR), check=True)

        res = subprocess.run([npm_cmd, "run", "build"], cwd=str(FRONTEND_DIR), check=True)
        if res.returncode == 0:
            print("[OpsMemory] Frontend built successfully! Dist directory ready.\n")
        else:
            print(f"[OpsMemory] ERROR: Frontend build failed with exit code {res.returncode}")
            sys.exit(res.returncode)
    except subprocess.CalledProcessError as e:
        print(f"[OpsMemory] Build command failed: {e}")
        sys.exit(1)


def open_browser_delayed(url: str, delay_seconds: float = 1.2):
    """Open the web browser to the unified URL after the server has booted."""
    def _open():
        time.sleep(delay_seconds)
        try:
            webbrowser.open(url)
        except Exception:
            pass

    t = threading.Thread(target=_open, daemon=True)
    t.start()


def print_banner(host: str, port: int):
    """Print the startup banner with the single unified URL."""
    display_host = "localhost" if host in ("127.0.0.1", "0.0.0.0") else host
    base_url = f"http://{display_host}:{port}"

    banner = f"""
========================================================================
  OpsMemory - AI Incident Response Agent with Hindsight Persistent Memory
========================================================================
  [+] Unified Single URL  : {base_url}
  [+] Web Dashboard       : {base_url}/
  [+] Interactive Swagger : {base_url}/docs
  [+] API Health Check    : {base_url}/api/health
========================================================================
  Frontend and backend are combined into ONE active localhost URL!
  Press Ctrl+C to stop the server.
========================================================================
"""
    print(banner)


def run_dev_mode(host: str, port: int):
    """Run in dual-process development mode (Vite dev server + Uvicorn)."""
    npm_cmd = shutil.which("npm") or shutil.which("npm.cmd")
    print("\n[OpsMemory] Starting in live DEVELOPMENT mode...")
    print(f"[OpsMemory] Vite dev server proxying API to backend port {port}...")
    
    # Launch Vite in background
    vite_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=str(FRONTEND_DIR))
    
    # Run uvicorn in current thread
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    
    import uvicorn
    try:
        uvicorn.run("app.main:app", host=host, port=port, reload=True)
    finally:
        vite_proc.terminate()


def main():
    parser = argparse.ArgumentParser(
        description="OpsMemory: Single URL Unified Application Runner"
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host address to bind (default: 127.0.0.1)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port number to listen on (default: 8000)"
    )
    parser.add_argument(
        "--build",
        action="store_true",
        help="Force rebuild frontend assets before starting"
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not automatically launch web browser"
    )
    parser.add_argument(
        "--no-reload",
        action="store_true",
        help="Disable uvicorn auto-reload"
    )
    parser.add_argument(
        "--dev",
        action="store_true",
        help="Start in development mode with Vite hot-module replacement"
    )

    args = parser.parse_args()

    if args.dev:
        run_dev_mode(host=args.host, port=args.port)
        return

    # Check if frontend is built
    if args.build or not INDEX_HTML.exists():
        build_frontend()

    # Ensure backend directory is in sys.path
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))

    # Print startup banner
    print_banner(host=args.host, port=args.port)

    # Launch browser
    display_host = "localhost" if args.host in ("127.0.0.1", "0.0.0.0") else args.host
    target_url = f"http://{display_host}:{args.port}"
    if not args.no_browser:
        open_browser_delayed(target_url, delay_seconds=1.5)

    # Start Uvicorn ASGI server with auto-reload enabled
    should_reload = not args.no_reload
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=should_reload,
        reload_dirs=[str(BACKEND_DIR)] if should_reload else None
    )


if __name__ == "__main__":
    main()
