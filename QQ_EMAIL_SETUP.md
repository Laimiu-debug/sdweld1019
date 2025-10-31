# QQ 邮箱 SMTP 授权码获取指南

## 📧 为什么需要 QQ 邮箱授权码？

系统需要发送以下邮件：
- ✉️ 用户注册验证码
- ✉️ 找回密码验证码
- ✉️ 邮箱验证链接
- ✉️ 系统通知邮件

QQ 邮箱的 SMTP 服务需要使用**授权码**而不是 QQ 密码，这是为了保护你的账号安全。

---

## 🔑 获取授权码步骤

### 步骤 1: 登录 QQ 邮箱

访问：https://mail.qq.com  
使用你的 QQ 号登录（2564786659@qq.com）

### 步骤 2: 进入设置

1. 点击页面右上角的 **设置** 图标（齿轮图标）
2. 选择 **账户**

### 步骤 3: 开启 SMTP 服务

1. 向下滚动找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
2. 找到以下任一服务并开启：
   - **POP3/SMTP服务**（推荐）
   - **IMAP/SMTP服务**

### 步骤 4: 生成授权码

1. 点击 **生成授权码** 按钮
2. 系统会要求你发送短信验证
3. 使用绑定的手机号发送指定内容到指定号码
4. 发送成功后，页面会显示一个 **16位授权码**

**授权码示例**：
```
abcdefghijklmnop
```

⚠️ **重要提示**：
- 授权码只显示一次，请立即复制保存
- 如果忘记授权码，需要重新生成
- 一个 QQ 邮箱可以生成多个授权码

### 步骤 5: 配置到系统

将授权码填入 `backend/.env.production` 文件：

```bash
# 编辑配置文件
vim backend/.env.production

# 找到以下行并修改
SMTP_PASSWORD=你的16位授权码
```

**完整配置示例**：
```bash
# QQ邮箱 SMTP 配置
SMTP_SERVER=smtp.qq.com
SMTP_PORT=587
SMTP_USER=2564786659@qq.com
SMTP_PASSWORD=abcdefghijklmnop  # 替换为你的授权码
EMAILS_FROM_EMAIL=2564786659@qq.com
EMAILS_FROM_NAME=焊接工艺管理系统
```

### 步骤 6: 重启服务

```bash
# 重启后端服务使配置生效
docker-compose restart backend
```

---

## ✅ 测试邮件发送

### 方法 1: 通过 API 文档测试

1. 访问：https://api.sdhaohan.cn/api/v1/docs
2. 找到 **POST /api/v1/auth/register** 接口
3. 输入测试邮箱地址
4. 点击 **Execute**
5. 检查邮箱是否收到验证码

### 方法 2: 通过前端页面测试

1. 访问：https://sdhaohan.cn
2. 点击 **注册**
3. 输入邮箱地址
4. 点击 **发送验证码**
5. 检查邮箱是否收到验证码

### 方法 3: 查看日志

```bash
# 查看后端日志
docker-compose logs -f backend

# 如果邮件发送成功，会看到类似日志：
# [INFO] Email sent to xxx@example.com
```

---

## ❓ 常见问题

### 1. 找不到"生成授权码"按钮

**原因**：未开启 SMTP 服务

**解决方法**：
1. 先开启 **POP3/SMTP服务** 或 **IMAP/SMTP服务**
2. 开启后会出现"生成授权码"按钮

### 2. 短信验证失败

**原因**：手机号未绑定或发送内容错误

**解决方法**：
1. 确保 QQ 账号已绑定手机号
2. 严格按照页面提示的内容发送短信
3. 发送到正确的号码

### 3. 授权码忘记了

**解决方法**：
1. 重新生成一个新的授权码
2. 旧的授权码会自动失效
3. 更新配置文件中的授权码

### 4. 邮件发送失败

**可能原因**：
- 授权码填写错误
- SMTP 服务器地址错误
- 端口号错误
- 网络连接问题

**解决方法**：
```bash
# 1. 检查配置
cat backend/.env.production | grep SMTP

# 2. 测试 SMTP 连接
docker-compose exec backend python -c "
import smtplib
server = smtplib.SMTP('smtp.qq.com', 587)
server.starttls()
server.login('2564786659@qq.com', '你的授权码')
print('连接成功！')
server.quit()
"

# 3. 查看详细日志
docker-compose logs backend | grep -i email
```

---

## 🔄 其他邮箱选择

如果不想使用 QQ 邮箱，也可以使用：

### 163 邮箱
```bash
SMTP_SERVER=smtp.163.com
SMTP_PORT=465
SMTP_USER=your-email@163.com
SMTP_PASSWORD=your-163-auth-code
```

### Gmail（需要科学上网）
```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 阿里云邮件推送（企业推荐）
```bash
EMAIL_PROVIDER=aliyun
ALIYUN_ACCESS_KEY_ID=your-access-key
ALIYUN_ACCESS_KEY_SECRET=your-secret-key
```

---

## 📝 配置检查清单

部署前请确认：

- [ ] QQ 邮箱已开启 SMTP 服务
- [ ] 已成功生成授权码
- [ ] 授权码已正确填入 `backend/.env.production`
- [ ] SMTP 服务器地址为 `smtp.qq.com`
- [ ] SMTP 端口为 `587`
- [ ] 发件人邮箱为 `2564786659@qq.com`
- [ ] 已重启后端服务
- [ ] 已测试邮件发送功能

---

**配置完成后，你的系统就可以正常发送邮件了！** ✅

