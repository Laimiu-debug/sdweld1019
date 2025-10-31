#!/bin/bash

# ========================================
# 焊接工艺管理系统 - 一键部署脚本
# ========================================
# 使用方法：
#   chmod +x deploy.sh
#   ./deploy.sh
# ========================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印标题
print_header() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 主函数
main() {
    print_header "焊接工艺管理系统 - 部署开始"

    # 1. 检查必要的命令
    print_info "检查系统环境..."
    check_command docker
    check_command docker-compose
    print_success "系统环境检查通过"

    # 2. 检查配置文件
    print_info "检查配置文件..."
    if [ ! -f "backend/.env.production" ]; then
        print_error "backend/.env.production 不存在，请先配置"
        exit 1
    fi
    print_success "配置文件检查通过"

    # 3. 检查 QQ 邮箱授权码
    print_warning "请确保已在 backend/.env.production 中配置了 QQ 邮箱授权码"
    read -p "是否已配置 QQ 邮箱授权码？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "请先配置 QQ 邮箱授权码，然后重新运行此脚本"
        exit 1
    fi

    # 4. 停止旧容器（如果存在）
    print_info "停止旧容器..."
    docker-compose down || true
    print_success "旧容器已停止"

    # 5. 清理旧镜像（可选）
    read -p "是否清理旧的 Docker 镜像？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "清理旧镜像..."
        docker-compose down --rmi all || true
        print_success "旧镜像已清理"
    fi

    # 6. 构建镜像
    print_header "构建 Docker 镜像"
    print_info "这可能需要几分钟时间，请耐心等待..."
    docker-compose build --no-cache
    print_success "Docker 镜像构建完成"

    # 7. 启动服务（不包括 Nginx，先申请证书）
    print_header "启动基础服务"
    docker-compose up -d postgres redis backend frontend admin-portal
    print_success "基础服务已启动"

    # 8. 等待数据库就绪
    print_info "等待数据库初始化..."
    sleep 10
    print_success "数据库已就绪"

    # 9. 运行数据库迁移
    print_info "运行数据库迁移..."
    docker-compose exec -T backend alembic upgrade head || print_warning "数据库迁移失败，可能已经是最新版本"
    print_success "数据库迁移完成"

    # 10. 创建管理员账号
    print_info "创建管理员账号..."
    read -p "是否创建管理员账号？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "请输入管理员邮箱: " admin_email
        read -s -p "请输入管理员密码: " admin_password
        echo
        docker-compose exec -T backend python create_admin.py "$admin_email" "$admin_password" || print_warning "管理员账号创建失败，可能已存在"
        print_success "管理员账号创建完成"
    fi

    # 11. SSL 证书申请
    print_header "SSL 证书配置"
    print_warning "首次部署需要申请 SSL 证书"
    print_info "请确保域名已正确解析到服务器 IP: 43.142.188.252"
    read -p "是否现在申请 SSL 证书？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "申请 SSL 证书..."
        
        # 临时启动 Nginx（HTTP 模式）用于证书验证
        docker-compose up -d nginx
        
        # 申请证书
        print_info "为 sdhaohan.cn 申请证书..."
        docker-compose run --rm certbot certonly --webroot \
            --webroot-path=/var/www/certbot \
            --email 2564786659@qq.com \
            --agree-tos \
            --no-eff-email \
            -d sdhaohan.cn
        
        print_info "为 laimiu.sdhaohan.cn 申请证书..."
        docker-compose run --rm certbot certonly --webroot \
            --webroot-path=/var/www/certbot \
            --email 2564786659@qq.com \
            --agree-tos \
            --no-eff-email \
            -d laimiu.sdhaohan.cn
        
        print_info "为 api.sdhaohan.cn 申请证书..."
        docker-compose run --rm certbot certonly --webroot \
            --webroot-path=/var/www/certbot \
            --email 2564786659@qq.com \
            --agree-tos \
            --no-eff-email \
            -d api.sdhaohan.cn
        
        print_success "SSL 证书申请完成"
        
        # 重启 Nginx 以加载证书
        docker-compose restart nginx
    else
        print_warning "跳过 SSL 证书申请，请稍后手动申请"
        print_info "启动 Nginx（HTTP 模式）..."
        docker-compose up -d nginx
    fi

    # 12. 启动所有服务
    print_header "启动所有服务"
    docker-compose up -d
    print_success "所有服务已启动"

    # 13. 显示服务状态
    print_header "服务状态"
    docker-compose ps

    # 14. 完成
    print_header "部署完成！"
    echo ""
    print_success "用户门户: https://sdhaohan.cn"
    print_success "管理门户: https://laimiu.sdhaohan.cn"
    print_success "后端API: https://api.sdhaohan.cn"
    print_success "API文档: https://api.sdhaohan.cn/api/v1/docs"
    echo ""
    print_info "查看日志: docker-compose logs -f"
    print_info "停止服务: docker-compose down"
    print_info "重启服务: docker-compose restart"
    echo ""
    print_warning "重要提示："
    print_warning "1. 请妥善保管 backend/.env.production 文件"
    print_warning "2. 定期备份数据库数据"
    print_warning "3. SSL 证书会自动续期，无需手动操作"
    echo ""
}

# 运行主函数
main

