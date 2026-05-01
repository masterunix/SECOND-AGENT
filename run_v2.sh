#!/bin/bash

# GlobalFreight Exception Handler - Level 2 Startup Script
# AI-Fortnight 2026

echo "=========================================="
echo "GlobalFreight Exception Handler - Level 2"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python found: $(python3 --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ Created .env file"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env and add your API key:"
        echo "   AZURE_OPENAI_API_KEY=your_key_here"
        echo ""
        read -p "Press Enter after you've updated .env with your API key..."
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Check if virtual environment exists
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

echo "✓ Virtual environment activated"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Check if policy documents exist
if [ ! -f "DOC1-carrier-sla-agreement.md" ] || [ ! -f "DOC2-customs-tariff-reference.md" ] || [ ! -f "DOC3-shipment-delay-policy.md" ]; then
    echo "❌ Policy documents not found. Please ensure DOC1, DOC2, DOC3 files exist."
    exit 1
fi

echo "✓ Policy documents found"
echo ""

# Check if event stream exists
if [ ! -f "Version2/event_stream.json" ]; then
    echo "❌ Event stream not found. Please ensure Version2/event_stream.json exists."
    exit 1
fi

echo "✓ Event stream found (20 events)"
echo ""

# Start backend
echo "=========================================="
echo "Starting Level 2 Backend (Agent)..."
echo "=========================================="
echo ""
echo "Backend will run on: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop the backend"
echo ""

# Run backend
python backend_v2.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo ""
echo "=========================================="
echo "Starting Frontend Server..."
echo "=========================================="
echo ""
echo "Frontend will run on: http://localhost:8000"
echo ""

# Open browser (macOS)
if command -v open &> /dev/null; then
    sleep 2
    open http://localhost:8000/index_v2.html
fi

# Run frontend
python3 -m http.server 8000

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
