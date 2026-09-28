# OpsMemory — Master Demo Recording Script

This script provides an exact, structured walkthrough designed to showcase OpsMemory for hackathon judges, technical evaluators, and DevOps practitioners.

---

## PART 1 — INTRODUCTION (0:00 – 0:25)

**Goal**: Establish the project identity, the core value proposition, and the fundamental problem OpsMemory solves.

- **SCREEN**: OpsMemory War Room Dashboard (`http://localhost:8000/`)
- **BUTTON**: None (Initial wide camera / screen capture)
- **ACTION**: Mouse gently hovers over the header branding (`OpsMemory (Hindsight SRE)`), the live memory bank indicator (`ops-memory`), and the metrics banner showing `-71% MTTR Impact`.
- **WHAT TO SAY**:
  > "OpsMemory is an AI-powered incident response agent that remembers previous production incidents using Hindsight persistent memory, and uses that historical memory to help engineers resolve similar incidents faster.
  >
  > In modern DevOps, when a critical outage strikes at 2 AM, on-call engineers spend precious minutes rediscovering what another engineer already diagnosed six months ago. OpsMemory gives the AI incident agent persistent memory across time."
- **EXPECTED RESULT**: Viewer sees a sleek, high-tech War Room dashboard with live telemetry indicators, connected to Hindsight Cloud memory bank `ops-memory`.

---

## PART 2 — THE PROBLEM (0:25 – 0:50)

**Goal**: Demonstrate a realistic, high-urgency production outage and explain why standard stateless AI assistants fall short.

- **SCREEN**: War Room — Incident Details
- **BUTTON**: `Demo Scenario` in top navigation bar
- **ACTION**: Click `Demo Scenario` (or select `INC-DEMO-PAY` from the sidebar).
- **WHAT TO SAY**:
  > "Let's observe a live critical outage: the Payment API is returning HTTP 503 errors on checkout endpoints. P99 latency has spiked to over 4,200 milliseconds, and error rates have hit 18.4%.
  >
  > A typical incident-response assistant can analyze the current error logs, but without persistent memory, it starts completely from scratch. It doesn't know how this service is configured, it doesn't know past failure patterns, and it often suggests blind restarts that temporarily mask the root cause."
- **EXPECTED RESULT**:
  - Payment API outage (`INC-DEMO-PAY`) loads with red `P1 - CRITICAL` badge.
  - Symptoms displayed: `HTTP 503 Service Unavailable`, `High latency (>4000ms)`, `Database connection timeout on checkout endpoints`.
  - Error logs displayed: `Timeout waiting for database connection from pool`, `Connection pool exhausted (active=50, max=50)`.

---

## PART 3 — CREATE / SELECT INCIDENT (0:50 – 1:10)

**Goal**: Showcase how an incident is registered, inspected, and verified in OpsMemory.

- **SCREEN**: War Room — Incident Detail Card
- **BUTTON**: Section Jump `#Details`
- **ACTION**: Briefly review the service name (`Payment API`), severity dropdown (`P1 - CRITICAL`), status (`ACTIVE`), observed symptoms tags, and telemetry logs. (Optionally mention the `+ New` button on the sidebar for manual registration).
- **WHAT TO SAY**:
  > "Here in the War Room, we have the complete incident manifest: service name, critical severity, observed symptoms, and raw telemetry logs from our application pods. 
  >
  > Notice the error: `Connection pool exhausted (active=50, max=50)`. Is the database down? Or is this a client-side pool misconfiguration? Let's ask OpsMemory to investigate."
- **EXPECTED RESULT**: All diagnostic signals are clearly visible to the viewer.

---

## PART 4 — ANALYZE INCIDENT (1:10 – 1:35)

**Goal**: Trigger the core AI agent analysis and highlight the agent's dual-step investigation process.

- **SCREEN**: War Room — Incident Detail Action Bar
- **BUTTON**: `Analyze Incident` (Top right of incident detail card)
- **ACTION**: Click `Analyze Incident`.
- **WHAT TO SAY**:
  > "When we click 'Analyze Incident', the agent doesn't just pass these raw logs into a stateless LLM. 
  > 
  > First, it builds an expressive semantic recall query. Then, it queries our Hindsight memory bank to see if the engineering team has ever seen this exact failure pattern before. Once historical memories are retrieved, the agent synthesizes current telemetry with past proven runbooks."
