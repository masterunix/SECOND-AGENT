#!/bin/bash

# GlobalFreight Smart Assistant - Startup Script

echo "🚀 Starting GlobalFreight Smart Assistant..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your PAI_API_KEY"
    echo ""
    read -p "Press Enter after you've added your API key to .env..."
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Starting backend server on http://localhost:5000"
echo "🌐 Starting frontend server on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
python3 backend.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
python3 -m http.server 8000 &
FRONTEND_PID=$!

# Wait for user to stop
wait

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
