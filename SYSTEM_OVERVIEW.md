# 🎯 System Overview - Visual Guide

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEVEL 2: AUTONOMOUS AGENT                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (UI)                           │
│  ┌──────────────┬──────────────────────┬──────────────────┐    │
│  │ Event Stream │  Event Details       │  System Info     │    │
│  │              │  & Processing        │  & Audit Log     │    │
│  │ • 20 events  │  • Event details     │  • 10 tools      │    │
│  │ • Severity   │  • Process button    │  • Guardrails    │    │
│  │ • Progress   │  • Results display   │  • Severity      │    │
│  │              │  • Guardrail status  │  • Audit log     │    │
│  └──────────────┴──────────────────────┴──────────────────┘    │
│                                                                  │
│  Files: index_v2.html, app_v2.js, styles_v2.css                │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP (REST API)
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Agent)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AGENT EXECUTOR (LangChain)                   │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Agent Decision Loop                        │  │  │
│  │  │                                                     │  │  │
│  │  │  1. Receive Event                                  │  │  │
│  │  │  2. Query Policy Documents (RAG) ──────────┐       │  │  │
│  │  │  3. Check Shipment History                 │       │  │  │
│  │  │  4. Assess Severity                        │       │  │  │
│  │  │  5. Make Decision                          │       │  │  │
│  │  │  6. Take Action(s) via Tools               │       │  │  │
│  │  │  7. Log Everything                         │       │  │  │
│  │  └────────────────────────────────────────────┼───────┘  │  │
│  │                                                │          │  │
│  └────────────────────────────────────────────────┼──────────┘  │
│                                                    │             │
│  ┌────────────────────────────────────────────────┼──────────┐  │
│  │              POLICY KNOWLEDGE BASE (RAG)       │          │  │
│  │                                                 │          │  │
│  │  ┌──────────────────────────────────────────┐  │          │  │
│  │  │  Vector Store (ChromaDB)                 │◄─┘          │  │
│  │  │                                          │             │  │
│  │  │  • DOC1: Carrier SLA Agreement          │             │  │
│  │  │  • DOC2: Customs Tariff Reference       │             │  │
│  │  │  • DOC3: Shipment Delay Policy          │             │  │
│  │  │                                          │             │  │
│  │  │  (HuggingFace Embeddings - Local)       │             │  │
│  │  └──────────────────────────────────────────┘             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    10 AGENT TOOLS                          │  │
│  │                                                            │  │
│  │  1. query_policy              6. apply_compensation       │  │
│  │  2. notify_customer           7. request_cancellation_... │  │
│  │  3. escalate_to_human         8. update_eta              │  │
│  │  4. flag_customs_issue        9. get_shipment_history    │  │
│  │  5. arrange_alternative_...  10. log_decision            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   STATE MANAGEMENT                         │  │
│  │                                                            │  │
│  │  • shipment_context: Track events per shipment           │  │
│  │  • cancellation_tracker: Enforce 3-per-10-min limit      │  │
│  │  • audit_log: Complete decision trail                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  SAFETY GUARDRAILS                         │  │
│  │                                                            │  │
│  │  ⚠️  Cancellation Limit: Max 3 per 10 minutes             │  │
│  │  ⚠️  Automatic Breach Detection                           │  │
│  │  ⚠️  Mandatory Escalation on Violation                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  File: backend_v2.py                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    AZURE OPENAI / PAI API                       │
│                                                                  │
│  • Model: gpt-5-nano                                            │
│  • Temperature: 1                                               │
│  • Tool calling enabled                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Event Processing Flow

