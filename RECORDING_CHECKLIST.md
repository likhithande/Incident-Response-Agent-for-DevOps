# OpsMemory — Pre-Recording & Production Checklist

Follow this checklist strictly before hitting record to ensure a flawless, professional hackathon demo video.

---

## 1. Environment & Server Health Verification

- [ ] **Backend Running**: FastAPI server running on `http://127.0.0.1:8000` via `python run.py`.
- [ ] **Frontend Built & Served**: React bundle built in `frontend/dist` and verified on `http://127.0.0.1:8000/`.
- [ ] **Hindsight Cloud Connected**: Health check `http://127.0.0.1:8000/api/memory/status` returns:
  - `"cloud_connected": true`
  - `"mode": "cloud"`
  - `"version": "0.10.1"`
  - `"bank_id": "ops-memory"`
- [ ] **Groq LLM Configured**: Model `llama-3.3-70b-versatile` verified active.
- [ ] **Memories Seeded**: 10 baseline postmortems seeded and verified (`INC-001` through `INC-010`).
- [ ] **Demo Incident Available**: Signature Payment API HTTP 503 incident ready via `Demo Scenario` button.

---

## 2. Screen & Audio Setup

- [ ] **Resolution**: Display resolution set to 1920x1080 (1080p) or 2560x1440 (1440p) minimum.
- [ ] **Browser Window**: Fullscreen or dedicated maximized browser window (`F11`).
- [ ] **Browser Zoom**: Set browser zoom to 100% or 110% for crisp typography and readable badges.
- [ ] **Clean Desktop**: Close all unrelated applications, browser tabs, and desktop icons.
- [ ] **Notifications Disabled**: Turn on Windows "Do Not Disturb" / Focus Assist. Mute Slack, Discord, email, and calendar popups.
- [ ] **Microphone Quality**: Clear microphone input with low noise floor. Keep speaking distance consistent (~6-8 inches).
- [ ] **Synthesized Web Audio**: If recording browser audio, ensure system audio capture is enabled so alert chimes and resolution sounds are heard.

---

## 3. Privacy & Security Guardrails

- [ ] **API Keys Hidden**: Do NOT open `.env` file or terminal windows showing raw secrets. The `Settings` modal masks keys with `••••••••`, which is safe to display.
- [ ] **No Personal Info**: Ensure browser bookmarks bar and personal file paths are hidden.
- [ ] **Terminal Cleanliness**: If showing the terminal, clear previous history (`cls`) and keep font size at 14pt+.

---

## 4. Main Demo Sequence Checklist

- [ ] **0:00 – Introduction**: Show War Room dashboard, project branding, and `-71% MTTR` impact banner.
- [ ] **0:25 – The Problem**: Click `Demo Scenario` to load `INC-DEMO-PAY` with 4,250ms P99 latency and 18.4% error rate.
- [ ] **0:50 – Incident Manifest**: Inspect service, severity, symptoms, and HikariCP pool error logs.
- [ ] **1:10 – Analyze Incident**: Click `Analyze Incident`. Observe loading state and completion toast.
- [ ] **1:35 – Hindsight Memory Retrieval**: Hover over `INC-001` with `96% Match` badge in the right panel. Explain that the agent recalled past capacity benchmarks.
- [ ] **2:05 – Comparison / Sandbox**: Demonstrate runbook CLI simulation with `Simulate & Verify` (or toggle `Compare (Stateless vs Memory)`).
- [ ] **2:25 – Structured Recommendation**: Highlight HIGH confidence, likely root cause, and pool scaling resolution.
- [ ] **2:50 – Resolution Workflow**: Click `Mark Resolved & Retain to Hindsight`, verify fields, and click `Retain Knowledge to Hindsight`.
- [ ] **3:15 – Hindsight Retain Moment**: Show green success toast with Memory ID and verify `resolution_retained` in Memory Timeline.
- [ ] **3:35 – Future Incident Recall**: Type `Payment API connection pool` into Direct Semantic Recall to show newly retained postmortem alongside `INC-001`.
- [ ] **3:55 – Key Takeaway & Closing**: Conclude on the SRE Analytics view showing permanent 71% MTTR reduction.

---

## 5. Post-Recording Review

- [ ] **Review Full Playback**: Watch the recorded video once from start to finish.
- [ ] **Audio Clarity**: Ensure voiceover is clear and audible over audio chimes.
- [ ] **Hindsight Moments Clear**: Verify that the two core moments (Recall of `INC-001` and Retain of `INC-DEMO-PAY`) are prominent and unobstructed.
- [ ] **No Errors / Popups**: Confirm zero unexpected crashes or notifications.
- [ ] **Export Settings**: Export MP4 in H.264 / AAC at 1080p 60fps or 30fps.
