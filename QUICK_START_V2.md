# 🚀 Quick Start - Level 2

## One-Command Setup

```bash
chmod +x run_v2.sh && ./run_v2.sh
```

That's it! The script will:
1. ✅ Check Python installation
2. ✅ Create/activate virtual environment
3. ✅ Install dependencies
4. ✅ Verify policy documents and event stream
5. ✅ Start backend (port 5001)
6. ✅ Start frontend (port 8000)
7. ✅ Open browser to `http://localhost:8000/index_v2.html`

---

## Manual Setup (if needed)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure API key (if not done)
cp .env.example .env
# Edit .env and add your AZURE_OPENAI_API_KEY

# 3. Start backend
python backend_v2.py

# 4. In new terminal, start frontend
python -m http.server 8000

# 5. Open browser
open http://localhost:8000/index_v2.html
```

---

## First Steps

### 1. Process a Single Event
1. Select **EVT-004** from the left panel (critical pharma delay)
2. Click **"Process Event"**
3. Watch the agent:
   - Query policy documents
   - Assess severity as CRITICAL
   - Escalate to Medical Supplies Desk
   - Log decision with reasoning

### 2. Test Context Awareness
1. Process **EVT-001** (SHP-4421, 3.5h delay)
2. Process **EVT-008** (same shipment, now 7h delay)
3. Agent will remember the first event!

### 3. Test Safety Guardrail
1. Process **EVT-011** (1st cancellation) → OK
2. Process **EVT-016** (2nd cancellation) → OK
3. Process **EVT-018** (3rd cancellation) → BREACH!
4. Agent detects breach and escalates to Operations Manager

### 4. Process All Events
1. Click **"Process All Events"**
2. Wait ~2-3 minutes
3. View summary:
   - Total actions taken
   - Escalations count
   - Notifications sent
   - Guardrail breaches detected
4. Download audit log as JSON

---

## What to Expect

### Event Stream (Left Panel)
- 20 events color-coded by severity
- Critical (red), High (orange), Medium (yellow), Low (green)
- Click any event to view details

### Event Details (Center Panel)
- Full event information
- Shipment details
- Policy notes
- Expected resolution

### Processing Results (Center Panel)
- Agent's decision and reasoning
- Actions taken
- Audit trail

### System Info (Right Panel)
- 10 agent capabilities
- Safety guardrail status
- Severity legend
- Audit log (collapsible)

---

## Key Features to Demo

### 🤖 Autonomous Agent
- Makes decisions without human input
- Uses 10 specialized tools
- Queries policy documents via RAG

### 🧠 Context Awareness
- Remembers previous events for same shipment
- Builds on previous decisions
- Maintains state across events

### 🛡️ Safety Guardrails
- Max 3 cancellations per 10 minutes
- Automatic breach detection
- Mandatory escalation on violations

### 📊 Complete Audit Trail
- Every decision logged
- Reasoning captured
- Downloadable JSON format

---

## API Endpoints

### Health Check
```bash
curl http://localhost:5001/health
```

### Process Single Event
```bash
curl -X POST http://localhost:5001/process-event \
  -H "Content-Type: application/json" \
  -d @Version2/event_stream.json
```

### Process All Events
```bash
curl -X POST http://localhost:5001/process-stream
```

### Get Audit Log
```bash
curl http://localhost:5001/audit-log
```

### Check Guardrail Status
```bash
curl http://localhost:5001/guardrail-status
```

---

## Troubleshooting

### "Backend connection failed"
- Ensure `backend_v2.py` is running on port 5001
- Check terminal for error messages
- Verify API key in `.env` file

### "Policy documents not found"
- Ensure DOC1, DOC2, DOC3 files exist in root directory
- Check file names match exactly

### "Event stream not found"
- Ensure `Version2/event_stream.json` exists
- Check file is valid JSON

### Agent not making decisions
- Check backend logs for errors
- Verify LangChain agent is initialized
- Check API key is valid and has quota

---

## Next Steps

1. ✅ Run the quick start script
2. ✅ Process a few events manually
3. ✅ Test the guardrail (EVT-011, 16, 18)
4. ✅ Process all 20 events
5. ✅ Download and review audit log
6. ✅ Prepare your demo!

---

## Support

- **Full Documentation:** `README_V2.md`
- **Upgrade Guide:** `LEVEL2_UPGRADE_SUMMARY.md`
- **Challenge Description:** `Version2/README.md`

---

**Ready to demo? Let's go! 🚀**
