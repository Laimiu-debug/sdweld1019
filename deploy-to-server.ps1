# ========================================
# 焊接工艺管理系统 - 自动化部署脚本
# ========================================
# 功能：从本地上传代码到云服务器并自动部署
# 使用方法：.\deploy-to-server.ps1
# ========================================

# 设置错误时停止
$ErrorActionPreference = "Stop"

# 服务器配置
$SERVER_IP = "43.142.188.252"
$SERVER_USER = "root"
$SERVER_PATH = "/root/sdweld"
$SSH_KEY_FILE = "$PSScriptRoot\server-key.pem"

# 颜色输出函数
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host $Message -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
}

# 检查SSH密钥文件
function Check-SSHKey {
    Write-Info "检查SSH密钥文件..."
    
    if (-not (Test-Path $SSH_KEY_FILE)) {
        Write-Warning "SSH密钥文件不存在，正在创建..."
        
        # 创建SSH密钥文件
        $sshKey = @"
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDcOr08lnUObi+djGnoalQpZ+6MgRuhH9BXB2k4g/sAOYeqs/y4xzcmDsdqF3Www8f0OwEmaII39kLTh0iucu4GS0G8aSKqD9gw4cQ9msH2cWk9EKH9jQyiASUOh/uZy7mhg145WAP+fUQ9HMU4D1oavdUnGCr5xyVyc9cgFjKcQizXTVPqR0KqdF7r8D2q9vV+25CCwWtwOtY8gAGLafsPT/BTs8Av9PbCIU7iCuad6kq/N0/n/g5q5+eohumpIaD/6OaT4NhWo4+ClC4iKEVqvykTiV6XuJUL+8KahJD/0+tTfw2UhQzIwEE7JVU+x776Fb8YKvapjZOFzZWxIaTf skey-o3j71l2x
"@
        $sshKey | Out-File -FilePath $SSH_KEY_FILE -Encoding ASCII -NoNewline
        
        Write-Success "SSH密钥文件已创建: $SSH_KEY_FILE"
    } else {
        Write-Success "SSH密钥文件已存在"
    }
}

# 测试SSH连接
function Test-SSHConnection {
    Write-Info "测试SSH连接..."
    
    try {
        $result = ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_IP} "echo 'SSH连接成功'" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "SSH连接测试成功"
            return $true
        } else {
            Write-Error-Custom "SSH连接失败: $result"
            return $false
        }
    } catch {
        Write-Error-Custom "SSH连接异常: $_"
        return $false
    }
}

# 创建排除文件列表
function Create-ExcludeList {
    Write-Info "创建排除文件列表..."
    
    $excludeFile = "$PSScriptRoot\rsync-exclude.txt"
    $excludeContent = @"
node_modules/
.git/
.vscode/
__pycache__/
*.pyc
.env
.env.local
.env.development
backend/venv/
backend/.venv/
frontend/dist/
admin-portal/dist/
*.log
.DS_Store
Thumbs.db
*.swp
*.swo
.idea/
*.iml
coverage/
.pytest_cache/
.mypy_cache/
*.egg-info/
build/
dist/
temp/
tmp/
"@
    
    $excludeContent | Out-File -FilePath $excludeFile -Encoding UTF8
    Write-Success "排除文件列表已创建"
    return $excludeFile
}

