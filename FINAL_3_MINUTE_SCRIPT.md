# OpsMemory — Final 3-Minute Hackathon Demo Script

This script is timed precisely for a 3-minute video presentation (180 seconds). It follows an authentic engineering workflow demonstrating the exact problem, the Hindsight memory recall moment, the actionable AI recommendation, the postmortem retain operation, and future memory retrieval.

---

### Segment 1: Introduction (0:00 – 0:25)

- **TIME**: 0:00 – 0:25 (25s)
- **SCREEN**: OpsMemory War Room (`http://localhost:8000/`)
- **CLICK**: None (Mouse cursor rests on War Room header and telemetry ribbon)
- **ACTION**: Show the full dashboard view: live incident list on the left, the central triage workspace, and the Hindsight persistent memory panel on the right.
- **NARRATION**:
  "This is OpsMemory, an AI incident response agent designed for DevOps teams. When a critical production outage occurs, engineers often spend hours diagnosing an issue that was already solved months ago by someone else. OpsMemory integrates Hindsight persistent memory to retain historical postmortems, root causes, and runbooks—so when an incident happens, the agent recalls past solutions instead of starting from scratch."
- **EXPECTED RESULT**: Viewer sees a clean, professional, high-density SRE dashboard with real-time telemetry and Hindsight memory bank status (`ops-memory` connected).

---

### Segment 2: The Problem (0:25 – 0:50)

- **TIME**: 0:25 – 0:50 (25s)
- **SCREEN**: War Room — Top Navigation & Incident Overview
- **CLICK**: `Demo Scenario` button in the top navigation bar
- **ACTION**: Click `Demo Scenario` to load the active critical Payment API outage (`INC-DEMO-PAY`).
- **NARRATION**:
  "Let's look at an active incident. Our Payment API has started returning HTTP 503 errors on checkout requests. P99 latency has jumped to over 4,200 milliseconds, and error rates are spiking. Looking at the raw logs, we see: 'Timeout waiting for database connection from pool' and 'Connection pool exhausted (active=50, max=50)'. A standard AI assistant looking only at these logs might suggest a blind pod restart, which would only temporarily mask the issue before the pool fills up again."
- **EXPECTED RESULT**: Payment API outage loads with `P1 - CRITICAL` severity badge, 4,250ms P99 latency indicator, and HikariCP pool exhaustion error logs clearly visible.

---

### Segment 3: Incident Inspection & Trigger (0:50 – 1:10)

- **TIME**: 0:50 – 1:10 (20s)
- **SCREEN**: War Room — Incident Detail Card
- **CLICK**: `Analyze Incident` button (Top right of incident detail card)
- **ACTION**: Mouse highlights the observed symptoms and error logs, then clicks `Analyze Incident`.
- **NARRATION**:
  "We have the symptoms and logs logged in our incident manifest. Instead of guessing, we click 'Analyze Incident'. The agent extracts the key operational signals, builds an expressive query, and searches our Hindsight persistent memory bank to see if our team has encountered this exact failure signature before."
- **EXPECTED RESULT**: Analysis button shows loading spinner, background requests execute to recall Hindsight memories and invoke the LLM, and a success toast appears: "Analysis complete. Recalled 4 historical postmortems from Hindsight."

---

### Segment 4: Hindsight Memory Retrieval (1:10 – 1:45)

- **TIME**: 1:10 – 1:45 (35s)
- **SCREEN**: War Room — Right Panel (`Hindsight Long-Term Memory Explorer`)
- **CLICK**: None (Mouse cursor highlights `INC-001` in the memory panel)
- **ACTION**: Hover over the recalled memory card for `INC-001` (`Payment API - Database connection pool exhaustion`).
- **NARRATION**:
  "Here in the Hindsight Memory panel on the right, the agent retrieved historical postmortem INC-001 with a 96% match. Hindsight remembered that during a previous traffic surge, the Payment API failed with the exact same symptoms. The database server itself was healthy, but the HikariCP client pool was capped at default 50 connections. The proven historical resolution was to scale the connection pool capacity to 150 and execute a zero-downtime rolling restart. The agent isn't guessing—it is applying verified institutional memory."
- **EXPECTED RESULT**: Memory card for `INC-001` is prominent, showing `96% Match`, `hindsight-cloud` source, the exact historical root cause, and the tested resolution runbook.

---

### Segment 5: AI Analysis & Runbook Verification (1:45 – 2:20)

- **TIME**: 1:45 – 2:20 (35s)
- **SCREEN**: War Room — Analysis Result Card
- **CLICK**: `Simulate & Verify` on the pool scaling runbook step
- **ACTION**: Review the structured analysis card (Root Cause: Connection pool exhaustion, Confidence: HIGH), then click `Simulate & Verify` to demonstrate the interactive SRE CLI sandbox.
- **NARRATION**:
  "In the central analysis card, OpsMemory presents a structured triage report with HIGH confidence. It cites INC-001 as its historical precedent and provides the exact remediation steps. Using our interactive CLI sandbox, we can simulate the verification command: `kubectl set env deployment/payment-api DB_POOL_MAX=150`. The simulation confirms that the queue clears with zero dropped requests, and P99 latency drops back to 41 milliseconds."
- **EXPECTED RESULT**: CLI sandbox modal opens, showing command execution, terminal output, and confirmation that HTTP 503 errors dropped below 0.01%.

---

### Segment 6: Resolve Incident & Retain New Memory (2:20 – 2:40)

- **TIME**: 2:20 – 2:40 (20s)
- **SCREEN**: War Room — Resolution Modal
- **CLICK**: `Mark Resolved & Retain to Hindsight` -> `Retain Knowledge to Hindsight`
- **ACTION**: Click `Mark Resolved & Retain to Hindsight`, verify the prefilled root cause and lessons learned, and click `Retain Knowledge to Hindsight`.
- **NARRATION**:
  "Once the mitigation is verified, we open the resolution workflow. We record the actual root cause, the resolution steps, and the lesson learned: always auto-scale connection pool limits for high-throughput sale events. Clicking 'Retain Knowledge to Hindsight' writes this postmortem directly into the Hindsight memory bank. The incident status is updated to RESOLVED, and the memory timeline logs the retain event."
- **EXPECTED RESULT**: Resolution modal submits cleanly, success chime plays, green toast displays: "Resolution retained into Hindsight! (Memory ID: mem-INC-DEMO-PAY-...)", and timeline updates.

---

### Segment 7: Future Incident & Key Takeaway (2:40 – 3:00)

- **TIME**: 2:40 – 3:00 (20s)
- **SCREEN**: War Room — Right Panel Query Search & SRE Analytics
- **CLICK**: Type `Payment API connection pool` into the Direct Recall search bar on the right, click `Recall`, then click `SRE Analytics` in top nav.
- **NARRATION**:
  "When we query Hindsight for 'Payment API connection pool', our newly retained postmortem INC-DEMO-PAY is immediately available alongside INC-001. By giving our incident response agent persistent memory with Hindsight, OpsMemory reduces MTTR by 71% and ensures that an engineering team never has to solve the same production outage twice."
- **EXPECTED RESULT**: Both INC-001 and INC-DEMO-PAY appear in the memory results, and clicking Analytics reveals a 71% MTTR reduction and $207,000 in saved downtime costs. Video ends on high-impact metric.
