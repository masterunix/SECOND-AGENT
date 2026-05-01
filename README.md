# GlobalFreight AI Platform

**AI-Fortnight 2026 - Unified Solution**

A single platform with two AI capabilities:
- **Level 1**: RAG Assistant for policy Q&A
- **Level 2**: Autonomous Exception Handler with safety guardrails

---

## 🚀 Quick Start

### Option 1: Automatic (Recommended)

```bash
./start.sh
```

This will:
1. Start the backend server
2. Start the frontend server
3. Open your browser automatically

### Option 2: Manual

**Terminal 1 - Backend:**
```bash
python3 backend.py
```

**Terminal 2 - Frontend:**
```bash
python3 -m http.server 8000
```

**Browser:**
```
http://localhost:8000/index.html
```

---

## 📁 Project Structure

```
.
├── index.html              # Main UI with tab navigation
├── app.js                  # Frontend logic
├── styles.css              # Styling
├── backend.py              # Flask + LangChain backend
├── requirements.txt        # Python dependencies
├── start.sh                # Startup script
├── .env                    # API keys (create from .env.example)
├── .env.example            # Environment template
│
├── data/                   # Data files
│   ├── DOC1-carrier-sla-agreement.md
│   ├── DOC2-customs-tariff-reference.md
│   ├── DOC3-shipment-delay-policy.md
│   └── Version2/
│       └── event_stream.json    # 20 logistics events
│
└── docs/                   # Documentation
    ├── HOW_TO_RUN.md
    ├── TROUBLESHOOTING.md
    └── SYSTEM_STATUS.md
```

---

## 🎯 Features

### Level 1: RAG Assistant 💬
- Grounded Q&A from policy documents
- Document management (add/remove)
- No hallucinations
- Fast responses (1-3 seconds)

### Level 2: Exception Handler ⚡
- Autonomous event processing
- 10 AI agent tools
- Safety guardrails (cancellation limits)
- Full audit logging
- Context-aware decisions

---

## 🔧 Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure API Key

```bash
cp .env.example .env
```

Edit `.env` and add your Azure OpenAI key:
```
AZURE_OPENAI_API_KEY=your_key_here
```

### 3. Start Platform

```bash
./start.sh
```

---

## 🎮 Usage

### Switch Between Levels

The interface has two tabs:
- **Level 1: RAG Assistant** - Ask questions about policies
- **Level 2: Exception Handler** - Process logistics events

### Level 1 Examples

Try these questions:
- "What's the transit time from Mumbai to Hamburg for Platinum?"
- "A Gold customer is 15 hours late. What compensation applies?"
- "What is the HS code for mobile phones?"

### Level 2 Examples

1. Select an event (EVT-001 to EVT-020)
2. Click "Process Event"
3. Wait 10-40 seconds
4. View agent's response and actions

---

## 📊 Performance

| Level | Operation | Time |
|-------|-----------|------|
| Level 1 | Simple query | 1-2s |
| Level 1 | Complex query | 2-3s |
| Level 2 | Quick test | <1s |
| Level 2 | Simple event | 10-20s |
| Level 2 | Complex event | 30-40s |

---

## 🛠️ Troubleshooting

### Backend not starting?
```bash
# Check if port 5001 is in use
lsof -i :5001

# Kill if needed
kill $(lsof -t -i:5001)

# Restart
python3 backend.py
```

### Frontend not loading?
```bash
# Check if port 8000 is in use
lsof -i :8000

# Start server
python3 -m http.server 8000
```

### Page shows "Offline"?
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Check `.env` file has valid API key
- Verify both servers are running

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more help.

---

## 📚 Documentation

- **[docs/HOW_TO_RUN.md](docs/HOW_TO_RUN.md)** - Detailed setup guide
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues
- **[docs/SYSTEM_STATUS.md](docs/SYSTEM_STATUS.md)** - System status

---

## 🏗️ Architecture

### Backend
- **Flask** - Web server
- **LangChain** - RAG & Agent framework
- **ChromaDB** - Vector store
- **Azure OpenAI** - LLM

### Frontend
- **Vanilla JavaScript** - No frameworks
- **Tab navigation** - Switch between levels
- **Responsive design** - Modern UI

---

## 🔐 Security

- API keys in `.env` (not committed to git)
- CORS enabled for localhost only
- Input validation on all endpoints
- Safety guardrails for agent actions

---

## 📝 Requirements

- Python 3.8+
- Azure OpenAI API key
- 2GB RAM minimum
- Modern web browser

---

## 🤝 Support

**Quick checks:**
```bash
# Test backend
curl http://localhost:5001/health

# Test Level 1
curl -X POST http://localhost:5001/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the SLA for Platinum?"}'

# Test Level 2
curl -X POST http://localhost:5001/test-simple \
  -H "Content-Type: application/json" \
  -d '{"event_id":"TEST"}'
```

**Need help?**
- Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- Verify `.env` configuration
- Ensure both servers are running

---

## 🎉 Ready to Go!

```bash
./start.sh
```

Then open: **http://localhost:8000/index.html**

---

**Built for AI-Fortnight 2026** 🚀
