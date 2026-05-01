# How to Run GlobalFreight AI Platform

## Quick Start (2 Steps)

### Step 1: Start the Backend

Open a terminal and run:

```bash
python3 backend.py
```

**Wait for this message:**
```
Loading documents...
Created X chunks from 3 documents
Vectorstore created
Platform ready!
 * Running on http://0.0.0.0:5001
```

**Keep this terminal open!**

---

### Step 2: Start the Frontend

Open a **NEW terminal** (keep the first one running) and run:

```bash
python3 -m http.server 8000
```

**You should see:**
```
Serving HTTP on 0.0.0.0 port 8000
```

**Keep this terminal open too!**

---

### Step 3: Open in Browser

Open your web browser and go to:

```
http://localhost:8000/index.html
```

**You should see:**
- Two tabs: "Level 1: RAG Assistant" and "Level 2: Exception Handler"
- Green status indicator saying "Online"
- Clean, modern interface

---

## Using the Platform

### Level 1: RAG Assistant

1. Click the **"Level 1: RAG Assistant"** tab (should be active by default)
2. Type a question in the input box or click a sample query
3. Get instant answers from policy documents (1-3 seconds)
4. Click **"Manage Documents"** to add/remove custom documents

**Try these:**
- "What's the transit time from Mumbai to Hamburg for Platinum?"
- "A Gold customer is 15 hours late. What compensation applies?"
- "What is the HS code for mobile phones?"

---

### Level 2: Exception Handler

1. Click the **"Level 2: Exception Handler"** tab
2. You'll see 20 events listed on the left
3. Click on an event (e.g., EVT-001)
4. Click **"Process Event"** button
5. Wait 10-40 seconds (be patient!)
6. See the agent's response and actions taken
7. Check the audit log on the right

**Quick Test:**
- Click **"Quick Test"** button for instant backend verification (1 second)

---

## Complete Setup (First Time)

If this is your first time running the application:

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- LangChain (RAG & Agents)
- Flask (Web server)
- ChromaDB (Vector store)
- Azure OpenAI SDK
- HuggingFace embeddings

### 2. Set Up Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Azure OpenAI credentials:

```
AZURE_OPENAI_API_KEY=your_actual_key_here
AZURE_OPENAI_ENDPOINT=https://ai-fortnight.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5-nano
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

### 3. Verify Files Exist

```bash
ls -la DOC*.md Version2/event_stream.json
```

You should see:
- DOC1-carrier-sla-agreement.md
- DOC2-customs-tariff-reference.md
- DOC3-shipment-delay-policy.md
- Version2/event_stream.json

---

## Troubleshooting

### Problem: "Backend is NOT running"

**Check if backend is running:**
```bash
curl http://localhost:5001/health
```

**If you see an error:**
1. Go to the terminal running `backend.py`
2. Press `Ctrl+C` to stop it
3. Run again: `python3 backend.py`

---

### Problem: "Cannot access http://localhost:8000"

**Check if frontend server is running:**
```bash
lsof -i :8000
```

**If nothing shows up:**
```bash
python3 -m http.server 8000
```

---

### Problem: Page shows "Offline" or red status

**Solution 1: Hard refresh the browser**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

**Solution 2: Check browser console**
1. Press `F12` (or `Cmd + Option + I` on Mac)
2. Go to **Console** tab
3. Look for red error messages

**Solution 3: Run diagnostic**
```bash
python3 diagnostic_check.py
```

---

### Problem: Events take too long to process

This is normal! The agent needs to:
1. Query policy documents
2. Make decisions
3. Call multiple tools
4. Log everything

**Expected times:**
- Simple events: 10-20 seconds
- Medium events: 20-30 seconds
- Complex events: 30-40 seconds

**If it takes longer than 60 seconds:**
1. The Azure API might be slow
2. Restart the backend: `Ctrl+C` then `python3 backend.py`

---

### Problem: "Dependencies not installed"

**Fix:**
```bash
pip install -r requirements.txt
```

---

### Problem: "Environment variables not set"

**Fix:**
1. Copy example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your Azure OpenAI key:
   ```
   AZURE_OPENAI_API_KEY=your_actual_key_here
   ```

---

## Stopping the Application

### Stop Backend
1. Go to the terminal running `backend.py`
2. Press `Ctrl+C`

### Stop Frontend
1. Go to the terminal running `http.server`
2. Press `Ctrl+C`

### Or kill all at once:
```bash
pkill -f "python.*backend"
pkill -f "python.*http.server"
```

---

## Visual Guide

```
Terminal 1                    Terminal 2                    Browser
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │          │                 │
│ $ python3       │          │ $ python3 -m    │          │ http://         │
│   backend.py    │          │   http.server   │          │ localhost:8000/ │
│                 │          │   8000          │          │ index.html      │
│ Platform ready! │          │                 │          │                 │
│ Running on      │          │ Serving HTTP... │          │ [Two Tabs]      │
│ port 5001       │          │                 │          │ Level 1 | Level 2│
│                 │          │                 │          │                 │
│ (Keep open)     │          │ (Keep open)     │          │ (Use this)      │
└─────────────────┘          └─────────────────┘          └─────────────────┘
```

---

## What You Should See

### Terminal 1 (Backend)
```
============================================================
GlobalFreight AI Platform v2.0-combined
============================================================

