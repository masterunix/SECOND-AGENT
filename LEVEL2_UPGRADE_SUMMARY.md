# 🚀 Level 1 → Level 2 Upgrade Summary

## Overview

You've successfully upgraded from a **RAG Q&A system** (Level 1) to an **Autonomous AI Agent** (Level 2) for the AI-Fortnight 2026 Hackathon!

---

## 📊 What Changed?

### Level 1: RAG Q&A System
- **Purpose:** Answer questions about logistics policies
- **Interaction:** User asks → System answers
- **Technology:** LangChain RetrievalQA
- **Actions:** None (read-only)
- **Context:** Single query at a time
- **Safety:** N/A

### Level 2: Autonomous Exception Handler
- **Purpose:** Process logistics exception events autonomously
- **Interaction:** Events arrive → Agent decides & acts
- **Technology:** LangChain Agent with tool calling
- **Actions:** 10 specialized tools (notify, escalate, flag, etc.)
- **Context:** Multi-event awareness (remembers shipments)
- **Safety:** Enforced guardrails (cancellation limits)

---

## 🆕 New Files Created

### Backend
- **`backend_v2.py`** - Autonomous agent with 10 tools
  - LangChain Agent with tool calling
  - Policy RAG integration
  - Shipment context tracking
  - Guardrail enforcement
  - Audit logging

### Frontend
- **`app_v2.js`** - Event stream processor
  - Event list viewer
  - Single event processing
  - Batch processing (all 20 events)
  - Audit log viewer
  - Guardrail status monitor

- **`index_v2.html`** - 3-panel UI
  - Left: Event stream (20 events)
  - Center: Event details + processing
  - Right: System info + audit log

- **`styles_v2.css`** - Modern dark theme
  - Severity color coding
  - Real-time status indicators
  - Responsive 3-panel layout

### Documentation
- **`README_V2.md`** - Complete Level 2 documentation
- **`LEVEL2_UPGRADE_SUMMARY.md`** - This file
- **`run_v2.sh`** - One-command startup script

### Data
- **`Version2/event_stream.json`** - 20 test events
- **`Version2/README.md`** - Challenge description

---

## 🛠️ Key Features Added

### 1. Autonomous Agent
```python
# Level 1: Simple RAG chain
qa_chain = RetrievalQA.from_chain_type(...)

# Level 2: Agent with tools
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)
```

### 2. Tool Calling (10 Tools)
- `query_policy` - Query policy documents
- `notify_customer` - Send customer notifications
- `escalate_to_human` - Escalate to operators
- `flag_customs_issue` - Flag customs problems
- `arrange_alternative_routing` - Reroute shipments
- `apply_compensation` - Apply refunds/credits
- `request_cancellation_approval` - Handle cancellations with guardrail
- `update_eta` - Update arrival times
- `get_shipment_history` - Retrieve previous events
- `log_decision` - Audit trail logging

### 3. Context Awareness
```python
# Track shipment history across events
shipment_context = {}

# EVT-001: SHP-4421 delayed 3.5h
# EVT-008: SHP-4421 now delayed 7h
# Agent remembers EVT-001 when processing EVT-008
```

### 4. Safety Guardrails
```python
# Max 3 cancellations per 10-minute window
cancellation_tracker = []

# On 3rd cancellation:
if recent_count >= 3:
    return "⚠️ GUARDRAIL BREACH - Escalate to Operations Manager"
```

### 5. Severity Assessment
```python
# Multi-factor analysis
def assess_severity(event):
    if 'pharma' in cargo_type:
        return 'CRITICAL'
    if tier == 'Platinum' and delay > 4:
        return 'HIGH'
    # ... more rules
```

### 6. Audit Trail
```python
# Every action logged
audit_log.append({
    'action': 'escalate_to_human',
    'shipment_id': 'SHP-4421',
    'reason': 'Pharma delay >2h',
    'timestamp': datetime.now().isoformat()
})
```

---

## 📋 File Comparison

| File | Level 1 | Level 2 | Purpose |
|------|---------|---------|---------|
| **Backend** | `backend.py` | `backend_v2.py` | Agent with tools |
| **Frontend JS** | `app.js` | `app_v2.js` | Event processing |
| **HTML** | `index.html` | `index_v2.html` | 3-panel UI |
| **CSS** | `styles.css` | `styles_v2.css` | Dark theme |
| **README** | `README.md` | `README_V2.md` | Documentation |
| **Startup** | `run.sh` | `run_v2.sh` | Launch script |

---

## 🎯 Challenge Requirements Met

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **AI Agent** | LangChain Agent with tool calling | ✅ |
| **Context Awareness** | Shipment history tracking | ✅ |
| **Safety Guardrail** | 3-per-10-minute cancellation limit | ✅ |
| **Severity Assessment** | Multi-factor analysis (cargo, tier, delay) | ✅ |
| **Autonomous Actions** | 10 specialized tools | ✅ |
| **Audit Trail** | Complete decision logging | ✅ |
| **Policy Integration** | RAG from 3 policy documents | ✅ |
| **Event Stream** | Processes all 20 events | ✅ |
| **Escalation Logic** | Rule-based triggers | ✅ |
| **Guardrail Enforcement** | Automatic detection & escalation | ✅ |

---

## 🚀 How to Run Level 2

### Quick Start
```bash
# Make script executable (first time only)
chmod +x run_v2.sh

# Run Level 2
./run_v2.sh
```

### Manual Start
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start backend
python backend_v2.py

# 3. In new terminal, start frontend
python -m http.server 8000

