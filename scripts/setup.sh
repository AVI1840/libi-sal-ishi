#!/bin/bash
# Savta.AI Development Setup Script

set -e

echo "🚀 Setting up Savta.AI development environment..."

# Check Python version
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
if [[ "$python_version" < "3.11" ]]; then
    echo "❌ Python 3.11+ is required. Current version: $python_version"
    exit 1
fi
echo "✅ Python version: $python_version"

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install packages in development mode
echo "📚 Installing shared package..."
pip install -e packages/shared[dev]

echo "📚 Installing AI Agent package..."
pip install -e packages/ai-agent[dev]

echo "📚 Installing Marketplace package..."
pip install -e packages/marketplace[dev]

# Copy environment file if not exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your API keys"
fi

# Check if Docker is running
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo "🐳 Docker is running"

        # Start services
        read -p "Start Docker services (PostgreSQL, Redis)? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🚀 Starting Docker services..."
            cd infrastructure/docker
            docker-compose up -d postgres redis
            cd ../..
            echo "✅ Services started. Waiting for database..."
            sleep 5
        fi
    else
        echo "⚠️  Docker is installed but not running"
    fi
else
    echo "⚠️  Docker not found. Install Docker to run local services."
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start developing:"
echo "  1. Activate the virtual environment: source .venv/bin/activate"
echo "  2. Update .env with your API keys"
echo "  3. Run AI Agent: cd packages/ai-agent && uvicorn ai_agent.main:app --reload --port 8001"
echo "  4. Run Marketplace: cd packages/marketplace && uvicorn marketplace.main:app --reload --port 8002"
echo ""
echo "Or use Docker Compose:"
echo "  cd infrastructure/docker && docker-compose up"
