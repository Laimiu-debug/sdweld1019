import React, { useState } from 'react'
import {
  Card,
  Form,
  Steps,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Space,
  message,
  Divider,
  Typography,
  Alert,
  Tag,
  Table,
  Modal,
} from 'antd'
import {
  UserOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { Dragger } = Upload
const { TextArea } = Input

interface WelderBasicInfo {
  name: string
  employeeId: string
  department: string
  position: string
  phone: string
  email: string
  idCard: string
  joinDate: string
  status: string
  avatar?: string
}

interface WelderSkill {
  process: string
  level: string
  experience: string
  certificateNumber?: string
  certificateExpiry?: string
}

interface WelderEducation {
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
}

interface WelderExperience {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

const WelderCreate: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<any>(null)
  const [skills, setSkills] = useState<WelderSkill[]>([])
  const [education, setEducation] = useState<WelderEducation[]>([])
  const [experience, setExperience] = useState<WelderExperience[]>([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)

  const steps = [
    {
      title: '基本信息',
      description: '填写焊工基本资料',
      icon: <UserOutlined />,
    },
    {
      title: '技能证书',
      description: '添加技能和证书信息',
      icon: <CheckCircleOutlined />,
    },
    {
      title: '教育经历',
      description: '填写教育背景',
      icon: <UserOutlined />,
    },
    {
      title: '工作经历',
      description: '填写相关工作经历',
      icon: <UserOutlined />,
    },
    {
      title: '预览提交',
      description: '确认信息并提交',
      icon: <EyeOutlined />,
    },
  ]

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!')
        return false
      }
      setAvatarFile(file)
      return false // 阻止自动上传
    },
    onRemove: () => {
      setAvatarFile(null)
    },
    fileList: avatarFile ? [avatarFile] : [],
  }

  // 添加技能
  const addSkill = () => {
    const newSkill: WelderSkill = {
      process: '',
      level: '',
      experience: '',
      certificateNumber: '',
      certificateExpiry: '',
    }
    setSkills([...skills, newSkill])
  }

  // 删除技能
  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  // 更新技能
  const updateSkill = (index: number, field: keyof WelderSkill, value: string) => {
    const newSkills = [...skills]
    newSkills[index] = { ...newSkills[index], [field]: value }
    setSkills(newSkills)
  }

  // 添加教育经历
  const addEducation = () => {
    const newEducation: WelderEducation = {
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
    }
    setEducation([...education, newEducation])
  }

  // 删除教育经历
  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  // 更新教育经历
  const updateEducation = (index: number, field: keyof WelderEducation, value: string) => {
    const newEducation = [...education]
    newEducation[index] = { ...newEducation[index], [field]: value }
    setEducation(newEducation)
  }

  // 添加工作经历
  const addExperience = () => {
    const newExperience: WelderExperience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    }
    setExperience([...experience, newExperience])
  }

  // 删除工作经历
  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index))
  }

  // 更新工作经历
  const updateExperience = (index: number, field: keyof WelderExperience, value: string) => {
    const newExperience = [...experience]
    newExperience[index] = { ...newExperience[index], [field]: value }
    setExperience(newExperience)
  }

  // 下一步
  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields()
        setCurrentStep(currentStep + 1)
      } catch (error) {
        message.error('请完善基本信息')
      }
    } else if (currentStep === 1) {
      if (skills.length === 0) {
        message.error('请至少添加一项技能')
        return
      }
      setCurrentStep(currentStep + 1)
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  // 预览
  const handlePreview = () => {
    const formData = form.getFieldsValue()
    setPreviewData({
      basic: formData,
      skills,
      education,
      experience,
      avatar: avatarFile,
    })
    setPreviewVisible(true)
  }

  // 提交
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const formData = form.getFieldsValue()
      const submitData = {
        ...formData,
        skills,
        education,
        experience,
        avatar: avatarFile,
      }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))

      message.success('焊工创建成功!')
      navigate('/welder/list')
    } catch (error) {
      message.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="基本信息" className="mb-6">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                status: 'active',
                joinDate: dayjs(),
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input placeholder="请输入姓名" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="employeeId"
                    label="工号"
                    rules={[{ required: true, message: '请输入工号' }]}
                  >
                    <Input placeholder="请输入工号" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="department"
                    label="部门"
                    rules={[{ required: true, message: '请选择部门' }]}
                  >
                    <Select placeholder="请选择部门">
                      <Option value="生产一部">生产一部</Option>
                      <Option value="生产二部">生产二部</Option>
                      <Option value="生产三部">生产三部</Option>
                      <Option value="质量部">质量部</Option>
                      <Option value="技术部">技术部</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="position"
                    label="职位"
                    rules={[{ required: true, message: '请选择职位' }]}
                  >
                    <Select placeholder="请选择职位">
                      <Option value="初级焊工">初级焊工</Option>
                      <Option value="中级焊工">中级焊工</Option>
                      <Option value="高级焊工">高级焊工</Option>
                      <Option value="技师">技师</Option>
                      <Option value="高级技师">高级技师</Option>
                      <Option value="质检焊工">质检焊工</Option>
                      <Option value="班组长">班组长</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                    ]}
                  >
                    <Input placeholder="请输入手机号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' },
                    ]}
                  >
                    <Input placeholder="请输入邮箱" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="idCard"
                    label="身份证号"
                    rules={[
                      { required: true, message: '请输入身份证号' },
                      { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入有效的身份证号' },
                    ]}
                  >
                    <Input placeholder="请输入身份证号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="joinDate"
                    label="入职日期"
                    rules={[{ required: true, message: '请选择入职日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} placeholder="请选择入职日期" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="状态"
                    rules={[{ required: true, message: '请选择状态' }]}
                  >
                    <Select placeholder="请选择状态">
                      <Option value="active">在职</Option>
                      <Option value="probation">试用</Option>
                      <Option value="suspended">停职</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="头像">
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>选择头像</Button>
                    </Upload>
                    <div className="text-xs text-gray-500 mt-1">
                      支持 JPG、PNG 格式，大小不超过 2MB
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="remark" label="备注">
                <TextArea rows={3} placeholder="请输入备注信息" />
              </Form.Item>
            </Form>
          </Card>
        )

      case 1:
        return (
          <Card title="技能证书" className="mb-6">
            <Alert
              message="技能证书信息"
              description="请添加焊工的技能专长和相关证书信息。证书到期时间将用于提醒续证。"
              type="info"
              showIcon
              className="mb-4"
            />

            <div className="space-y-4">
              {skills.map((skill, index) => (
                <Card key={index} size="small" title={`技能 ${index + 1}`}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">焊接工艺 *</label>
                        <Select
                          placeholder="请选择焊接工艺"
                          value={skill.process}
                          onChange={(value) => updateSkill(index, 'process', value)}
                          style={{ width: '100%' }}
                        >
                          <Option value="SMAW">SMAW (焊条电弧焊)</Option>
                          <Option value="GMAW">GMAW (熔化极气体保护焊)</Option>
                          <Option value="GTAW">GTAW (钨极氩弧焊)</Option>
                          <Option value="FCAW">FCAW (药芯焊丝电弧焊)</Option>
                          <Option value="SAW">SAW (埋弧焊)</Option>
                          <Option value="MMAW">MMAW (手工金属电弧焊)</Option>
                          <Option value="PAW">PAW (等离子弧焊)</Option>
                        </Select>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">技能等级 *</label>
                        <Select
                          placeholder="请选择技能等级"
                          value={skill.level}
                          onChange={(value) => updateSkill(index, 'level', value)}
                          style={{ width: '100%' }}
                        >
                          <Option value="初级">初级</Option>
                          <Option value="中级">中级</Option>
                          <Option value="高级">高级</Option>
                          <Option value="技师">技师</Option>
                          <Option value="高级技师">高级技师</Option>
                        </Select>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">工作经验</label>
                        <Input
                          placeholder="如：3年"
                          value={skill.experience}
                          onChange={(e) => updateSkill(index, 'experience', e.target.value)}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">证书编号</label>
                        <Input
                          placeholder="请输入证书编号"
                          value={skill.certificateNumber}
                          onChange={(e) => updateSkill(index, 'certificateNumber', e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">证书到期时间</label>
                        <DatePicker
                          placeholder="请选择到期时间"
                          value={skill.certificateExpiry ? dayjs(skill.certificateExpiry) : null}
                          onChange={(date) => updateSkill(index, 'certificateExpiry', date ? date.format('YYYY-MM-DD') : '')}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">操作</label>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeSkill(index)}
                        >
                          删除
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addSkill}
                block
              >
                添加技能
              </Button>
            </div>
          </Card>
        )

      case 2:
        return (
          <Card title="教育经历" className="mb-6">
            <div className="space-y-4">
              {education.map((edu, index) => (
                <Card key={index} size="small" title={`教育经历 ${index + 1}`}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">学校名称 *</label>
                        <Input
                          placeholder="请输入学校名称"
                          value={edu.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">专业 *</label>
                        <Input
                          placeholder="请输入专业"
                          value={edu.major}
                          onChange={(e) => updateEducation(index, 'major', e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">学历 *</label>
                        <Select
                          placeholder="请选择学历"
                          value={edu.degree}
                          onChange={(value) => updateEducation(index, 'degree', value)}
                          style={{ width: '100%' }}
                        >
                          <Option value="初中">初中</Option>
                          <Option value="高中">高中</Option>
                          <Option value="中专">中专</Option>
                          <Option value="大专">大专</Option>
                          <Option value="本科">本科</Option>
                          <Option value="硕士">硕士</Option>
                          <Option value="博士">博士</Option>
                        </Select>
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">开始时间 *</label>
                        <DatePicker
                          placeholder="请选择开始时间"
                          value={edu.startDate ? dayjs(edu.startDate) : null}
                          onChange={(date) => updateEducation(index, 'startDate', date ? date.format('YYYY-MM-DD') : '')}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">结束时间 *</label>
                        <DatePicker
                          placeholder="请选择结束时间"
                          value={edu.endDate ? dayjs(edu.endDate) : null}
                          onChange={(date) => updateEducation(index, 'endDate', date ? date.format('YYYY-MM-DD') : '')}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">操作</label>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeEducation(index)}
                        >
                          删除
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addEducation}
                block
              >
                添加教育经历
              </Button>
            </div>
          </Card>
        )

      case 3:
        return (
          <Card title="工作经历" className="mb-6">
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <Card key={index} size="small" title={`工作经历 ${index + 1}`}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">公司名称 *</label>
                        <Input
                          placeholder="请输入公司名称"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">职位 *</label>
                        <Input
                          placeholder="请输入职位"
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">开始时间 *</label>
                        <DatePicker
                          placeholder="请选择开始时间"
                          value={exp.startDate ? dayjs(exp.startDate) : null}
                          onChange={(date) => updateExperience(index, 'startDate', date ? date.format('YYYY-MM-DD') : '')}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">结束时间</label>
                        <DatePicker
                          placeholder="请选择结束时间（如在职请留空）"
                          value={exp.endDate ? dayjs(exp.endDate) : null}
                          onChange={(date) => updateExperience(index, 'endDate', date ? date.format('YYYY-MM-DD') : '')}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </Col>
                    <Col span={16}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">工作描述</label>
                        <TextArea
                          rows={2}
                          placeholder="请描述主要工作内容和职责"
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={24}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeExperience(index)}
                      >
                        删除
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addExperience}
                block
              >
                添加工作经历
              </Button>
            </div>
          </Card>
        )

      case 4:
        return (
          <Card title="信息预览" className="mb-6">
            <div className="text-center mb-6">
              <Title level={4}>焊工信息预览</Title>
              <Text type="secondary">请确认以下信息无误后提交</Text>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="基本信息" className="mb-4">
                  <div className="space-y-2">
                    <div><strong>姓名：</strong>{form.getFieldValue('name')}</div>
                    <div><strong>工号：</strong>{form.getFieldValue('employeeId')}</div>
                    <div><strong>部门：</strong>{form.getFieldValue('department')}</div>
                    <div><strong>职位：</strong>{form.getFieldValue('position')}</div>
                    <div><strong>手机：</strong>{form.getFieldValue('phone')}</div>
                    <div><strong>邮箱：</strong>{form.getFieldValue('email')}</div>
                    <div><strong>入职日期：</strong>{form.getFieldValue('joinDate')?.format('YYYY-MM-DD')}</div>
                    <div><strong>状态：</strong><Tag color="blue">在职</Tag></div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="技能信息" className="mb-4">
                  <div className="space-y-2">
                    {skills.map((skill, index) => (
                      <div key={index}>
                        <Tag color="green">{skill.process}</Tag>
                        <Tag color="blue">{skill.level}</Tag>
                        {skill.experience && <Text type="secondary">({skill.experience})</Text>}
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>

            {education.length > 0 && (
              <Card size="small" title="教育经历" className="mb-4">
                <Table
                  dataSource={education}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '学校', dataIndex: 'school' },
                    { title: '专业', dataIndex: 'major' },
                    { title: '学历', dataIndex: 'degree' },
                    { title: '时间', render: (_, record) => `${record.startDate} ~ ${record.endDate || '至今'}` },
                  ]}
                />
              </Card>
            )}

            {experience.length > 0 && (
              <Card size="small" title="工作经历" className="mb-4">
                <Table
                  dataSource={experience}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '公司', dataIndex: 'company' },
                    { title: '职位', dataIndex: 'position' },
                    { title: '时间', render: (_, record) => `${record.startDate} ~ ${record.endDate || '至今'}` },
                  ]}
                />
              </Card>
            )}

            <Alert
              message="请仔细核对以上信息"
              description="信息提交后如需修改请联系管理员"
              type="warning"
              showIcon
            />
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>新增焊工</Title>
      </div>

      <Steps current={currentStep} className="mb-8">
        {steps.map((step) => (
          <Steps.Step key={step.title} title={step.title} description={step.description} icon={step.icon} />
        ))}
      </Steps>

      {renderStepContent()}

      <div className="flex justify-between mt-8">
        <div>
          {currentStep > 0 && (
            <Button onClick={handlePrev}>
              上一步
            </Button>
          )}
        </div>
        <div>
          <Space>
            {currentStep < 4 && (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            )}
            {currentStep === 4 && (
              <>
                <Button onClick={handlePreview}>
                  预览
                </Button>
                <Button type="primary" loading={loading} onClick={handleSubmit}>
                  提交
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>

      {/* 预览模态框 */}
      <Modal
        title="信息预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
            确认提交
          </Button>,
        ]}
        width={800}
      >
        {previewData && (
          <div>
            {/* 预览内容 */}
            <pre>{JSON.stringify(previewData, null, 2)}</pre>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WelderCreate