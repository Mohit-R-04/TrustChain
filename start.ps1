Write-Host "🔗 TrustChain - Starting Application..."
Write-Host ""

# Check if Docker is running
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env file exists in frontend
if (-not (Test-Path ".\frontend\.env")) {
    Write-Host "⚠️  Frontend .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".\frontend\.env.example" ".\frontend\.env"
    Write-Host "✅ Created frontend\.env" -ForegroundColor Green
}

Write-Host "📦 Building and starting services with Docker Compose..."
Write-Host ""

# Build and start services
docker-compose up --build

# Note: Use Ctrl+C to stop the services
