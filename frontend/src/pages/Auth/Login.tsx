import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Alert,
  Checkbox,
  Row,
  Col,
  Tabs,
  message,
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MobileOutlined,
  MailOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth'

const { Title, Text } = Typography

interface LoginForm {
  account: string // 支持邮箱或手机号
  password: string
  remember: boolean
}

interface VerificationForm {
  account: string // 支持邮箱或手机号
  verificationCode: string
  remember: boolean
}

const Login: React.FC = () => {
  const [passwordForm] = Form.useForm()
  const [verificationForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [error, setError] = useState<string>('')
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  // 判断输入的是邮箱还是手机号
  const detectAccountType = (account: string) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)
    const isPhone = /^1[3-9]\d{9}$/.test(account)
    return { isEmail, isPhone }
  }

  // 密码登录
  const handlePasswordLogin = async (values: LoginForm) => {
    console.log('🚀 开始处理登录请求')
    setLoading(true)
    setError('')

    try {
      // 使用 authStore 的 login 方法
      console.log('📞 调用 authStore.login')
      const success = await login(values.account, values.password)
      console.log('📊 登录结果:', success)

      if (success) {
        console.log('✅ 登录成功，准备跳转到 /dashboard')
        message.success('登录成功！')

        // 使用 setTimeout 确保状态更新完成后再跳转
        setTimeout(() => {
          console.log('🔄 执行页面跳转')
          navigate('/dashboard', { replace: true })
        }, 100)
      } else {
        console.error('❌ 登录失败')
        setError('账号或密码错误，请重新输入')
      }
    } catch (err) {
      console.error('❌ 登录异常:', err)
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 发送验证码
  const sendVerificationCode = async (account: string) => {
    if (!account) {
      message.error('请输入邮箱或手机号')
      return
    }

    const { isEmail, isPhone } = detectAccountType(account)

    if (!isEmail && !isPhone) {
      message.error('请输入有效的邮箱地址或手机号')
      return
    }

    setSendingCode(true)
    try {
      // 这里需要调用发送验证码的API
      const response = await fetch('/api/v1/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: account,
          account_type: isEmail ? 'email' : 'phone'
        })
      })

      if (response.ok) {
        message.success(isEmail ? '验证码已发送到邮箱' : '验证码已发送到手机')

        // 开始倒计时
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        const errorData = await response.json()
        message.error(errorData.detail || '发送验证码失败')
      }
    } catch (error) {
      message.error('网络错误，请稍后重试')
    } finally {
      setSendingCode(false)
    }
  }

  // 验证码登录
  const handleVerificationLogin = async (values: VerificationForm) => {
    console.log('🚀 开始处理验证码登录请求')
    setLoading(true)
    setError('')

    try {
      const { isEmail, isPhone } = detectAccountType(values.account)

      if (!isEmail && !isPhone) {
        setError('请输入有效的邮箱地址或手机号')
        setLoading(false)
        return
      }

      // 使用 authService 的验证码登录方法
      console.log('📞 调用 authService.loginWithVerificationCode')
      const success = await authService.loginWithVerificationCode({
        account: values.account,
        verification_code: values.verificationCode,
        account_type: isEmail ? 'email' : 'phone'
      })

      console.log('📊 验证码登录结果:', success)

      if (success) {
        console.log('✅ 验证码登录成功，准备跳转到 /dashboard')
        message.success('登录成功！')

        // 使用 setTimeout 确保状态更新完成后再跳转
        setTimeout(() => {
          console.log('🔄 执行页面跳转')
          navigate('/dashboard', { replace: true })
        }, 100)
      } else {
        console.error('❌ 验证码登录失败')
        setError('验证码错误或已过期，请重新获取')
      }
    } catch (error) {
      console.error('❌ 验证码登录异常:', error)
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="text-center mb-8">
          <Title level={2} className="text-blue-600 mb-2">
            焊接工艺管理系统
          </Title>
          <Text type="secondary">专业的焊接工艺管理平台</Text>
        </div>

        <Card className="shadow-lg">
          <Title level={3} className="text-center mb-6">
            用户登录
          </Title>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              className="mb-4"
              onClose={() => setError('')}
            />
          )}

          <Tabs
            defaultActiveKey="password"
            centered
            items={[
              {
                key: 'password',
                label: (
                  <span>
                    <LockOutlined />
                    密码登录
                  </span>
                ),
                children: (
                  <Form
                    form={passwordForm}
                    name="passwordLogin"
                    initialValues={{ remember: true }}
                    onFinish={handlePasswordLogin}
                    size="large"
                    layout="vertical"
                  >
                    <Form.Item
                      name="account"
                      label="账号"
                      rules={[
                        { required: true, message: '请输入邮箱或手机号' },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve()
                            const { isEmail, isPhone } = detectAccountType(value)
                            if (!isEmail && !isPhone) {
                              return Promise.reject(new Error('请输入有效的邮箱地址或手机号'))
                            }
                            return Promise.resolve()
                          }
                        }
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="请输入邮箱地址或手机号码"
                        autoComplete="username"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      label="密码"
                      rules={[
                        { required: true, message: '请输入密码' },
                        { min: 1, message: '请输入密码' },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="请输入密码"
                        autoComplete="current-password"
                        iconRender={(visible) =>
                          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                      />
                    </Form.Item>

                    <Form.Item>
                      <div className="flex justify-between items-center">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                          <Checkbox>记住我</Checkbox>
                        </Form.Item>
                        <Link to="/forgot-password" className="text-blue-600">
                          忘记密码？
                        </Link>
                      </div>
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-12 text-base"
                      >
                        登录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'verification',
                label: (
                  <span>
                    <SafetyOutlined />
                    验证码登录
                  </span>
                ),
                children: (
                  <Form
                    form={verificationForm}
                    name="verificationLogin"
                    initialValues={{ remember: true }}
                    onFinish={handleVerificationLogin}
                    size="large"
                    layout="vertical"
                  >
                    <Form.Item
                      name="account"
                      label="账号"
                      rules={[
                        { required: true, message: '请输入邮箱或手机号' },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve()
                            const { isEmail, isPhone } = detectAccountType(value)
                            if (!isEmail && !isPhone) {
                              return Promise.reject(new Error('请输入有效的邮箱地址或手机号'))
                            }
                            return Promise.resolve()
                          }
                        }
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="请输入邮箱地址或手机号码"
                        autoComplete="username"
                      />
                    </Form.Item>

                    <Form.Item
                      name="verificationCode"
                      label="验证码"
                      rules={[
                        { required: true, message: '请输入验证码' },
                        { len: 6, message: '验证码为6位数字' },
                        { pattern: /^\d{6}$/, message: '验证码必须为6位数字' }
                      ]}
                    >
                      <Input.Search
                        placeholder="请输入6位验证码"
                        enterButton={
                          <Button
                            type="primary"
                            loading={sendingCode}
                            disabled={countdown > 0}
                            onClick={() => {
                              const account = verificationForm.getFieldValue('account')
                              sendVerificationCode(account)
                            }}
                          >
                            {countdown > 0 ? `${countdown}s` : '发送验证码'}
                          </Button>
                        }
                        autoComplete="one-time-code"
                      />
                    </Form.Item>

                    <Form.Item>
                      <div className="flex justify-between items-center">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                          <Checkbox>记住我</Checkbox>
                        </Form.Item>
                        <Text type="secondary" className="text-sm">
                          验证码有效期为10分钟
                        </Text>
                      </div>
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-12 text-base"
                      >
                        登录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />


          <div className="text-center">
            <Space direction="vertical" size="small">
              <Text type="secondary">还没有账号？</Text>
              <Link to="/register" className="text-blue-600 font-medium">
                立即注册
              </Link>
            </Space>
          </div>

          <Divider />

          {/* 法律政策链接 */}
          <div className="text-center">
            <Space split={<Divider type="vertical" />} size="small">
              <Link to="/privacy-policy" style={{ fontSize: '12px', color: '#8c8c8c' }}>
                隐私政策
              </Link>
              <Link to="/terms-of-service" style={{ fontSize: '12px', color: '#8c8c8c' }}>
                用户协议
              </Link>
            </Space>
          </div>
        </Card>
        </div>
    </div>
  )
}

export default Login