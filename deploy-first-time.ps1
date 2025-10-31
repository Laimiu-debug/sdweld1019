# ========================================
# First Time Deployment Script
# ========================================
# Deploy to /home/ubuntu/sdweld using Git
# ========================================

$ErrorActionPreference = "Stop"

# Server Configuration
$SERVER_IP = "43.142.188.252"
$SERVER_USER = "root"
$DEPLOY_USER = "ubuntu"
$DEPLOY_PATH = "/home/ubuntu/sdweld"
$SSH_KEY_FILE = "$PSScriptRoot\server-key.pem"

# Color Output Functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
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

# Main Function
function Main {
    Write-Header "First Time Deployment to Cloud Server"
    
    Write-Info "Server IP: $SERVER_IP"
    Write-Info "Deploy Path: $DEPLOY_PATH"
    Write-Info "Deploy User: $DEPLOY_USER"
    Write-Host ""
    
    # 1. Check Git Repository
    Write-Header "Step 1: Check Git Repository"
    
    try {
        $gitRemote = git remote get-url origin 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Git repository configured: $gitRemote"
        } else {
            Write-Error-Custom "No Git remote repository found"
            Write-Info "Please push code to GitHub or Gitee first"
            Write-Info "Commands:"
            Write-Host "  git init" -ForegroundColor Gray
            Write-Host "  git add ." -ForegroundColor Gray
            Write-Host "  git commit -m 'Initial commit'" -ForegroundColor Gray
            Write-Host "  git remote add origin YOUR_REPO_URL" -ForegroundColor Gray
            Write-Host "  git push -u origin main" -ForegroundColor Gray
            exit 1
        }
    } catch {
        Write-Error-Custom "Git check failed: $_"
        exit 1
    }
    
    # 2. Push Latest Code
    Write-Header "Step 2: Push Code to Git"
    
    $gitStatus = git status --porcelain
    if (-not [string]::IsNullOrEmpty($gitStatus)) {
        Write-Info "Uncommitted changes detected, committing..."
        git add .
        git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    
    Write-Info "Pushing to remote repository..."
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Code pushed successfully"
    } else {
        Write-Warning-Custom "Git push failed, but continuing deployment..."
        Write-Info "You may need to push manually later"
    }
    
    # 3. Test SSH Connection
    Write-Header "Step 3: Test SSH Connection"

    Write-Info "Testing SSH connection..."
    Write-Warning-Custom "Please enter the server password when prompted"
    Write-Host ""

    $testCmd = "echo 'OK'"
    $testResult = ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_IP} $testCmd 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Success "SSH connection successful"
    } else {
        Write-Error-Custom "SSH connection failed: $testResult"
        Write-Info "Please check:"
        Write-Host "  1. Server IP is correct" -ForegroundColor Yellow
        Write-Host "  2. Security group allows port 22" -ForegroundColor Yellow
        Write-Host "  3. Password is correct" -ForegroundColor Yellow
        exit 1
    }
    
    # 4. Setup Server Environment
    Write-Header "Step 4: Setup Server Environment"

    Write-Info "Creating ubuntu user and configuring permissions..."
    Write-Warning-Custom "Please enter password if prompted"
    Write-Host ""

    $setupScript = @'
# Check ubuntu user
if ! id ubuntu &>/dev/null; then
    echo "Creating ubuntu user..."
    useradd -m -s /bin/bash ubuntu
else
    echo "Ubuntu user already exists"
fi

# Install Docker
if ! command -v docker &>/dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
else
    echo "Docker already installed"
fi

# Install docker-compose
if ! command -v docker-compose &>/dev/null; then
    echo "Installing docker-compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "docker-compose already installed"
fi

# Configure permissions
usermod -aG docker ubuntu
usermod -aG sudo ubuntu

echo "Environment setup complete"
'@

    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} $setupScript

    Write-Success "Server environment configured"
    
    # 5. Clone Code
    Write-Header "Step 5: Clone Code to Server"

    Write-Info "Git repository: $gitRemote"
    Write-Info "Target directory: $DEPLOY_PATH"
    Write-Warning-Custom "Please enter password if prompted"
    Write-Host ""

    $cloneScript = @"
