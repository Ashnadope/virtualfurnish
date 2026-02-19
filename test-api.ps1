# Test the Room Analysis API endpoint
# Usage: .\test-api.ps1

Write-Host "🧪 Testing Virtual Furnish Room Analysis API" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ApiUrl = "http://localhost:3000/api/room-analysis"
$ImageUrl = "https://images.unsplash.com/photo-1634497885778-152eb6fd543d"

# Sample furniture data
$FurnitureData = @(
    @{
        id = "1"
        name = "Modern Fabric Sofa - 3 Seater"
        category = "Living Room"
        material = "Fabric"
        dimensions = "2000x900x800"
        price = 24999
    },
    @{
        id = "2"
        name = "Solid Wood Coffee Table"
        category = "Living Room"
        material = "Oak Wood"
        dimensions = "1200x600x400"
        price = 8999
    },
    @{
        id = "3"
        name = "Queen Size Bed Frame"
        category = "Bedroom"
        material = "Upholstered"
        dimensions = "1600x2000x1000"
        price = 15999
    }
)

$RequestBody = @{
    imageUrl = $ImageUrl
    furnitureData = $FurnitureData
} | ConvertTo-Json

Write-Host "📋 Request Details:" -ForegroundColor Yellow
Write-Host "  URL: $ApiUrl"
Write-Host "  Method: POST"
Write-Host "  Content-Type: application/json"
Write-Host "  Image: $(Split-Path -Leaf $ImageUrl)"
Write-Host "  Furniture Items: $($FurnitureData.Count)"
Write-Host ""

Write-Host "⏳ Sending request..." -ForegroundColor Cyan

try {
    Write-Host ""
    $Response = Invoke-WebRequest `
        -Uri $ApiUrl `
        -Method Post `
        -ContentType "application/json" `
        -Body $RequestBody `
        -ErrorAction Stop

    $Result = $Response.Content | ConvertFrom-Json

    Write-Host "✅ Success! (Status: $($Response.StatusCode))" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Response:" -ForegroundColor Yellow
    Write-Host ($Result | ConvertTo-Json -Depth 5) -ForegroundColor Green
    
    # Extract and display key insights
    if ($Result.success -and $Result.analysis) {
        $Analysis = $Result.analysis
        
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "📈 Analysis Summary:" -ForegroundColor Yellow
        Write-Host ""
        
        if ($Analysis.roomAnalysis) {
            $Room = $Analysis.roomAnalysis
            Write-Host "  🏠 Room Type: $($Room.roomType)" -ForegroundColor Cyan
            Write-Host "  📐 Dimensions: $($Room.estimatedDimensions)" -ForegroundColor Cyan
            Write-Host "  🎨 Colors: $($Room.dominantColors -join ', ')" -ForegroundColor Cyan
            Write-Host "  ✨ Style: $($Room.style)" -ForegroundColor Cyan
            Write-Host "  💡 Lighting: $($Room.lighting)" -ForegroundColor Cyan
        }
        
        if ($Analysis.furnitureRecommendations) {
            Write-Host ""
            Write-Host "  📦 Recommended Furniture:" -ForegroundColor Cyan
            foreach ($Rec in $Analysis.furnitureRecommendations | Select-Object -First 3) {
                Write-Host "     • $($Rec.reason)" -ForegroundColor Green
            }
        }
    }

} catch {
    Write-Host "❌ Error!" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Response) {
        $ErrorBody = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        Write-Host "Status: $($_.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Error: $($ErrorBody.error)" -ForegroundColor Red
        
        if ($ErrorBody.details) {
            Write-Host "Details: $($ErrorBody.details)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Make sure 'npm run dev' is running"
    Write-Host "  2. Check if Next.js server is listening on http://localhost:3000"
    Write-Host "  3. Verify OPENAI_API_KEY is set in your .env file"
    Write-Host "  4. Check the terminal logs for more details"
}

Write-Host ""
