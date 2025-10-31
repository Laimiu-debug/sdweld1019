$SERVER = "root@43.142.188.252"
$PROJECT = "/root/welding-system"

Write-Host "Uploading config files..." -ForegroundColor Cyan

Write-Host "1. backend/.env.production" -ForegroundColor Yellow
scp backend/.env.production ${SERVER}:${PROJECT}/backend/

Write-Host "2. frontend/.env.production" -ForegroundColor Yellow
scp frontend/.env.production ${SERVER}:${PROJECT}/frontend/

Write-Host "3. admin-portal/.env.production" -ForegroundColor Yellow
scp admin-portal/.env.production ${SERVER}:${PROJECT}/admin-portal/

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Deploy on server" -ForegroundColor Yellow
Write-Host "  ssh $SERVER" -ForegroundColor Gray
Write-Host "  cd $PROJECT" -ForegroundColor Gray
Write-Host "  ./deploy.sh" -ForegroundColor Gray
pause

