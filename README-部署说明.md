# 🚀 部署说明 - 使用Git方式部署到普通目录

## 📋 快速开始

### 方式一：首次部署（推荐）⭐

如果你是第一次部署，使用这个脚本：

```powershell
.\首次部署到服务器.ps1
```

这个脚本会自动完成：
- ✅ 推送代码到Git仓库
- ✅ 在服务器上创建ubuntu用户
- ✅ 安装Docker和docker-compose
- ✅ 克隆代码到 `/home/ubuntu/sdweld`
- ✅ 上传环境配置文件
- ✅ 执行部署

**预计时间**: 15-20分钟

---

### 方式二：手动部署

如果你想手动控制每一步，参考这个文档：

📖 **[Git部署到普通目录.md](./Git部署到普通目录.md)**

---

## 🔄 后续更新代码

当你修改了代码后，使用这个脚本更新服务器：

```powershell
.\更新服务器代码.ps1
```

这个脚本会：
1. 推送本地代码到Git
2. 在服务器上拉取最新代码
3. 询问是否重新部署（快速重启 或 完整重新部署）

**预计时间**: 2-10分钟（取决于选择）

---

## 📁 部署目录说明

### 为什么使用 `/home/ubuntu/sdweld` 而不是 `/root/sdweld`？

使用普通用户目录的优势：

1. **更安全** 🔒
   - 限制了权限范围
   - 即使应用被攻击也不会影响系统核心

2. **更规范** ✅
   - 符合Linux最佳实践
   - 生产环境标准做法

3. **更易管理** 📊
   - 可以为不同项目创建不同用户
   - 权限隔离更清晰

4. **更易备份** 💾
   - 用户目录更容易备份和迁移
   - 不会混入系统文件

---

## 🔧 部署前必须配置

### ⚠️ QQ邮箱授权码（必须）

编辑 `backend/.env.production` 文件：

```env
SMTP_PASSWORD=你的QQ邮箱授权码  # ⚠️ 必须修改
```

**如何获取**：
1. 登录 QQ邮箱: https://mail.qq.com
2. 设置 → 账户 → 开启IMAP/SMTP服务
3. 生成授权码（16位字符）
4. 复制并粘贴到配置文件

---

## 📦 服务器信息

- **IP地址**: 43.142.188.252
- **操作系统**: Ubuntu 22.04
- **部署目录**: `/home/ubuntu/sdweld`
- **部署用户**: ubuntu
- **SSH密钥**: 已内置在脚本中

---

## 🌐 访问地址

部署成功后，访问：

- **用户门户**: https://sdhaohan.cn
- **管理门户**: https://laimiu.sdhaohan.cn
- **后端API**: https://api.sdhaohan.cn
- **API文档**: https://api.sdhaohan.cn/api/v1/docs

---

## 🛠️ 常用管理命令

### 查看服务状态

```powershell
ssh -i server-key.pem root@43.142.188.252 "su - ubuntu -c 'cd /home/ubuntu/sdweld && docker-compose ps'"
```

### 查看日志

```powershell
# 查看所有日志
ssh -i server-key.pem root@43.142.188.252 "su - ubuntu -c 'cd /home/ubuntu/sdweld && docker-compose logs -f'"

# 查看后端日志
ssh -i server-key.pem root@43.142.188.252 "su - ubuntu -c 'cd /home/ubuntu/sdweld && docker-compose logs -f backend'"
```

### 重启服务

```powershell
ssh -i server-key.pem root@43.142.188.252 "su - ubuntu -c 'cd /home/ubuntu/sdweld && docker-compose restart'"
```

### 停止服务

```powershell
ssh -i server-key.pem root@43.142.188.252 "su - ubuntu -c 'cd /home/ubuntu/sdweld && docker-compose down'"
```

### 启动服务

```powershell
ssh -i server-key.pem root@43.142.188.252 "su - ubuntu -c 'cd /home/ubuntu/sdweld && docker-compose up -d'"
```

---

## 📋 文件说明

| 文件名 | 说明 | 使用场景 |
|--------|------|----------|
| `首次部署到服务器.ps1` | 自动化首次部署脚本 | 第一次部署时使用 |
| `更新服务器代码.ps1` | 自动化更新脚本 | 后续更新代码时使用 |
| `Git部署到普通目录.md` | 详细的手动部署指南 | 想手动控制每一步时参考 |
| `server-key.pem` | SSH密钥文件 | 自动生成，用于连接服务器 |

---

## ❓ 常见问题

### 1. 提示"无法运行脚本"

**错误**:
```
无法加载文件 *.ps1，因为在此系统上禁止运行脚本
```

**解决**:
```powershell
# 以管理员身份运行PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 2. Git推送失败

**错误**: `Permission denied` 或 `Authentication failed`

**解决**:
- 确保已配置Git远程仓库
- 如果是私有仓库，使用Personal Access Token（GitHub）或私人令牌（Gitee）

---

### 3. SSH连接失败

**错误**: `Connection refused` 或 `Connection timed out`

**解决**:
- 检查服务器IP是否正确
- 检查安全组是否开放22端口
- 检查网络连接

---

### 4. Docker权限问题

**错误**: `permission denied while trying to connect to the Docker daemon`

**解决**:
服务器上执行：
```bash
sudo usermod -aG docker ubuntu
# 然后退出重新登录
```

---

## 🎯 部署流程图

```
本地开发
   ↓
修改代码
   ↓
运行: .\首次部署到服务器.ps1 (首次)
   或
运行: .\更新服务器代码.ps1 (更新)
   ↓
自动推送到Git
   ↓
服务器拉取代码
   ↓
重新部署
   ↓
访问: https://sdhaohan.cn
```

---

## 💡 最佳实践

1. **首次部署前**
   - ✅ 配置QQ邮箱授权码
   - ✅ 确保代码已推送到Git仓库
   - ✅ 检查域名DNS解析

2. **日常开发**
   - ✅ 在本地测试通过后再部署
   - ✅ 使用 `更新服务器代码.ps1` 快速更新
   - ✅ 定期查看服务器日志

3. **安全建议**
   - ✅ 不要将 `.env.production` 提交到Git
   - ✅ 定期备份数据库
   - ✅ 妥善保管SSH密钥

---

## 📞 需要帮助？

1. 查看详细文档: `Git部署到普通目录.md`
2. 查看部署日志: `docker-compose logs -f`
3. 检查服务状态: `docker-compose ps`

---

## 🎉 部署成功标志

当你看到这个输出时，说明部署成功：

```
========================================
部署完成！
========================================

访问地址：
  用户门户: https://sdhaohan.cn
  管理门户: https://laimiu.sdhaohan.cn
  后端API:  https://api.sdhaohan.cn
```

**恭喜！你的系统已成功部署！** 🎊

