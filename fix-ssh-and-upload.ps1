# Fix SSH key issue and upload configuration files

$SERVER = "43.142.188.252"
$SERVER_USER = "root@43.142.188.252"
$PROJECT_DIR = "/root/welding-system"
$KNOWN_HOSTS = "$env:USERPROFILE\.ssh\known_hosts"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Fix SSH and Upload Config Files" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Remove old SSH key
Write-Host "Step 1: Removing old SSH key..." -ForegroundColor Yellow
if (Test-Path $KNOWN_HOSTS) {
    # Remove the specific line for this server
    ssh-keygen -R $SERVER
    Write-Host "  Old SSH key removed" -ForegroundColor Green
} else {
    Write-Host "  No known_hosts file found (this is OK)" -ForegroundColor Gray
}
Write-Host ""

# Step 2: Upload configuration files
Write-Host "Step 2: Uploading configuration files..." -ForegroundColor Yellow
Write-Host ""

# Upload backend config
Write-Host "  Uploading backend/.env.production..." -ForegroundColor Cyan
scp -o StrictHostKeyChecking=no backend/.env.production ${SERVER_USER}:${PROJECT_DIR}/backend/
if ($LASTEXITCODE -eq 0) {
    Write-Host "    Success!" -ForegroundColor Green
} else {
    Write-Host "    Failed!" -ForegroundColor Red
}

# Upload frontend config
Write-Host "  Uploading frontend/.env.production..." -ForegroundColor Cyan
scp -o StrictHostKeyChecking=no frontend/.env.production ${SERVER_USER}:${PROJECT_DIR}/frontend/
if ($LASTEXITCODE -eq 0) {
    Write-Host "    Success!" -ForegroundColor Green
} else {
    Write-Host "    Failed!" -ForegroundColor Red
}

# Upload admin-portal config
Write-Host "  Uploading admin-portal/.env.production..." -ForegroundColor Cyan
scp -o StrictHostKeyChecking=no admin-portal/.env.production ${SERVER_USER}:${PROJECT_DIR}/admin-portal/
if ($LASTEXITCODE -eq 0) {
    Write-Host "    Success!" -ForegroundColor Green
} else {
    Write-Host "    Failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Upload Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. SSH to server: ssh $SERVER_USER" -ForegroundColor White
Write-Host "  2. Go to project: cd $PROJECT_DIR" -ForegroundColor White
Write-Host "  3. Run deploy: ./deploy.sh" -ForegroundColor White
Write-Host ""

pause

