Write-Host "Starting Kyna Jewels Development Server..." -ForegroundColor Green
Write-Host ""

# Set memory options for Node.js
$env:NODE_OPTIONS = "--max-old-space-size=2048"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if dist directory exists, if not build
if (-not (Test-Path "dist")) {
    Write-Host "Building TypeScript..." -ForegroundColor Yellow
    npm run build
    Write-Host ""
}

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:5000/api" -ForegroundColor Green
Write-Host "Health Check: http://localhost:5000/api/health" -ForegroundColor Green
Write-Host ""

npm run dev