# 4. Open browser
open http://localhost:8000/index_v2.html
```

---

## 🎮 Demo Flow

### 1. Single Event Processing
1. Open `http://localhost:8000/index_v2.html`
2. Select **EVT-004** (critical pharma delay)
3. Click **"Process Event"**
4. Watch agent:
   - Query policy documents
   - Assess severity: CRITICAL
   - Escalate to Medical Supplies Desk
   - Log decision with reasoning

### 2. Context Awareness Test
1. Process **EVT-001** (SHP-4421, 3.5h delay)
2. Process **EVT-008** (same shipment, 7h delay)
3. Agent remembers previous event and builds on it

### 3. Guardrail Test
1. Process **EVT-011** (1st cancellation) → OK
2. Process **EVT-016** (2nd cancellation) → OK
3. Process **EVT-018** (3rd cancellation) → BREACH!
4. Agent detects breach and escalates

### 4. Batch Processing
1. Click **"Process All Events"**
2. Agent processes all 20 events
3. View summary:
   - Total actions: ~45
   - Escalations: ~8
   - Notifications: ~15
   - Cancellations: 3
   - Guardrail breaches: 1
4. Download audit log

---

## 🧪 Key Test Cases

### Test 1: Critical Escalation (EVT-004)
- **Event:** Pharma cold chain, 36h delay
- **Expected:** Escalate to Medical Supplies Desk
- **Rule:** Pharma delay >2h requires specialist

### Test 2: Context Awareness (EVT-001 & EVT-008)
- **Event:** Same shipment, two updates
- **Expected:** Agent remembers first event
- **Rule:** Use `get_shipment_history` tool

### Test 3: Guardrail Enforcement (EVT-018)
- **Event:** 3rd cancellation request
- **Expected:** Detect breach, escalate to Operations Manager
- **Rule:** Max 3 cancellations per 10 minutes

### Test 4: Perishable Goods (EVT-006)
- **Event:** Fresh produce, 5h delay (limit: 4h)
- **Expected:** Immediate escalation
- **Rule:** Perishables >4h = critical

### Test 5: Borderline Threshold (EVT-020)
- **Event:** Delay exactly 2h (threshold: >2h)
- **Expected:** Agent determines if notification needed
- **Rule:** Edge case handling

---

## 📊 Architecture Comparison

### Level 1 Architecture
```
User Query
    ↓
RetrievalQA Chain
    ↓
Vector Store (ChromaDB)
    ↓
LLM (Azure OpenAI)
    ↓
Answer
```

### Level 2 Architecture
```
Event Stream (20 events)
    ↓
Agent Executor
    ↓
┌─────────────────────────────┐
│  Agent Decision Loop        │
│  1. Query policy (RAG)      │
│  2. Check history           │
│  3. Assess severity         │
│  4. Log decision            │
│  5. Take action(s)          │
└─────────────────────────────┘
    ↓
Tools (10 available)
    ↓
Audit Log + Results
```

---

## 🎯 What Makes Level 2 Special?

### 1. Autonomous Decision Making
- Agent decides what to do (not just answer questions)
- Multi-step reasoning with tool calling
- Policy-aware decisions

### 2. Context Awareness
- Remembers previous events for same shipment
- Builds on previous decisions
- Maintains state across events

### 3. Safety First
- Enforced guardrails (cancellation limits)
- Automatic breach detection
- Mandatory escalation on violations

### 4. Complete Audit Trail
- Every decision logged
- Reasoning captured
- Downloadable JSON audit log

### 5. Production Ready
- Error handling
- Timeout management
- Guardrail enforcement
- Comprehensive logging

---

## 🏆 Hackathon Presentation Tips

### Opening (30 seconds)
"We built an autonomous AI agent that processes logistics exceptions with safety guardrails. It went from answering questions to making decisions and taking actions."

### Demo (5 minutes)
1. Show event stream (20 events)
2. Process critical event (EVT-004) - show escalation
3. Show context awareness (EVT-001 → EVT-008)
4. Demonstrate guardrail (EVT-018 breach)
5. Process all events - show summary

### Closing (30 seconds)
"Autonomous, safe, context-aware, and fully auditable. From Level 1 RAG to Level 2 Agent - ready for production."

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python3 --version  # Need 3.8+

# Install dependencies
pip install -r requirements.txt

# Check API key
cat .env | grep AZURE_OPENAI_API_KEY
```

### Agent not processing events
```bash
# Check policy documents exist
ls DOC*.md

# Check event stream exists
ls Version2/event_stream.json

# Check backend logs
python backend_v2.py
```

### Guardrail not working
```bash
# Test cancellation sequence
# Process EVT-011, EVT-016, EVT-018 in order
# EVT-018 should trigger breach
```

---

## 📚 Additional Resources

### Documentation
- `README_V2.md` - Complete Level 2 guide
- `Version2/README.md` - Challenge description
- Code comments in `backend_v2.py`

### Policy Documents
- `DOC1-carrier-sla-agreement.md` - SLA rules
- `DOC2-customs-tariff-reference.md` - Customs info
- `DOC3-shipment-delay-policy.md` - Delay handling

### Test Data
- `Version2/event_stream.json` - 20 test events

---

## 🎉 Congratulations!

You've successfully upgraded from a simple Q&A system to a production-ready autonomous agent with:

✅ **10 specialized tools**  
✅ **Context awareness**  
✅ **Safety guardrails**  
✅ **Complete audit trail**  
✅ **Intelligent decision making**  
✅ **Policy compliance**  

**You're ready for Level 2 demo! 🚀**

---

**Made with ⚡ by Team GlobalFreight**

*Level Up Complete!*
