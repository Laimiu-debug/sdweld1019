# ========================================
# 最简单的上传脚本
# ========================================

Write-Host "========================================" -ForegroundColor Blue
Write-Host "上传代码到服务器" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

$SERVER = "root@43.142.188.252"
$PROJECT_DIR = "/root/welding-system"

Write-Host "服务器: $SERVER" -ForegroundColor Yellow
Write-Host "目标目录: $PROJECT_DIR" -ForegroundColor Yellow
Write-Host ""

# 步骤 1: 修复 SSH 主机密钥
Write-Host "步骤 1: 修复 SSH 主机密钥..." -ForegroundColor Cyan
ssh-keygen -R 43.142.188.252 2>$null
Write-Host "✓ 完成" -ForegroundColor Green
Write-Host ""

# 步骤 2: 创建目录
Write-Host "步骤 2: 创建服务器目录..." -ForegroundColor Cyan
Write-Host "请输入服务器密码（输入时不显示）" -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no $SERVER "mkdir -p $PROJECT_DIR"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 连接失败，请检查密码是否正确" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✓ 完成" -ForegroundColor Green
Write-Host ""

# 步骤 3: 上传代码
Write-Host "步骤 3: 上传代码..." -ForegroundColor Cyan
Write-Host "正在上传，请稍候（可能需要几分钟）..." -ForegroundColor Yellow
Write-Host "请再次输入服务器密码" -ForegroundColor Yellow
Write-Host ""

scp -r . ${SERVER}:${PROJECT_DIR}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 上传失败" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "✓ 上传完成！" -ForegroundColor Green
Write-Host ""

# 步骤 4: 设置权限
Write-Host "步骤 4: 设置执行权限..." -ForegroundColor Cyan
Write-Host "请再次输入服务器密码" -ForegroundColor Yellow
ssh $SERVER "cd $PROJECT_DIR && chmod +x deploy.sh create_default_admin.sh"

Write-Host "✓ 完成" -ForegroundColor Green
Write-Host ""

# 完成
Write-Host "========================================" -ForegroundColor Green
Write-Host "上传成功！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "下一步: 部署系统" -ForegroundColor Cyan
Write-Host ""
Write-Host "执行以下命令开始部署:" -ForegroundColor White
Write-Host "  ssh $SERVER" -ForegroundColor Gray
Write-Host "  cd $PROJECT_DIR" -ForegroundColor Gray
Write-Host "  ./deploy.sh" -ForegroundColor Gray
Write-Host ""

# 询问是否立即部署
$deploy = Read-Host "是否现在就开始部署？(y/n)"

if ($deploy -eq 'y' -or $deploy -eq 'Y') {
    Write-Host ""
    Write-Host "开始部署..." -ForegroundColor Blue
    Write-Host "请再次输入服务器密码" -ForegroundColor Yellow
    Write-Host ""
    ssh -t $SERVER "cd $PROJECT_DIR && ./deploy.sh"
} else {
    Write-Host ""
    Write-Host "稍后可以手动部署" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "完成！" -ForegroundColor Green
pause

