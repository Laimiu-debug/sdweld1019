# 🔧 修复 SSH 连接问题

## ❌ 错误信息

```
WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!
Host key verification failed.
```

## 📝 原因

这是因为服务器的 SSH 密钥发生了变化（可能是重装了系统），但你的电脑上还保存着旧的密钥信息。

## ✅ 解决方法

### 方式一：删除旧的主机密钥（推荐）

在 PowerShell 中执行以下命令：

```powershell
ssh-keygen -R 43.142.188.252
```

然后重新连接：

```powershell
ssh root@43.142.188.252
```

第一次连接会提示：
```
Are you sure you want to continue connecting (yes/no)?
```

输入: `yes`

---

### 方式二：手动删除 known_hosts 文件中的记录

1. 打开文件：
   ```
   C:\Users\25647\.ssh\known_hosts
   ```

2. 找到第 6 行（包含 `43.142.188.252` 的行）

3. 删除这一行

4. 保存文件

5. 重新连接：
   ```powershell
   ssh root@43.142.188.252
   ```

---

### 方式三：直接删除整个 known_hosts 文件

⚠️ 这会删除所有已保存的主机密钥

```powershell
Remove-Item C:\Users\25647\.ssh\known_hosts
```

然后重新连接：
```powershell
ssh root@43.142.188.252
```

---

## 🚀 修复后继续上传

修复 SSH 连接后，重新运行上传脚本：

```powershell
.\upload_to_server.bat
```

或者直接在 PowerShell 中执行：

```powershell
# 1. 修复 SSH
ssh-keygen -R 43.142.188.252

# 2. 测试连接
ssh root@43.142.188.252
# 输入 yes，然后输入密码，测试成功后输入 exit 退出

# 3. 上传代码
scp -r . root@43.142.188.252:/root/welding-system/
```

---

## 📝 完整操作步骤

### 在 PowerShell 中依次执行：

```powershell
# 步骤 1: 删除旧的主机密钥
ssh-keygen -R 43.142.188.252

# 步骤 2: 在服务器上创建项目目录
ssh root@43.142.188.252 "mkdir -p /root/welding-system"
# 输入 yes（首次连接）
# 输入密码

# 步骤 3: 上传代码
scp -r . root@43.142.188.252:/root/welding-system/
# 输入密码

# 步骤 4: 设置执行权限
ssh root@43.142.188.252 "cd /root/welding-system && chmod +x deploy.sh create_default_admin.sh"
# 输入密码

# 步骤 5: 开始部署
ssh root@43.142.188.252 "cd /root/welding-system && ./deploy.sh"
# 输入密码
```

---

## ✅ 验证修复成功

执行以下命令测试连接：

```powershell
ssh root@43.142.188.252 "echo 'SSH 连接成功！'"
```

如果看到 `SSH 连接成功！`，说明问题已解决。

---

## 🎯 快速修复命令

复制以下命令到 PowerShell，一次性执行：

```powershell
# 修复 SSH 密钥
ssh-keygen -R 43.142.188.252

# 测试连接
Write-Host "正在测试 SSH 连接..." -ForegroundColor Cyan
ssh root@43.142.188.252 "echo 'SSH 连接成功！'"

Write-Host "SSH 已修复，现在可以运行上传脚本了！" -ForegroundColor Green
```

