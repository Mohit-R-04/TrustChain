#!/bin/bash

echo "🔗 TrustChain - Starting Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env file exists in frontend
if [ ! -f "./frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found. Creating from .env.example..."
    cp ./frontend/.env.example ./frontend/.env
    echo "✅ Created frontend/.env"
fi

echo "📦 Building and starting services with Docker Compose..."
echo ""

# Build and start services
docker-compose up --build

# Note: Use Ctrl+C to stop the services
