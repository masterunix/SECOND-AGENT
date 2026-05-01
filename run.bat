@echo off
REM GlobalFreight Smart Assistant - Startup Script for Windows

echo ========================================
echo GlobalFreight Smart Assistant
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed.
    echo Please install Python 3.8 or higher from https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [OK] Found Python %PYTHON_VERSION%

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found. Creating from .env.example...
    copy .env.example .env
    echo [ACTION] Please edit .env file and add your AZURE_OPENAI_API_KEY
    echo.
    pause
)

REM Check if virtual environment exists
if not exist venv (
    if not exist .venv (
        echo [SETUP] Creating virtual environment...
        python -m venv venv
    )
)

REM Activate virtual environment
echo [SETUP] Activating virtual environment...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)

REM Install dependencies
echo [SETUP] Installing dependencies...
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:8000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend in new window
start "GlobalFreight Backend" cmd /k "python backend.py"

REM Wait for backend to start
echo [WAIT] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend
echo [START] Starting frontend server...
echo.
echo ========================================
echo Open http://localhost:8000 in your browser
echo ========================================
echo.
python -m http.server 8000

pause
