# 🚀 使用Git部署到云服务器（普通用户目录）

## 📋 服务器信息

- **服务器IP**: 43.142.188.252
- **操作系统**: Ubuntu 22.04
- **部署目录**: `/home/ubuntu/sdweld`（普通用户目录，非root）
- **部署用户**: ubuntu

---

## 🎯 完整部署步骤

### 第一步：推送代码到Git仓库

#### 1. 初始化Git仓库（如果还没有）

```powershell
# 在本地项目目录执行
git init
git add .
git commit -m "Initial commit"
```

#### 2. 推送到GitHub/Gitee

**使用GitHub**:
```powershell
# 创建GitHub仓库后
git remote add origin https://github.com/你的用户名/sdweld-system.git
git branch -M main
git push -u origin main
```

**使用Gitee（国内速度更快）**:
```powershell
# 创建Gitee仓库后
git remote add origin https://gitee.com/你的用户名/sdweld-system.git
git branch -M main
git push -u origin main
```

---

### 第二步：在服务器上配置环境

#### 1. SSH登录服务器

```powershell
# 保存SSH密钥
$sshKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDcOr08lnUObi+djGnoalQpZ+6MgRuhH9BXB2k4g/sAOYeqs/y4xzcmDsdqF3Www8f0OwEmaII39kLTh0iucu4GS0G8aSKqD9gw4cQ9msH2cWk9EKH9jQyiASUOh/uZy7mhg145WAP+fUQ9HMU4D1oavdUnGCr5xyVyc9cgFjKcQizXTVPqR0KqdF7r8D2q9vV+25CCwWtwOtY8gAGLafsPT/BTs8Av9PbCIU7iCuad6kq/N0/n/g5q5+eohumpIaD/6OaT4NhWo4+ClC4iKEVqvykTiV6XuJUL+8KahJD/0+tTfw2UhQzIwEE7JVU+x776Fb8YKvapjZOFzZWxIaTf skey-o3j71l2x"
$sshKey | Out-File -FilePath "server-key.pem" -Encoding ASCII -NoNewline

# SSH登录
ssh -i server-key.pem root@43.142.188.252
```

#### 2. 创建ubuntu用户并配置权限

```bash
# 在服务器上执行（以root身份）

# 检查ubuntu用户是否存在
if ! id ubuntu &>/dev/null; then
    # 创建ubuntu用户
    useradd -m -s /bin/bash ubuntu
    echo "ubuntu用户已创建"
else
    echo "ubuntu用户已存在"
fi

# 安装Docker（如果未安装）
if ! command -v docker &>/dev/null; then
    echo "安装Docker..."
    curl -fsSL https://get.docker.com | sh
fi

# 将ubuntu用户添加到docker组
usermod -aG docker ubuntu

# 给ubuntu用户sudo权限（可选，方便管理）
usermod -aG sudo ubuntu

# 验证
id ubuntu
groups ubuntu

echo "ubuntu用户配置完成"
```

#### 3. 切换到ubuntu用户

```bash
# 切换到ubuntu用户
su - ubuntu

# 验证当前用户
whoami
# 应该显示: ubuntu

# 验证docker权限
docker ps
# 如果提示权限错误，退出重新登录即可
```

---

### 第三步：克隆代码

```bash
# 以ubuntu用户身份执行

# 进入home目录
cd /home/ubuntu

# 克隆代码
git clone https://github.com/你的用户名/sdweld-system.git sdweld

# 如果是Gitee
# git clone https://gitee.com/你的用户名/sdweld-system.git sdweld

# 进入项目目录
cd sdweld

# 查看文件
ls -la
```

**如果是私有仓库**，需要输入用户名和密码/Token：
- GitHub: 使用Personal Access Token（不是密码）
- Gitee: 可以使用密码或私人令牌

---

### 第四步：配置环境变量

```bash
# 在 /home/ubuntu/sdweld 目录

# 编辑生产环境配置
nano backend/.env.production
```

**必须修改的配置**：

找到这一行：
```env
SMTP_PASSWORD=你的QQ邮箱授权码
```

替换为你的真实QQ邮箱授权码（16位字符）。

**保存并退出**：
- 按 `Ctrl+X`
- 按 `Y`
- 按 `Enter`

---

### 第五步：安装Docker Compose（如果未安装）

```bash
# 检查是否已安装
docker-compose --version

# 如果未安装，执行：
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

---

### 第六步：执行部署

```bash
# 在 /home/ubuntu/sdweld 目录

# 给脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

部署过程大约需要 **10-15分钟**，会自动完成：
- ✅ 检查系统环境
- ✅ 构建Docker镜像
- ✅ 启动所有服务（PostgreSQL、Redis、Backend、Frontend、Admin、Nginx）
- ✅ 初始化数据库
- ✅ 申请SSL证书（可选）

