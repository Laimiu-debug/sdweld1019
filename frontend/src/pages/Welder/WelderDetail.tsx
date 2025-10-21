import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Button,
  Space,
  Descriptions,
  Table,
  Tabs,
  Badge,
  Timeline,
  Statistic,
  Progress,
  Alert,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Divider,
  Typography,
  Tooltip,
  Dropdown,
} from 'antd'
import {
  UserOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  HistoryOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  TrophyOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  MoreOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

interface WelderDetail {
  id: string
  name: string
  employeeId: string
  department: string
  position: string
  phone: string
  email: string
  idCard: string
  status: string
  joinDate: string
  avatar: string
  skills: WelderSkill[]
  education: WelderEducation[]
  experience: WelderExperience[]
  certificates: WelderCertificate[]
  projects: WelderProject[]
  trainingRecords: TrainingRecord[]
  performanceRecords: PerformanceRecord[]
  totalProjects: number
  activeProjects: number
  completedProjects: number
  averageScore: number
  nextTestDate: string
  lastTestDate: string
}

interface WelderSkill {
  id: string
  process: string
  level: string
  experience: string
  certificateNumber?: string
  certificateExpiry?: string
  status: 'valid' | 'expiring' | 'expired'
}

interface WelderEducation {
  id: string
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
}

interface WelderExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  description: string
}

interface WelderCertificate {
  id: string
  certificateNumber: string
  certificateType: string
  issueDate: string
  expiryDate: string
  issuingAuthority: string
  status: 'valid' | 'expiring' | 'expired'
  weldingProcesses: string[]
  thicknessRange: string
  materialTypes: string[]
  positions: string[]
  attachmentUrl?: string
}

interface WelderProject {
  id: string
  projectName: string
  projectCode: string
  role: string
  startDate: string
  endDate?: string
  status: 'planning' | 'in_progress' | 'completed' | 'suspended'
  weldingHours: number
  qualityScore: number
  supervisor: string
}

interface TrainingRecord {
  id: string
  trainingName: string
  trainingType: string
  startDate: string
  endDate: string
  trainingHours: number
  trainer: string
  score?: number
  certificate?: string
  status: 'completed' | 'in_progress' | 'planned'
}

interface PerformanceRecord {
  id: string
  evaluationDate: string
  evaluator: string
  qualityScore: number
  efficiencyScore: number
  safetyScore: number
  teamworkScore: number
  overallScore: number
  comments: string
}

const WelderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [welder, setWelder] = useState<WelderDetail | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [certificateModalVisible, setCertificateModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (id) {
      fetchWelderDetail(id)
    }
  }, [id])

  const fetchWelderDetail = async (welderId: string) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockData: WelderDetail = {
        id: welderId,
        name: '张师傅',
        employeeId: 'WG001',
        department: '生产一部',
        position: '高级焊工',
        phone: '13800138001',
        email: 'zhang@company.com',
        idCard: '310101199001011234',
        status: 'active',
        joinDate: '2020-03-15',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
        totalProjects: 45,
        activeProjects: 3,
        completedProjects: 42,
        averageScore: 92.5,
        nextTestDate: '2024-06-15',
        lastTestDate: '2023-06-15',
        skills: [
          {
            id: '1',
            process: 'SMAW',
            level: '高级',
            experience: '8年',
            certificateNumber: 'WP2022001',
            certificateExpiry: '2025-01-15',
            status: 'valid',
          },
          {
            id: '2',
            process: 'GMAW',
            level: '高级',
            experience: '6年',
            certificateNumber: 'WP2022002',
            certificateExpiry: '2024-12-01',
            status: 'expiring',
          },
          {
            id: '3',
            process: 'GTAW',
            level: '中级',
            experience: '4年',
            certificateNumber: 'WP2022003',
            certificateExpiry: '2023-12-01',
            status: 'expired',
          },
        ],
        education: [
          {
            id: '1',
            school: '上海机械技术学院',
            major: '焊接技术与自动化',
            degree: '大专',
            startDate: '2016-09-01',
            endDate: '2019-06-30',
          },
        ],
        experience: [
          {
            id: '1',
            company: '上海焊接工程有限公司',
            position: '焊工',
            startDate: '2019-07-01',
            endDate: '2020-03-14',
            description: '负责钢结构焊接工作，参与多个大型项目',
          },
          {
            id: '2',
            company: '当前公司',
            position: '高级焊工',
            startDate: '2020-03-15',
            description: '担任高级焊工，负责重要焊接工艺执行',
          },
        ],
        certificates: [
          {
            id: '1',
            certificateNumber: 'WP2022001',
            certificateType: 'AWS D1.1',
            issueDate: '2022-01-15',
            expiryDate: '2025-01-15',
            issuingAuthority: 'AWS',
            status: 'valid',
            weldingProcesses: ['SMAW', 'GMAW'],
            thicknessRange: '3-25mm',
            materialTypes: ['碳钢', '低合金钢'],
            positions: ['F', 'H', 'V'],
          },
          {
            id: '2',
            certificateNumber: 'GT2022002',
            certificateType: 'GTAW',
            issueDate: '2022-06-01',
            expiryDate: '2024-12-01',
            issuingAuthority: 'ASME',
            status: 'expiring',
            weldingProcesses: ['GTAW'],
            thicknessRange: '2-15mm',
            materialTypes: ['不锈钢', '合金钢'],
            positions: ['F', 'H'],
          },
        ],
        projects: [
          {
            id: '1',
            projectName: '浦东机场扩建项目',
            projectCode: 'PDJ-2023-001',
            role: '主焊工',
            startDate: '2023-01-15',
            endDate: '2023-08-30',
            status: 'completed',
            weldingHours: 320,
            qualityScore: 95,
            supervisor: '李主管',
          },
          {
            id: '2',
            projectName: '虹桥交通枢纽工程',
            projectCode: 'HQJ-2023-002',
            role: '焊工组长',
            startDate: '2023-09-01',
            status: 'in_progress',
            weldingHours: 180,
            qualityScore: 92,
            supervisor: '王经理',
          },
        ],
        trainingRecords: [
          {
            id: '1',
            trainingName: '高级焊接技术培训',
            trainingType: '技能提升',
            startDate: '2023-03-01',
            endDate: '2023-03-15',
            trainingHours: 40,
            trainer: '刘教授',
            score: 95,
            certificate: '高级焊接技术证书',
            status: 'completed',
          },
        ],
        performanceRecords: [
          {
            id: '1',
            evaluationDate: '2023-12-01',
            evaluator: '质量部',
            qualityScore: 95,
            efficiencyScore: 90,
            safetyScore: 98,
            teamworkScore: 92,
            overallScore: 93.75,
            comments: '工作认真负责，焊接质量优秀',
          },
        ],
      }

      setWelder(mockData)
      form.setFieldsValue(mockData)
    } catch (error) {
      message.error('获取焊工详情失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'success',
      inactive: 'default',
      suspended: 'warning',
      expiring: 'warning',
      expired: 'error',
      valid: 'success',
      completed: 'success',
      in_progress: 'processing',
      planning: 'default',
    }
    return colorMap[status] || 'default'
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      active: '在职',
      inactive: '离职',
      suspended: '停职',
      valid: '有效',
      expiring: '即将过期',
      expired: '已过期',
      completed: '已完成',
      in_progress: '进行中',
      planning: '计划中',
    }
    return textMap[status] || status
  }

  // 编辑焊工信息
  const handleEdit = () => {
    setEditModalVisible(true)
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      setWelder({ ...welder!, ...values })
      setEditModalVisible(false)
      message.success('更新成功')
    } catch (error) {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  // 证书列定义
  const certificateColumns = [
    {
      title: '证书编号',
      dataIndex: 'certificateNumber',
      key: 'certificateNumber',
    },
    {
      title: '证书类型',
      dataIndex: 'certificateType',
      key: 'certificateType',
    },
    {
      title: '发证机关',
      dataIndex: 'issuingAuthority',
      key: 'issuingAuthority',
    },
    {
      title: '发证日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => {
        const daysUntil = dayjs(date).diff(dayjs(), 'day')
        let color = 'text-gray-600'
        if (daysUntil < 30) color = 'text-red-600 font-medium'
        else if (daysUntil < 90) color = 'text-orange-600'

        return (
          <span className={color}>
            {dayjs(date).format('YYYY-MM-DD')}
          </span>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: WelderCertificate) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Button type="link" size="small" icon={<DownloadOutlined />}>
            下载
          </Button>
        </Space>
      ),
    },
  ]

  // 项目列定义
  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '项目编号',
      dataIndex: 'projectCode',
      key: 'projectCode',
    },
    {
      title: '担任角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '焊接工时',
      dataIndex: 'weldingHours',
      key: 'weldingHours',
      render: (hours: number) => `${hours}小时`,
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      render: (score: number) => (
        <div>
          <Progress percent={score} size="small" />
          <Text type="secondary">{score}分</Text>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: WelderProject) => (
        <Button type="link" size="small">
          查看详情
        </Button>
      ),
    },
  ]

  if (!welder) {
    return <div className="p-6">加载中...</div>
  }

  return (
    <div className="p-6">
      {/* 头部信息 */}
      <div className="mb-6">
        <Row gutter={16} align="middle">
          <Col span={18}>
            <Space size="large" align="center">
              <Avatar size={80} src={welder.avatar} icon={<UserOutlined />} />
              <div>
                <Title level={2} className="mb-1">{welder.name}</Title>
                <Text type="secondary" className="text-lg">{welder.position} · {welder.employeeId}</Text>
                <div className="mt-2">
                  <Tag color={getStatusColor(welder.status)} className="text-sm">
                    {getStatusText(welder.status)}
                  </Tag>
                  <Tag color="blue" className="text-sm">{welder.department}</Tag>
                </div>
              </div>
            </Space>
          </Col>
          <Col span={6} className="text-right">
            <Space>
              <Button icon={<EditOutlined />} onClick={handleEdit}>
                编辑信息
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCertificateModalVisible(true)}>
                添加证书
              </Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'print',
                      label: '打印档案',
                      icon: <FileTextOutlined />,
                    },
                    {
                      key: 'export',
                      label: '导出数据',
                      icon: <DownloadOutlined />,
                    },
                  ],
                }}
              >
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="项目总数"
              value={welder.totalProjects}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="活跃项目"
              value={welder.activeProjects}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="平均评分"
              value={welder.averageScore}
              suffix="分"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div>
              <Text type="secondary">下次考试</Text>
              <div className="text-lg font-medium text-red-600">
                {dayjs(welder.nextTestDate).format('YYYY-MM-DD')}
              </div>
              <Text type="secondary" className="text-sm">
                {dayjs(welder.nextTestDate).diff(dayjs(), 'day')}天后
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 证书过期提醒 */}
      {welder.certificates.some(cert => cert.status === 'expiring' || cert.status === 'expired') && (
        <Alert
          message="证书提醒"
          description={
            <div>
              {welder.certificates.filter(cert => cert.status === 'expiring').length > 0 && (
                <div>• 有 {welder.certificates.filter(cert => cert.status === 'expiring').length} 个证书即将过期</div>
              )}
              {welder.certificates.filter(cert => cert.status === 'expired').length > 0 && (
                <div>• 有 {welder.certificates.filter(cert => cert.status === 'expired').length} 个证书已过期</div>
              )}
            </div>
          }
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}

      {/* 标签页内容 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: '基本信息',
              children: (
                <div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="个人信息" size="small" className="mb-4">
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="姓名">{welder.name}</Descriptions.Item>
                          <Descriptions.Item label="工号">{welder.employeeId}</Descriptions.Item>
                          <Descriptions.Item label="部门">{welder.department}</Descriptions.Item>
                          <Descriptions.Item label="职位">{welder.position}</Descriptions.Item>
                          <Descriptions.Item label="入职日期">{welder.joinDate}</Descriptions.Item>
                          <Descriptions.Item label="身份证号">{welder.idCard}</Descriptions.Item>
                          <Descriptions.Item label="状态">
                            <Tag color={getStatusColor(welder.status)}>
                              {getStatusText(welder.status)}
                            </Tag>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="联系方式" size="small" className="mb-4">
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="手机号">
                            <Space>
                              <PhoneOutlined />
                              {welder.phone}
                            </Space>
                          </Descriptions.Item>
                          <Descriptions.Item label="邮箱">
                            <Space>
                              <MailOutlined />
                              {welder.email}
                            </Space>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                  </Row>

                  <Card title="技能专长" size="small" className="mb-4">
                    <Row gutter={16}>
                      {welder.skills.map(skill => (
                        <Col span={8} key={skill.id} className="mb-4">
                          <Card size="small">
                            <div className="text-center">
                              <Title level={4}>{skill.process}</Title>
                              <Tag color="blue" className="mb-2">{skill.level}</Tag>
                              <div className="text-sm text-gray-600">{skill.experience}</div>
                              <div className="mt-2">
                                <Tag color={getStatusColor(skill.status)}>
                                  {getStatusText(skill.status)}
                                </Tag>
                              </div>
                              {skill.certificateNumber && (
                                <div className="text-xs text-gray-500 mt-1">
                                  证书编号: {skill.certificateNumber}
                                </div>
                              )}
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </div>
              )
            },
            {
              key: 'certificates',
              label: '证书管理',
              children: (
                <div>
                  <div className="mb-4">
                    <Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setCertificateModalVisible(true)}>
                        添加证书
                      </Button>
                      <Button icon={<UploadOutlined />}>
                        批量导入
                      </Button>
                      <Button icon={<DownloadOutlined />}>
                        导出证书
                      </Button>
                    </Space>
                  </div>
                  <Table
                    dataSource={welder.certificates}
                    columns={certificateColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              )
            },
            {
              key: 'projects',
              label: '项目经历',
              children: (
                <Table
                  dataSource={welder.projects}
                  columns={projectColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              )
            },
            {
              key: 'training',
              label: '培训记录',
              children: (
                <Timeline>
                  {welder.trainingRecords.map(record => (
                    <Timeline.Item
                      key={record.id}
                      color={record.status === 'completed' ? 'green' : record.status === 'in_progress' ? 'blue' : 'gray'}
                    >
                      <div>
                        <div className="font-medium">{record.trainingName}</div>
                        <div className="text-sm text-gray-600">
                          {record.startDate} ~ {record.endDate} · {record.trainingHours}小时
                        </div>
                        <div className="text-sm text-gray-600">讲师: {record.trainer}</div>
                        {record.score && (
                          <div className="text-sm">
                            <Tag color="green">评分: {record.score}分</Tag>
                          </div>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )
            },
            {
              key: 'performance',
              label: '绩效评估',
              children: (
                <div className="space-y-4">
                  {welder.performanceRecords.map(record => (
                    <Card key={record.id} size="small">
                      <Row gutter={16}>
                        <Col span={18}>
                          <Descriptions column={2} size="small">
                            <Descriptions.Item label="评估日期">{record.evaluationDate}</Descriptions.Item>
                            <Descriptions.Item label="评估人">{record.evaluator}</Descriptions.Item>
                            <Descriptions.Item label="质量评分">{record.qualityScore}分</Descriptions.Item>
                            <Descriptions.Item label="效率评分">{record.efficiencyScore}分</Descriptions.Item>
                            <Descriptions.Item label="安全评分">{record.safetyScore}分</Descriptions.Item>
                            <Descriptions.Item label="团队评分">{record.teamworkScore}分</Descriptions.Item>
                            <Descriptions.Item label="综合评分">
                              <Text strong className="text-lg">{record.overallScore}分</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="评语" span={2}>
                              {record.comments}
                            </Descriptions.Item>
                          </Descriptions>
                        </Col>
                        <Col span={6}>
                          <div className="text-center">
                            <Progress
                              type="circle"
                              percent={record.overallScore}
                              format={percent => `${percent}`}
                              strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                              }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              )
            },
            {
              key: 'experience',
              label: '工作经历',
              children: (
                <Timeline>
                  {welder.experience.map(record => (
                    <Timeline.Item key={record.id}>
                      <div>
                        <div className="font-medium">{record.company}</div>
                        <div className="text-sm text-gray-600">{record.position}</div>
                        <div className="text-sm text-gray-600">
                          {record.startDate} ~ {record.endDate || '至今'}
                        </div>
                        <div className="text-sm mt-1">{record.description}</div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )
            },
            {
              key: 'education',
              label: '教育背景',
              children: (
                <Timeline>
                  {welder.education.map(record => (
                    <Timeline.Item key={record.id}>
                      <div>
                        <div className="font-medium">{record.school}</div>
                        <div className="text-sm text-gray-600">{record.major}</div>
                        <div className="text-sm text-gray-600">
                          {record.startDate} ~ {record.endDate}
                        </div>
                        <div className="text-sm">
                          <Tag color="blue">{record.degree}</Tag>
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )
            }
          ]}
        />
      </Card>

      {/* 编辑模态框 */}
      <Modal
        title="编辑焊工信息"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" loading={loading} onClick={handleSaveEdit}>
            保存
          </Button>,
        ]}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="部门" rules={[{ required: true }]}>
                <Select>
                  <Option value="生产一部">生产一部</Option>
                  <Option value="生产二部">生产二部</Option>
                  <Option value="质量部">质量部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="职位" rules={[{ required: true }]}>
                <Select>
                  <Option value="初级焊工">初级焊工</Option>
                  <Option value="中级焊工">中级焊工</Option>
                  <Option value="高级焊工">高级焊工</Option>
                  <Option value="技师">技师</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select>
                  <Option value="active">在职</Option>
                  <Option value="inactive">离职</Option>
                  <Option value="suspended">停职</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="nextTestDate" label="下次考试日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加证书模态框 */}
      <Modal
        title="添加证书"
        open={certificateModalVisible}
        onCancel={() => setCertificateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCertificateModalVisible(false)}>
            取消
          </Button>,
          <Button key="add" type="primary">
            添加
          </Button>,
        ]}
        width={800}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="证书编号" rules={[{ required: true }]}>
                <Input placeholder="请输入证书编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="证书类型" rules={[{ required: true }]}>
                <Select placeholder="请选择证书类型">
                  <Option value="AWS D1.1">AWS D1.1</Option>
                  <Option value="ASME">ASME</Option>
                  <Option value="ISO 15614">ISO 15614</Option>
                  <Option value="GB/T 3323">GB/T 3323</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="发证机关" rules={[{ required: true }]}>
                <Input placeholder="请输入发证机关" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="到期日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} placeholder="请选择到期日期" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="证书附件">
            <Upload.Dragger>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持PDF、JPG、PNG格式，单个文件不超过10MB</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WelderDetail