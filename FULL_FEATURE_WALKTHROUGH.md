# OpsMemory — Full Feature Walkthrough Guide

This document provides a comprehensive, exhaustive walkthrough of **every single interactive element, view, modal, button, and auxiliary tool** implemented in the OpsMemory repository. Use this for deep-dive technical evaluations, extended demo videos (5–10 minutes), or feature-by-feature audits.

---

## 1. Top Navigation Bar (`Navbar.tsx`)

### Button: `OpsMemory (Logo & Branding)`
- **Action**: Click the OpsMemory logo on the far left.
- **Expected**: Resets active view to the main War Room (`war-room`).
- **Telemetry Indicators**: Displays green dot indicator for `Hindsight SRE` and `Cloud Connected`.

### View Tabs: `War Room`, `Topology`, `Neural Graph`, `Canary Pilot`, `Analytics`, `Swarm`, `Sentinel`, `Postmortem`
- **Action**: Click each navigation pill tab.
- **Expected**:
  - `War Room`: Returns to the main incident triage cockpit.
  - `Topology`: Switches to `TopologyView.tsx`, displaying live service dependency graph, cascading health states, and blast radius calculation.
  - `Neural Graph`: Switches to `NeuralGraphView.tsx`, rendering interactive memory constellation clusters (`Resource Pool`, `In-Memory Cache`, `Streaming / Queue`, `Distributed Mesh`) with similarity links.
  - `Canary Pilot`: Switches to `CanaryPilotView.tsx`, opening the 4-stage autonomous progressive canary deployment cockpit.
  - `Analytics`: Switches to `AnalyticsView.tsx`, presenting MTTR reduction charts, downtime hours saved, cost savings, and per-service reliability SLA metrics.
  - `Swarm`: Switches to `SwarmView.tsx`, simulating an autonomous 5-Agent SRE Swarm (Telemetry, Hindsight, Safety Gatekeeper, Canary Pilot, Incident Commander) reaching consensus.
  - `Sentinel`: Switches to `SentinelRadarView.tsx`, showing proactive anomaly radar matching live metrics to Hindsight historical failure signatures.
  - `Postmortem`: Switches to `PostmortemStudioView.tsx`, displaying enterprise Five-Whys root cause analysis, markdown export, and executive summary.

### Button: `Sound Mute/Unmute` (Speaker Icon)
- **Action**: Click the speaker icon in the top right.
- **Expected**: Mutes/unmutes synthesized Web Audio API telemetry chimes (Sev-1 alarm, resolution chime, button clicks). Displays toast: `"Audio Alert Chimes Muted"` or `"Audio Alert Chimes Enabled"`.

### Button: `Broadcast & Export` (Megaphone Icon)
- **Action**: Click `Broadcast & Export`.
- **Expected**: Opens `BroadcastModal.tsx`. Displays preformatted stakeholder broadcasts for:
  - Slack `#incident-war-room` channel with copy button.
  - PagerDuty incident alert update.
  - Public Statuspage notification.
  - Markdown postmortem export.

### Button: `Demo Scenario`
- **Action**: Click `Demo Scenario`.
- **Expected**: Instantly loads the signature Payment API HTTP 503 Outage scenario (`INC-DEMO-PAY`), plays audio telemetry alert, switches to War Room, and populates 4,250ms P99 latency indicators.

### Button: `Seed 10` / `Seed Memories`
- **Action**: Click `Seed 10`.
- **Expected**: Calls `POST /api/memory/seed`. Verifies and loads the 10 baseline postmortems from `data/sample_incidents.json` into Hindsight bank `ops-memory`. Displays success toast and updates the indexed count.

### Button: `Settings` (Gear Icon)
- **Action**: Click the gear icon.
- **Expected**: Opens `SettingsModal.tsx`. Displays Hindsight API URL, bank ID (`ops-memory`), Groq model (`llama-3.3-70b-versatile`), masked API keys, and `Save & Test Connection` button.

---

## 2. Cyber Command HUD Ribbon (`CyberCommandHUD.tsx`)

### Telemetry Widgets
- **Triage Clock**: Dynamic incident elapsed countdown clock.
- **P99 Latency Gauge**: Displays current latency spike (e.g., `4,250 ms` with red warning pill).
- **Vector Recall Status**: Displays `Standing By` (before analysis) or `Recalled` (with count of retrieved memories).

### Button: `Command Palette` (`Ctrl+K` Pill)
- **Action**: Click `Ctrl+K` or press `Ctrl+K` on keyboard.
- **Expected**: Opens `GlobalCommandPalette.tsx`. Allows instant fuzzy searching of incidents, direct Hindsight memory queries, quick view switching, and command execution.

### Button: `Time-Travel Replay`
- **Action**: Click `Time-Travel Replay`.
- **Expected**: Toggles `TimeTravelSimulator.tsx` bar under the HUD. Dragging the slider through stages (T0 Healthy -> T+2m Anomaly -> T+5m Outage -> T+7m Recall -> T+9m Restored) updates the live telemetry to show historical lifecycle progression.

