#!/bin/bash

# ========================================
# 服务器诊断和修复脚本
# ========================================

echo "========================================="
echo "开始诊断服务器环境"
echo "========================================="
echo ""

# 1. 检查当前位置
echo "1. 当前位置："
pwd
echo ""

# 2. 检查 /root 目录
echo "2. /root 目录内容："
ls -la /root/
echo ""

# 3. 检查是否有 welding-system 目录
if [ -d "/root/welding-system" ]; then
    echo "3. welding-system 目录存在"
    echo "   目录内容："
    ls -la /root/welding-system/
    echo ""
    
    # 检查是否是 Git 仓库
    if [ -d "/root/welding-system/.git" ]; then
        echo "   这是一个 Git 仓库"
        cd /root/welding-system
        echo "   远程仓库："
        git remote -v
        echo ""
        echo "   当前分支："
        git branch
        echo ""
    else
        echo "   ⚠️  不是 Git 仓库！"
    fi
else
    echo "3. ⚠️  welding-system 目录不存在"
fi
echo ""

# 4. 检查网络连接
echo "4. 测试 GitHub 连接："
ping -c 3 github.com
echo ""

# 5. 测试 Git 克隆
echo "5. 测试克隆仓库："
echo "   清理旧目录..."
rm -rf /root/welding-system-test

echo "   开始克隆..."
git clone https://github.com/Laimiu-debug/sdweld1019.git /root/welding-system-test

if [ $? -eq 0 ]; then
    echo "   ✓ 克隆成功！"
    echo ""
    echo "   克隆的文件："
    ls -la /root/welding-system-test/
    echo ""
    echo "   检查关键文件："
    ls -lh /root/welding-system-test/deploy.sh
    ls -lh /root/welding-system-test/docker-compose.yml
    ls -lh /root/welding-system-test/backend/Dockerfile
    echo ""
    
    # 如果测试成功，替换正式目录
    echo "6. 替换正式目录："
    rm -rf /root/welding-system
    mv /root/welding-system-test /root/welding-system
    echo "   ✓ 完成！"
    echo ""
    
    # 设置权限
    echo "7. 设置执行权限："
    cd /root/welding-system
    chmod +x deploy.sh create_default_admin.sh
    echo "   ✓ 完成！"
    echo ""
    
    echo "========================================="
    echo "✓ 诊断和修复完成！"
    echo "========================================="
    echo ""
    echo "下一步："
    echo "1. 退出服务器（输入 exit）"
    echo "2. 在本地执行: .\\上传敏感配置.ps1"
    echo "3. 重新登录服务器: ssh root@43.142.188.252"
    echo "4. 开始部署: cd /root/welding-system && ./deploy.sh"
    echo ""
else
    echo "   ✗ 克隆失败！"
    echo ""
    echo "可能的原因："
    echo "1. 网络连接问题"
    echo "2. GitHub 仓库是私有的"
    echo "3. Git 未安装"
    echo ""
    echo "请检查："
    echo "- 仓库是否设为公开: https://github.com/Laimiu-debug/sdweld1019/settings"
    echo "- 网络是否正常: ping github.com"
    echo "- Git 是否安装: git --version"
fi