```
┌─────────────┐
│   Event     │  EVT-004: Pharma cold chain delayed 36h
│  Arrives    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Query Policy Documents                         │
│  Agent: "What's the rule for pharma delays?"            │
│  RAG: "Pharma delays >2h require Medical Supplies Desk" │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Check Shipment History                         │
│  Agent: "Have I seen this shipment before?"             │
│  Tool: get_shipment_history(SHP-1105)                   │
│  Result: "No previous events"                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 3: Assess Severity                                │
│  Factors:                                               │
│  • Cargo: Pharmaceutical - Cold Chain ✓                │
│  • Delay: 36 hours (>>2h threshold) ✓                  │
│  • Customer: Platinum tier ✓                           │
│  • Value: $220,000 ✓                                   │
│  Assessment: CRITICAL                                   │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 4: Make Decision                                  │
│  Decision: ESCALATE TO HUMAN                            │
│  Reasoning: "Pharma cold chain >2h requires specialist" │
│  Target: Medical Supplies Desk                          │
│  Priority: CRITICAL                                     │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 5: Take Actions                                   │
│  Tool 1: log_decision(EVT-004, "escalate", ...)         │
│  Tool 2: escalate_to_human(SHP-1105, "pharma >2h", ...) │
│  Tool 3: notify_customer(SHP-1105, "urgent", ...)       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 6: Log to Audit Trail                             │
│  {                                                       │
│    "event_id": "EVT-004",                               │
│    "decision": "escalate",                              │
│    "severity": "CRITICAL",                              │
│    "reasoning": "Pharma cold chain >2h...",             │
│    "actions": [                                         │
│      "escalated to Medical Supplies Desk",              │
│      "notified customer"                                │
│    ],                                                   │
│    "timestamp": "2025-06-15T07:35:00Z"                  │
│  }                                                       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Result    │  ✓ Event processed
│  Returned   │  ✓ Actions taken
└─────────────┘  ✓ Audit logged
```

---

## 🛡️ Guardrail Enforcement Flow

```
┌─────────────┐
│  EVT-011    │  1st Cancellation Request
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Check Cancellation Count               │
│  Recent cancellations: 0                │
│  Status: OK (0/3)                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Process Cancellation                   │
│  ✓ Request approval                     │
│  ✓ Track in cancellation_tracker        │
│  ✓ Log action                           │
└─────────────────────────────────────────┘

┌─────────────┐
│  EVT-016    │  2nd Cancellation Request
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Check Cancellation Count               │
│  Recent cancellations: 1                │
│  Status: OK (1/3)                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Process Cancellation                   │
│  ✓ Request approval                     │
│  ✓ Track in cancellation_tracker        │
│  ✓ Log action                           │
└─────────────────────────────────────────┘

┌─────────────┐
│  EVT-018    │  3rd Cancellation Request
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Check Cancellation Count               │
│  Recent cancellations: 2                │
│  Status: APPROACHING LIMIT (2/3)        │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  ⚠️  GUARDRAIL BREACH DETECTED!         │
│                                         │
│  Recent count: 2                        │
│  This request: 1                        │
│  Total: 3 (LIMIT REACHED)               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  AUTOMATIC ACTIONS                      │
│  1. PAUSE processing                    │
│  2. DO NOT proceed with cancellation    │
│  3. Escalate to Operations Manager      │
│  4. Log guardrail breach                │
│  5. Update guardrail status: BREACH     │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Result                                 │
│  ⚠️  Cancellation NOT processed         │
│  ✓  Escalated for human approval        │
│  ✓  Guardrail enforced                  │
│  ✓  Audit trail updated                 │
└─────────────────────────────────────────┘
```

---

## 🧠 Context Awareness Flow

