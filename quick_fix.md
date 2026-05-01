# Quick Fix: "Backend Failed to Run" Error

## The Issue
You're seeing "Backend Failed to Run" but the backend IS actually running and healthy.

## Most Likely Causes

### 1. **Browser Cache Issue** (Most Common)
Your browser is loading an old version of the JavaScript file.

**Fix:**
1. Open http://localhost:8000/index_v2.html
2. Press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows/Linux) to hard refresh
3. Or open DevTools (F12) → Network tab → Check "Disable cache"

### 2. **Wrong File Being Viewed**
You might be looking at `index.html` instead of `index_v2.html`.

**Fix:**
Make sure you're accessing:
```
http://localhost:8000/index_v2.html
```

NOT:
```
http://localhost:8000/index.html
```

### 3. **JavaScript Error**
There might be a JavaScript error preventing the page from loading.

**Fix:**
1. Open http://localhost:8000/index_v2.html
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for red error messages
5. Share the error message

### 4. **Port Conflict**
The frontend might be trying to connect to the wrong port.

**Fix:**
Check the browser console (F12) and look for:
```
Backend connection failed: ...
```

## Quick Verification

### Step 1: Test Backend Directly
Open this in your browser:
```
http://localhost:5001/health
```

You should see:
```json
{
  "status": "healthy",
  "version": "2.0-agent",
  "tools_available": 10
}
```

### Step 2: Test Frontend Connection
Open this test page:
```
http://localhost:8000/test_frontend_backend.html
```

This will run 4 tests and show you exactly what's failing.

### Step 3: Check Browser Console
1. Open http://localhost:8000/index_v2.html
2. Press F12
3. Go to Console tab
4. Look for errors (red text)
5. Look for "Backend connected:" message (should be green)

## What Should You See?

When the page loads correctly, you should see:

**In the browser:**
- Status indicator: Green dot with "Online · v2.0-agent · 10 tools"
- Event list on the left (20 events)
- Event details in the center
- System info on the right

**In the console (F12):**
```
Backend connected: {status: 'healthy', version: '2.0-agent', ...}
```

## Still Not Working?

Run this command to see the actual status:
```bash
python3 diagnostic_check.py
```

Or manually check:
```bash
# Check backend
curl http://localhost:5001/health

# Check frontend
curl -I http://localhost:8000/index_v2.html

# Check if files are being served
curl http://localhost:8000/app_v2.js | head -20
```

## Common Mistakes

❌ **Wrong:** Opening file directly
```
file:///Users/you/project/index_v2.html
```

✅ **Right:** Opening via web server
```
http://localhost:8000/index_v2.html
```

❌ **Wrong:** Old version
```
http://localhost:8000/index.html
```

✅ **Right:** Version 2
```
http://localhost:8000/index_v2.html
```

## Emergency Reset

If nothing works, do a complete reset:

```bash
# 1. Stop everything
pkill -f "python.*backend"
pkill -f "python.*http.server"

# 2. Clear browser cache
# In browser: Cmd+Shift+Delete → Clear cache

# 3. Restart backend
python3 backend_v2.py

# 4. In another terminal, restart frontend
python3 -m http.server 8000

# 5. Open browser (hard refresh)
# http://localhost:8000/index_v2.html
# Press Cmd+Shift+R
```

## Need More Help?

Please provide:
1. Screenshot of the error
2. Browser console output (F12 → Console tab)
3. Output of: `curl http://localhost:5001/health`
4. Output of: `python3 diagnostic_check.py`
