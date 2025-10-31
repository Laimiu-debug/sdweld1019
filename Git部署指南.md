# 🚀 使用 Git 部署到服务器

## ✅ 代码已推送到 GitHub

你的代码已成功推送到：
- 仓库: https://github.com/Laimiu-debug/sdweld1019.git
- 分支: main

---

## 📋 部署步骤（3步）

### 步骤 1: 在服务器上克隆代码

在 PowerShell 中执行：

```powershell
ssh root@43.142.188.252
```

登录服务器后，执行：

```bash
# 进入 root 目录
cd /root

# 克隆代码
git clone https://github.com/Laimiu-debug/sdweld1019.git welding-system

# 进入项目目录
cd welding-system

# 查看文件
ls -la

# 设置脚本执行权限
chmod +x deploy.sh create_default_admin.sh
```

---

### 步骤 2: 上传敏感配置文件

**退出服务器**（输入 `exit`），回到本地 PowerShell。

然后执行：

```powershell
.\上传敏感配置.ps1
```

这会上传以下文件：
- `backend/.env.production` - 包含数据库密码、QQ邮箱授权码等
- `frontend/.env.production` - 前端API地址
- `admin-portal/.env.production` - 管理门户API地址

---

### 步骤 3: 开始部署

重新登录服务器：

```powershell
ssh root@43.142.188.252
```

在服务器上执行：

```bash
cd /root/welding-system
./deploy.sh
```

按提示操作即可！

---

## 🎯 完整命令（复制粘贴）

### 在本地 PowerShell 执行：

```powershell
# 1. 登录服务器
ssh root@43.142.188.252
```

### 在服务器上执行：

```bash
# 2. 克隆代码
cd /root
git clone https://github.com/Laimiu-debug/sdweld1019.git welding-system
cd welding-system
chmod +x deploy.sh create_default_admin.sh

# 3. 退出服务器
exit
```

### 回到本地 PowerShell：

```powershell
# 4. 上传敏感配置
.\上传敏感配置.ps1
```

### 再次登录服务器：

```powershell
# 5. 登录服务器
ssh root@43.142.188.252
```

### 在服务器上部署：

```bash
# 6. 部署
cd /root/welding-system
./deploy.sh
```

---

## ⏱️ 预计时间

- 克隆代码: 1-2 分钟
- 上传配置: 30 秒
- 部署系统: 10-15 分钟
- **总计: 12-18 分钟**

---

## 📝 部署过程中的交互

部署脚本会询问以下问题：

### 1. QQ 邮箱授权码
```
是否已配置 QQ 邮箱授权码？(y/n):
```
输入: `y`

### 2. 创建管理员账号
```
是否创建管理员账号？(y/n):
```
输入: `y`

```
请输入管理员邮箱:
```
输入: `Laimiu.new@gmail.com`

```
请输入管理员密码:
```
输入: `ghzzz123`

### 3. 申请 SSL 证书
```
是否申请 SSL 证书？(y/n):
```
输入: `y`

---

## ✅ 部署完成后

访问以下地址：

### 用户门户
https://sdhaohan.cn

### 管理门户
https://laimiu.sdhaohan.cn

**登录信息**:
- 邮箱: `Laimiu.new@gmail.com`
- 密码: `ghzzz123`

### API 文档
https://api.sdhaohan.cn/api/v1/docs

---

## 🔄 后续更新代码

如果以后需要更新代码：

### 在本地：

```powershell
# 提交更改
git add .
git commit -m "更新说明"
git push origin main
```

### 在服务器上：

```bash
# SSH 登录
ssh root@43.142.188.252

# 进入项目目录
cd /root/welding-system

# 拉取最新代码
git pull origin main

# 重启服务
docker-compose down
docker-compose up -d --build
```

---

## ❓ 常见问题

### Q1: 克隆代码时提示权限错误

**原因**: 仓库是私有的

**解决**: 
1. 将仓库设置为公开（GitHub 仓库设置）
2. 或者在服务器上配置 GitHub SSH 密钥

### Q2: 上传配置文件失败

**原因**: 项目目录不存在

**解决**: 确保先在服务器上克隆了代码

### Q3: 部署脚本无法执行

**原因**: 没有执行权限

**解决**:
```bash
chmod +x deploy.sh create_default_admin.sh
```

---

## 🎊 现在开始

### 第一步：登录服务器

```powershell
ssh root@43.142.188.252
```

### 第二步：克隆代码

```bash
cd /root
git clone https://github.com/Laimiu-debug/sdweld1019.git welding-system
cd welding-system
chmod +x deploy.sh create_default_admin.sh
exit
```

### 第三步：上传配置

```powershell
.\上传敏感配置.ps1
```

### 第四步：部署

```powershell
ssh root@43.142.188.252
cd /root/welding-system
./deploy.sh
```

---

**开始吧！** 🚀