- **EXPECTED RESULT**:
  - Button switches to active analyzing spinner.
  - Green success toast appears: `"Analysis complete. Recalled 4 historical postmortems from Hindsight."`
  - Analysis Result card animates into view.
  - Right sidebar Hindsight Memory panel populates with retrieved postmortems.

---

## PART 5 — HINDSIGHT MEMORY RETRIEVAL (1:35 – 2:05) [CRITICAL CORE MOMENT]

**Goal**: Explicitly demonstrate the Hindsight memory retrieval mechanism and show the historical incident.

- **SCREEN**: War Room — Right Panel (`Hindsight Long-Term Memory Explorer`)
- **BUTTON**: None (Point to the retrieved memory card `INC-001`)
- **ACTION**: Hover over and highlight the top retrieved memory card: `INC-001` with `96% Match` badge.
- **WHAT TO SAY**:
  > "Look at the Hindsight Memory panel on the right. 
  >
  > The agent is not simply hallucinating or generating this recommendation from the current error. It retrieved historical postmortem INC-001 from Hindsight with a 96% semantic match.
  >
  > Hindsight remembered that back in March, during a flash sale, the Payment API suffered the exact same outage. The root cause wasn't a crashed database—Postgres CPU was under 30%. The root cause was client-side HikariCP pool starvation capped at default 50 connections.
  >
  > Hindsight preserved the exact resolution: scale pool capacity to 150 and execute a zero-downtime rolling restart."
- **EXPECTED RESULT**:
  - `INC-001: Payment API` card clearly visible.
  - `96% Match` badge, `hindsight-cloud` source badge, and historical root cause/resolution displayed.

---

## PART 6 — BEFORE VS AFTER MEMORY (OPTIONAL / 2:05 – 2:25)

**Goal**: Compare what happens with vs without persistent memory.

- **SCREEN**: War Room — Side-by-Side Comparison
- **BUTTON**: `Compare (Stateless vs Memory)`
- **ACTION**: Click `Compare (Stateless vs Memory)` to open the split comparison view.
- **WHAT TO SAY**:
  > "To see why Hindsight is revolutionary for DevOps, look at this side-by-side comparison:
  >
  > On the left, a standard AI model operating without memory provides generic advice: 'restart the instances, check general logs, contact team lead' with LOW confidence. A blind restart would only crash the checkout pods again within 45 seconds.
  >
  > On the right, OpsMemory with Hindsight provides a HIGH-confidence, deterministic runbook citing INC-001: scale DB_POOL_MAX to 150 with a rolling restart."
- **EXPECTED RESULT**: Split view showing Stateless Generic (left) vs Hindsight Memory (right). Click `#Analysis & Runbook` or Close Comparison to return to main analysis.

---

## PART 7 — AI RECOMMENDATION & RUNBOOK SANDBOX (2:25 – 2:50)

**Goal**: Demonstrate the structured recommendation, investigation checklist, and interactive CLI runbook simulation.

- **SCREEN**: War Room — Analysis Result Card
- **BUTTON**: `Simulate & Verify` (Next to runbook step)
- **ACTION**: Click `Simulate & Verify` on the pool scale resolution step.
- **WHAT TO SAY**:
  > "The agent produces a structured, evidence-based triage report:
  > - Likely Root Cause: Database connection pool exhaustion under elevated traffic.
  > - Confidence: HIGH.
  > - Recommended Resolution: Scale pool capacity from 50 to 150 and trigger zero-downtime rollout.
  >
  > OpsMemory includes an interactive SRE sandbox. When we click 'Simulate & Verify', we can execute the remediation command: `kubectl set env deployment/payment-api DB_POOL_MAX=150`.
  > The simulation confirms: zero dropped requests, queue cleared, and P99 latency normalized to 41ms."
- **EXPECTED RESULT**: SRE terminal execution modal opens showing realistic `kubectl` command execution, terminal output, and `Dry-Run Passed | RBAC Authorized` verdict.

