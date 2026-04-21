@echo off
REM Savta.AI Development Setup Script for Windows

echo 🚀 Setting up Savta.AI development environment...

REM Check Python version
python --version 2>NUL
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    exit /b 1
)

REM Create virtual environment
if not exist ".venv" (
    echo 📦 Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install packages in development mode
echo 📚 Installing shared package...
pip install -e packages/shared[dev]

echo 📚 Installing AI Agent package...
pip install -e packages/ai-agent[dev]

echo 📚 Installing Marketplace package...
pip install -e packages/marketplace[dev]

echo 📚 Installing Integration package...
pip install -e packages/integration[dev]

REM Copy environment file if not exists
if not exist ".env" (
    echo 📋 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update .env with your API keys
)

echo.
echo ✨ Setup complete!
echo.
echo To start developing:
echo   1. Activate the virtual environment: .venv\Scripts\activate
echo   2. Update .env with your API keys
echo   3. Run AI Agent: cd packages\ai-agent ^&^& uvicorn ai_agent.main:app --reload --port 8001
echo   4. Run Marketplace: cd packages\marketplace ^&^& uvicorn marketplace.main:app --reload --port 8002
echo   5. Run Integration: cd packages\integration ^&^& uvicorn integration.main:app --reload --port 8000
echo.
echo Or use Docker Compose:
echo   cd infrastructure\docker ^&^& docker-compose up
