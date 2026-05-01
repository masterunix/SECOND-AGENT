#!/bin/bash

echo "🚀 Starting GlobalFreight AI Platform..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your AZURE_OPENAI_API_KEY"
    echo "Then run this script again."
    exit 1
fi

# Start backend
echo "Starting backend server..."
python3 backend.py &
BACKEND_PID=$!

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 8

# Check if backend is running
if ! curl -s http://localhost:5001/health > /dev/null; then
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend running on http://localhost:5001"
echo ""

# Start frontend
echo "Starting frontend server..."
python3 -m http.server 8000 &
FRONTEND_PID=$!

sleep 2

echo "✅ Frontend running on http://localhost:8000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Platform is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Open in browser: http://localhost:8000/index.html"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Open browser (macOS)
if command -v open &> /dev/null; then
    sleep 1
    open http://localhost:8000/index.html
fi

# Cleanup on exit
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'; exit 0" INT TERM

# Wait
wait
