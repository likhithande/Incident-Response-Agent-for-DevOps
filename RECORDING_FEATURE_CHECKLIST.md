# OpsMemory — Recording Feature Checklist & Interactive Feature Inventory

This document provides a comprehensive, verified inventory of every page, tab, interactive button, input field, modal, API endpoint, Hindsight memory operation, and LLM operation currently implemented in **OpsMemory**.

---

## 1. Feature Inventory by Category

### Navigation & Top Bar
- [x] **Project Branding**: Displays `OpsMemory` logo with `Hindsight SRE` badge and live connection indicators.
- [x] **View Switcher: War Room**: Main interactive operational triage view with Incident Detail, AI Analysis, Runbook Sandbox, Hypotheses, Timeline, and Hindsight Memory panel.
- [x] **View Switcher: Topology & Blast Radius**: Interactive microservice topology graph, live latency/error rate telemetry, and blast radius calculation.
- [x] **View Switcher: Neural Graph**: Constellation memory graph visualizing semantic clusters (`Resource Pool`, `In-Memory Cache`, `Streaming / Queue`, `Distributed Mesh`) and historical incidents with similarity links.
- [x] **View Switcher: Canary Pilot**: Autonomous 4-stage progressive canary deployment cockpit (0% -> 10% -> 50% -> 100%) with automated safety gate checks and instant rollback.
- [x] **View Switcher: SRE Analytics**: Enterprise MTTR reduction metrics (-71%), financial savings ($207,000 USD), downtime hours averted (34.5 hrs), and per-service reliability SLA breakdown.
- [x] **View Switcher: Agent Swarm**: Autonomous 5-Agent SRE Swarm (Agent-Delta Telemetry, Agent-Mnemosyne Hindsight, Agent-Aegis Safety Gatekeeper, Agent-Hermes Canary Pilot, Agent-Athena Commander) reaching verified consensus.
- [x] **View Switcher: AI Sentinel**: Proactive anomaly detection radar correlating live telemetry against Hindsight historical failure signatures before outages trigger.
- [x] **Audio Chimes Mute Toggle**: Mutes or enables synthesized Web Audio API sound effects (Sev-1 alarm, resolution chimes, button feedback).
- [x] **Broadcast & Export Modal Trigger**: Opens multi-channel broadcast modal (Slack, PagerDuty, Statuspage, Markdown postmortem).
- [x] **Demo Scenario Quick-Load Button**: One-click preset loader for the signature Payment API HTTP 503 outage (`INC-DEMO-PAY`).
- [x] **Seed Memories Button**: One-click trigger to seed/verify 10 baseline production incident postmortems into Hindsight memory bank.
- [x] **Engine Settings Modal Trigger**: Opens configuration modal for Hindsight API credentials, bank ID, and Groq LLM model settings.

### Cyber Command HUD Ribbon
- [x] **Live Triage Clock**: Dynamic incident countdown/elapsed timer.
- [x] **P99 Telemetry Gauge**: Real-time latency tracking (e.g., 4,250 ms spike vs 42 ms baseline).
- [x] **Vector Recall Indicator**: Live status badge displaying Hindsight memory bank connectivity (`Standing By` / `Recalled`).
- [x] **Global Command Palette Trigger (`Ctrl+K`)**: Opens Spotlight-style quick-search overlay across incidents, views, and actions.
- [x] **Time-Travel Simulator Trigger**: Toggles 5-stage interactive lifecycle slider (T0 Normal -> T+2m Anomaly -> T+5m Outage -> T+7m Recall -> T+9m Restored).
- [x] **1-Click SRE Autopilot Trigger**: Launches autonomous 4-stage automated incident mitigation modal.

### Incident Management (Sidebar & Detail)
- [x] **Incident List Filter Tabs**: Filter incidents by `All`, `Active`, `Crit`, and `Resolved`.
- [x] **Incident Search Input**: Live text filtering of incidents by ID, service name, or symptoms.
- [x] **New Incident Button (`+ New`)**: Opens registration modal to add custom production incidents.
- [x] **Incident Item Card Selection**: Click to load any incident into the War Room with active telemetry.
- [x] **Incident Detail Card**:
  - [x] Editable Service Name field
  - [x] Severity Selector dropdown (`P1 - CRITICAL`, `P2 - HIGH`, `P3 - MEDIUM`, `P4 - LOW`)
  - [x] Status Selector dropdown (`ACTIVE`, `INVESTIGATING`, `MITIGATING`, `RESOLVED`)
  - [x] Observed Symptoms Tag Cloud with add/remove capability
  - [x] Raw Telemetry Log Stream box with sample error messages
  - [x] Investigation Steps list
  - [x] Runbook Steps list
  - [x] Lessons Learned list
