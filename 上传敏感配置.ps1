# ========================================
# 上传敏感配置文件到服务器
# ========================================

$SERVER = "root@43.142.188.252"
$PROJECT_DIR = "/root/welding-system"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "上传敏感配置文件" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# 检查文件是否存在
$files = @(
    "backend/.env.production",
    "frontend/.env.production",
    "admin-portal/.env.production"
)

Write-Host "检查配置文件..." -ForegroundColor Cyan
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file 不存在" -ForegroundColor Red
    }
}
Write-Host ""

# 上传文件
Write-Host "上传配置文件..." -ForegroundColor Cyan
Write-Host ""

# 上传 backend/.env.production
if (Test-Path "backend/.env.production") {
    Write-Host "上传 backend/.env.production..." -ForegroundColor Yellow
    scp backend/.env.production ${SERVER}:${PROJECT_DIR}/backend/
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 完成" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 失败" -ForegroundColor Red
    }
}

# 上传 frontend/.env.production
if (Test-Path "frontend/.env.production") {
    Write-Host "上传 frontend/.env.production..." -ForegroundColor Yellow
    scp frontend/.env.production ${SERVER}:${PROJECT_DIR}/frontend/
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 完成" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 失败" -ForegroundColor Red
    }
}

# 上传 admin-portal/.env.production
if (Test-Path "admin-portal/.env.production") {
    Write-Host "上传 admin-portal/.env.production..." -ForegroundColor Yellow
    scp admin-portal/.env.production ${SERVER}:${PROJECT_DIR}/admin-portal/
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 完成" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 失败" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "配置文件上传完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "下一步: 开始部署" -ForegroundColor Cyan
Write-Host ""
Write-Host "执行以下命令:" -ForegroundColor White
Write-Host "  ssh $SERVER" -ForegroundColor Gray
Write-Host "  cd $PROJECT_DIR" -ForegroundColor Gray
Write-Host "  ./deploy.sh" -ForegroundColor Gray
Write-Host ""

pause