---

## PART 8 — RESOLVE INCIDENT (2:50 – 3:15)

**Goal**: Demonstrate the incident resolution workflow and transition into permanent memory retention.

- **SCREEN**: War Room — Analysis Result Card
- **BUTTON**: `Mark Resolved & Retain to Hindsight`
- **ACTION**: Click `Mark Resolved & Retain to Hindsight`.
- **WHAT TO SAY**:
  > "Now the incident is mitigated. But the most important part of incident response is learning.
  >
  > We open the Resolution modal. Here we document:
  > - Actual Root Cause: Database connection pool exhaustion during flash sale.
  > - Resolution: Scaled HikariCP pool from 50 to 150 connections and executed rolling restart.
  > - Outcome: P99 latency dropped from 4,200ms to 41ms. 0 dropped requests.
  > - Lessons Learned: Always auto-scale connection pool limits for high-throughput sale events.
  >
  > Now we click 'Retain Knowledge to Hindsight'."
- **EXPECTED RESULT**: Modal opens, user clicks `Retain Knowledge to Hindsight`.

---

## PART 9 — HINDSIGHT RETAIN (3:15 – 3:35) [SECOND CRITICAL CORE MOMENT]

**Goal**: Show that the resolved incident is permanently encoded into Hindsight as a new memory.

- **SCREEN**: War Room — Success Toast & Memory Timeline Stream
- **BUTTON**: Section Jump `#Event Stream`
- **ACTION**: Point to the success toast and the new timeline entry.
- **WHAT TO SAY**:
  > "Notice the success confirmation: 'Resolution retained into Hindsight! Memory ID: mem-INC-DEMO-PAY'.
  >
  > Down in our Memory Timeline, we see the permanent audit trail: `resolution_retained` in bank `ops-memory`. 
  >
  > The agent has not merely solved this incident—it has evolved. The new knowledge, root cause, and runbook are retained so that anyone on the team, or any future automated triage run, can immediately benefit from it."
- **EXPECTED RESULT**:
  - Toast: `Resolution retained into Hindsight! (Memory ID: mem-INC-DEMO-PAY-...)`.
  - Timeline stream displays the new retain event with timestamp and details.
  - Retained count increments.

---

## PART 10 — FUTURE INCIDENT & MEMORY RECALL (3:35 – 4:00)

**Goal**: Demonstrate that the newly retained memory is immediately retrievable for future incidents.

- **SCREEN**: War Room — Right Panel (`Hindsight Memory Explorer`)
- **BUTTON**: Direct Semantic Recall Query Input
- **ACTION**: In the Direct Recall search bar on the right, type: `Payment API connection pool` and click `Recall`.
- **WHAT TO SAY**:
  > "To verify that this knowledge is active, let's query Hindsight directly. We search for 'Payment API connection pool'.
  >
  > Instantly, Hindsight recalls both our original benchmark incident INC-001 AND our newly retained postmortem INC-DEMO-PAY.
  >
  > This completes the full intelligence loop:
  > Incident occurred -> Hindsight recalled past wisdom -> Outage resolved -> Knowledge retained -> Future incidents protected."
- **EXPECTED RESULT**: Both `INC-001` and `INC-DEMO-PAY` appear in the memory results list with full postmortem metadata.

---

## PART 11 — CLOSING & IMPACT (4:00 – 4:20)

**Goal**: Deliver a memorable closing statement summarizing the architectural innovation and measurable impact.

- **SCREEN**: SRE Analytics View (`Analytics` in Navbar)
- **BUTTON**: `SRE Analytics` in top navigation bar
- **ACTION**: Click `SRE Analytics` to show the metrics dashboard.
- **WHAT TO SAY**:
  > "By bridging stateless LLMs with Hindsight persistent memory, OpsMemory achieves a 71% reduction in Mean Time to Resolution, saves tens of thousands in downtime costs, and transforms every production outage into an permanent organizational superpower.
  >
  > Thank you."
- **EXPECTED RESULT**: Analytics view displays MTTR down from 48m to 14m (-71%), $207,000 USD saved, and 94.2% memory attribution rate.
