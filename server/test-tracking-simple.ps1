# Simple PowerShell test for tracking cron job
Write-Host "🧪 Testing Automatic Tracking Updates..." -ForegroundColor Green
Write-Host ""

try {
    # Test 1: Check if server is running
    Write-Host "1️⃣ Testing server health..." -ForegroundColor Yellow
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/tracking/health" -Method GET
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "Response: $($healthResponse.Content)" -ForegroundColor Cyan
    
    # Test 2: Test manual tracking update
    Write-Host ""
    Write-Host "2️⃣ Testing manual tracking update..." -ForegroundColor Yellow
    try {
        $manualResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/tracking/manual-update" -Method POST
        Write-Host "✅ Manual tracking update successful" -ForegroundColor Green
        Write-Host "Response: $($manualResponse.Content)" -ForegroundColor Cyan
    } catch {
        Write-Host "📊 Manual update response: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody" -ForegroundColor Cyan
        }
    }
    
    # Test 3: Check tracking stats
    Write-Host ""
    Write-Host "3️⃣ Checking tracking statistics..." -ForegroundColor Yellow
    try {
        $statsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/tracking/stats" -Method GET
        Write-Host "✅ Tracking stats retrieved" -ForegroundColor Green
        Write-Host "Response: $($statsResponse.Content)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Stats error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎉 Tracking cron job test completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 What happens next:" -ForegroundColor Cyan
    Write-Host "• Automatic updates will run every 30 minutes" -ForegroundColor White
    Write-Host "• Check server logs for cron job activity" -ForegroundColor White
    Write-Host "• Orders with docket numbers will be updated automatically" -ForegroundColor White
    Write-Host "• Use POST /api/tracking/manual-update to test manually" -ForegroundColor White
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure the server is running:" -ForegroundColor Yellow
    Write-Host "cd server && npm run dev" -ForegroundColor White
}