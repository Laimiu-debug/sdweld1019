# 部署检查清单

## 📋 部署前准备（在本地完成）

### 1. 代码准备
- [ ] 所有代码已提交到 Git 仓库
- [ ] 已创建 `.gitignore` 文件，排除敏感信息
- [ ] 已测试所有功能正常运行
- [ ] 已更新版本号

### 2. 配置文件准备
- [ ] 已创建 `backend/.env.production`
- [ ] 已创建 `frontend/.env.production`
- [ ] 已创建 `admin-portal/.env.production`
- [ ] **重要**: 已获取 QQ 邮箱授权码
- [ ] **重要**: 已在 `backend/.env.production` 中填写授权码

### 3. 域名和DNS
- [ ] 已购买域名: sdhaohan.cn
- [ ] 已完成域名备案
- [ ] 已配置 DNS 解析:
  - [ ] @ → 43.142.188.252
  - [ ] laimiu → 43.142.188.252
  - [ ] api → 43.142.188.252
- [ ] 已验证 DNS 解析生效（ping 测试）

### 4. 服务器准备
- [ ] 已购买腾讯云服务器
- [ ] 服务器IP: 43.142.188.252
- [ ] 操作系统: Ubuntu 22.04
- [ ] 已安装 Docker
- [ ] 已安装 Docker Compose
- [ ] 安全组已配置（开放 22, 80, 443 端口）

---

## 🚀 部署步骤（在服务器上完成）

### 步骤 1: 登录服务器
```bash
ssh root@43.142.188.252
```
- [ ] 成功登录服务器

### 步骤 2: 上传代码
```bash
# 方式A: Git克隆（推荐）
git clone <你的仓库地址>
cd <项目目录>

# 方式B: 本地上传
# scp -r ./项目目录 root@43.142.188.252:/root/
```
- [ ] 代码已上传到服务器
- [ ] 已进入项目目录

### 步骤 3: 配置环境变量
```bash
vim backend/.env.production
```
- [ ] 已填写 QQ 邮箱授权码（SMTP_PASSWORD）
- [ ] 已检查数据库密码
- [ ] 已检查 Redis 密码
- [ ] 已检查域名配置

### 步骤 4: 运行部署脚本
```bash
chmod +x deploy.sh
./deploy.sh
```
- [ ] 脚本运行成功
- [ ] 所有 Docker 镜像构建完成
- [ ] 所有服务已启动

### 步骤 5: 申请 SSL 证书
部署脚本会自动申请，或手动执行：
```bash
# 为主域名申请
docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email 2564786659@qq.com \
    --agree-tos -d sdhaohan.cn

# 为子域名申请
docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email 2564786659@qq.com \
    --agree-tos -d laimiu.sdhaohan.cn

docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email 2564786659@qq.com \
    --agree-tos -d api.sdhaohan.cn
```
- [ ] sdhaohan.cn 证书申请成功
- [ ] laimiu.sdhaohan.cn 证书申请成功
- [ ] api.sdhaohan.cn 证书申请成功
- [ ] 已重启 Nginx 加载证书

### 步骤 6: 初始化数据库
```bash
# 运行数据库迁移
docker-compose exec backend alembic upgrade head

# 创建管理员账号
docker-compose exec backend python create_admin.py admin@example.com Admin@123456
```
- [ ] 数据库迁移成功
- [ ] 管理员账号创建成功
- [ ] 已记录管理员账号密码

---

## ✅ 部署后验证

### 1. 检查服务状态
```bash
docker-compose ps
```
- [ ] postgres 服务状态: Up (healthy)
- [ ] redis 服务状态: Up (healthy)
- [ ] backend 服务状态: Up (healthy)
- [ ] frontend 服务状态: Up
- [ ] admin-portal 服务状态: Up
- [ ] nginx 服务状态: Up (healthy)
- [ ] certbot 服务状态: Up

### 2. 检查日志
```bash
docker-compose logs -f
```
- [ ] 无严重错误日志
- [ ] 后端服务启动成功
- [ ] 数据库连接成功

### 3. 访问测试

#### 用户门户
```bash
curl -I https://sdhaohan.cn
```
- [ ] 返回 200 OK
- [ ] 浏览器访问正常
- [ ] HTTPS 证书有效
- [ ] 页面加载正常

