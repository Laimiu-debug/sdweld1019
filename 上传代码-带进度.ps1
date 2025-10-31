# ========================================
# 上传代码到服务器（带进度显示）
# ========================================

$SERVER = "root@43.142.188.252"
$PROJECT_DIR = "/root/welding-system"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "上传代码到服务器（带进度显示）" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# 步骤 1: 创建目录
Write-Host "步骤 1: 创建服务器目录..." -ForegroundColor Cyan
ssh $SERVER "mkdir -p $PROJECT_DIR"
Write-Host "✓ 完成" -ForegroundColor Green
Write-Host ""

# 步骤 2: 上传主要目录
Write-Host "步骤 2: 上传代码文件..." -ForegroundColor Cyan
Write-Host "这可能需要几分钟，请耐心等待..." -ForegroundColor Yellow
Write-Host ""

$folders = @("backend", "frontend", "admin-portal", "nginx")
$files = @(
    "docker-compose.yml",
    "deploy.sh",
    "create_default_admin.sh",
    "init.sql"
)

# 上传文件夹
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "正在上传 $folder/ ..." -ForegroundColor Cyan
        scp -r $folder ${SERVER}:${PROJECT_DIR}/
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $folder/ 上传完成" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $folder/ 上传失败" -ForegroundColor Red
        }
    }
}

Write-Host ""

# 上传单个文件
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "正在上传 $file ..." -ForegroundColor Cyan
        scp $file ${SERVER}:${PROJECT_DIR}/
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $file 上传完成" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $file 上传失败" -ForegroundColor Red
        }
    }
}

Write-Host ""

# 步骤 3: 设置权限
Write-Host "步骤 3: 设置执行权限..." -ForegroundColor Cyan
ssh $SERVER "cd $PROJECT_DIR && chmod +x deploy.sh create_default_admin.sh"
Write-Host "✓ 完成" -ForegroundColor Green
Write-Host ""

# 步骤 4: 验证
Write-Host "步骤 4: 验证上传..." -ForegroundColor Cyan
ssh $SERVER "ls -lh $PROJECT_DIR"
Write-Host ""

# 完成
Write-Host "========================================" -ForegroundColor Green
Write-Host "上传完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "下一步: 开始部署" -ForegroundColor Cyan
Write-Host ""
$deploy = Read-Host "是否现在开始部署？(y/n)"

if ($deploy -eq 'y' -or $deploy -eq 'Y') {
    Write-Host ""
    Write-Host "开始部署..." -ForegroundColor Blue
    Write-Host ""
    ssh -t $SERVER "cd $PROJECT_DIR && ./deploy.sh"
} else {
    Write-Host ""
    Write-Host "稍后可以手动部署:" -ForegroundColor Yellow
    Write-Host "  ssh $SERVER" -ForegroundColor Gray
    Write-Host "  cd $PROJECT_DIR" -ForegroundColor Gray
    Write-Host "  ./deploy.sh" -ForegroundColor Gray
}

Write-Host ""
Write-Host "完成！" -ForegroundColor Green
pause