### Button: `SRE Autopilot (1-CLICK)`
- **Action**: Click `SRE Autopilot (1-CLICK)`.
- **Expected**: Opens `AutopilotCockpitModal.tsx`. Runs an autonomous 4-stage automated mitigation cycle:
  1. Hindsight Vector Recall (`INC-001` match).
  2. Safety Gatekeeper validation (headroom verified).
  3. Canary Traffic Shift (10% -> 50% -> 100%).
  4. Auto-retain postmortem into Hindsight.

---

## 3. Incident Management & Sidebar (`Sidebar.tsx`)

### Filter Tabs: `All`, `Active`, `Crit`, `Resolved`
- **Action**: Click any filter tab.
- **Expected**: Instantly filters the incident list in the sidebar.

### Search Input: `Search incidents...`
- **Action**: Type keywords (e.g., `Payment`, `Redis`, `Kafka`, `503`).
- **Expected**: Real-time filtering of matching incident cards.

### Button: `+ New` (New Incident)
- **Action**: Click `+ New` button.
- **Expected**: Opens `NewIncidentModal.tsx`.
- **Input Fields**:
  - Incident ID (e.g., `INC-NEW-01`)
  - Service Name (e.g., `Billing Service`)
  - Severity dropdown (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
  - Symptoms tags input
  - Error logs tags input
- **Action**: Click `Create Incident`.
- **Expected**: Incident is registered via `POST /api/incidents`, added to the top of the sidebar, loaded into the War Room, and logged in the Memory Timeline.

### Incident Item Cards
- **Action**: Click any incident card in the sidebar (e.g. `INC-001`, `INC-002`, `INC-005`).
- **Expected**: Incident is loaded into the active War Room with full metadata, symptoms, and logs.

---

## 4. Incident Detail Card (`IncidentDetail.tsx`)

### Section Jump Floating Pill Bar
- **Action**: Click `#Details`, `#Analysis & Runbook`, `#Hypotheses`, `#Event Stream`, or `Top`.
- **Expected**: Smoothly scrolls the viewport directly to that section.

### Input Fields & Selectors
- **Service Name**: Editable text field.
- **Severity Selector**: Dropdown to change severity (`P1 - CRITICAL`, `P2 - HIGH`, `P3 - MEDIUM`, `P4 - LOW`).
- **Status Selector**: Dropdown to change status (`ACTIVE`, `INVESTIGATING`, `MITIGATING`, `RESOLVED`).
- **Symptoms Cloud**: Allows inspecting or adding/removing symptom chips.
- **Raw Telemetry Log Stream**: Code block displaying attached error logs.

### Button: `Analyze Incident`
- **Action**: Click `Analyze Incident`.
- **Expected**:
  - Agent queries Hindsight memory bank `ops-memory`.
  - Recalls matching historical postmortems (`INC-001`).
  - Calls Groq LLM with incident context + historical memories.
  - Displays Analysis Result card with `HIGH` confidence.
  - Populates Hindsight Memory panel on the right sidebar.

### Button: `Compare (Stateless vs Memory)`
- **Action**: Click `Compare (Stateless vs Memory)`.
- **Expected**: Executes dual parallel analysis. Opens `SideBySideComparison.tsx` showing Stateless generic advice on the left and Hindsight memory-grounded recommendations on the right.

---

## 5. AI Analysis Result & SRE Runbook Sandbox (`AnalysisResult.tsx`)

### Structured Report Elements
- **Executive Summary**: High-level incident summary with historical correlation.
- **Likely Root Cause**: Detailed root cause badge with confidence indicator (`HIGH`).
- **Historical Memory Attribution Banner**: Cites recalled incidents (`INC-001`).
- **Recommended Investigation**: Interactive checklist of diagnostic steps.
- **Recommended Resolution**: Step-by-step remediation runbook.
- **Operational Warnings**: Safety guardrails against common anti-patterns (e.g., warning against blind restarts).
- **Historical Context Cards**: Expandable citations detailing relevance and takeaways from past postmortems.
- **Reasoning Summary**: Clear breakdown distinguishing current observations from historical memory.

### Button: `Simulate & Verify` (Runbook Step Action)
- **Action**: Click `Simulate & Verify` on any runbook step.
- **Expected**:
  - Sends `POST /api/runbook/execute`.
  - Opens terminal execution modal displaying simulated command (e.g., `kubectl set env deployment/payment-api DB_POOL_MAX=150`).
  - Shows mock stdout/stderr terminal output with latency dropping to 41ms.
  - Displays safety verification verdict: `Dry-Run Passed | RBAC Authorized | Zero-Downtime Safe`.

### Button: `Mark Resolved & Retain to Hindsight`
- **Action**: Click `Mark Resolved & Retain to Hindsight`.
- **Expected**: Opens `ResolutionModal.tsx` prefilled with analysis recommendations.

---

## 6. Hindsight Long-Term Memory Explorer (`HindsightMemoryPanel.tsx`)

### Search Input: `Direct Semantic Recall`
- **Action**: Type arbitrary text (e.g., `redis memory eviction`, `kafka consumer lag`) and click `Recall` or press Enter.
- **Expected**: Queries `POST /api/memory/recall` directly against Hindsight. Returns matching postmortem cards with similarity scores.

### Quick Filter Tags: `#503 Outage`, `#Connection Pool`, `#Redis OOM`, `#CrashLoopBackOff`, `#Kafka Lag`
- **Action**: Click any quick tag.
- **Expected**: Instantly triggers vector recall for that failure domain and updates the displayed memory cards.

### Memory Cards
- **Elements**:
  - Semantic Similarity Score badge (e.g., `96% Match`).
  - Memory Engine badge (`hindsight-cloud` / `hindsight`).
  - Incident ID (`INC-001`) and Service name (`Payment API`).
  - Root Cause summary.
  - Proven Resolution steps.
  - Lessons Learned takeaways.

---

## 7. Resolution & Hindsight Retain (`ResolutionModal.tsx`)

### Form Fields
- **Actual Root Cause**: Multiline textarea to specify verified cause.
- **Resolution Steps**: Multiline textarea to document operational fix.
- **Outcome**: Text input for post-resolution metrics (e.g., `Latency normalized to 41ms`).
- **Lessons Learned**: Multiline textarea for preventative guardrails.

### Button: `Retain Knowledge to Hindsight`
- **Action**: Click `Retain Knowledge to Hindsight`.
- **Expected**:
  - Calls `POST /api/incidents/resolve`.
  - Executes `hindsight_service.retain_incident()`.
  - Stores postmortem into Hindsight bank `ops-memory`.
  - Plays resolution chime audio effect.
  - Shows success toast: `"Resolution retained into Hindsight! (Memory ID: mem-INC-...)"`.
  - Incident status updates to `RESOLVED`.
  - Memory Timeline appends `resolution_retained` event.

---

## 8. Memory Timeline Stream (`MemoryTimeline.tsx`)

### Timeline Event Stream
- **Action**: Scroll to `#Event Stream`.
- **Expected**: Displays chronological audit log of all agent operations:
  - `system_startup`: Baseline memory bank initialized.
  - `memory_seeded`: Historical postmortems verified in Hindsight.
  - `incident_created`: New incident registered.
  - `memory_retrieved`: Hindsight recall query and recalled incident IDs.
  - `recommendation_generated`: Confidence score and processing duration in milliseconds.
  - `incident_resolved`: Incident marked resolved.
  - `resolution_retained`: New memory retained with permanent memory ID.

---

## 9. Counterfactual Hypothesis Sandbox (`HypothesisSandbox.tsx`)

### Hypothesis Evaluation
- **Action**: Scroll to `#Hypotheses`.
- **Expected**: Displays 3 competing root cause hypotheses evaluated against Hindsight memory:
  - `Database Connection Pool Starvation`: `CONFIRMED` (94% Probability) citing INC-001 precedent.
  - `PostgreSQL Row Deadlock`: `REJECTED` (12% Probability) due to absence of engine lock telemetry.
  - `Network Socket Starvation`: `REJECTED` (4% Probability) due to 0 dropped SYN packets in VPC flow logs.

---

## 10. Floating Interactive SRE Terminal Drawer (`InteractiveTerminalDrawer.tsx`)

### Drawer Toggle (Bottom Left Button or Backtick `` ` `` key)
- **Action**: Click the terminal icon in bottom left or press backtick `` ` ``.
- **Expected**: Expands interactive terminal CLI from bottom of screen.
- **Available Commands**:
  - `help`: Lists available diagnostic commands.
  - `sre-cli status`: Displays cluster health and pool saturation.
  - `kubectl get pods`: Lists payment-api and auth-service pod states.
  - `pg_stat`: Displays active database connections and HikariCP queue depth.
  - `hindsight status`: Displays memory bank connection telemetry.
  - `clear`: Clears terminal screen.

---

## 11. Floating War Room AI SRE Copilot (`LiveWarRoomChat.tsx`)

### Copilot Drawer Toggle (Bottom Right Button)
- **Action**: Click the floating chat bubble in bottom right.
- **Expected**: Expands conversational SRE Copilot grounded in Hindsight.
- **Quick Action Chips**:
  - `"Did this happen before?"`: Agent responds citing INC-001 details and proven pool scaling fix.
  - `"Should I restart?"`: Agent warns against blind restarts using historical lesson.
  - `"Executive summary"`: Formats Slack-ready executive update.
- **Chat Input**: Type custom operational questions (e.g. `What is the pool size?`) and receive Hindsight-grounded replies.