- [x] **Quick Section Jump Floating Pill Bar**: Smoothly scrolls to `#Details`, `#Analysis & Runbook`, `#Hypotheses`, `#Event Stream`, or `#Top`.

### Hindsight Memory Retrieval & Panel
- [x] **Long-Term Knowledge Bank Status**: Displays active Hindsight bank (`ops-memory`), cloud/local mode, and total retained memories count.
- [x] **Direct Semantic Recall Query Bar**: Allows manual searching of Hindsight memory bank with arbitrary operational queries.
- [x] **Quick Filter Tags**: One-click queries for `#503 Outage`, `#Connection Pool`, `#Redis OOM`, `#CrashLoopBackOff`, `#Kafka Lag`.
- [x] **Retrieved Memory Cards**: Displays recalled historical incidents with:
  - Exact Cosine Similarity Match percentage (e.g., `96% Match`)
  - Source attribution (`hindsight-cloud` / `hindsight`)
  - Historical Incident ID and Service badge
  - Historical Root Cause summary
  - Verified Historical Resolution steps
  - Lessons Learned takeaways
  - Timestamp and tag metadata

### AI Incident Analysis & Comparison
- [x] **Analyze Incident Button**: Calls the AI Incident Response Agent to recall Hindsight memories and generate structured recommendations.
- [x] **Compare Stateless vs Memory Button**: Executes dual parallel analysis to showcase generic advice vs memory-grounded recommendations.
- [x] **Analysis Result Card**:
  - [x] Executive Summary banner
  - [x] Likely Root Cause badge with Confidence rating (`HIGH` / `MEDIUM` / `LOW`)
  - [x] Memory Attribution banner citing recalled incidents (e.g., `INC-001`)
  - [x] Recommended Investigation checklist
  - [x] Recommended Resolution action items
  - [x] Operational Warnings & Guardrails
  - [x] Historical Context citation cards with relevance explanations
  - [x] Reasoning Summary distinguishing current observations from historical memory
- [x] **Interactive SRE CLI Sandbox**:
  - [x] "Simulate & Verify" button on each runbook step
  - [x] Realistic terminal command execution modal/drawer
  - [x] Command executed string (e.g., `kubectl set env deployment/payment-api DB_POOL_MAX=150`)
  - [x] Full mock terminal output with stderr/stdout
  - [x] Safety verdict badge (`Dry-Run Passed | RBAC Authorized | Zero-Downtime Safe`)
  - [x] Evidence found verification readout

### Counterfactual Root Cause Hypothesis Explorer
- [x] **3 Competing Hypotheses**:
  - Primary Hypothesis: Confirmed by Hindsight Precedent (e.g., HikariCP Pool Starvation, 94% Probability)
  - Alternative Hypothesis 1: Rejected (e.g., PostgreSQL Row Deadlock, 12% Probability)
  - Alternative Hypothesis 2: Rejected (e.g., Network Socket Starvation, 4% Probability)
- [x] **Supporting vs Contradicting Telemetry Signals**: Explains why alternative explanations were ruled out.

### Resolution & Hindsight Retain Workflow
- [x] **Mark Resolved & Retain Trigger Button**: Opens the postmortem resolution modal.
- [x] **Resolution Modal**:
  - [x] Actual Root Cause input textarea
  - [x] Resolution Steps textarea
  - [x] Final Operational Outcome input
  - [x] Lessons Learned & Preventative Guardrails textarea
  - [x] "Retain Knowledge to Hindsight" submission button
- [x] **Hindsight Retain Operation**: Calls `hindsight_service.retain_incident()` to encode postmortem into the memory bank.
- [x] **Memory Timeline Event**: Automatically appends `incident_resolved` and `resolution_retained` events with memory ID.

