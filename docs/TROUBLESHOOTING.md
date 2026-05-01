# Troubleshooting Guide

## Issue: Backend Processing is Slow or Times Out

### Symptoms
- Events take longer than 30 seconds to process
- "Processing timed out" messages
- Backend appears to hang

### Root Causes
1. **Azure OpenAI API is slow** - The API response time can vary
2. **Agent making too many tool calls** - Complex events trigger multiple policy queries
3. **Network latency** - Connection to Azure endpoint is slow

### Solutions

#### 1. Restart the Backend with Optimizations
The backend has been optimized for speed. Restart it:

```bash
# Stop the current backend (Ctrl+C in the terminal running it)
# Or find and kill the process:
ps aux | grep backend_v2.py
kill <PID>

# Start the optimized backend
python3 backend_v2.py
```

#### 2. Check Azure OpenAI API Status
Test the API directly:

```bash
python3 -c "
from langchain_openai import AzureChatOpenAI
import os
from dotenv import load_dotenv
load_dotenv()

llm = AzureChatOpenAI(
    azure_deployment=os.getenv('AZURE_OPENAI_DEPLOYMENT'),
    openai_api_version=os.getenv('AZURE_OPENAI_API_VERSION'),
    azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
    api_key=os.getenv('AZURE_OPENAI_API_KEY'),
    temperature=0.7
)

import time
start = time.time()
response = llm.invoke('Hello')
print(f'Response time: {time.time() - start:.2f}s')
print(f'Response: {response.content}')
"
```

If this takes >5 seconds, the API is slow.

#### 3. Use the Quick Test Button
The frontend has a "Quick Test" button that tests the backend without agent processing.

#### 4. Process Events One at a Time
Instead of "Process All Events", use "Process Event" to handle one event at a time.

#### 5. Check Backend Logs
Look at the terminal running `backend_v2.py` for error messages or slow operations.

---

## Issue: Frontend Not Loading

### Symptoms
- Blank page
- "Cannot connect to backend" error
- Status shows "Offline"

### Solutions

#### 1. Check Frontend Server
```bash
# Check if server is running
lsof -i :8000

# If not running, start it:
python3 -m http.server 8000
```

#### 2. Check Backend Server
```bash
# Check if backend is running
lsof -i :5001

# If not running, start it:
python3 backend_v2.py
```

#### 3. Open Correct URL
Make sure you're accessing:
```
http://localhost:8000/index_v2.html
```

Not:
- `file:///path/to/index_v2.html` (won't work - needs server)
- `http://localhost:8000/index.html` (wrong version)

---

## Issue: "Backend is NOT running"

### Solutions

#### 1. Check Environment Variables
```bash
# Verify .env file exists and has correct values
cat .env

# Should contain:
# AZURE_OPENAI_API_KEY=...
# AZURE_OPENAI_ENDPOINT=...
# AZURE_OPENAI_DEPLOYMENT=...
# AZURE_OPENAI_API_VERSION=...
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Check Port Availability
```bash
# Check if port 5001 is already in use
lsof -i :5001

# If another process is using it, kill it:
kill <PID>
```

#### 4. Start Backend
```bash
python3 backend_v2.py
```

Look for:
```
Loading policy documents...
Created X chunks from 3 documents
Policy vectorstore created
Agent ready!
```

---

## Issue: Policy Documents Not Loading

### Symptoms
- "Policy documents not loaded" error
- Backend fails to start

### Solutions

#### 1. Check Files Exist
```bash
ls -la DOC*.md
```

Should show:
- DOC1-carrier-sla-agreement.md
- DOC2-customs-tariff-reference.md
- DOC3-shipment-delay-policy.md

#### 2. Check File Permissions
```bash
chmod 644 DOC*.md
```

---

## Issue: Events Not Processing

### Symptoms
- Click "Process Event" but nothing happens
- No results appear
- Console shows errors

### Solutions

#### 1. Check Browser Console
Open Developer Tools (F12) and check Console tab for errors.

#### 2. Check Network Tab
Look for failed requests to `http://localhost:5001/process-event`

#### 3. Test Backend Directly
```bash
curl -X POST http://localhost:5001/test-simple \
  -H "Content-Type: application/json" \
  -d '{"event_id":"TEST"}'
```

Should return JSON with `"status": "test_success"`

#### 4. Check CORS
If you see CORS errors, make sure:
- Backend is running on port 5001
- Frontend is accessing from `http://localhost:8000` (not `file://`)

---

## Quick Diagnostic

Run the diagnostic script:

```bash
python3 diagnostic_check.py
```

This will check:
- ✓ Environment variables
- ✓ Required files
- ✓ Python dependencies
- ✓ Backend server
- ✓ Frontend server
- ✓ Event processing

---

## Performance Optimization

### Current Optimizations (Applied)
1. **Reduced LLM temperature** (0.7 instead of 1.0) - More consistent responses
2. **Reduced max iterations** (8 instead of 10) - Faster processing
3. **Shorter prompt** - Less tokens to process
4. **Max execution time** (40s) - Prevents infinite loops
5. **Reduced retries** (1 instead of 2) - Faster failure recovery

### Expected Performance
- **Simple events** (minor delays): 10-15 seconds
- **Medium events** (customs, compensation): 15-25 seconds
- **Complex events** (cancellations, escalations): 25-40 seconds

### If Still Too Slow
Consider:
1. Using a faster Azure OpenAI deployment (e.g., GPT-4 Turbo)
2. Reducing the number of policy documents
3. Pre-caching common policy queries
4. Using a local LLM for faster response times

---

## Common Error Messages

### "AZURE_OPENAI_API_KEY not found"
**Fix:** Create `.env` file with your API key

### "Policy documents not loaded"
**Fix:** Ensure DOC1, DOC2, DOC3 markdown files exist

### "Backend request timed out"
**Fix:** Restart backend with optimizations, or increase timeout in frontend

### "Cannot connect to backend"
**Fix:** Start backend with `python3 backend_v2.py`

### "Port already in use"
**Fix:** Kill existing process or use different port

---

## Still Having Issues?

1. Run diagnostic: `python3 diagnostic_check.py`
2. Check backend logs in terminal
3. Check browser console (F12)
4. Verify all files exist: `ls -la`
5. Verify dependencies: `pip list | grep -E "langchain|flask|chromadb"`

---

## Contact

If issues persist, provide:
1. Output of `python3 diagnostic_check.py`
2. Backend terminal logs
3. Browser console errors
4. Operating system and Python version
