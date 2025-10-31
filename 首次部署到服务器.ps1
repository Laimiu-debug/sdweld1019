# ========================================
# 首次部署到服务器脚本
# ========================================
# 功能：推送代码到Git，在服务器上克隆并部署
# 使用方法：.\首次部署到服务器.ps1
# ========================================

$ErrorActionPreference = "Stop"

# 服务器配置
$SERVER_IP = "43.142.188.252"
$SERVER_USER = "root"
$DEPLOY_USER = "ubuntu"
$DEPLOY_PATH = "/home/ubuntu/sdweld"
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

# 主函数
function Main {
    Write-Header "首次部署到云服务器"
    
    Write-Info "服务器IP: $SERVER_IP"
    Write-Info "部署目录: $DEPLOY_PATH"
    Write-Info "部署用户: $DEPLOY_USER"
    Write-Host ""
    
    # 1. 检查Git仓库
    Write-Header "检查Git仓库"
    
    try {
        $gitRemote = git remote get-url origin 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Git仓库已配置: $gitRemote"
        } else {
            Write-Error-Custom "未检测到Git远程仓库"
            Write-Info "请先将代码推送到GitHub或Gitee"
            Write-Info "参考命令："
            Write-Host "  git init" -ForegroundColor Gray
            Write-Host "  git add ." -ForegroundColor Gray
            Write-Host "  git commit -m 'Initial commit'" -ForegroundColor Gray
            Write-Host "  git remote add origin <你的仓库地址>" -ForegroundColor Gray
            Write-Host "  git push -u origin main" -ForegroundColor Gray
            exit 1
        }
    } catch {
        Write-Error-Custom "Git检查失败: $_"
        exit 1
    }
    
    # 2. 推送最新代码
    Write-Header "推送代码到Git"
    
    $gitStatus = git status --porcelain
    if (-not [string]::IsNullOrEmpty($gitStatus)) {
        Write-Info "检测到未提交的变更，正在提交..."
        git add .
        git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    
    Write-Info "推送到远程仓库..."
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "代码已推送"
    } else {
        Write-Error-Custom "代码推送失败"
        exit 1
    }
    
    # 3. 创建SSH密钥
    if (-not (Test-Path $SSH_KEY_FILE)) {
        Write-Info "创建SSH密钥文件..."
        $sshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDcOr08lnUObi+djGnoalQpZ+6MgRuhH9BXB2k4g/sAOYeqs/y4xzcmDsdqF3Www8f0OwEmaII39kLTh0iucu4GS0G8aSKqD9gw4cQ9msH2cWk9EKH9jQyiASUOh/uZy7mhg145WAP+fUQ9HMU4D1oavdUnGCr5xyVyc9cgFjKcQizXTVPqR0KqdF7r8D2q9vV+25CCwWtwOtY8gAGLafsPT/BTs8Av9PbCIU7iCuad6kq/N0/n/g5q5+eohumpIaD/6OaT4NhWo4+ClC4iKEVqvykTiV6XuJUL+8KahJD/0+tTfw2UhQzIwEE7JVU+x776Fb8YKvapjZOFzZWxIaTf skey-o3j71l2x"
        $sshKey | Out-File -FilePath $SSH_KEY_FILE -Encoding ASCII -NoNewline
        Write-Success "SSH密钥已创建"
    }
    
    # 4. 测试SSH连接
    Write-Info "测试SSH连接..."
    $testResult = ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_IP} "echo 'OK'" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "SSH连接成功"
    } else {
        Write-Error-Custom "SSH连接失败: $testResult"
        exit 1
    }
    
    # 5. 在服务器上配置环境
    Write-Header "配置服务器环境"
    
    Write-Info "创建ubuntu用户并配置权限..."
    
    ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
        # 检查ubuntu用户
        if ! id ubuntu &>/dev/null; then
            echo "创建ubuntu用户..."
            useradd -m -s /bin/bash ubuntu
        else
            echo "ubuntu用户已存在"
        fi
        
        # 安装Docker
        if ! command -v docker &>/dev/null; then
            echo "安装Docker..."
            curl -fsSL https://get.docker.com | sh
        else
            echo "Docker已安装"
        fi
        
        # 安装docker-compose
        if ! command -v docker-compose &>/dev/null; then
            echo "安装docker-compose..."
            curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        else
            echo "docker-compose已安装"
        fi
        
        # 配置权限
        usermod -aG docker ubuntu
        usermod -aG sudo ubuntu
        
        echo "环境配置完成"