### Auxiliary Futuristic Tools
- [x] **Interactive SRE Terminal Drawer**: Expandable bottom terminal CLI for diagnostic commands (`sre-cli`, `kubectl`, `redis-cli`, `psql`).
- [x] **Live SRE War Room Chat Copilot**: Floating conversational assistant grounded in Hindsight with quick prompt chips:
  - "Did this happen before?" (Recalls INC-001)
  - "Should I restart?" (Warns against blind restarts using historical lesson)
  - "Executive summary" (Formats Slack-ready briefing)
- [x] **Chaos Lab Modal**: Injects simulated disaster scenarios (Pool Starvation, Redis OOM, Kafka Rebalance, K8s OOMKilled, Stripe Rate Limit).

---

## 2. Interactive Buttons: Complete Reference

### Button: `Analyze Incident`
- **Location**: `IncidentDetail.tsx` (Top right of incident detail card)
- **Purpose**: Triggers the OpsMemory AI agent workflow with Hindsight persistent memory retrieval enabled.
- **What happens**: 
  1. Sends `POST /api/incidents/analyze` with `with_memory: true`.
  2. Constructs an expressive recall query from incident symptoms and error logs.
  3. Queries Hindsight memory bank `ops-memory` via vector recall.
  4. Passes current symptoms + retrieved historical postmortems to Groq LLM (`llama-3.3-70b-versatile`).
  5. Records timeline event `memory_retrieved` and `recommendation_generated`.
- **Expected result**: Analysis card appears with `HIGH` confidence, citing historical incident (e.g. `INC-001`), providing exact pool scaling runbook steps, and populating the Hindsight Memory panel on the right.
- **What should be visible in recording**: Loading spinner -> Success toast -> Analysis card popping in -> Right sidebar displaying `INC-001` with `96% Match` -> Root cause and recommended steps clearly displayed.

### Button: `Compare (Stateless vs Memory)`
- **Location**: `IncidentDetail.tsx` (Next to Analyze Incident button)
- **Purpose**: Demonstrates the profound difference between an AI agent operating without memory vs one grounded in Hindsight.
- **What happens**: Sends parallel requests to `/api/incidents/analyze` with `with_memory: false` and `with_memory: true`.
- **Expected result**: Side-by-side comparison view opens:
  - Left panel: "Stateless (Generic)" shows generic advice ("restart instances", "check logs", confidence: LOW).
  - Right panel: "Grounded in Hindsight" shows specific historical precedent (`INC-001`), proven pool scaling resolution, and high confidence.
- **What should be visible in recording**: Split comparison screen clearly demonstrating why persistent memory is necessary for DevOps.

### Button: `Demo Scenario`
- **Location**: `Navbar.tsx` (Top navigation bar)
- **Purpose**: Loads the signature Payment API HTTP 503 Outage scenario (`INC-DEMO-PAY`) in 1 click.
- **What happens**: Sets active incident to `INC-DEMO-PAY`, switches view to War Room, plays audio alert chime, and presents all symptoms ready for triage.
- **Expected result**: Immediate transition to Payment API incident with 4,250ms P99 latency and 18.4% error rate.
- **What should be visible in recording**: Clean jump to the live outage ready for analysis.

### Button: `Seed 10` / `Seed Memories`
- **Location**: `Navbar.tsx` (Top navigation bar)
- **Purpose**: Populates or verifies the 10 production postmortems in the Hindsight memory bank.
- **What happens**: Calls `POST /api/memory/seed`, loading `data/sample_incidents.json` into Hindsight via `retain_incident`.
- **Expected result**: Toast notification: "10 incident memories active in Hindsight bank 'ops-memory'".
- **What should be visible in recording**: Memory status updates to 10 retained postmortems.

### Button: `Mark Resolved & Retain to Hindsight`
- **Location**: `AnalysisResult.tsx` (Bottom of analysis card) and `IncidentDetail.tsx`
- **Purpose**: Opens the incident resolution workflow to document actual root cause and retain it into Hindsight.
- **What happens**: Opens `ResolutionModal.tsx` prefilled with incident details.
- **Expected result**: Modal appears with editable fields for Actual Root Cause, Resolution, Outcome, and Lessons Learned.
- **What should be visible in recording**: Modal opening smoothly over the War Room.

