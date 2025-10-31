# ========================================
# 使用 SSH 密钥上传代码到服务器
# ========================================

Write-Host "========================================" -ForegroundColor Blue
Write-Host "使用 SSH 密钥上传代码到服务器" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# 服务器信息
$SERVER_IP = "43.142.188.252"
$SERVER_USER = "root"
$PROJECT_DIR = "/root/welding-system"

# 密钥文件路径（请修改为你的实际路径）
Write-Host "请输入 SSH 密钥文件的完整路径:" -ForegroundColor Cyan
Write-Host "例如: C:\Users\25647\Downloads\aa.pem" -ForegroundColor Gray
$KEY_FILE = Read-Host "密钥路径"

# 检查密钥文件是否存在
if (-not (Test-Path $KEY_FILE)) {
    Write-Host "错误: 密钥文件不存在: $KEY_FILE" -ForegroundColor Red
    Write-Host "请检查路径是否正确" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✓ 找到密钥文件: $KEY_FILE" -ForegroundColor Green
Write-Host ""

# 修复 SSH 主机密钥问题
Write-Host "修复 SSH 主机密钥..." -ForegroundColor Cyan
ssh-keygen -R $SERVER_IP 2>$null
Write-Host "✓ SSH 主机密钥已清除" -ForegroundColor Green
Write-Host ""

# 步骤 1: 测试 SSH 连接
Write-Host "========================================" -ForegroundColor Blue
Write-Host "步骤 1: 测试 SSH 连接" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "正在测试连接..." -ForegroundColor Cyan
$testResult = ssh -i $KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "echo 'SSH 连接成功！'" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SSH 连接测试成功！" -ForegroundColor Green
} else {
    Write-Host "✗ SSH 连接失败" -ForegroundColor Red
    Write-Host "错误信息: $testResult" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. 密钥未绑定到服务器" -ForegroundColor Gray
    Write-Host "2. 服务器未重启" -ForegroundColor Gray
    Write-Host "3. 密钥文件权限不正确" -ForegroundColor Gray
    pause
    exit 1
}
Write-Host ""

# 步骤 2: 创建项目目录
Write-Host "========================================" -ForegroundColor Blue
Write-Host "步骤 2: 创建项目目录" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "正在创建目录: $PROJECT_DIR" -ForegroundColor Cyan
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "mkdir -p $PROJECT_DIR"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 项目目录创建成功" -ForegroundColor Green
} else {
    Write-Host "✗ 项目目录创建失败" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 步骤 3: 上传代码
Write-Host "========================================" -ForegroundColor Blue
Write-Host "步骤 3: 上传代码" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "正在上传文件，请稍候..." -ForegroundColor Cyan
Write-Host "这可能需要几分钟时间" -ForegroundColor Yellow
Write-Host ""

# 使用 scp 上传
scp -i $KEY_FILE -r . ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ 代码上传成功！" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ 代码上传失败" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 步骤 4: 设置执行权限
Write-Host "========================================" -ForegroundColor Blue
Write-Host "步骤 4: 设置脚本执行权限" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "正在设置执行权限..." -ForegroundColor Cyan
ssh -i $KEY_FILE ${SERVER_USER}@${SERVER_IP} "cd $PROJECT_DIR && chmod +x deploy.sh create_default_admin.sh"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 执行权限设置成功" -ForegroundColor Green
} else {
    Write-Host "✗ 执行权限设置失败" -ForegroundColor Red
}
Write-Host ""

# 完成
Write-Host "========================================" -ForegroundColor Green
Write-Host "上传完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "项目已上传到: ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}" -ForegroundColor Yellow
Write-Host ""

Write-Host "下一步操作:" -ForegroundColor Cyan
Write-Host "1. SSH 登录服务器:" -ForegroundColor White
Write-Host "   ssh -i `"$KEY_FILE`" ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 进入项目目录:" -ForegroundColor White
Write-Host "   cd $PROJECT_DIR" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 运行部署脚本:" -ForegroundColor White
Write-Host "   ./deploy.sh" -ForegroundColor Gray
Write-Host ""

# 询问是否立即部署
Write-Host "是否现在就开始部署？(y/n): " -ForegroundColor Cyan -NoNewline
$response = Read-Host

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "开始部署..." -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    
    # 运行部署脚本
    ssh -i $KEY_FILE -t ${SERVER_USER}@${SERVER_IP} "cd $PROJECT_DIR && ./deploy.sh"
} else {
    Write-Host ""
    Write-Host "稍后可以手动运行部署脚本" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "完成！" -ForegroundColor Green
pause