```
┌─────────────┐
│  EVT-001    │  SHP-4421 delayed 3.5 hours
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Check Shipment History                 │
│  get_shipment_history(SHP-4421)         │
│  Result: No previous events             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Process Event                          │
│  • Assess: LOW severity (3.5h < 4h)    │
│  • Action: Notify customer              │
│  • Store: Save to shipment_context      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  shipment_context[SHP-4421] = [         │
│    {                                    │
│      "event_id": "EVT-001",             │
│      "delay": 3.5,                      │
│      "action": "notified_customer"      │
│    }                                    │
│  ]                                      │
└─────────────────────────────────────────┘

        ⏰ Time passes...

┌─────────────┐
│  EVT-008    │  SHP-4421 now delayed 7 hours (SAME SHIPMENT!)
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Check Shipment History                 │
│  get_shipment_history(SHP-4421)         │
│  Result: Found EVT-001!                 │
│  {                                      │
│    "event_id": "EVT-001",               │
│    "delay": 3.5,                        │
│    "action": "notified_customer"        │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Context-Aware Decision                 │
│  • Previous: 3.5h delay                 │
│  • Current: 7h delay (WORSENING!)       │
│  • Platinum tolerance: 4h               │
│  • Now exceeds SLA!                     │
│  • Decision: Apply compensation         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Take Actions                           │
│  1. Apply SLA credit (10% per 24h)      │
│  2. Notify customer (proactive)         │
│  3. Escalate to account manager         │
│  4. Update shipment_context             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Result                                 │
│  ✓  Context-aware decision made         │
│  ✓  Built on previous event             │
│  ✓  Appropriate escalation              │
│  ✓  Customer proactively notified       │
└─────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        INPUT LAYER                           │
├──────────────────────────────────────────────────────────────┤
│  • Version2/event_stream.json (20 events)                    │
│  • DOC1-carrier-sla-agreement.md                             │
│  • DOC2-customs-tariff-reference.md                          │
│  • DOC3-shipment-delay-policy.md                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    PROCESSING LAYER                          │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Text Splitter │→ │  Embeddings    │→ │  Vector Store  │ │
│  │  (800 chars)   │  │  (HuggingFace) │  │  (ChromaDB)    │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Agent Executor (LangChain)                │  │
│  │  • Receives events                                     │  │
│  │  • Queries vector store (RAG)                          │  │
│  │  • Makes decisions                                     │  │
│  │  • Calls tools                                         │  │
│  │  • Enforces guardrails                                 │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                      OUTPUT LAYER                            │
├──────────────────────────────────────────────────────────────┤
│  • Agent decisions (JSON)                                    │
│  • Action results (tool outputs)                             │
│  • Audit log entries (timestamped)                           │
│  • Guardrail status (real-time)                              │
│  • UI updates (WebSocket/polling)                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Severity Assessment Logic

```
┌─────────────────────────────────────────────────────────────┐
│                   SEVERITY ASSESSMENT                       │
└─────────────────────────────────────────────────────────────┘

Input: Event Data
  ├─ cargo_type
  ├─ customer_tier
  ├─ delay_hours
  ├─ reason_code
  └─ event_type

                    ↓

┌─────────────────────────────────────────────────────────────┐
│  CRITICAL (Immediate Escalation Required)                   │
├─────────────────────────────────────────────────────────────┤
│  • Pharma / Medical / Cold Chain                            │
│  • Perishables with delay >4h                               │
│  • Cancellation requests                                    │
│  • Legal / Financial documents                              │
│  • High-value Platinum (>$500k)                             │
└─────────────────────────────────────────────────────────────┘

                    ↓ (if not critical)

┌─────────────────────────────────────────────────────────────┐
│  HIGH (Escalation Likely)                                   │
├─────────────────────────────────────────────────────────────┤
│  • Platinum delays >4h                                      │
│  • Gold delays >12h                                         │
│  • Customs holds                                            │
│  • Regulatory issues                                        │
│  • High-value shipments (>$200k)                            │
└─────────────────────────────────────────────────────────────┘

                    ↓ (if not high)

┌─────────────────────────────────────────────────────────────┐
│  MEDIUM (Monitor & Notify)                                  │
├─────────────────────────────────────────────────────────────┤
│  • Standard tier delays                                     │
│  • Port congestion                                          │
│  • Minor documentation issues                               │
│  • Gold delays 8-12h                                        │
└─────────────────────────────────────────────────────────────┘

                    ↓ (if not medium)

