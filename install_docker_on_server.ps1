$SERVER = "root@43.142.188.252"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Installing Docker on Server" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Step 1: Uploading installation script..." -ForegroundColor Cyan
scp install_docker.sh ${SERVER}:/root/

Write-Host ""
Write-Host "Step 2: Running installation (this may take 3-5 minutes)..." -ForegroundColor Cyan
Write-Host ""

ssh ${SERVER} "chmod +x /root/install_docker.sh && /root/install_docker.sh"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Docker Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next: Deploy the application" -ForegroundColor Yellow
Write-Host "  ssh $SERVER" -ForegroundColor Gray
Write-Host "  cd /root/welding-system" -ForegroundColor Gray
Write-Host "  ./deploy.sh" -ForegroundColor Gray
Write-Host ""

pause