Initializing embeddings...
Loading documents...
Created 156 chunks from 3 documents
Vectorstore created
Initializing Exception Handler Agent...
Platform ready!
 * Serving Flask app 'backend'
 * Running on http://0.0.0.0:5001
```

### Terminal 2 (Frontend)
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
127.0.0.1 - - [02/May/2026 01:30:00] "GET /index.html HTTP/1.1" 200 -
127.0.0.1 - - [02/May/2026 01:30:00] "GET /app.js HTTP/1.1" 200 -
127.0.0.1 - - [02/May/2026 01:30:00] "GET /styles.css HTTP/1.1" 200 -
```

### Browser
- **Status**: Green dot with "Online · v2.0-combined · 10 tools"
- **Tabs**: Two tabs for Level 1 and Level 2
- **Level 1**: Chat interface with sample queries
- **Level 2**: Event list, details, and controls

---

## Testing Both Levels

### Test Level 1 (Fast - 1-3 seconds)

1. Click **"Level 1: RAG Assistant"** tab
2. Click a sample query or type: "What is the SLA for Platinum?"
3. Get instant answer from policy documents

### Test Level 2 (Slow - 10-40 seconds)

1. Click **"Level 2: Exception Handler"** tab
2. Click **"Quick Test"** button (1 second - verifies backend)
3. Select first event (EVT-001)
4. Click **"Process Event"** (10-40 seconds - full agent processing)
5. View results and audit log

---

## Advanced: Running with Script

Create a startup script `start.sh`:

```bash
#!/bin/bash

echo "Starting GlobalFreight AI Platform..."

# Start backend in background
python3 backend.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
python3 -m http.server 8000 &
FRONTEND_PID=$!

# Open browser (macOS)
sleep 2
open http://localhost:8000/index.html

echo "Platform running!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

Make it executable:
```bash
chmod +x start.sh
./start.sh
```

---

## Need Help?

### Run the diagnostic page:
```
http://localhost:8000/status_check.html
```

### Or run the Python diagnostic:
```bash
python3 diagnostic_check.py
```

### Check the troubleshooting guide:
```bash
cat TROUBLESHOOTING.md
```

---

## Summary

**To run the platform:**

1. **Terminal 1:** `python3 backend.py` (wait for "Platform ready!")
2. **Terminal 2:** `python3 -m http.server 8000`
3. **Browser:** `http://localhost:8000/index.html`

**Switch between levels using the tabs!**

**That's it!** 🚀