┌─────────────────────────────────────────────────────────────┐
│  LOW (Auto-Resolve)                                         │
├─────────────────────────────────────────────────────────────┤
│  • Minor delays within tolerance                            │
│  • Routine ETA updates                                      │
│  • Procedural delays                                        │
│  • Standard tier <24h                                       │
└─────────────────────────────────────────────────────────────┘

                    ↓

Output: Severity Level + Recommended Action
```

---

## 🔧 Tool Execution Flow

```
Agent decides to use a tool
         │
         ▼
┌─────────────────────────────────────────┐
│  Tool: escalate_to_human                │
│  Parameters:                            │
│  • shipment_id: "SHP-4421"              │
│  • reason: "Pharma delay >2h"           │
│  • escalation_target: "Medical Desk"    │
│  • priority: "critical"                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Tool Execution                         │
│  1. Validate parameters                 │
│  2. Create log entry                    │
│  3. Add to audit_log                    │
│  4. Return confirmation                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Audit Log Entry                        │
│  {                                      │
│    "action": "escalate_to_human",       │
│    "shipment_id": "SHP-4421",           │
│    "reason": "Pharma delay >2h",        │
│    "escalation_target": "Medical Desk", │
│    "priority": "critical",              │
│    "timestamp": "2025-06-15T07:35:00Z"  │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Return to Agent                        │
│  "✓ Escalated SHP-4421 to Medical Desk  │
│   (priority: critical)"                 │
└──────┬──────────────────────────────────┘
       │
       ▼
Agent continues with next action
```

---

## 📁 File Structure

```
GlobalFreight-Level2/
│
├── 🚀 STARTUP
│   ├── run_v2.sh                    # One-command startup
│   └── .env                         # API configuration
│
├── 💻 BACKEND
│   ├── backend_v2.py                # Agent with 10 tools
│   └── requirements.txt             # Dependencies
│
├── 🎨 FRONTEND
│   ├── index_v2.html                # 3-panel UI
│   ├── app_v2.js                    # Event processor
│   └── styles_v2.css                # Dark theme
│
├── 📚 DOCUMENTATION
│   ├── START_HERE.md                # Your starting point ⭐
│   ├── QUICK_START_V2.md            # 30-second setup
│   ├── DEMO_SCRIPT_V2.md            # Presentation script
│   ├── HACKATHON_READY.md           # Pre-demo checklist
│   ├── README_V2.md                 # Complete docs
│   ├── LEVEL2_UPGRADE_SUMMARY.md    # What changed
│   ├── LEVEL_COMPARISON.md          # Level 1 vs 2
│   ├── README_NAVIGATION.md         # Doc guide
│   ├── COMPLETE_UPGRADE_PACKAGE.md  # Package overview
│   └── SYSTEM_OVERVIEW.md           # This file
│
├── 📄 POLICY DOCUMENTS
│   ├── DOC1-carrier-sla-agreement.md
│   ├── DOC2-customs-tariff-reference.md
│   └── DOC3-shipment-delay-policy.md
│
├── 🧪 TEST DATA
│   └── Version2/
│       ├── README.md                # Challenge description
│       └── event_stream.json        # 20 test events
│
└── 📦 LEVEL 1 (Original)
    ├── backend.py                   # Original RAG system
    ├── app.js                       # Original frontend
    ├── index.html                   # Original UI
    ├── styles.css                   # Original styles
    └── README.md                    # Level 1 docs
```

---

## 🎯 Quick Navigation

### Want to start immediately?
```bash
./run_v2.sh
```

### Want to understand the system?
Read: **START_HERE.md**

### Want to demo?
Read: **DEMO_SCRIPT_V2.md**

### Want complete docs?
Read: **README_V2.md**

---

## 🏆 You're Ready!

This visual guide shows you:
- ✅ Complete system architecture
- ✅ Event processing flow
- ✅ Guardrail enforcement
- ✅ Context awareness
- ✅ Data flow
- ✅ Severity assessment
- ✅ Tool execution
- ✅ File structure

**Now go win the hackathon! 🚀**

---

**Made with ⚡ by Team GlobalFreight**
