@echo off
REM GlobalFreight Smart Assistant - Startup Script for Windows

echo Starting GlobalFreight Smart Assistant...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo .env file not found. Creating from .env.example...
    copy .env.example .env
    echo Please edit .env file and add your PAI_API_KEY
    echo.
    pause
)

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -q -r requirements.txt

echo.
echo Setup complete!
echo.
echo Starting backend server on http://localhost:5000
echo Starting frontend server on http://localhost:8000
echo.
echo Press Ctrl+C to stop
echo.

REM Start backend
start /B python backend.py

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
python -m http.server 8000

pause