"@
    
    Write-Success "服务器环境配置完成"
    
    # 6. 克隆代码
    Write-Header "克隆代码到服务器"
    
    Write-Info "Git仓库: $gitRemote"
    Write-Info "目标目录: $DEPLOY_PATH"
    Write-Host ""
    
    ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
        su - $DEPLOY_USER -c '
            # 检查目录是否存在
            if [ -d "$DEPLOY_PATH" ]; then
                echo "目录已存在，正在备份..."
                mv $DEPLOY_PATH ${DEPLOY_PATH}.backup.\$(date +%Y%m%d%H%M%S)
            fi
            
            # 克隆代码
            echo "克隆代码..."
            git clone $gitRemote $DEPLOY_PATH
            
            if [ \$? -eq 0 ]; then
                echo "代码克隆成功"
                cd $DEPLOY_PATH
                ls -la
            else
                echo "代码克隆失败"
                exit 1
            fi
        '
"@
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "代码克隆成功"
    } else {
        Write-Error-Custom "代码克隆失败"
        Write-Warning "如果是私有仓库，可能需要在服务器上配置Git凭据"
        exit 1
    }
    
    # 7. 上传环境配置文件
    Write-Header "上传环境配置文件"
    
    Write-Warning "需要上传包含敏感信息的配置文件"
    Write-Info "将上传: backend/.env.production"
    Write-Host ""
    
    if (Test-Path "backend\.env.production") {
        Write-Info "上传 backend/.env.production..."
        scp -i $SSH_KEY_FILE -o StrictHostKeyChecking=no "backend\.env.production" ${SERVER_USER}@${SERVER_IP}:/tmp/
        
        ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
            chown ubuntu:ubuntu /tmp/.env.production
            su - $DEPLOY_USER -c 'mv /tmp/.env.production $DEPLOY_PATH/backend/.env.production'
"@
        
        Write-Success "配置文件已上传"
    } else {
        Write-Warning "未找到 backend/.env.production 文件"
        Write-Info "请确保已配置QQ邮箱授权码等敏感信息"
    }
    
    # 8. 执行部署
    Write-Header "执行部署"
    
    Write-Warning "这可能需要10-15分钟，请耐心等待..."
    Write-Host ""
    
    ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
        su - $DEPLOY_USER -c '
            cd $DEPLOY_PATH
            
            # 给脚本执行权限
            chmod +x deploy.sh
            
            # 执行部署
            ./deploy.sh
        '
"@
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "部署完成"
    } else {
        Write-Warning "部署过程中可能出现了一些问题"
        Write-Info "请查看日志以获取详细信息"
    }
    
    # 9. 完成
    Write-Header "部署完成！"
    
    Write-Success "项目已部署到: $DEPLOY_PATH"
    Write-Host ""
    Write-Info "访问地址："
    Write-Host "  用户门户: https://sdhaohan.cn" -ForegroundColor Cyan
    Write-Host "  管理门户: https://laimiu.sdhaohan.cn" -ForegroundColor Cyan
    Write-Host "  后端API:  https://api.sdhaohan.cn" -ForegroundColor Cyan
    Write-Host "  API文档:  https://api.sdhaohan.cn/api/v1/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "常用命令："
    Write-Host "  查看服务状态: ssh -i $SSH_KEY_FILE ${SERVER_USER}@${SERVER_IP} 'su - $DEPLOY_USER -c \"cd $DEPLOY_PATH && docker-compose ps\"'" -ForegroundColor Gray
    Write-Host "  查看日志:     ssh -i $SSH_KEY_FILE ${SERVER_USER}@${SERVER_IP} 'su - $DEPLOY_USER -c \"cd $DEPLOY_PATH && docker-compose logs -f\"'" -ForegroundColor Gray
    Write-Host "  更新代码:     .\更新服务器代码.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Warning "重要提示："
    Write-Host "  1. 请妥善保管 backend/.env.production 文件" -ForegroundColor Yellow
    Write-Host "  2. 定期备份数据库数据" -ForegroundColor Yellow
    Write-Host "  3. 后续更新代码使用: .\更新服务器代码.ps1" -ForegroundColor Yellow
}

# 运行主函数
try {
    Main
} catch {
    Write-Error-Custom "发生错误: $_"
    exit 1
}

