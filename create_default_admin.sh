#!/bin/bash

# ========================================
# 创建默认管理员账号脚本
# ========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认管理员信息
ADMIN_EMAIL="Laimiu.new@gmail.com"
ADMIN_PASSWORD="ghzzz123"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}创建默认管理员账号${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}管理员邮箱: ${ADMIN_EMAIL}${NC}"
echo -e "${YELLOW}管理员密码: ********${NC}"
echo ""

# 检查 Docker 服务是否运行
if ! docker-compose ps | grep -q "backend.*Up"; then
    echo -e "${RED}错误: 后端服务未运行${NC}"
    echo -e "${YELLOW}请先运行: docker-compose up -d${NC}"
    exit 1
fi

# 创建管理员账号
echo -e "${BLUE}正在创建管理员账号...${NC}"
docker-compose exec -T backend python create_admin.py "$ADMIN_EMAIL" "$ADMIN_PASSWORD"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}管理员账号创建成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}登录信息:${NC}"
    echo -e "  邮箱: ${ADMIN_EMAIL}"
    echo -e "  密码: ${ADMIN_PASSWORD}"
    echo ""
    echo -e "${GREEN}管理门户: https://laimiu.sdhaohan.cn${NC}"
    echo ""
else
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}提示: 管理员账号可能已存在${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    echo -e "${YELLOW}如果账号已存在，请使用以下信息登录:${NC}"
    echo -e "  邮箱: ${ADMIN_EMAIL}"
    echo -e "  密码: ${ADMIN_PASSWORD}"
    echo ""
    echo -e "${YELLOW}管理门户: https://laimiu.sdhaohan.cn${NC}"
    echo ""
fi

