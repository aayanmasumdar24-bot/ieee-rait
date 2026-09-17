#!/usr/bin/env bash
set -e

echo "🚀 Deploying IEEE RAIT Student Branch Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Pull latest code from git repository
if [ -d .git ]; then
    echo "📥 Pulling latest git updates..."
    git pull origin main || git pull origin master || true
fi

# Create .env from .env.example if not present
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "⚙️ Creating .env from .env.example..."
        cp .env.example .env
    fi
fi

# Build and start containers
echo "🔨 Building and launching containers via Docker Compose..."
docker compose down --remove-orphans
docker compose up -d --build

# Clean up dangling images to keep VPS storage clean
echo "🧹 Pruning unused build cache & images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
echo "🌐 App is running on port 80/443 via Nginx reverse proxy."
echo "📜 View live logs using: docker compose logs -f"
