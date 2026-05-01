#!/bin/bash

echo "============================================================"
echo "Restarting GlobalFreight Exception Handler Backend"
echo "============================================================"
echo ""

# Find and kill existing backend process
echo "1. Stopping existing backend..."
pkill -f "python.*backend_v2.py" 2>/dev/null
sleep 2

# Check if port is free
if lsof -i :5001 >/dev/null 2>&1; then
    echo "   ⚠️  Port 5001 still in use. Forcing kill..."
    lsof -ti :5001 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "   ✓ Backend stopped"
echo ""

# Start backend
echo "2. Starting optimized backend..."
echo "   (This will take 10-15 seconds to load policies)"
echo ""

python3 backend_v2.py

# Note: This script will keep running until you press Ctrl+C
