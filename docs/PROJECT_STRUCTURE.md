# 📁 Project Structure - v1.0

## Clean Directory Organization

```
GlobalFreight Smart Shipment Assistant/
│
├── 🎯 Core Application Files
│   ├── backend.py                      # Flask API + RAG pipeline (v1.0)
│   ├── app.js                          # Frontend JavaScript
│   ├── index.html                      # Main UI with v1.0 footer
│   └── styles.css                      # Black neon theme
│
├── 📚 Policy Documents (Required)
│   ├── DOC1-carrier-sla-agreement.md   # Transit times, compensation
│   ├── DOC2-customs-tariff-reference.md # HS codes, duties
│   └── DOC3-shipment-delay-policy.md   # Delay handling, AI rules
│
├── ⚙️ Configuration
│   ├── .env                            # Azure OpenAI credentials (private)
│   ├── .env.example                    # Template for .env
│   ├── requirements.txt                # Python dependencies
│   └── .gitignore                      # Git ignore rules
│
├── 🚀 Startup Scripts
│   ├── run.sh                          # Linux/Mac launcher
│   └── run.bat                         # Windows launcher
│
├── 📖 Documentation
│   ├── README.md                       # Main documentation
│   └── docs/
│       ├── PROJECT_SUMMARY.md          # Project overview
│       ├── DEMO_SCRIPT.md              # Demo walkthrough
│       ├── TESTING_CHECKLIST.md        # Testing guide
│       ├── DOCUMENT_MANAGEMENT.md      # Document handling
│       └── DOC4-test-policy.md         # Test document
│
└── 🔧 Development
    ├── .venv/                          # Python virtual environment
    ├── .vscode/                        # VS Code settings
    └── .git/                           # Git repository
```

## File Count Summary

### Essential Files (11)
- **Application**: 4 files (backend.py, app.js, index.html, styles.css)
- **Documents**: 3 files (DOC1, DOC2, DOC3)
- **Config**: 3 files (.env, .env.example, requirements.txt)
- **Scripts**: 2 files (run.sh, run.bat)
- **Docs**: 1 file (README.md)

### Additional Documentation (5)
- Located in `docs/` folder
- Optional reference materials
- Not required for running the app

## Key Files Description

### Core Application

**backend.py** (v1.0)
- Flask REST API
- LangChain RAG pipeline
- ChromaDB vector store
- Azure OpenAI integration
- HuggingFace embeddings
- 7 API endpoints

**app.js**
- Frontend logic
- API communication
- Chat interface
- Status monitoring
- Sample query handling

**index.html**
- Main UI structure
- Black neon theme
- Chat container
- Status indicator
- Version display (v1.0)

**styles.css**
- Black background (#0a0a0a)
- Neon green (#00ff88)
- Neon blue (#00d4ff)
- Glowing effects
- Responsive design

### Configuration

**.env** (private)
```bash
AZURE_OPENAI_API_KEY=your_key
AZURE_OPENAI_ENDPOINT=https://ai-fortnight.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5-nano
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

**requirements.txt**
```
langchain==0.1.0
langchain-community==0.0.13
langchain-openai==0.0.2
chromadb==0.4.22
openai==1.7.2
flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
sentence-transformers==2.2.2
```

### Policy Documents

**DOC1-carrier-sla-agreement.md**
- Transit times by route
- Service tiers (Platinum, Gold, Silver)
- Compensation rules
- SLA tolerances

**DOC2-customs-tariff-reference.md**
- HS codes
- Import duties
- Restricted items
- Documentation requirements

**DOC3-shipment-delay-policy.md**
- Delay reason codes
- Escalation thresholds
- AI agent autonomy rules
- Bulk action limits

## What Was Cleaned Up

### Removed Files (6)
- ❌ AZURE_OPENAI_SETUP.md (migration doc)
- ❌ MIGRATION_SUMMARY.md (migration doc)
- ❌ QUICK_REFERENCE.md (redundant)
- ❌ SETUP_COMPLETE.md (redundant)
- ❌ RUNNING_STATUS.md (temporary)
- ❌ test_azure_connection.py (test script)
- ❌ SETUP.md (redundant with README)
- ❌ QUICKSTART.md (redundant with README)

### Moved to docs/ (5)
- 📁 DEMO_SCRIPT.md
- 📁 PROJECT_SUMMARY.md
- 📁 TESTING_CHECKLIST.md
- 📁 DOCUMENT_MANAGEMENT.md
- 📁 DOC4-test-policy.md

## Directory Size

```
Total Files: 16 (excluding .git, .venv, .vscode)
Core App: 4 files
Documents: 3 files
Config: 4 files
Scripts: 2 files
Docs: 6 files (1 main + 5 in docs/)
```

## Quick Access

### Run the Application
```bash
# Start backend
python backend.py

# Start frontend (new terminal)
python -m http.server 8000
```

### Or use scripts
```bash
# Linux/Mac
./run.sh

# Windows
run.bat
```

### Access Points
- Backend: http://localhost:5001
- Frontend: http://localhost:8000
- Health: http://localhost:5001/health

## Version Information

**Current Version**: 1.0

**Version Display Locations**:
- Backend startup banner
- `/health` endpoint response
- Frontend footer
- Frontend status indicator

---

**Clean, organized, and production-ready! ✨**
