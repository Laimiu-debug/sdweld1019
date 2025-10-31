# Upload sensitive configuration files to server

$SERVER = "root@43.142.188.252"
$PROJECT_DIR = "/root/welding-system"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Upload Configuration Files" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Upload backend config
Write-Host "Uploading backend/.env.production..." -ForegroundColor Yellow
scp backend/.env.production ${SERVER}:${PROJECT_DIR}/backend/
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Success" -ForegroundColor Green
} else {
    Write-Host "  Failed" -ForegroundColor Red
}

# Upload frontend config
Write-Host "Uploading frontend/.env.production..." -ForegroundColor Yellow
scp frontend/.env.production ${SERVER}:${PROJECT_DIR}/frontend/
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Success" -ForegroundColor Green
} else {
    Write-Host "  Failed" -ForegroundColor Red
}

# Upload admin-portal config
Write-Host "Uploading admin-portal/.env.production..." -ForegroundColor Yellow
scp admin-portal/.env.production ${SERVER}:${PROJECT_DIR}/admin-portal/
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Success" -ForegroundColor Green
} else {
    Write-Host "  Failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Upload Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next step: Deploy on server" -ForegroundColor Cyan
Write-Host "  ssh $SERVER" -ForegroundColor Gray
Write-Host "  cd $PROJECT_DIR" -ForegroundColor Gray
Write-Host "  ./deploy.sh" -ForegroundColor Gray
Write-Host ""

pause