#### 管理门户
```bash
curl -I https://laimiu.sdhaohan.cn
```
- [ ] 返回 200 OK
- [ ] 浏览器访问正常
- [ ] HTTPS 证书有效
- [ ] 页面加载正常

#### 后端 API
```bash
curl https://api.sdhaohan.cn/api/v1/health
```
- [ ] 返回健康检查响应
- [ ] API 文档可访问: https://api.sdhaohan.cn/api/v1/docs
- [ ] HTTPS 证书有效

### 4. 功能测试

#### 用户注册
- [ ] 访问 https://sdhaohan.cn
- [ ] 点击注册
- [ ] 输入邮箱地址
- [ ] 点击"发送验证码"
- [ ] 邮箱收到验证码
- [ ] 完成注册流程

#### 用户登录
- [ ] 使用注册的账号登录
- [ ] 登录成功，进入系统

#### 管理员登录
- [ ] 访问 https://admin.sdhaohan.cn
- [ ] 使用管理员账号登录
- [ ] 登录成功，进入管理后台

#### 邮件发送
- [ ] 注册验证码邮件正常发送
- [ ] 找回密码邮件正常发送
- [ ] 邮件内容格式正确

---

## 🔒 安全检查

### 1. 密码安全
- [ ] 数据库密码已修改为强密码
- [ ] Redis 密码已配置
- [ ] JWT 密钥已生成随机值
- [ ] 管理员密码已设置为强密码

### 2. 文件权限
```bash
# 检查敏感文件权限
ls -la backend/.env.production
```
- [ ] .env.production 文件权限正确（600 或 644）
- [ ] 敏感文件未提交到 Git

### 3. 防火墙和安全组
- [ ] 只开放必要端口（22, 80, 443）
- [ ] SSH 端口已修改（可选）
- [ ] 已禁用 root 密码登录（可选）
- [ ] 已配置 SSH 密钥登录（可选）

### 4. HTTPS 配置
- [ ] 所有域名都使用 HTTPS
- [ ] HTTP 自动跳转到 HTTPS
- [ ] SSL 证书有效期正常
- [ ] 证书自动续期已配置

---

## 📊 性能检查

### 1. 资源使用
```bash
docker stats
```
- [ ] CPU 使用率正常（< 80%）
- [ ] 内存使用率正常（< 80%）
- [ ] 磁盘空间充足（> 20% 剩余）

### 2. 响应速度
- [ ] 首页加载时间 < 3秒
- [ ] API 响应时间 < 1秒
- [ ] 静态资源加载正常

---

## 💾 备份配置

### 1. 数据库备份
```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U weld_user weld_db > /root/backups/backup_$DATE.sql
# 删除7天前的备份
find /root/backups -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# 添加定时任务（每天凌晨2点备份）
crontab -e
# 添加: 0 2 * * * /root/backup.sh
```
- [ ] 备份脚本已创建
- [ ] 定时任务已配置
- [ ] 备份目录已创建
- [ ] 已测试备份功能

### 2. 配置文件备份
```bash
# 备份配置文件
cp backend/.env.production /root/backups/env.production.backup
```
- [ ] 配置文件已备份
- [ ] 备份文件已妥善保管

---

## 📝 文档记录

### 需要记录的信息
- [ ] 服务器 IP: 43.142.188.252
- [ ] 域名: sdhaohan.cn
- [ ] 数据库密码: WeldDB@2024#Secure!Pass
- [ ] Redis 密码: Redis@2024#Strong!Key
- [ ] 管理员账号: _______________
- [ ] 管理员密码: _______________
- [ ] QQ 邮箱授权码: _______________
- [ ] SSL 证书到期时间: _______________

### 文档清单
- [ ] 已阅读 `DEPLOYMENT_GUIDE.md`
- [ ] 已阅读 `QQ_EMAIL_SETUP.md`
- [ ] 已阅读 `QUICK_DEPLOY.md`
- [ ] 已保存所有密码到安全位置

---

## 🎉 部署完成

恭喜！如果以上所有项目都已勾选，说明部署已成功完成！

### 下一步
1. 通知团队成员系统已上线
2. 开始使用系统
3. 定期检查日志和性能
4. 定期备份数据
5. 关注系统更新

### 维护建议
- 每天检查一次日志
- 每周检查一次资源使用
- 每月检查一次备份
- 及时更新系统和依赖

---

**部署日期**: _______________  
**部署人员**: _______________  
**备注**: _______________

