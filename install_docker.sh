#!/bin/bash

# ========================================
# Docker 和 Docker Compose 安装脚本
# 适用于 Ubuntu 22.04
# ========================================

set -e

echo "========================================="
echo "Installing Docker and Docker Compose"
echo "========================================="
echo ""

# 1. 更新系统包
echo "1. Updating system packages..."
apt-get update
echo "Done"
echo ""

# 2. 安装必要的依赖
echo "2. Installing dependencies..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
echo "Done"
echo ""

# 3. 添加 Docker 官方 GPG 密钥
echo "3. Adding Docker GPG key..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "Done"
echo ""

# 4. 设置 Docker 仓库
echo "4. Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
echo "Done"
echo ""

# 5. 更新包索引
echo "5. Updating package index..."
apt-get update
echo "Done"
echo ""

# 6. 安装 Docker Engine
echo "6. Installing Docker Engine..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
echo "Done"
echo ""

# 7. 启动 Docker 服务
echo "7. Starting Docker service..."
systemctl start docker
systemctl enable docker
echo "Done"
echo ""

# 8. 验证安装
echo "8. Verifying installation..."
echo ""
echo "Docker version:"
docker --version
echo ""
echo "Docker Compose version:"
docker compose version
echo ""

# 9. 测试 Docker
echo "9. Testing Docker..."
docker run hello-world
echo ""

echo "========================================="
echo "SUCCESS! Docker installed successfully"
echo "========================================="
echo ""
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"
echo ""
echo "Next steps:"
echo "1. Run deployment script: cd /root/welding-system && ./deploy.sh"
echo ""

