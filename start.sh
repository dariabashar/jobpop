#!/bin/bash

echo "🚀 Starting JobPop Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env file with your configuration"
fi

if [ ! -f jobpop/.env.local ]; then
    echo "📝 Creating jobpop/.env.local file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > jobpop/.env.local
fi

# Start the application
echo "🐳 Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ JobPop is now running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🗄️  MongoDB: mongodb://admin:password@localhost:27017/jobpop"

echo ""
echo "📝 To stop the application, run: docker-compose down"
echo "📝 To view logs, run: docker-compose logs -f"