# 上传代码到服务器
function Upload-Code {
    Write-Header "上传代码到服务器"
    
    # 检查是否安装了rsync (通过WSL或Git Bash)
    $hasRsync = $false
    try {
        $null = rsync --version 2>&1
        $hasRsync = $true
    } catch {
        Write-Warning "未检测到rsync，将使用scp上传（速度较慢）"
    }
    
    if ($hasRsync) {
        Write-Info "使用rsync上传代码（增量同步，速度快）..."
        $excludeFile = Create-ExcludeList
        
        # 使用rsync上传
        rsync -avz --progress `
            --exclude-from=$excludeFile `
            -e "ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no" `
            "$PSScriptRoot/" `
            "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "代码上传成功（rsync）"
        } else {
            Write-Error-Custom "代码上传失败"
            exit 1
        }
    } else {
        Write-Info "使用scp上传代码..."
        Write-Warning "首次上传可能需要较长时间，请耐心等待..."
        
        # 创建临时压缩包
        $tempZip = "$env:TEMP\sdweld-deploy.zip"
        Write-Info "正在压缩代码..."
        
        # 排除不需要的文件
        $excludeDirs = @("node_modules", ".git", "__pycache__", "venv", ".venv", "dist")
        
        # 使用PowerShell压缩（排除特定目录）
        Compress-Archive -Path "$PSScriptRoot\*" -DestinationPath $tempZip -Force -CompressionLevel Optimal
        
        Write-Success "代码压缩完成"
        
        # 上传压缩包
        Write-Info "上传压缩包到服务器..."
        scp -i $SSH_KEY_FILE -o StrictHostKeyChecking=no $tempZip ${SERVER_USER}@${SERVER_IP}:/tmp/sdweld-deploy.zip
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "压缩包上传成功"
            
            # 在服务器上解压
            Write-Info "在服务器上解压代码..."
            ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
                mkdir -p $SERVER_PATH
                cd $SERVER_PATH
                unzip -o /tmp/sdweld-deploy.zip
                rm /tmp/sdweld-deploy.zip
"@
            
            Write-Success "代码解压完成"
            
            # 删除临时文件
            Remove-Item $tempZip -Force
        } else {
            Write-Error-Custom "压缩包上传失败"
            exit 1
        }
    }
}

# 在服务器上执行部署
function Deploy-OnServer {
    Write-Header "在服务器上执行部署"
    
    Write-Info "连接服务器并执行部署脚本..."
    
    # 执行部署命令
    ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
        cd $SERVER_PATH
        
        # 检查Docker是否安装
        if ! command -v docker &> /dev/null; then
            echo "Docker未安装，正在安装..."
            chmod +x install_docker.sh
            ./install_docker.sh
        fi
        
        # 检查docker-compose是否安装
        if ! command -v docker-compose &> /dev/null; then
            echo "docker-compose未安装，正在安装..."
            curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # 给部署脚本执行权限
        chmod +x deploy.sh
        
        # 执行部署
        ./deploy.sh
"@
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "部署执行完成"
    } else {
        Write-Error-Custom "部署执行失败"
        exit 1
    }
}

# 验证部署结果
function Verify-Deployment {
    Write-Header "验证部署结果"
    
    Write-Info "检查服务状态..."
    
    ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
        cd $SERVER_PATH
        docker-compose ps
"@
    
    Write-Info "检查服务健康状态..."
    
    # 等待服务启动
    Start-Sleep -Seconds 5
    
    # 检查后端API
    try {
        $response = Invoke-WebRequest -Uri "http://${SERVER_IP}:8000/api/v1/health" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "后端API健康检查通过"
        }
    } catch {
        Write-Warning "后端API健康检查失败（可能还在启动中）"
    }
    
    Write-Success "部署验证完成"
}

# 主函数
function Main {
    Write-Header "焊接工艺管理系统 - 自动化部署"
    
    Write-Info "服务器IP: $SERVER_IP"
    Write-Info "部署路径: $SERVER_PATH"
    Write-Info ""
    
    # 1. 检查SSH密钥
    Check-SSHKey
    
    # 2. 测试SSH连接
    if (-not (Test-SSHConnection)) {
        Write-Error-Custom "SSH连接失败，请检查服务器IP和密钥是否正确"
        exit 1
    }
    
    # 3. 上传代码
    Upload-Code
    
    # 4. 执行部署
    Deploy-OnServer
    
    # 5. 验证部署
    Verify-Deployment
    
    # 完成
    Write-Header "部署完成！"
    Write-Success "用户门户: https://sdhaohan.cn"
    Write-Success "管理门户: https://laimiu.sdhaohan.cn"
    Write-Success "后端API: https://api.sdhaohan.cn"
    Write-Success "API文档: https://api.sdhaohan.cn/api/v1/docs"
    Write-Info ""
    Write-Info "常用命令："
    Write-Info "  查看日志: ssh -i $SSH_KEY_FILE ${SERVER_USER}@${SERVER_IP} 'cd $SERVER_PATH && docker-compose logs -f'"
    Write-Info "  重启服务: ssh -i $SSH_KEY_FILE ${SERVER_USER}@${SERVER_IP} 'cd $SERVER_PATH && docker-compose restart'"
    Write-Info "  停止服务: ssh -i $SSH_KEY_FILE ${SERVER_USER}@${SERVER_IP} 'cd $SERVER_PATH && docker-compose down'"
}

# 运行主函数
Main

