# ========================================
# 焊接工艺管理系统 - 快速部署脚本
# ========================================
# 使用方法：.\快速部署.ps1
# ========================================

Write-Host "========================================" -ForegroundColor Green
Write-Host "焊接工艺管理系统 - 快速部署" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 服务器配置
$SERVER_IP = "43.142.188.252"
$SERVER_USER = "root"
$SERVER_PATH = "/root/sdweld"

# 创建SSH密钥文件
Write-Host "[1/5] 配置SSH密钥..." -ForegroundColor Blue
$sshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDcOr08lnUObi+djGnoalQpZ+6MgRuhH9BXB2k4g/sAOYeqs/y4xzcmDsdqF3Www8f0OwEmaII39kLTh0iucu4GS0G8aSKqD9gw4cQ9msH2cWk9EKH9jQyiASUOh/uZy7mhg145WAP+fUQ9HMU4D1oavdUnGCr5xyVyc9cgFjKcQizXTVPqR0KqdF7r8D2q9vV+25CCwWtwOtY8gAGLafsPT/BTs8Av9PbCIU7iCuad6kq/N0/n/g5q5+eohumpIaD/6OaT4NhWo4+ClC4iKEVqvykTiV6XuJUL+8KahJD/0+tTfw2UhQzIwEE7JVU+x776Fb8YKvapjZOFzZWxIaTf skey-o3j71l2x"
$sshKey | Out-File -FilePath "server-key.pem" -Encoding ASCII -NoNewline
Write-Host "✓ SSH密钥已配置" -ForegroundColor Green
Write-Host ""

# 测试连接
Write-Host "[2/5] 测试服务器连接..." -ForegroundColor Blue
try {
    $testResult = ssh -i server-key.pem -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_IP} "echo 'OK'" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 服务器连接成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 服务器连接失败" -ForegroundColor Red
        Write-Host "错误信息: $testResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ 连接异常: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 压缩代码
Write-Host "[3/5] 压缩项目代码..." -ForegroundColor Blue
$tempZip = "$env:TEMP\sdweld-deploy-$(Get-Date -Format 'yyyyMMddHHmmss').zip"

# 排除不需要的文件和目录
$excludePatterns = @(
    "node_modules",
    ".git",
    "__pycache__",
    "venv",
    ".venv",
    "dist",
    "*.log",
    ".env.local",
    ".env.development"
)

Write-Host "正在压缩（这可能需要几分钟）..." -ForegroundColor Yellow

# 创建临时目录
$tempDir = "$env:TEMP\sdweld-temp-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# 复制文件（排除特定目录）
Get-ChildItem -Path $PSScriptRoot | Where-Object {
    $item = $_
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($item.Name -like $pattern) {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
} | Copy-Item -Destination $tempDir -Recurse -Force

# 压缩
Compress-Archive -Path "$tempDir\*" -DestinationPath $tempZip -Force

# 清理临时目录
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "✓ 代码压缩完成 ($('{0:N2}' -f ((Get-Item $tempZip).Length / 1MB)) MB)" -ForegroundColor Green
Write-Host ""

# 上传代码
Write-Host "[4/5] 上传代码到服务器..." -ForegroundColor Blue
Write-Host "上传中，请稍候..." -ForegroundColor Yellow

scp -i server-key.pem -o StrictHostKeyChecking=no $tempZip ${SERVER_USER}@${SERVER_IP}:/tmp/sdweld-deploy.zip

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 代码上传成功" -ForegroundColor Green
} else {
    Write-Host "✗ 代码上传失败" -ForegroundColor Red
    Remove-Item $tempZip -Force
    exit 1
}

# 清理本地临时文件
Remove-Item $tempZip -Force
Write-Host ""

# 在服务器上部署
Write-Host "[5/5] 在服务器上执行部署..." -ForegroundColor Blue
Write-Host "这可能需要5-10分钟，请耐心等待..." -ForegroundColor Yellow
Write-Host ""

ssh -i server-key.pem -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
    set -e
    
    echo "解压代码..."
    mkdir -p $SERVER_PATH
    cd $SERVER_PATH
    unzip -o /tmp/sdweld-deploy.zip
    rm /tmp/sdweld-deploy.zip
    
    echo "检查Docker..."
    if ! command -v docker &> /dev/null; then
        echo "安装Docker..."
        if [ -f install_docker.sh ]; then
            chmod +x install_docker.sh
            ./install_docker.sh
        else
            curl -fsSL https://get.docker.com | sh
        fi
    fi
    
    echo "检查docker-compose..."
    if ! command -v docker-compose &> /dev/null; then
        echo "安装docker-compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "执行部署..."
    chmod +x deploy.sh
    
    # 停止旧服务
    docker-compose down 2>/dev/null || true
    
    # 构建并启动服务
    docker-compose build
    docker-compose up -d postgres redis backend frontend admin-portal
    
    # 等待数据库启动
    echo "等待数据库启动..."
    sleep 15
    
    # 运行数据库迁移
    echo "运行数据库迁移..."
    docker-compose exec -T backend alembic upgrade head || true
    
    # 启动Nginx
    docker-compose up -d nginx
    
    echo "部署完成！"
    echo ""
    echo "服务状态："
    docker-compose ps
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "访问地址：" -ForegroundColor Cyan
    Write-Host "  用户门户: https://sdhaohan.cn" -ForegroundColor White
    Write-Host "  管理门户: https://laimiu.sdhaohan.cn" -ForegroundColor White
    Write-Host "  后端API:  https://api.sdhaohan.cn" -ForegroundColor White
    Write-Host "  API文档:  https://api.sdhaohan.cn/api/v1/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "常用命令：" -ForegroundColor Cyan
    Write-Host "  查看日志: ssh -i server-key.pem root@43.142.188.252 'cd /root/sdweld && docker-compose logs -f'" -ForegroundColor Gray
    Write-Host "  重启服务: ssh -i server-key.pem root@43.142.188.252 'cd /root/sdweld && docker-compose restart'" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "部署失败！" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查错误信息并重试" -ForegroundColor Yellow
    Write-Host "或查看详细日志：" -ForegroundColor Yellow
    Write-Host "  ssh -i server-key.pem root@43.142.188.252 'cd /root/sdweld && docker-compose logs'" -ForegroundColor Gray
    exit 1
}

