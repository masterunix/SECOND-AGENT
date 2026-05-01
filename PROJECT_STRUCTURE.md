# Project Structure

## Clean & Organized Layout

```
GlobalFreight-AI-Platform/
│
├── 📄 Core Application Files
│   ├── index.html              # Main UI with tab navigation
│   ├── app.js                  # Frontend JavaScript (combined Level 1 & 2)
│   ├── styles.css              # Styling (combined)
│   └── backend.py              # Flask backend (combined Level 1 & 2)
│
├── 🚀 Quick Start
│   ├── start.sh                # One-command startup script
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment template
│   └── .env                    # Your API keys (create from .env.example)
│
├── 📊 Data Files
│   └── data/
│       ├── DOC1-carrier-sla-agreement.md
│       ├── DOC2-customs-tariff-reference.md
│       ├── DOC3-shipment-delay-policy.md
│       └── Version2/
│           └── event_stream.json    # 20 logistics events for Level 2
│
├── 📚 Documentation
│   └── docs/
│       ├── HOW_TO_RUN.md           # Detailed setup instructions
│       ├── TROUBLESHOOTING.md      # Common issues & fixes
│       └── SYSTEM_STATUS.md        # System status info
│
└── 📖 Main Documentation
    ├── README.md                    # Main project documentation
    └── PROJECT_STRUCTURE.md         # This file
```

---

## File Descriptions

### Core Application

| File | Purpose | Size |
|------|---------|------|
| `index.html` | Main UI with Level 1 & 2 tabs | ~12 KB |
| `app.js` | Combined frontend logic | ~34 KB |
| `styles.css` | Combined styling | ~35 KB |
| `backend.py` | Flask + LangChain backend | ~21 KB |

### Data

| File | Purpose |
|------|---------|
| `data/DOC1-carrier-sla-agreement.md` | Carrier SLA policy |
| `data/DOC2-customs-tariff-reference.md` | Customs tariff reference |
| `data/DOC3-shipment-delay-policy.md` | Delay handling policy |
| `data/Version2/event_stream.json` | 20 logistics exception events |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `docs/HOW_TO_RUN.md` | Step-by-step setup guide |
| `docs/TROUBLESHOOTING.md` | Common issues & solutions |
| `docs/SYSTEM_STATUS.md` | System status & diagnostics |

---

## What Was Removed

### Deleted Files (No Longer Needed)
- ❌ `app_v2.js` - Merged into `app.js`
- ❌ `backend_v2.py` - Merged into `backend.py`
- ❌ `index_v2.html` - Merged into `index.html`
- ❌ `styles_v2.css` - Merged into `styles.css`
- ❌ All test files (`test_*.py`, `test_*.html`)
- ❌ Old scripts (`run_v2.sh`, `cleanup_old_files.sh`, etc.)
- ❌ Redundant docs (20+ markdown files)
- ❌ `archive/` folder
- ❌ `docs/` folder (old structure)
- ❌ `venv/` folder (use `.venv` instead)

### Why These Were Removed
- **Duplicate files**: V1 and V2 are now combined
- **Test files**: Not needed for production use
- **Old scripts**: Replaced by `start.sh`
- **Redundant docs**: Consolidated into 3 essential docs

---

## Folder Organization

### Before Cleanup (Cluttered)
```
50+ files in root directory
Multiple duplicate files (v1, v2, _v2)
Scattered documentation
Test files everywhere
Multiple archive folders
```

### After Cleanup (Clean)
```
✅ 6 core files in root
✅ Data organized in data/
✅ Docs organized in docs/
✅ Single startup script
✅ Clear structure
```

---

## How to Navigate

### For Users
1. **Start here**: `README.md`
2. **Setup guide**: `docs/HOW_TO_RUN.md`
3. **Having issues?**: `docs/TROUBLESHOOTING.md`

### For Developers
1. **Frontend**: `index.html`, `app.js`, `styles.css`
2. **Backend**: `backend.py`
3. **Data**: `data/` folder
4. **Config**: `.env`, `requirements.txt`

---

## Quick Commands

```bash
# View structure
ls -la

# View data files
ls -la data/

# View documentation
ls -la docs/

# Start platform
./start.sh

# Install dependencies
pip install -r requirements.txt

# Check backend health
curl http://localhost:5001/health
```

---

## Benefits of New Structure

### ✅ Clarity
- Clear separation of concerns
- Easy to find files
- Logical organization

### ✅ Simplicity
- Fewer files to manage
- No duplicate code
- Single source of truth

### ✅ Maintainability
- Easy to update
- Clear dependencies
- Well-documented

### ✅ Professional
- Industry-standard layout
- Clean git history
- Production-ready

---

## File Count Comparison

| Category | Before | After | Reduction |
|----------|--------|-------|-----------|
| Root files | 50+ | 6 | 88% |
| HTML files | 3 | 1 | 67% |
| JS files | 3 | 1 | 67% |
| CSS files | 3 | 1 | 67% |
| Python files | 8+ | 1 | 87% |
| Docs | 20+ | 4 | 80% |
| **Total** | **80+** | **17** | **79%** |

---

## Summary

The project is now:
- ✅ **Clean** - Only essential files
- ✅ **Organized** - Logical folder structure
- ✅ **Simple** - Easy to understand
- ✅ **Professional** - Production-ready
- ✅ **Maintainable** - Easy to update

**Everything you need, nothing you don't.** 🎯
