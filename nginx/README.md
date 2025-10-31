# Nginx 配置目录说明

## 📁 目录结构

```
nginx/
├── nginx.conf              # Nginx 主配置文件
├── conf.d/                 # 站点配置目录
│   └── default.conf        # 默认站点配置（三个域名）
├── ssl/                    # SSL 证书目录（手动上传的证书）
├── certbot/                # Let's Encrypt 证书目录
│   ├── conf/               # Certbot 配置和证书存储
│   └── www/                # ACME 验证文件目录
└── README.md               # 本文件
```

## 📝 文件说明

### nginx.conf
- **用途**: Nginx 主配置文件
- **内容**: 全局配置、性能优化、Gzip 压缩
- **修改**: 一般不需要修改

### conf.d/default.conf
- **用途**: 站点配置文件
- **内容**: 三个域名的 HTTPS 配置和反向代理
- **域名**:
  - `sdhaohan.cn` → 用户门户
  - `admin.sdhaohan.cn` → 管理门户
  - `api.sdhaohan.cn` → 后端 API

### ssl/ 目录
- **用途**: 存放手动上传的 SSL 证书（如果有）
- **说明**: 使用 Let's Encrypt 时不需要此目录

### certbot/ 目录
- **用途**: Let's Encrypt 自动证书管理
- **conf/**: 存放 Certbot 配置和申请的证书
- **www/**: ACME 验证文件目录（用于证书申请）

## 🔒 SSL 证书位置

使用 Let's Encrypt 申请的证书会存储在：
```
certbot/conf/live/sdhaohan.cn/fullchain.pem
certbot/conf/live/sdhaohan.cn/privkey.pem
certbot/conf/live/admin.sdhaohan.cn/fullchain.pem
certbot/conf/live/admin.sdhaohan.cn/privkey.pem
certbot/conf/live/api.sdhaohan.cn/fullchain.pem
certbot/conf/live/api.sdhaohan.cn/privkey.pem
```

## ⚠️ 注意事项

1. **不要手动修改 certbot/ 目录**
   - 此目录由 Certbot 自动管理
   - 手动修改可能导致证书续期失败

2. **证书自动续期**
   - Certbot 容器会每 12 小时自动检查并续期证书
   - 无需手动操作

3. **首次部署**
   - 首次部署时 certbot/conf/ 目录为空
   - 运行 deploy.sh 会自动申请证书
   - 证书申请成功后会自动重启 Nginx

## 🛠️ 常用操作

### 查看 Nginx 配置是否正确
```bash
docker-compose exec nginx nginx -t
```

### 重新加载 Nginx 配置
```bash
docker-compose exec nginx nginx -s reload
```

### 查看 Nginx 日志
```bash
docker-compose logs nginx
```

### 手动申请证书
```bash
docker-compose run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email 2564786659@qq.com \
    --agree-tos \
    -d sdhaohan.cn
```

### 手动续期证书
```bash
docker-compose run --rm certbot renew
```

## 📋 部署检查

部署后检查以下内容：

- [ ] nginx.conf 文件存在
- [ ] conf.d/default.conf 文件存在
- [ ] certbot/conf/ 目录已创建
- [ ] certbot/www/ 目录已创建
- [ ] SSL 证书已成功申请
- [ ] Nginx 配置测试通过
- [ ] 所有域名可以通过 HTTPS 访问