### Button: `Retain Knowledge to Hindsight`
- **Location**: `ResolutionModal.tsx` (Submit button)
- **Purpose**: Submits postmortem resolution and permanently saves it into Hindsight.
- **What happens**: Calls `POST /api/incidents/resolve`, executing `hindsight_service.retain_incident()`. Appends resolution to local and cloud memory bank.
- **Expected result**: Success chime plays, toast confirms memory retained with Memory ID, incident status changes to `RESOLVED`, and Memory Timeline records the new retain event.
- **What should be visible in recording**: Success toast with Memory ID (`mem-INC-...`) and updated timeline stream.

### Button: `Simulate & Verify` (Runbook CLI Sandbox)
- **Location**: `AnalysisResult.tsx` (Action button on each investigation/resolution step)
- **Purpose**: Simulates automated SRE command execution and telemetry verification.
- **What happens**: Calls `POST /api/runbook/execute` with step details, returning realistic shell command output and dry-run safety verification.
- **Expected result**: Terminal execution modal opens showing `kubectl` or `psql` command execution, terminal output, and zero-downtime safety verification.
- **What should be visible in recording**: Terminal screen showing live kubectl rollout output with `HTTP 503 errors resolved. P99 latency normalized to 41ms`.

### Button: `1-Click SRE Autopilot`
- **Location**: `CyberCommandHUD.tsx` (Status bar) and `AnalysisResult.tsx`
- **Purpose**: Executes automated end-to-end incident resolution across 4 autonomous phases.
- **What happens**: Opens `AutopilotCockpitModal.tsx` and cycles through Recall -> Safety Validation -> Canary Rollout -> Hindsight Retain.
- **Expected result**: Automated progression with progress bar, telemetry charts, and complete resolution without manual intervention.
- **What should be visible in recording**: 4-phase cockpit completing with green checkmarks.

### Button: `Recall` (Direct Query)
- **Location**: `HindsightMemoryPanel.tsx` (Right sidebar)
- **Purpose**: Performs on-demand vector semantic search against the Hindsight memory bank.
- **What happens**: Calls `POST /api/memory/recall` with user text query.
- **Expected result**: Recalls matching historical postmortems and updates memory cards list immediately.
- **What should be visible in recording**: Real-time memory cards matching the custom query.

### Button: `Broadcast & Export`
- **Location**: `Navbar.tsx` (Top navigation bar)
- **Purpose**: Opens multi-platform stakeholder broadcast modal.
- **What happens**: Formats incident summary for Slack, PagerDuty, Statuspage, and Markdown postmortem with 1-click clipboard copy.
- **Expected result**: Ready-to-send incident communication cards.
- **What should be visible in recording**: Professional Slack and Statuspage notifications formatted with Hindsight citations.

### Button: `Inject Chaos Outage`
- **Location**: `Navbar.tsx` (Top navigation bar)
- **Purpose**: Opens disaster simulation lab with 5 pre-configured chaos scenarios.
- **What happens**: Allows judge to select an infrastructure failure scenario to simulate a real-time incident.
- **Expected result**: Loads selected disaster scenario into the War Room with active telemetry.
- **What should be visible in recording**: Instant switch to high-severity outage scenario.

### Button: `Time-Travel Replay`
- **Location**: `CyberCommandHUD.tsx` (Status bar)
- **Purpose**: Scrubs through the 5 chronological stages of an incident lifecycle.
- **What happens**: Displays interactive slider from T0 (Healthy) to T+9m (Restored).
- **Expected result**: Live telemetry updates to reflect the scrubbed point in time.
- **What should be visible in recording**: Interactive scrub showing how Hindsight intervened at T+5m to cut MTTR.

### Button: `Sound Toggle` (Speaker Icon)
- **Location**: `Navbar.tsx` (Top navigation bar)
- **Purpose**: Toggles audio telemetry effects.
- **What happens**: Sets audio mute state in Web Audio synthesizer.
- **Expected result**: Toast notification confirming sound enabled or muted.
- **What should be visible in recording**: Audio icon toggling state.

### Button: `Settings` (Gear Icon)
- **Location**: `Navbar.tsx` (Top navigation bar)
- **Purpose**: Opens configuration modal for Hindsight and Groq credentials.
- **What happens**: Opens `SettingsModal.tsx` displaying API URLs, bank ID, and masked API keys with connection test button.
- **Expected result**: Displays `Cloud Connected` status and allows live testing.
- **What should be visible in recording**: Green connectivity badge confirming `Hindsight Cloud API v0.10.1`.
