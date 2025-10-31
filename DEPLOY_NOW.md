# 🚀 现在开始部署！

## ✅ 准备工作已完成

- ✅ 代码已推送到 GitHub
- ✅ 服务器已克隆代码
- ✅ 配置文件已上传
- ✅ 脚本权限已设置

---

## 🎯 最后一步：部署

### 在 PowerShell 中执行：

```powershell
ssh root@43.142.188.252
```

### 登录服务器后执行：

```bash
cd /root/welding-system
./deploy.sh
```

---

## 📋 部署过程中的问答

### 1. QQ 邮箱授权码
```
是否已配置 QQ 邮箱授权码？(y/n):
```
**输入**: `y`

---

### 2. 创建管理员账号
```
是否创建管理员账号？(y/n):
```
**输入**: `y`

```
请输入管理员邮箱:
```
**输入**: `Laimiu.new@gmail.com`

```
请输入管理员密码:
```
**输入**: `ghzzz123`

---

### 3. 申请 SSL 证书
```
是否申请 SSL 证书？(y/n):
```
**输入**: `y`

---

## ⏱️ 预计时间

- Docker 镜像构建: 5-10 分钟
- SSL 证书申请: 1-2 分钟
- 数据库初始化: 1 分钟
- **总计: 7-13 分钟**

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

## 🔍 检查部署状态

在服务器上执行：

```bash
# 查看所有容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f nginx
```

---

## 🎊 现在开始！

```powershell
ssh root@43.142.188.252
```

然后：

```bash
cd /root/welding-system
./deploy.sh
```

**祝部署顺利！** 🚀