---

## 🔄 后续更新代码

### 方式一：在本地更新并推送

```powershell
# 在本地修改代码后

# 提交并推送
git add .
git commit -m "更新说明"
git push
```

然后在服务器上拉取：

```bash
# SSH登录服务器
ssh -i server-key.pem root@43.142.188.252

# 切换到ubuntu用户
su - ubuntu

# 进入项目目录
cd /home/ubuntu/sdweld

# 拉取最新代码
git pull

# 重新部署
./deploy.sh --rebuild
```

### 方式二：使用自动化脚本

创建文件 `更新服务器.ps1`：

```powershell
# 更新服务器代码

Write-Host "开始更新服务器..." -ForegroundColor Green

# 1. 推送代码
Write-Host "[1/3] 推送代码到Git..." -ForegroundColor Blue
git add .
git commit -m "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push

# 2. 在服务器上拉取
Write-Host "[2/3] 拉取最新代码..." -ForegroundColor Blue
ssh -i server-key.pem root@43.142.188.252 "su - ubuntu -c 'cd /home/ubuntu/sdweld && git pull'"

# 3. 重新部署
Write-Host "[3/3] 重新部署..." -ForegroundColor Blue
ssh -i server-key.pem root@43.142.188.252 "su - ubuntu -c 'cd /home/ubuntu/sdweld && ./deploy.sh --rebuild'"

Write-Host "更新完成！" -ForegroundColor Green
```

使用：
```powershell
.\更新服务器.ps1
```

---

## 🛠️ 常用管理命令

### 从本地连接服务器

```powershell
# 方式一：先登录root，再切换ubuntu
ssh -i server-key.pem root@43.142.188.252
su - ubuntu
cd /home/ubuntu/sdweld

# 方式二：直接执行命令
ssh -i server-key.pem root@43.142.188.252 "su - ubuntu -c 'cd /home/ubuntu/sdweld && docker-compose ps'"
```

### 查看服务状态

```bash
cd /home/ubuntu/sdweld
docker-compose ps
```

### 查看日志

```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启单个服务
docker-compose restart backend
```

### 停止/启动服务

```bash
# 停止
docker-compose down

# 启动
docker-compose up -d
```

---

## 📋 目录结构

```
/home/ubuntu/
└── sdweld/                    # 项目根目录
    ├── backend/               # 后端代码
    │   ├── app/
    │   ├── .env.production    # 生产环境配置
    │   └── Dockerfile
    ├── frontend/              # 前端代码
    ├── admin-portal/          # 管理门户
    ├── docker-compose.yml     # Docker编排
    ├── deploy.sh              # 部署脚本
    └── nginx/                 # Nginx配置
```

---

## ❓ 常见问题

### 1. Git克隆失败

**问题**: `Permission denied` 或 `Authentication failed`

**解决方案**:
- 检查仓库地址是否正确
- 如果是私有仓库：
  - GitHub: 使用Personal Access Token（设置 → Developer settings → Personal access tokens）
  - Gitee: 使用密码或私人令牌

### 2. Docker权限问题

**问题**: `permission denied while trying to connect to the Docker daemon`

**解决方案**:
```bash
# 确保ubuntu用户在docker组
sudo usermod -aG docker ubuntu

# 退出并重新登录
exit
su - ubuntu

# 验证
docker ps
```

### 3. 端口被占用

**问题**: `port is already allocated`

**解决方案**:
```bash
# 查看端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# 停止占用端口的服务
sudo systemctl stop nginx  # 如果有系统级nginx
sudo systemctl stop apache2  # 如果有apache
```

### 4. 文件权限问题

**问题**: 某些文件无法访问

**解决方案**:
```bash
# 确保ubuntu用户拥有项目目录
sudo chown -R ubuntu:ubuntu /home/ubuntu/sdweld

# 设置正确的权限
chmod -R 755 /home/ubuntu/sdweld
```

---

## 🎉 部署成功

访问以下地址验证：

- **用户门户**: https://sdhaohan.cn
- **管理门户**: https://laimiu.sdhaohan.cn
- **后端API**: https://api.sdhaohan.cn
- **API文档**: https://api.sdhaohan.cn/api/v1/docs

恭喜！你的系统已成功部署到 `/home/ubuntu/sdweld` 目录！🎊

---

## 💡 优势说明

使用普通用户目录（`/home/ubuntu`）而不是root目录的优势：

1. **更安全**: 限制了权限范围，即使应用被攻击也不会影响系统核心
2. **更规范**: 符合Linux最佳实践
3. **更易管理**: 可以为不同项目创建不同用户
4. **更易备份**: 用户目录更容易备份和迁移

