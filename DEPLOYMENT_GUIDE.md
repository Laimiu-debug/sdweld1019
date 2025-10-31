# 焊接工艺管理系统 - 部署指南

## 📋 目录

- [服务器信息](#服务器信息)
- [部署前准备](#部署前准备)
- [快速部署](#快速部署)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [常见问题](#常见问题)
- [维护指南](#维护指南)

---

## 🖥️ 服务器信息

- **服务器IP**: 43.142.188.252
- **操作系统**: Ubuntu 22.04 + Docker
- **配置**: 2核 4GB 内存 90GB 存储
- **域名**: sdhaohan.cn (已备案)

### 域名规划

- `https://sdhaohan.cn` → 用户门户
- `https://laimiu.sdhaohan.cn` → 管理门户
- `https://api.sdhaohan.cn` → 后端API

---

## 🔧 部署前准备

### 1. 域名解析配置

在腾讯云 DNS 解析中添加以下记录：

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| @ | A | 43.142.188.252 | 600 |
| laimiu | A | 43.142.188.252 | 600 |
| api | A | 43.142.188.252 | 600 |

**验证方法**：
```bash
ping sdhaohan.cn
ping laimiu.sdhaohan.cn
ping api.sdhaohan.cn
```

### 2. 获取 QQ 邮箱授权码

QQ 邮箱用于发送验证码、找回密码等邮件。

**步骤**：
1. 登录 QQ 邮箱 (https://mail.qq.com)
2. 点击 **设置** → **账户**
3. 找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
4. 开启 **POP3/SMTP服务** 或 **IMAP/SMTP服务**
5. 点击 **生成授权码**，按提示发送短信
6. 复制生成的授权码（16位字符，如：`abcdefghijklmnop`）
7. 将授权码填入 `backend/.env.production` 的 `SMTP_PASSWORD` 字段

### 3. 安全组配置

在腾讯云控制台配置安全组，开放以下端口：

| 端口 | 协议 | 说明 |
|-----|------|------|
| 22 | TCP | SSH 登录 |
| 80 | TCP | HTTP (用于 SSL 证书验证) |
| 443 | TCP | HTTPS |

---

## 🚀 快速部署

### 方式一：使用一键部署脚本（推荐）

```bash
# 1. SSH 登录服务器
ssh root@43.142.188.252

# 2. 克隆代码（或上传代码到服务器）
git clone <你的仓库地址>
cd <项目目录>

# 3. 配置 QQ 邮箱授权码
vim backend/.env.production
# 找到 SMTP_PASSWORD 字段，填入你的 QQ 邮箱授权码

# 4. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

脚本会自动完成：
- ✅ 检查系统环境
- ✅ 构建 Docker 镜像
- ✅ 启动所有服务
- ✅ 初始化数据库
- ✅ 申请 SSL 证书
- ✅ 创建管理员账号

---

## 📝 详细部署步骤

### 步骤 1: 上传代码到服务器

**方式 A: 使用 Git（推荐）**
```bash
ssh root@43.142.188.252
git clone <你的仓库地址>
cd <项目目录>
```

**方式 B: 使用 SCP 上传**
```bash
# 在本地电脑执行
scp -r ./项目目录 root@43.142.188.252:/root/
```

### 步骤 2: 配置环境变量

编辑 `backend/.env.production`：

```bash
vim backend/.env.production
```

**必须修改的配置**：
```bash
# QQ 邮箱授权码（必填！）
SMTP_PASSWORD=你的QQ邮箱授权码
```

**可选配置**：
- 数据库密码（默认已生成强密码）
- Redis 密码（默认已生成强密码）
- JWT 密钥（默认已生成随机密钥）

### 步骤 3: 构建和启动服务

```bash
# 构建 Docker 镜像
docker-compose build

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 步骤 4: 初始化数据库

```bash
# 运行数据库迁移
docker-compose exec backend alembic upgrade head

# 创建管理员账号
docker-compose exec backend python create_admin.py admin@example.com Admin@123456
```

### 步骤 5: 申请 SSL 证书

**首次申请**：
```bash
# 为主域名申请证书
docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email 2564786659@qq.com \
    --agree-tos \
    --no-eff-email \
    -d sdhaohan.cn

# 为管理门户申请证书
docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email 2564786659@qq.com \
    --agree-tos \
    --no-eff-email \
    -d laimiu.sdhaohan.cn

# 为 API 申请证书
docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email 2564786659@qq.com \
    --agree-tos \
    --no-eff-email \
    -d api.sdhaohan.cn

# 重启 Nginx 加载证书
docker-compose restart nginx
```

**证书自动续期**：
Certbot 容器会每 12 小时自动检查并续期证书，无需手动操作。

### 步骤 6: 验证部署

访问以下地址验证部署是否成功：

- 用户门户: https://sdhaohan.cn
- 管理门户: https://laimiu.sdhaohan.cn
- API 文档: https://api.sdhaohan.cn/api/v1/docs

---

## ⚙️ 配置说明

### 数据库配置

**默认配置**（已在 docker-compose.yml 中设置）：
- 数据库名: `weld_db`
- 用户名: `weld_user`
- 密码: `WeldDB@2024#Secure!Pass`
- 端口: `5432`

**数据存储位置**：
- Docker Volume: `postgres_data`
- 物理路径: `/var/lib/docker/volumes/postgres_data/_data`

### Redis 配置

**默认配置**：
- 密码: `Redis@2024#Strong!Key`
- 端口: `6379`
- 数据库: `0`

**数据存储位置**：
- Docker Volume: `redis_data`

### 文件上传配置

**上传目录**：
- Docker Volume: `backend_uploads`
- 容器内路径: `/app/storage/uploads`
- 访问地址: `https://api.sdhaohan.cn/uploads/`

**限制**：
- 最大文件大小: 10MB
- 允许的文件类型: jpg, jpeg, png, pdf, doc, docx, xls, xlsx

---

## 🔍 常见问题

### 1. SSL 证书申请失败

**原因**：域名未正确解析到服务器 IP

**解决方法**：
```bash
# 检查域名解析
ping sdhaohan.cn

# 如果解析不正确，请在腾讯云 DNS 控制台修改
# 等待 DNS 生效后（通常 10 分钟内），重新申请证书
```

### 2. 邮件发送失败

**原因**：QQ 邮箱授权码未配置或配置错误

**解决方法**：
```bash
# 1. 检查配置文件
cat backend/.env.production | grep SMTP_PASSWORD

# 2. 重新获取 QQ 邮箱授权码
# 3. 修改配置文件
vim backend/.env.production

# 4. 重启后端服务
docker-compose restart backend
```

### 3. 前端页面无法访问

**原因**：Nginx 配置错误或证书未申请

**解决方法**：
```bash
# 查看 Nginx 日志
docker-compose logs nginx

# 检查 Nginx 配置
docker-compose exec nginx nginx -t

# 重启 Nginx
docker-compose restart nginx
```

### 4. 数据库连接失败

**原因**：数据库未启动或密码错误

**解决方法**：
```bash
# 查看数据库状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 重启数据库
docker-compose restart postgres
```

---

## 🛠️ 维护指南

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f postgres
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
docker-compose restart nginx
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（危险！会删除所有数据）
docker-compose down -v
```

### 更新代码

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d

# 4. 运行数据库迁移（如果有）
docker-compose exec backend alembic upgrade head
```

### 数据库备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U weld_user weld_db > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker-compose exec -T postgres psql -U weld_user weld_db < backup_20241031.sql
```

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h

# 查看 Docker 磁盘使用
docker system df
```

### 清理 Docker 资源

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的数据卷
docker volume prune

# 清理所有未使用的资源
docker system prune -a
```

---

## 📞 技术支持

如遇到问题，请检查：
1. 日志文件: `docker-compose logs`
2. 服务状态: `docker-compose ps`
3. 网络连接: `ping` 和 `curl` 测试

---

## 🎉 部署完成检查清单

- [ ] 域名已正确解析到服务器 IP
- [ ] SSL 证书已成功申请
- [ ] QQ 邮箱授权码已配置
- [ ] 所有服务已启动（docker-compose ps 显示 Up）
- [ ] 用户门户可以访问 (https://sdhaohan.cn)
- [ ] 管理门户可以访问 (https://admin.sdhaohan.cn)
- [ ] API 文档可以访问 (https://api.sdhaohan.cn/api/v1/docs)
- [ ] 管理员账号已创建
- [ ] 邮件发送功能已测试
- [ ] 数据库已备份

---

**祝部署顺利！** 🚀

