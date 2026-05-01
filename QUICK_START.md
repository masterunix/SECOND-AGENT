# 🚀 Quick Start Guide

## 30-Second Setup

### Windows
```cmd
run.bat
```

### macOS/Linux
```bash
chmod +x run.sh && ./run.sh
```

### Open Browser
```
http://localhost:8000
```

**That's it!** 🎉

---

## What Just Happened?

The startup script automatically:
1. ✅ Checked Python version (3.8+ required)
2. ✅ Created virtual environment
3. ✅ Installed all dependencies
4. ✅ Started backend server (port 5001)
5. ✅ Started frontend server (port 8000)
6. ✅ Opened your browser

---

## First Time Setup

### 1. Configure API Key

Edit `.env` file:
```bash
AZURE_OPENAI_API_KEY=your_actual_key_here
AZURE_OPENAI_ENDPOINT=https://ai-fortnight.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5-nano
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

### 2. Test It

Ask a question:
```
What's the transit time from Mumbai to Hamburg for a Platinum shipment?
```

**First time**: ~15-30 seconds (calls AI)  
**Second time**: ~3 milliseconds (cached!) ⚡

---

## Key Features

### 📝 Ask Questions
- Transit times
- Compensation policies
- HS codes and duties
- Delay handling rules

### 📁 Upload Documents
1. Click "Manage Documents"
2. Click "Choose File"
3. Select `.md` or `.txt` file
4. Enter display name
5. Click "Add Document"

### ⚡ Lightning Fast
- First query: 15-30 seconds
- Cached query: 3 milliseconds
- **5,000x faster!**

---

## Sample Queries

Try these:

1. **Multi-hop reasoning**
   ```
   What's the transit time from Mumbai to Hamburg for a Platinum shipment, including customs?
   ```

2. **Policy lookup**
   ```
   A Gold customer's shipment is 15 hours late. What compensation applies?
   ```

3. **Rule checking**
   ```
   Can our agent autonomously cancel 5 shipments in a row?
   ```

4. **Tariff lookup**
   ```
   What is the HS code and import duty for mobile phones?
   ```

5. **Out-of-scope test**
   ```
   What is the weather in Mumbai today?
   ```

---

## Troubleshooting

### "Python not found"
**Install Python 3.8+**
- Windows: https://www.python.org/downloads/
- macOS: `brew install python@3.11`
- Linux: `sudo apt install python3`

### "Port already in use"
**Kill the process**
```bash
# macOS/Linux
lsof -ti:5001 | xargs kill -9

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### "Module not found"
**Reinstall dependencies**
```bash
pip install -r requirements.txt
```

### "Cannot connect to backend"
**Check if backend is running**
```bash
# Should see: "Running on http://127.0.0.1:5001"
```

---

## Testing

### Quick Test
```bash
python3 test_platform_compatibility.py
```

### Full Test Suite
```bash
python3 run_all_tests.py
```

---

## File Structure

```
.
├── backend.py              # Backend API (port 5001)
├── app.js                  # Frontend logic
├── index.html              # UI
├── styles.css              # Styling
├── run.sh                  # Unix startup script
├── run.bat                 # Windows startup script
├── requirements.txt        # Python dependencies
├── .env                    # API keys (create this)
├── DOC1-*.md              # Policy documents (3 files)
└── docs/                   # Documentation
```

---

## Commands

### Start Application
```bash
# Windows
run.bat

# macOS/Linux
./run.sh
```

### Start Manually
```bash
# Backend
python3 backend.py

# Frontend (new terminal)
python3 -m http.server 8000
```

### Run Tests
```bash
# Platform compatibility
python3 test_platform_compatibility.py

# File upload
python3 test_file_upload.py

# Response time
python3 test_response_time.py

# All tests
python3 run_all_tests.py
```

### Stop Servers
```
Press Ctrl+C in terminal
```

---

## URLs

- **Frontend**: http://localhost:8000
- **Backend**: http://localhost:5001
- **Health Check**: http://localhost:5001/health
- **API Docs**: See `backend.py` for endpoints

---

## Performance

### First Query
- **Time**: 15-30 seconds
- **Why**: Calls Azure OpenAI API
- **What happens**: Retrieves docs, generates answer

### Cached Query
- **Time**: 3 milliseconds
- **Why**: Stored in memory
- **What happens**: Instant retrieval

### Cache Management
- **Size**: 100 queries max
- **Auto-clear**: When documents change
- **Manual clear**: POST /cache/clear

---

## Document Management

### Add Document
1. Click "Manage Documents"
2. Click "Choose File"
3. Select file (.md or .txt)
4. Enter display name
5. Click "Add Document"

### Remove Document
1. Click "Manage Documents"
2. Find custom document
3. Click "Remove"
4. Confirm

### Reset to Defaults
1. Click "Manage Documents"
2. Click "Reset to Default Documents"
3. Confirm

**Note**: Default documents (DOC1, DOC2, DOC3) cannot be removed.

---

## Support

### Documentation
- `README.md` - Full documentation
- `PLATFORM_COMPATIBILITY.md` - Setup guide
- `OPTIMIZATION_SUMMARY.md` - Performance details
- `FINAL_SUMMARY.md` - Complete overview

### Need Help?
1. Run compatibility test
2. Check error messages
3. Review documentation
4. Verify Python version (3.8+)
5. Check ports are available

---

## Requirements

### Minimum
- Python 3.8+
- 2GB RAM
- Internet connection (for API calls)

### Recommended
- Python 3.9-3.11
- 4GB RAM
- Fast internet connection

### Supported Platforms
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 20.04+)

### Supported Browsers
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

---

## Next Steps

1. ✅ Start the application
2. ✅ Configure API key in `.env`
3. ✅ Try sample queries
4. ✅ Upload a custom document
5. ✅ Experience the speed!

---

## Tips

💡 **Ask the same question twice** to see caching in action  
💡 **Upload your own policies** to customize the knowledge base  
💡 **Use sample queries** for quick testing  
💡 **Check cache stats** at `/cache/stats` endpoint  
💡 **Clear cache** when documents change (automatic)

---

**Ready to go!** 🚀

Open http://localhost:8000 and start asking questions!
