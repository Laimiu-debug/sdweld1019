# ========================================
# 更新服务器代码脚本
# ========================================
# 功能：推送本地代码到Git，然后在服务器上拉取并重新部署
# 使用方法：.\更新服务器代码.ps1
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
    Write-Header "更新服务器代码"
    
    # 1. 检查Git状态
    Write-Info "检查Git状态..."
    
    $gitStatus = git status --porcelain
    if ([string]::IsNullOrEmpty($gitStatus)) {
        Write-Warning "没有检测到代码变更"
        $continue = Read-Host "是否继续更新服务器？(y/n)"
        if ($continue -ne 'y' -and $continue -ne 'Y') {
            Write-Info "操作已取消"
            exit 0
        }
    } else {
        Write-Info "检测到以下变更："
        git status --short
        Write-Host ""
    }
    
    # 2. 推送代码到Git
    Write-Header "推送代码到Git仓库"
    
    try {
        # 添加所有变更
        Write-Info "添加变更文件..."
        git add .
        
        # 提交
        $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Info "提交变更: $commitMessage"
        git commit -m $commitMessage
        
        # 推送
        Write-Info "推送到远程仓库..."
        git push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "代码已推送到Git仓库"
        } else {
            Write-Error-Custom "Git推送失败"
            exit 1
        }
    } catch {
        Write-Error-Custom "Git操作失败: $_"
        exit 1
    }
    
    # 3. 检查SSH密钥
    if (-not (Test-Path $SSH_KEY_FILE)) {
        Write-Warning "SSH密钥文件不存在，正在创建..."
        $sshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDcOr08lnUObi+djGnoalQpZ+6MgRuhH9BXB2k4g/sAOYeqs/y4xzcmDsdqF3Www8f0OwEmaII39kLTh0iucu4GS0G8aSKqD9gw4cQ9msH2cWk9EKH9jQyiASUOh/uZy7mhg145WAP+fUQ9HMU4D1oavdUnGCr5xyVyc9cgFjKcQizXTVPqR0KqdF7r8D2q9vV+25CCwWtwOtY8gAGLafsPT/BTs8Av9PbCIU7iCuad6kq/N0/n/g5q5+eohumpIaD/6OaT4NhWo4+ClC4iKEVqvykTiV6XuJUL+8KahJD/0+tTfw2UhQzIwEE7JVU+x776Fb8YKvapjZOFzZWxIaTf skey-o3j71l2x"
        $sshKey | Out-File -FilePath $SSH_KEY_FILE -Encoding ASCII -NoNewline
        Write-Success "SSH密钥已创建"
    }
    
    # 4. 在服务器上拉取代码
    Write-Header "在服务器上拉取最新代码"
    
    Write-Info "连接服务器: ${SERVER_IP}"
    Write-Info "部署目录: ${DEPLOY_PATH}"
    Write-Host ""
    
    try {
        ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
            echo "切换到ubuntu用户..."
            su - $DEPLOY_USER -c '
                echo "进入项目目录..."
                cd $DEPLOY_PATH
                
                echo "拉取最新代码..."
                git pull
                
                if [ \$? -eq 0 ]; then
                    echo "代码拉取成功"
                else
                    echo "代码拉取失败"
                    exit 1
                fi
            '
"@
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "服务器代码已更新"
        } else {
            Write-Error-Custom "服务器代码拉取失败"
            exit 1
        }
    } catch {
        Write-Error-Custom "SSH连接失败: $_"
        exit 1
    }
    
    # 5. 询问是否重新部署
    Write-Host ""
    Write-Warning "是否重新部署服务？"
    Write-Info "  [1] 快速重启（仅重启服务，不重新构建镜像）"
    Write-Info "  [2] 完整重新部署（重新构建镜像并重启）"
    Write-Info "  [3] 跳过部署"
    Write-Host ""
    
    $choice = Read-Host "请选择 (1/2/3)"
    
    if ($choice -eq "1") {
        Write-Header "快速重启服务"
        
        ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
            su - $DEPLOY_USER -c '
                cd $DEPLOY_PATH
                echo "重启服务..."
                docker-compose restart
                echo ""
                echo "服务状态："
                docker-compose ps
            '
"@
        
        Write-Success "服务已重启"
        
    } elseif ($choice -eq "2") {
        Write-Header "完整重新部署"
        
        Write-Warning "这可能需要5-10分钟，请耐心等待..."
        Write-Host ""
        
        ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} @"
            su - $DEPLOY_USER -c '
                cd $DEPLOY_PATH
                echo "执行部署脚本..."
                ./deploy.sh --rebuild
            '
"@
        
        Write-Success "部署完成"
        
    } else {
        Write-Info "跳过部署"
    }
    
    # 6. 完成
    Write-Header "更新完成！"
    
    Write-Success "本地代码已推送到Git"
    Write-Success "服务器代码已更新"
    
    if ($choice -eq "1" -or $choice -eq "2") {
        Write-Host ""
        Write-Info "访问地址："
        Write-Host "  用户门户: https://sdhaohan.cn" -ForegroundColor Cyan
        Write-Host "  管理门户: https://laimiu.sdhaohan.cn" -ForegroundColor Cyan
        Write-Host "  后端API:  https://api.sdhaohan.cn" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Info "常用命令："
    Write-Host "  查看日志: ssh -i $SSH_KEY_FILE ${SERVER_USER}@${SERVER_IP} 'su - $DEPLOY_USER -c \"cd $DEPLOY_PATH && docker-compose logs -f\"'" -ForegroundColor Gray
    Write-Host "  查看状态: ssh -i $SSH_KEY_FILE ${SERVER_USER}@${SERVER_IP} 'su - $DEPLOY_USER -c \"cd $DEPLOY_PATH && docker-compose ps\"'" -ForegroundColor Gray
}

# 运行主函数
try {
    Main
} catch {
    Write-Error-Custom "发生错误: $_"
    exit 1
}

