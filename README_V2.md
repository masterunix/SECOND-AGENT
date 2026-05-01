# 🚀 GlobalFreight Exception Handler - Level 2

**AI-Fortnight 2026 - Intellithon Challenge Level 2**

An autonomous AI agent that processes logistics exception events with safety guardrails, context awareness, and intelligent decision-making. Built with LangChain Agents, tool calling, and production-ready safety mechanisms.

![Status](https://img.shields.io/badge/status-level--2--ready-brightgreen)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Agent](https://img.shields.io/badge/agent-autonomous-orange)

---

## 🎯 The Challenge

GlobalFreight's operations desk receives a **constant stream of exception events**:
- Flight cancellations
- Port congestion
- Customs holds
- Perishable goods at risk
- Customer cancellation requests

**The Problem:**
- ~20 exception events queue up overnight
- High volume + limited human capacity
- Leads to: missed events, incorrect classification, delayed escalations

**The Solution:**
Build an **AI agent** that:
- ✅ Processes events autonomously and safely
- ✅ Assesses severity (cargo type, tier, delay, reason code)
- ✅ Decides: auto-resolve OR escalate to human
- ✅ Takes appropriate actions (notify, escalate, flag, route)
- ✅ Maintains detailed audit log
- ✅ Enforces safety guardrails (max 3 cancellations per 10 minutes)
- ✅ Remembers context across events (same shipment, multiple events)

---

## ✨ Key Features

### 🤖 Autonomous Agent
- **LangChain Agent** with tool calling
- **10 specialized tools** for different actions
- **Policy-aware** via RAG (retrieves from SLA, Customs, Delay Policy)
- **Context-aware** - remembers previous events for same shipment

### 🛡️ Safety Guardrails
- **Cancellation limit:** Max 3 per 10-minute window
- **Automatic enforcement:** Agent detects breach and escalates
- **Audit trail:** Every decision logged with reasoning

### 🎯 Intelligent Decision Making
- **Severity assessment:** Critical, High, Medium, Low
- **Multi-factor analysis:** Cargo type, customer tier, delay, reason code
- **Policy compliance:** Queries documents for rules and thresholds
- **Escalation triggers:** Pharma >2h, perishables >4h, cancellations, etc.

### 📊 Complete Audit Trail
- Every action logged with timestamp
- Decision reasoning captured
- Guardrail status tracked
- Downloadable JSON audit log

---

## 🏗️ Architecture

### Level 2 vs Level 1

| Feature | Level 1 (RAG Q&A) | Level 2 (Agent) |
|---------|-------------------|-----------------|
| **Type** | Retrieval-Augmented Generation | Autonomous Agent with Tools |
| **Interaction** | User asks questions | Agent processes events autonomously |
| **Actions** | Returns answers only | Takes actions (notify, escalate, etc.) |
| **Tools** | None | 10 specialized tools |
| **Context** | Single query | Multi-event context awareness |
| **Safety** | N/A | Enforced guardrails |
| **Audit** | None | Complete decision trail |

### Agent Architecture

```
Event Stream (20 events)
    ↓
Agent Executor (LangChain)
    ↓
┌─────────────────────────────────────┐
│  Agent Decision Loop                │
│  1. Query policy documents (RAG)    │
│  2. Check shipment history          │
│  3. Assess severity                 │
│  4. Log decision                    │
│  5. Take action(s)                  │
└─────────────────────────────────────┘
    ↓
Tools (10 available)
    ├─ query_policy
    ├─ notify_customer
    ├─ escalate_to_human
    ├─ flag_customs_issue
    ├─ arrange_alternative_routing
    ├─ apply_compensation
    ├─ request_cancellation_approval ⚠️
    ├─ update_eta
    ├─ get_shipment_history
    └─ log_decision
    ↓
Audit Log + Results
```

---

## 🎬 Quick Start

### Prerequisites
- Python 3.8+
- Azure OpenAI API key (or PAI API key for hackathon)
- Dependencies: `langchain`, `langchain-openai`, `flask`, `chromadb`

### Installation

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure API key
# Copy .env.example to .env and add your key
cp .env.example .env
# Edit .env with your Azure OpenAI or PAI API key

# 3. Start Level 2 backend
python backend_v2.py

# 4. In new terminal, start frontend
python -m http.server 8000

# 5. Open browser
open http://localhost:8000/index_v2.html
```

### Using PAI API (Hackathon)

If using PAI instead of Azure OpenAI, update your `.env`:

```bash
# PAI Configuration
AZURE_OPENAI_API_KEY=your_pai_key_here
AZURE_OPENAI_ENDPOINT=https://pai-api.thepsi.com/api/v4/chat
AZURE_OPENAI_DEPLOYMENT=gpt-5-nano
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

---

## 📋 Agent Tools

### 1. `query_policy`
Query policy documents (SLA, Customs, Delay Policy) for rules, thresholds, compensation rates, etc.

**Example:** "What is the delay tolerance for Platinum customers?"

### 2. `notify_customer`
Send notification to customer about their shipment.

**Parameters:** shipment_id, customer, message, urgency

### 3. `escalate_to_human`
Escalate event to human operator (Operations Manager, Medical Supplies Desk, etc.).

**Parameters:** shipment_id, reason, escalation_target, priority

### 4. `flag_customs_issue`
Flag a customs-related issue for correction.

**Parameters:** shipment_id, issue_type, corrective_action

### 5. `arrange_alternative_routing`
Arrange alternative routing for a shipment.

**Parameters:** shipment_id, reason, estimated_delay_reduction

### 6. `apply_compensation`
Apply compensation to customer for service failure.

**Parameters:** shipment_id, customer, compensation_type, amount, reason

### 7. `request_cancellation_approval` ⚠️
Request approval for shipment cancellation. **CRITICAL:** Enforces 3-per-10-minute guardrail.

**Parameters:** shipment_id, customer, reason, cancellation_number

### 8. `update_eta`
Update the estimated time of arrival for a shipment.

**Parameters:** shipment_id, new_eta, reason

### 9. `get_shipment_history`
Retrieve previous events for a specific shipment to maintain context.

**Parameters:** shipment_id

### 10. `log_decision`
Log a decision made by the agent for audit trail.

**Parameters:** event_id, decision, reasoning, severity

---

## 🎯 Event Stream Overview

The `Version2/event_stream.json` contains **20 real-world exception events**:

| Type | Count | Examples |
|------|-------|----------|
| **Delay** | 8 | ATC hold, traffic, mechanical failure, IT outage |
| **Customs hold** | 3 | Wrong HS code, missing WHO-GMP cert, pharma hold |
| **Cancellation requests** | 3 | Pre-departure, in-transit, complex |
| **Critical / pharma** | 3 | Cold chain, medical, biopharm |
| **Weather / force majeure** | 2 | Cyclone, weather reroute |
| **Other** | 1 | Regulatory airspace restriction |

### Key Test Cases

#### 1. Context Awareness (EVT-001 & EVT-008)
- **EVT-001:** SHP-4421 delayed 3.5 hours
- **EVT-008:** Same shipment, now 7 hours delayed
- **Agent must:** Remember EVT-001 and build on previous decision

#### 2. Critical Escalation (EVT-004)
- **Event:** Pharma cold chain, 36-hour delay
- **Agent must:** Escalate to Medical Supplies Desk immediately
- **Rule:** Any pharma delay >2h requires specialist escalation

#### 3. Guardrail Enforcement (EVT-011, EVT-016, EVT-018)
- **EVT-011:** 1st cancellation request
- **EVT-016:** 2nd cancellation request
- **EVT-018:** 3rd cancellation request ⚠️
- **Agent must:** Detect breach on EVT-018 and escalate to Operations Manager

#### 4. Perishable Goods (EVT-006)
- **Event:** Fresh produce, 5-hour delay (limit is 4h)
- **Agent must:** Escalate immediately per Section 6.1

#### 5. Borderline Threshold (EVT-020)
- **Event:** Delay exactly 2 hours (threshold is >2h)
- **Agent must:** Determine if notification required (edge case)

---

## 🛡️ Safety Guardrails

### Cancellation Limit
**Rule:** No agent (human or AI) may cancel more than 3 shipments in any 10-minute window.

**Implementation:**
1. Agent tracks all cancellation requests with timestamps
2. On each cancellation, checks count in last 10 minutes
3. If count ≥ 3, agent MUST:
   - Pause processing
   - Use `request_cancellation_approval` tool
   - Escalate to Operations Manager
   - Log guardrail breach in audit trail

**Test:** Events 11, 16, and 18 are cancellation requests. On EVT-018, agent should detect breach.

---

## 📊 Severity Assessment

The agent assesses severity based on multiple factors:

### CRITICAL
- Pharma/medical cargo
- Cold chain shipments
- Perishables with delay >4h
- Cancellation requests
- Legal/financial documents
- High-value Platinum shipments

### HIGH
- Platinum delays >4h
- Gold delays >12h
- Customs holds
- Regulatory issues

### MEDIUM
- Standard tier delays
- Port congestion
- Minor documentation issues

### LOW
- Minor delays within tolerance
- Routine ETA updates
- Procedural delays

---

## 🎮 Usage

### Process Single Event
1. Open `http://localhost:8000/index_v2.html`
2. Select an event from the left panel
3. Review event details in center panel
4. Click **"Process Event"**
5. Agent will:
   - Query policies
   - Check shipment history
   - Assess severity
   - Log decision
   - Take action(s)
6. View results and audit log

### Process All Events
1. Click **"Process All Events"**
2. Agent processes all 20 events sequentially
3. View summary:
   - Total actions taken
   - Escalations count
   - Notifications sent
   - Cancellations processed
   - Guardrail breaches detected
4. Download complete audit log as JSON

### View Audit Log
1. Click **"View Audit Log"** in right panel
2. See all actions with timestamps
3. Review decision reasoning
4. Check guardrail status

---

## 🧪 Testing Checklist

### ✅ Core Functionality
- [ ] Agent loads policy documents successfully
- [ ] Agent processes single event
- [ ] Agent processes all 20 events
- [ ] All 10 tools are accessible
- [ ] Audit log captures all actions

### ✅ Context Awareness
- [ ] Agent remembers EVT-001 when processing EVT-008
- [ ] Agent uses `get_shipment_history` tool
- [ ] Agent builds on previous decisions

### ✅ Safety Guardrails
- [ ] Agent tracks cancellation count
- [ ] Agent detects breach on 3rd cancellation (EVT-018)
- [ ] Agent escalates to Operations Manager
- [ ] Guardrail status updates in UI

### ✅ Severity Assessment
- [ ] Critical events escalated (EVT-004, EVT-006, EVT-010)
- [ ] High-priority events handled correctly
- [ ] Low-priority events auto-resolved
- [ ] Borderline cases handled (EVT-020)

### ✅ Policy Compliance
- [ ] Agent queries policy documents
- [ ] Agent applies correct compensation rules
- [ ] Agent respects SLA pause conditions
- [ ] Agent follows escalation triggers

---

## 📁 Project Structure

```
.
├── backend_v2.py                       # Level 2 Agent backend
├── app_v2.js                           # Level 2 Frontend JavaScript
├── index_v2.html                       # Level 2 UI
├── styles_v2.css                       # Level 2 Styling
├── requirements.txt                    # Python dependencies
├── .env                                # API configuration
├── README_V2.md                        # This file
│
├── Version2/
│   ├── README.md                       # Level 2 challenge description
│   └── event_stream.json               # 20 exception events
│
├── DOC1-carrier-sla-agreement.md       # Policy document 1
├── DOC2-customs-tariff-reference.md    # Policy document 2
├── DOC3-shipment-delay-policy.md       # Policy document 3
│
└── [Level 1 files]                     # Original RAG system
    ├── backend.py
    ├── app.js
    ├── index.html
    └── styles.css
```

---

## 🔧 API Endpoints

### `GET /health`
Health check and system status

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0-agent",
  "agent_type": "exception_handler",
  "policies_loaded": true,
  "tools_available": 10
}
```

### `POST /process-event`
Process a single exception event

**Request:**
```json
{
  "event_id": "EVT-001",
  "shipment_id": "SHP-4421",
  "customer": "Reliance Retail Ltd.",
  "customer_tier": "Platinum",
  ...
}
```

**Response:**
```json
{
  "event_id": "EVT-001",
  "shipment_id": "SHP-4421",
  "agent_response": "Processed event...",
  "actions_taken": 3,
  "timestamp": "2025-06-15T06:12:00Z"
}
```

### `POST /process-stream`
Process entire event stream (all 20 events)

**Response:**
```json
{
  "total_events": 20,
  "results": [...],
  "audit_log": [...],
  "summary": {
    "total_actions": 45,
    "escalations": 8,
    "notifications": 15,
    "cancellations": 3,
    "guardrail_breaches": 1
  }
}
```

### `GET /audit-log`
Get complete audit log

### `POST /audit-log/clear`
Clear audit log and reset state

### `GET /guardrail-status`
Get current guardrail status

**Response:**
```json
{
  "cancellations_in_window": 2,
  "guardrail_limit": 3,
  "status": "OK",
  "recent_cancellations": [...]
}
```

---

## 🎯 Challenge Requirements ✅

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| AI Agent | ✅ | LangChain Agent with tool calling |
| Context Awareness | ✅ | Shipment history tracking |
| Safety Guardrail | ✅ | 3-per-10-minute cancellation limit |
| Severity Assessment | ✅ | Multi-factor analysis |
| Autonomous Actions | ✅ | 10 specialized tools |
| Audit Trail | ✅ | Complete decision logging |
| Policy Integration | ✅ | RAG from 3 policy documents |
| Event Stream Processing | ✅ | Handles all 20 events |
| Escalation Logic | ✅ | Rule-based triggers |
| Guardrail Enforcement | ✅ | Automatic detection & escalation |

---

## 🚀 Level 1 → Level 2 Upgrade Summary

### What Changed?

1. **Backend:** `backend.py` → `backend_v2.py`
   - Added LangChain Agent with tool calling
   - Implemented 10 specialized tools
   - Added guardrail enforcement
   - Added shipment context tracking
   - Added audit logging

2. **Frontend:** `app.js` → `app_v2.js`
   - Event stream viewer
   - Single event processing
   - Batch processing (all events)
   - Audit log viewer
   - Guardrail status monitor

3. **UI:** `index.html` → `index_v2.html`
   - 3-panel layout (events, details, info)
   - Event severity indicators
   - Real-time guardrail status
   - Audit log display

4. **New Files:**
   - `Version2/event_stream.json` - 20 test events
   - `Version2/README.md` - Challenge description

---

## 🏆 Hackathon Demo Script

### 1. Introduction (1 min)
"We upgraded from a simple Q&A system to an autonomous agent that processes logistics exceptions with safety guardrails."

### 2. Show Event Stream (1 min)
"Here are 20 real-world exception events - delays, customs holds, cancellations, critical pharma shipments."

### 3. Process Single Event (2 min)
- Select EVT-004 (critical pharma delay)
- Click "Process Event"
- Show agent:
  - Queries policy documents
  - Assesses severity as CRITICAL
  - Escalates to Medical Supplies Desk
  - Logs decision with reasoning

### 4. Show Context Awareness (2 min)
- Process EVT-001 (3.5h delay)
- Process EVT-008 (same shipment, now 7h)
- Show agent remembers previous event

### 5. Demonstrate Guardrail (2 min)
- Process EVT-011 (1st cancellation) - OK
- Process EVT-016 (2nd cancellation) - OK
- Process EVT-018 (3rd cancellation) - BREACH!
- Show agent detects breach and escalates

### 6. Process All Events (1 min)
- Click "Process All Events"
- Show summary: 45 actions, 8 escalations, 1 guardrail breach
- Download audit log

### 7. Conclusion (1 min)
"Autonomous, safe, context-aware, and fully auditable. Ready for production."

---

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.8+)
- Verify API key in `.env` file
- Install dependencies: `pip install -r requirements.txt`

### Agent not processing events
- Check backend logs for errors
- Verify policy documents (DOC1, DOC2, DOC3) exist
- Check API key is valid

### Guardrail not working
- Check backend logs for cancellation tracking
- Verify timestamps are correct
- Test with EVT-011, EVT-016, EVT-018 in sequence

---

## 📝 License

Built for **AI-Fortnight 2026 - Intellithon Challenge Level 2**

---

**Made with ⚡ by Team GlobalFreight**

*From Q&A to Autonomous Agent - Level Up Complete!*
