#!/bin/bash

# ========================================
# 服务器加速配置脚本
# 用于解决 Docker 构建时下载慢的问题
# ========================================

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "========================================"
echo "服务器加速配置"
echo "========================================"
echo ""

# 1. 配置 Docker 镜像加速器（使用阿里云、腾讯云等国内镜像）
print_info "配置 Docker 镜像加速器..."

# 创建 Docker 配置目录
mkdir -p /etc/docker

# 配置 Docker daemon.json（使用多个国内镜像源）
cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

print_success "Docker 配置文件已创建"

# 重启 Docker 服务
print_info "重启 Docker 服务..."
systemctl daemon-reload
systemctl restart docker

print_success "Docker 服务已重启"

# 验证配置
print_info "验证 Docker 配置..."
docker info | grep -A 5 "Registry Mirrors" || print_warning "无法显示镜像源信息"

echo ""
print_success "Docker 镜像加速器配置完成！"
echo ""

# 2. 配置系统 APT 源为国内镜像
print_info "配置系统 APT 源为阿里云镜像..."

# 备份原有源
cp /etc/apt/sources.list /etc/apt/sources.list.backup.$(date +%Y%m%d) 2>/dev/null || true

# 检测 Ubuntu 版本
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_VERSION=$VERSION_CODENAME
    
    if [ "$OS_VERSION" = "noble" ] || [ "$OS_VERSION" = "jammy" ]; then
        # Ubuntu 24.04 (noble) 或 22.04 (jammy)
        print_info "检测到 Ubuntu $VERSION_ID ($OS_VERSION)"
        
        cat > /etc/apt/sources.list <<EOF
# 阿里云镜像源 - Ubuntu $VERSION_ID
deb https://mirrors.aliyun.com/ubuntu/ $OS_VERSION main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ $OS_VERSION-updates main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ $OS_VERSION-backports main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ $OS_VERSION-security main restricted universe multiverse
EOF
        print_success "APT 源已配置为阿里云镜像"
    else
        print_warning "未识别的 Ubuntu 版本: $OS_VERSION，跳过 APT 源配置"
    fi
fi

# 更新 APT 缓存
print_info "更新 APT 缓存..."
apt-get update

print_success "APT 缓存更新完成"

echo ""
echo "========================================"
echo "配置完成！"
echo "========================================"
echo ""
print_success "✓ Docker 镜像加速器已配置"
print_success "✓ APT 源已切换到国内镜像"
echo ""
print_info "现在可以运行部署脚本了："
print_info "  ./deploy.sh"
echo ""

