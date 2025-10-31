# 快速部署参考卡片

## 🚀 一键部署命令

```bash
# 1. SSH 登录服务器
ssh root@43.142.188.252

# 2. 上传代码（选择一种方式）
# 方式A: Git克隆
git clone <你的仓库地址>
cd <项目目录>

# 方式B: 本地上传（在本地电脑执行）
scp -r ./项目目录 root@43.142.188.252:/root/

# 3. 配置 QQ 邮箱授权码（必须！）
vim backend/.env.production
# 修改: SMTP_PASSWORD=你的QQ邮箱授权码

# 4. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

---

## 📋 关键信息速查

### 服务器信息
- **IP**: 43.142.188.252
- **系统**: Ubuntu 22.04 + Docker
- **配置**: 2核4GB 90GB

### 域名配置
| 域名 | 用途 | DNS记录 |
|------|------|---------|
| sdhaohan.cn | 用户门户 | A → 43.142.188.252 |
| laimiu.sdhaohan.cn | 管理门户 | A → 43.142.188.252 |
| api.sdhaohan.cn | 后端API | A → 43.142.188.252 |

### 默认密码
```bash
# PostgreSQL
用户名: weld_user
密码: WeldDB@2024#Secure!Pass
数据库: weld_db

# Redis
密码: Redis@2024#Strong!Key

# JWT密钥（已自动生成）
在 backend/.env.production 中
```

### 访问地址
- 用户门户: https://sdhaohan.cn
- 管理门户: https://laimiu.sdhaohan.cn
- API文档: https://api.sdhaohan.cn/api/v1/docs

---

## 🔧 常用命令

### Docker 管理
```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
docker-compose logs -f backend

# 重启服务
docker-compose restart
docker-compose restart backend

# 停止服务
docker-compose down

# 启动服务
docker-compose up -d
```

### 数据库管理
```bash
# 运行迁移
docker-compose exec backend alembic upgrade head

# 创建管理员
docker-compose exec backend python create_admin.py admin@example.com Admin@123456

# 备份数据库
docker-compose exec postgres pg_dump -U weld_user weld_db > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U weld_user weld_db < backup.sql
```

### SSL 证书管理
```bash
# 申请证书（首次）
docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email 2564786659@qq.com \
    --agree-tos \
    -d laimiu.sdhaohan.cn

# 手动续期（自动续期已配置）
docker-compose run --rm certbot renew

# 重启 Nginx 加载证书
docker-compose restart nginx
```

---

## ⚠️ 部署前检查

- [ ] 域名已解析到服务器IP（ping sdhaohan.cn, laimiu.sdhaohan.cn, api.sdhaohan.cn）
- [ ] 安全组已开放 22, 80, 443 端口
- [ ] QQ 邮箱授权码已获取
- [ ] 已配置 backend/.env.production
- [ ] 服务器已安装 Docker 和 Docker Compose

---

## 🐛 快速排错

### 问题1: SSL证书申请失败
```bash
# 检查域名解析
ping sdhaohan.cn

# 检查80端口是否开放
curl http://sdhaohan.cn/.well-known/acme-challenge/test
```

### 问题2: 邮件发送失败
```bash
# 检查配置
cat backend/.env.production | grep SMTP

# 查看日志
docker-compose logs backend | grep -i email

# 重启后端
docker-compose restart backend
```

### 问题3: 前端无法访问
```bash
# 检查 Nginx 状态
docker-compose ps nginx

# 查看 Nginx 日志
docker-compose logs nginx

# 测试 Nginx 配置
docker-compose exec nginx nginx -t
```

### 问题4: 数据库连接失败
```bash
# 检查数据库状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 进入数据库
docker-compose exec postgres psql -U weld_user -d weld_db
```

---

## 📞 获取帮助

1. 查看详细文档: `DEPLOYMENT_GUIDE.md`
2. QQ邮箱配置: `QQ_EMAIL_SETUP.md`
3. 查看日志: `docker-compose logs -f`
4. 检查服务: `docker-compose ps`

---

## 🎯 部署后验证

```bash
# 1. 检查所有服务是否运行
docker-compose ps

# 2. 测试用户门户
curl -I https://sdhaohan.cn

# 3. 测试管理门户
curl -I https://laimiu.sdhaohan.cn

# 4. 测试 API
curl https://api.sdhaohan.cn/api/v1/health

# 5. 查看资源使用
docker stats
```

---

**部署完成！** 🎉

