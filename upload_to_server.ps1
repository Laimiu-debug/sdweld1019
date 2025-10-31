# ========================================
# 上传代码到服务器脚本 (PowerShell)
# ========================================

Write-Host "========================================" -ForegroundColor Blue
Write-Host "上传代码到腾讯云服务器" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# 服务器信息
$SERVER_IP = "43.142.188.252"
$SERVER_USER = "root"
$PROJECT_DIR = "/root/welding-system"

Write-Host "服务器 IP: $SERVER_IP" -ForegroundColor Yellow
Write-Host "项目目录: $PROJECT_DIR" -ForegroundColor Yellow
Write-Host ""

# 检查是否安装了 SSH
Write-Host "检查 SSH 客户端..." -ForegroundColor Cyan
$sshCheck = Get-Command ssh -ErrorAction SilentlyContinue
if (-not $sshCheck) {
    Write-Host "错误: 未找到 SSH 客户端" -ForegroundColor Red
    Write-Host "请安装 OpenSSH 客户端或使用 WinSCP 等工具上传" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ SSH 客户端已安装" -ForegroundColor Green
Write-Host ""

# 步骤 1: 在服务器上创建项目目录
Write-Host "========================================" -ForegroundColor Blue
Write-Host "步骤 1: 在服务器上创建项目目录" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "正在连接服务器..." -ForegroundColor Cyan
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p $PROJECT_DIR"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 项目目录创建成功: $PROJECT_DIR" -ForegroundColor Green
} else {
    Write-Host "✗ 无法连接到服务器，请检查:" -ForegroundColor Red
    Write-Host "  1. 服务器 IP 是否正确" -ForegroundColor Yellow
    Write-Host "  2. SSH 端口 22 是否开放" -ForegroundColor Yellow
    Write-Host "  3. 是否有 SSH 密钥或密码" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 步骤 2: 上传代码
Write-Host "========================================" -ForegroundColor Blue
Write-Host "步骤 2: 上传代码到服务器" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "正在上传文件，请稍候..." -ForegroundColor Cyan
Write-Host "这可能需要几分钟时间，取决于网络速度" -ForegroundColor Yellow
Write-Host ""

# 使用 scp 上传整个项目目录
# 排除不需要的文件
$excludePatterns = @(
    "node_modules",
    "__pycache__",
    ".git",
    "*.pyc",
    ".venv",
    "venv",
    "dist",
    "build",
    ".next",
    "*.log"
)

Write-Host "上传项目文件..." -ForegroundColor Cyan

# 使用 rsync 如果可用（更快），否则使用 scp
$rsyncCheck = Get-Command rsync -ErrorAction SilentlyContinue
if ($rsyncCheck) {
    Write-Host "使用 rsync 上传（更快）..." -ForegroundColor Green
    
    $excludeArgs = $excludePatterns | ForEach-Object { "--exclude=$_" }
    
    rsync -avz --progress `
        $excludeArgs `
        -e "ssh" `
        .\ ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/
} else {
    Write-Host "使用 scp 上传..." -ForegroundColor Yellow
    Write-Host "提示: 安装 rsync 可以加快上传速度" -ForegroundColor Gray
    
    # 使用 scp 递归上传
    scp -r .\ ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ 代码上传成功！" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ 代码上传失败" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 步骤 3: 设置脚本执行权限
Write-Host "========================================" -ForegroundColor Blue
Write-Host "步骤 3: 设置脚本执行权限" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "正在设置执行权限..." -ForegroundColor Cyan
ssh ${SERVER_USER}@${SERVER_IP} "cd $PROJECT_DIR && chmod +x deploy.sh create_default_admin.sh"

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
Write-Host "   ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 进入项目目录:" -ForegroundColor White
Write-Host "   cd $PROJECT_DIR" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 运行部署脚本:" -ForegroundColor White
Write-Host "   ./deploy.sh" -ForegroundColor Gray
Write-Host ""

Write-Host "或者直接运行以下命令一键部署:" -ForegroundColor Cyan
Write-Host "ssh ${SERVER_USER}@${SERVER_IP} 'cd $PROJECT_DIR && ./deploy.sh'" -ForegroundColor Yellow
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
    ssh -t ${SERVER_USER}@${SERVER_IP} "cd $PROJECT_DIR && ./deploy.sh"
} else {
    Write-Host ""
    Write-Host "稍后可以手动运行部署脚本" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "完成！" -ForegroundColor Green

