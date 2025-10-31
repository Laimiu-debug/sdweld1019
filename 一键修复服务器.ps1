$SERVER = "root@43.142.188.252"

Write-Host "Uploading fix script..." -ForegroundColor Cyan
scp fix_server.sh ${SERVER}:/root/

Write-Host "Running fix script..." -ForegroundColor Cyan
ssh ${SERVER} "chmod +x /root/fix_server.sh && /root/fix_server.sh"

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
pause

