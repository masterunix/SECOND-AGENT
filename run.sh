#!/bin/bash

# GlobalFreight Smart Assistant - Startup Script (Cross-Platform)

echo "🚀 Starting GlobalFreight Smart Assistant..."
echo ""

# Detect Python command (python3 or python)
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}' | cut -d. -f1)
    if [ "$PYTHON_VERSION" -ge 3 ]; then
        PYTHON_CMD="python"
    fi
fi

if [ -z "$PYTHON_CMD" ]; then
    echo "❌ Python 3.8+ is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

echo "✅ Found Python $PYTHON_VERSION"

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
    echo "❌ Python 3.8 or higher is required. You have Python $PYTHON_VERSION"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your AZURE_OPENAI_API_KEY"
    echo ""
    read -p "Press Enter after you've added your API key to .env..."
fi

# Check if virtual environment exists
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Starting backend server on http://localhost:5001"
echo "🌐 Starting frontend server on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
$PYTHON_CMD backend.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend server
$PYTHON_CMD -m http.server 8000 &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:8000"
echo ""
echo "Open http://localhost:8000 in your browser"
echo ""

# Wait for user to stop
wait

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