su - $DEPLOY_USER -c '
    # Check if directory exists
    if [ -d "$DEPLOY_PATH" ]; then
        echo "Directory exists, backing up..."
        mv $DEPLOY_PATH ${DEPLOY_PATH}.backup.\$(date +%Y%m%d%H%M%S)
    fi

    # Clone code
    echo "Cloning code..."
    git clone $gitRemote $DEPLOY_PATH

    if [ \$? -eq 0 ]; then
        echo "Code cloned successfully"
        cd $DEPLOY_PATH
        ls -la
    else
        echo "Code clone failed"
        exit 1
    fi
'
"@

    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} $cloneScript

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Code cloned successfully"
    } else {
        Write-Error-Custom "Code clone failed"
        Write-Warning-Custom "If this is a private repository, you may need to configure Git credentials on the server"
        exit 1
    }
    
    # 6. Upload Environment Config
    Write-Header "Step 6: Upload Environment Configuration"

    Write-Warning-Custom "Uploading sensitive configuration files"
    Write-Info "Uploading: backend/.env.production"
    Write-Warning-Custom "Please enter password if prompted"
    Write-Host ""

    if (Test-Path "backend\.env.production") {
        Write-Info "Uploading backend/.env.production..."
        scp -o StrictHostKeyChecking=no "backend\.env.production" ${SERVER_USER}@${SERVER_IP}:/tmp/

        $moveScript = @"
chown ubuntu:ubuntu /tmp/.env.production
su - $DEPLOY_USER -c 'mv /tmp/.env.production $DEPLOY_PATH/backend/.env.production'
"@

        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} $moveScript

        Write-Success "Configuration file uploaded"
    } else {
        Write-Warning-Custom "backend/.env.production not found"
        Write-Info "Please ensure QQ email authorization code is configured"
    }
    
    # 7. Execute Deployment
    Write-Header "Step 7: Execute Deployment"

    Write-Warning-Custom "This may take 10-15 minutes, please be patient..."
    Write-Warning-Custom "Please enter password if prompted"
    Write-Host ""

    $deployScript = @"
su - $DEPLOY_USER -c '
    cd $DEPLOY_PATH

    # Give execute permission to script
    chmod +x deploy.sh

    # Execute deployment
    ./deploy.sh
'
"@

    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} $deployScript

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployment complete"
    } else {
        Write-Warning-Custom "Some issues may have occurred during deployment"
        Write-Info "Please check logs for details"
    }
    
    # 8. Complete
    Write-Header "Deployment Complete!"

    Write-Success "Project deployed to: $DEPLOY_PATH"
    Write-Host ""
    Write-Info "Access URLs:"
    Write-Host "  User Portal:  https://sdhaohan.cn" -ForegroundColor Cyan
    Write-Host "  Admin Portal: https://laimiu.sdhaohan.cn" -ForegroundColor Cyan
    Write-Host "  Backend API:  https://api.sdhaohan.cn" -ForegroundColor Cyan
    Write-Host "  API Docs:     https://api.sdhaohan.cn/api/v1/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "Common Commands:"
    Write-Host "  Check status: ssh ${SERVER_USER}@${SERVER_IP} 'su - $DEPLOY_USER -c `"cd $DEPLOY_PATH && docker-compose ps`"'" -ForegroundColor Gray
    Write-Host "  View logs:    ssh ${SERVER_USER}@${SERVER_IP} 'su - $DEPLOY_USER -c `"cd $DEPLOY_PATH && docker-compose logs -f`"'" -ForegroundColor Gray
    Write-Host ""
    Write-Warning-Custom "Important Notes:"
    Write-Host "  1. Keep backend/.env.production secure" -ForegroundColor Yellow
    Write-Host "  2. Backup database regularly" -ForegroundColor Yellow
    Write-Host "  3. For future updates, manually pull code and redeploy" -ForegroundColor Yellow
}

# Run Main Function
try {
    Main
} catch {
    Write-Error-Custom "Error occurred: $_"
    exit 1
}

