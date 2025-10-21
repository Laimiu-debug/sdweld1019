import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Select,
  DatePicker,
  Upload,
  message,
  Tooltip,
  Dropdown,
  Badge,
  Row,
  Col,
  Statistic,
  Alert,
  Divider,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  UserOutlined,
  FilterOutlined,
  MoreOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  UploadOutlined,
  StarOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

interface WelderRecord {
  id: string
  name: string
  employeeId: string
  department: string
  position: string
  phone: string
  email: string
  status: 'active' | 'inactive' | 'suspended'
  joinDate: string
  certificates: WelderCertificate[]
  skillLevels: SkillLevel[]
  trainingRecords: TrainingRecord[]
  totalProjects: number
  activeProjects: number
  lastTestDate: string
  nextTestDate: string
  avatar?: string
  skills: string[]
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
}

interface SkillLevel {
  id: string
  skillType: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  certificationDate: string
  lastAssessment: string
  nextAssessment: string
  assessor: string
  score: number
  remarks: string
}

interface TrainingRecord {
  id: string
  trainingType: string
  trainingTitle: string
  startDate: string
  endDate: string
  duration: number
  institution: string
  instructor: string
  status: 'completed' | 'in_progress' | 'planned' | 'cancelled'
  score?: number
  certificate?: string
  cost: number
  description: string
}

const WelderList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [welders, setWelders] = useState<WelderRecord[]>([])
  const [filteredData, setFilteredData] = useState<WelderRecord[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create')
  const [currentWelder, setCurrentWelder] = useState<WelderRecord | null>(null)
  const [certificatesVisible, setCertificatesVisible] = useState(false)
  const [selectedWelderForCertificates, setSelectedWelderForCertificates] = useState<WelderRecord | null>(null)
  const [skillsVisible, setSkillsVisible] = useState(false)
  const [trainingVisible, setTrainingVisible] = useState(false)
  const [selectedWelderForSkills, setSelectedWelderForSkills] = useState<WelderRecord | null>(null)
  const [selectedWelderForTraining, setSelectedWelderForTraining] = useState<WelderRecord | null>(null)
  const [form] = Form.useForm()

  // 模拟数据
  useEffect(() => {
    generateMockData()
  }, [])

  const generateMockData = () => {
    const mockData: WelderRecord[] = [
      {
        id: '1',
        name: '张师傅',
        employeeId: 'WG001',
        department: '生产一部',
        position: '高级焊工',
        phone: '13800138001',
        email: 'zhang@company.com',
        status: 'active',
        joinDate: '2020-03-15',
        certificates: [
          {
            id: 'C001',
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
            id: 'C002',
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
        skillLevels: [
          {
            id: 'SL001',
            skillType: 'SMAW',
            level: 'expert',
            certificationDate: '2022-01-15',
            lastAssessment: '2023-06-15',
            nextAssessment: '2024-06-15',
            assessor: '李考官',
            score: 95,
            remarks: '技能优秀，可胜任高难度焊接任务'
          },
          {
            id: 'SL002',
            skillType: 'GTAW',
            level: 'advanced',
            certificationDate: '2022-06-01',
            lastAssessment: '2023-09-20',
            nextAssessment: '2024-09-20',
            assessor: '王考官',
            score: 88,
            remarks: '不锈钢焊接技术娴熟'
          }
        ],
        trainingRecords: [
          {
            id: 'TR001',
            trainingType: '安全培训',
            trainingTitle: '焊接安全操作规程培训',
            startDate: '2023-08-01',
            endDate: '2023-08-03',
            duration: 24,
            institution: '安全生产培训中心',
            instructor: '赵老师',
            status: 'completed',
            score: 92,
            certificate: '焊接安全操作证书',
            cost: 1200,
            description: '学习焊接安全操作规范、防护措施等'
          },
          {
            id: 'TR002',
            trainingType: '技能提升',
            trainingTitle: '不锈钢焊接技术进阶培训',
            startDate: '2023-11-15',
            endDate: '2023-11-17',
            duration: 24,
            institution: '焊接技术研究院',
            instructor: '刘专家',
            status: 'completed',
            score: 96,
            certificate: '不锈钢焊接技术证书',
            cost: 2800,
            description: '深入学习不锈钢焊接工艺和技术要点'
          }
        ],
        totalProjects: 45,
        activeProjects: 3,
        lastTestDate: '2023-06-15',
        nextTestDate: '2024-06-15',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
        skills: ['SMAW', 'GMAW', 'GTAW', 'FCAW'],
      },
      {
        id: '2',
        name: '李师傅',
        employeeId: 'WG002',
        department: '生产二部',
        position: '中级焊工',
        phone: '13800138002',
        email: 'li@company.com',
        status: 'active',
        joinDate: '2021-07-20',
        certificates: [
          {
            id: 'C003',
            certificateNumber: 'WP2022003',
            certificateType: 'ISO 15614',
            issueDate: '2022-03-10',
            expiryDate: '2025-03-10',
            issuingAuthority: 'TÜV',
            status: 'valid',
            weldingProcesses: ['GMAW', 'FCAW'],
            thicknessRange: '5-30mm',
            materialTypes: ['碳钢', '不锈钢'],
            positions: ['F', 'H'],
          },
        ],
        skillLevels: [
          {
            id: 'SL003',
            skillType: 'GMAW',
            level: 'intermediate',
            certificationDate: '2022-03-10',
            lastAssessment: '2023-08-20',
            nextAssessment: '2024-08-20',
            assessor: '陈考官',
            score: 82,
            remarks: '熟练掌握GMAW焊接技术'
          }
        ],
        trainingRecords: [
          {
            id: 'TR003',
            trainingType: '技能提升',
            trainingTitle: 'FCAW焊接技术培训',
            startDate: '2023-05-10',
            endDate: '2023-05-12',
            duration: 24,
            institution: '焊接培训中心',
            instructor: '孙老师',
            status: 'completed',
            score: 85,
            certificate: 'FCAW焊接技能证书',
            cost: 1800,
            description: '系统学习FCAW焊接工艺'
          }
        ],
        totalProjects: 32,
        activeProjects: 2,
        lastTestDate: '2023-08-20',
        nextTestDate: '2024-08-20',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
        skills: ['GMAW', 'FCAW', 'MMAW'],
      },
      {
        id: '3',
        name: '王师傅',
        employeeId: 'WG003',
        department: '生产一部',
        position: '初级焊工',
        phone: '13800138003',
        email: 'wang@company.com',
        status: 'suspended',
        joinDate: '2022-11-10',
        certificates: [],
        skillLevels: [
          {
            id: 'SL004',
            skillType: 'SMAW',
            level: 'beginner',
            certificationDate: '2022-11-10',
            lastAssessment: '2023-09-10',
            nextAssessment: '2024-03-10',
            assessor: '周考官',
            score: 72,
            remarks: '基础技能待提升'
          }
        ],
        trainingRecords: [
          {
            id: 'TR004',
            trainingType: '基础培训',
            trainingTitle: '焊工入门培训',
            startDate: '2022-11-01',
            endDate: '2022-11-07',
            duration: 42,
            institution: '职业技术学校',
            instructor: '吴老师',
            status: 'completed',
            score: 78,
            certificate: '焊工操作证书',
            cost: 800,
            description: '焊工基础知识和技能培训'
          }
        ],
        totalProjects: 12,
        activeProjects: 0,
        lastTestDate: '2023-09-10',
        nextTestDate: '2024-09-10',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang',
        skills: ['SMAW'],
      },
      {
        id: '4',
        name: '刘师傅',
        employeeId: 'WG004',
        department: '质量部',
        position: '质检焊工',
        phone: '13800138004',
        email: 'liu@company.com',
        status: 'active',
        joinDate: '2019-05-15',
        certificates: [
          {
            id: 'C004',
            certificateNumber: 'RT2022004',
            certificateType: 'RT认证',
            issueDate: '2022-04-05',
            expiryDate: '2024-04-05',
            issuingAuthority: 'CNAS',
            status: 'expired',
            weldingProcesses: ['SMAW', 'GMAW'],
            thicknessRange: '3-50mm',
            materialTypes: ['碳钢', '不锈钢', '合金钢'],
            positions: ['F', 'H', 'V', 'O'],
          },
        ],
        skillLevels: [
          {
            id: 'SL005',
            skillType: 'RT检测',
            level: 'advanced',
            certificationDate: '2022-04-05',
            lastAssessment: '2023-10-15',
            nextAssessment: '2024-04-05',
            assessor: '郑考官',
            score: 90,
            remarks: '无损检测技术熟练'
          }
        ],
        trainingRecords: [
          {
            id: 'TR005',
            trainingType: '专业技能',
            trainingTitle: '无损检测技术培训',
            startDate: '2022-03-15',
            endDate: '2022-03-25',
            duration: 80,
            institution: '无损检测协会',
            instructor: '马专家',
            status: 'completed',
            score: 94,
            certificate: 'RT检测工程师证书',
            cost: 5600,
            description: '系统学习射线检测技术'
          },
          {
            id: 'TR006',
            trainingType: '资格复审',
            trainingTitle: 'RT检测资格复审培训',
            startDate: '2024-02-10',
            endDate: '2024-02-12',
            duration: 24,
            institution: '无损检测协会',
            instructor: '冯老师',
            status: 'planned',
            cost: 1200,
            description: 'RT检测资格证书复审'
          }
        ],
        totalProjects: 67,
        activeProjects: 1,
        lastTestDate: '2023-10-15',
        nextTestDate: '2024-10-15',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liu',
        skills: ['SMAW', 'GMAW', 'GTAW', 'RT检测'],
      },
    ]

    setWelders(mockData)
    setFilteredData(mockData)
  }

  // 获取统计数据
  const getWelderStats = (data: WelderRecord[] = []) => {
    const activeCount = data.filter(item => item.status === 'active').length
    const expiringCount = data.reduce((count, welder) => {
      const expiringCerts = welder.certificates.filter(cert => cert.status === 'expiring').length
      return count + expiringCerts
    }, 0)
    const expiredCount = data.reduce((count, welder) => {
      const expiredCerts = welder.certificates.filter(cert => cert.status === 'expired').length
      return count + expiredCerts
    }, 0)
    const suspendedCount = data.filter(item => item.status === 'suspended').length

    return {
      total: data.length,
      active: activeCount,
      expiring: expiringCount,
      expired: expiredCount,
      suspended: suspendedCount,
    }
  }

  const stats = getWelderStats(filteredData)

  // 搜索过滤
  const handleSearch = (value: string) => {
    const filtered = welders.filter(
      item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(value.toLowerCase()) ||
        item.department.toLowerCase().includes(value.toLowerCase()) ||
        item.phone.includes(value)
    )
    setFilteredData(filtered)
  }

  // 状态过滤
  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilteredData(welders)
    } else {
      const filtered = welders.filter(item => item.status === status)
      setFilteredData(filtered)
    }
  }

  // 查看证书
  const handleViewCertificates = (welder: WelderRecord) => {
    setSelectedWelderForCertificates(welder)
    setCertificatesVisible(true)
  }

  // 查看技能等级
  const handleViewSkills = (welder: WelderRecord) => {
    setSelectedWelderForSkills(welder)
    setSkillsVisible(true)
  }

  // 查看培训记录
  const handleViewTraining = (welder: WelderRecord) => {
    setSelectedWelderForTraining(welder)
    setTrainingVisible(true)
  }

  // 删除焊工
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个焊工吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const newWelders = welders.filter(item => item.id !== id)
        setWelders(newWelders)
        setFilteredData(newWelders)
        message.success('删除成功')
      },
    })
  }

  // 表格列定义
  const columns: ColumnsType<WelderRecord> = [
    {
      title: '焊工信息',
      key: 'welder',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar size="large" src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">{record.employeeId}</div>
            <div className="text-xs text-gray-400">{record.position}</div>
          </div>
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-gray-900">{record.phone}</div>
          <div className="text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'success', text: '在职' },
          inactive: { color: 'default', text: '离职' },
          suspended: { color: 'warning', text: '停职' },
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '证书状态',
      key: 'certificates',
      width: 150,
      render: (_, record) => {
        const validCount = record.certificates.filter(cert => cert.status === 'valid').length
        const expiringCount = record.certificates.filter(cert => cert.status === 'expiring').length
        const expiredCount = record.certificates.filter(cert => cert.status === 'expired').length

        return (
          <Space direction="vertical" size="small">
            <div className="flex items-center space-x-1">
              <Badge status="success" />
              <span className="text-xs">有效: {validCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge status="warning" />
              <span className="text-xs">即将过期: {expiringCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge status="error" />
              <span className="text-xs">已过期: {expiredCount}</span>
            </div>
          </Space>
        )
      },
    },
    {
      title: '项目统计',
      key: 'projects',
      width: 120,
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-gray-900">总计: {record.totalProjects}</div>
          <div className="text-blue-600">进行中: {record.activeProjects}</div>
        </div>
      ),
    },
    {
      title: '下次考试',
      dataIndex: 'nextTestDate',
      key: 'nextTestDate',
      width: 120,
      render: (date: string) => {
        const daysUntil = dayjs(date).diff(dayjs(), 'day')
        let color = 'text-gray-600'
        if (daysUntil < 30) color = 'text-red-600 font-medium'
        else if (daysUntil < 90) color = 'text-orange-600'

        return (
          <div className={color}>
            <div>{dayjs(date).format('YYYY-MM-DD')}</div>
            <div className="text-xs">{daysUntil > 0 ? `${daysUntil}天后` : '已过期'}</div>
          </div>
        )
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setCurrentWelder(record)
                setModalType('view')
                setIsModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="查看证书">
            <Button
              type="text"
              size="small"
              icon={<SafetyCertificateOutlined />}
              onClick={() => handleViewCertificates(record)}
            />
          </Tooltip>
          <Tooltip title="技能等级">
            <Button
              type="text"
              size="small"
              icon={<StarOutlined />}
              onClick={() => handleViewSkills(record)}
            />
          </Tooltip>
          <Tooltip title="培训记录">
            <Button
              type="text"
              size="small"
              icon={<BookOutlined />}
              onClick={() => handleViewTraining(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  label: '编辑信息',
                  icon: <EditOutlined />,
                  onClick: () => {
                    setCurrentWelder(record)
                    setModalType('edit')
                    setIsModalVisible(true)
                    form.setFieldsValue(record)
                  },
                },
                {
                  key: 'delete',
                  label: '删除焊工',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(record.id),
                },
              ],
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  // 证书状态统计组件
  const CertificateStats: React.FC<{ welder: WelderRecord }> = ({ welder }) => {
    const validCount = welder.certificates.filter(cert => cert.status === 'valid').length
    const expiringCount = welder.certificates.filter(cert => cert.status === 'expiring').length
    const expiredCount = welder.certificates.filter(cert => cert.status === 'expired').length

    return (
      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Statistic
            title="有效证书"
            value={validCount}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="即将过期"
            value={expiringCount}
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="已过期"
            value={expiredCount}
            valueStyle={{ color: '#f5222d' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Col>
      </Row>
    )
  }

  return (
    <div className="p-6">
      {/* 页面标题和统计 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">焊工管理</h1>

        {/* 统计卡片 */}
        <Row gutter={16} className="mb-6">
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="总焊工数"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="在职焊工"
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="即将过期证书"
                value={stats.expiring}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="已过期证书"
                value={stats.expired}
                valueStyle={{ color: '#f5222d' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="停职焊工"
                value={stats.suspended}
                valueStyle={{ color: '#8c8c8c' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="活跃项目"
                value={filteredData.reduce((sum, w) => sum + w.activeProjects, 0)}
                valueStyle={{ color: '#722ed1' }}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 预警信息 */}
        {stats.expiring > 0 && (
          <Alert
            message={`有 ${stats.expiring} 个证书即将过期，请及时安排续证！`}
            type="warning"
            showIcon
            closable
            className="mb-4"
          />
        )}
        {stats.expired > 0 && (
          <Alert
            message={`有 ${stats.expired} 个证书已过期，需要重新考试！`}
            type="error"
            showIcon
            closable
            className="mb-4"
          />
        )}
      </div>

      {/* 工具栏 */}
      <Card className="mb-4">
        <div className="flex justify-between items-center">
          <Space size="middle">
            <Search
              placeholder="搜索焊工姓名、工号、部门、手机号"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
            />
            <Select
              placeholder="状态筛选"
              style={{ width: 120 }}
              onChange={handleStatusFilter}
              defaultValue="all"
            >
              <Option value="all">全部状态</Option>
              <Option value="active">在职</Option>
              <Option value="inactive">离职</Option>
              <Option value="suspended">停职</Option>
            </Select>
          </Space>

          <Space>
            <Button icon={<ImportOutlined />}>批量导入</Button>
            <Button icon={<ExportOutlined />}>导出数据</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setModalType('create')
                setIsModalVisible(true)
                form.resetFields()
              }}
            >
              新增焊工
            </Button>
          </Space>
        </div>
      </Card>

      {/* 焊工列表表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 焊工详情/编辑模态框 */}
      <Modal
        title={modalType === 'view' ? '焊工详情' : modalType === 'edit' ? '编辑焊工' : '新增焊工'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={modalType === 'view' ? [
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            关闭
          </Button>,
        ] : [
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              form.validateFields().then(values => {
                console.log('Form values:', values)
                message.success(modalType === 'edit' ? '更新成功' : '创建成功')
                setIsModalVisible(false)
                generateMockData() // 重新生成数据以模拟保存
              })
            }}
          >
            {modalType === 'edit' ? '更新' : '创建'}
          </Button>,
        ]}
        width={800}
      >
        {currentWelder && modalType === 'view' && (
          <div>
            <div className="text-center mb-6">
              <Avatar size={80} src={currentWelder.avatar} icon={<UserOutlined />} />
              <h2 className="mt-3 text-xl font-semibold">{currentWelder.name}</h2>
              <p className="text-gray-500">{currentWelder.position} · {currentWelder.employeeId}</p>
            </div>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <span className="font-medium">部门：</span>
                  {currentWelder.department}
                </div>
                <div className="mb-4">
                  <span className="font-medium">手机号：</span>
                  {currentWelder.phone}
                </div>
                <div className="mb-4">
                  <span className="font-medium">邮箱：</span>
                  {currentWelder.email}
                </div>
                <div className="mb-4">
                  <span className="font-medium">入职日期：</span>
                  {currentWelder.joinDate}
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <span className="font-medium">状态：</span>
                  <Tag color="success">在职</Tag>
                </div>
                <div className="mb-4">
                  <span className="font-medium">项目总数：</span>
                  {currentWelder.totalProjects}
                </div>
                <div className="mb-4">
                  <span className="font-medium">活跃项目：</span>
                  {currentWelder.activeProjects}
                </div>
                <div className="mb-4">
                  <span className="font-medium">下次考试：</span>
                  {currentWelder.nextTestDate}
                </div>
              </Col>
            </Row>

            <Divider />

            <div className="mb-4">
              <span className="font-medium">技能专长：</span>
              <div className="mt-2">
                {currentWelder.skills.map(skill => (
                  <Tag key={skill} color="blue" className="mb-1">{skill}</Tag>
                ))}
              </div>
            </div>

            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => handleViewCertificates(currentWelder)}
              block
            >
              查看证书详情
            </Button>
          </div>
        )}

        {(modalType === 'create' || modalType === 'edit') && (
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
                  rules={[{ required: true, message: '请输入焊工姓名' }]}
                >
                  <Input placeholder="请输入焊工姓名" />
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
                  name="joinDate"
                  label="入职日期"
                  rules={[{ required: true, message: '请选择入职日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="请选择入职日期" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nextTestDate"
                  label="下次考试日期"
                  rules={[{ required: true, message: '请选择下次考试日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="请选择下次考试日期" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="skills"
              label="技能专长"
            >
              <Select
                mode="multiple"
                placeholder="请选择技能专长"
                options={[
                  { label: 'SMAW (焊条电弧焊)', value: 'SMAW' },
                  { label: 'GMAW (熔化极气体保护焊)', value: 'GMAW' },
                  { label: 'GTAW (钨极氩弧焊)', value: 'GTAW' },
                  { label: 'FCAW (药芯焊丝电弧焊)', value: 'FCAW' },
                  { label: 'SAW (埋弧焊)', value: 'SAW' },
                  { label: 'MMAW (手工金属电弧焊)', value: 'MMAW' },
                  { label: 'PAW (等离子弧焊)', value: 'PAW' },
                  { label: 'Resistance welding (电阻焊)', value: 'Resistance welding' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="avatar"
              label="头像"
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传头像</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 证书详情模态框 */}
      <Modal
        title={`${selectedWelderForCertificates?.name} - 证书管理`}
        open={certificatesVisible}
        onCancel={() => setCertificatesVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCertificatesVisible(false)}>
            关闭
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            添加证书
          </Button>,
        ]}
        width={1000}
      >
        {selectedWelderForCertificates && (
          <div>
            <CertificateStats welder={selectedWelderForCertificates} />

            <Table
              dataSource={selectedWelderForCertificates.certificates}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
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
                  render: (status: string) => {
                    const statusConfig = {
                      valid: { color: 'success', text: '有效' },
                      expiring: { color: 'warning', text: '即将过期' },
                      expired: { color: 'error', text: '已过期' },
                    }
                    const config = statusConfig[status as keyof typeof statusConfig]
                    return <Tag color={config.color}>{config.text}</Tag>
                  },
                },
                {
                  title: '焊接工艺',
                  dataIndex: 'weldingProcesses',
                  key: 'weldingProcesses',
                  render: (processes: string[]) => (
                    <Space wrap>
                      {processes.map(process => (
                        <Tag key={process} size="small">{process}</Tag>
                      ))}
                    </Space>
                  ),
                },
                {
                  title: '厚度范围',
                  dataIndex: 'thicknessRange',
                  key: 'thicknessRange',
                },
                {
                  title: '操作',
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small">查看</Button>
                      <Button type="link" size="small">编辑</Button>
                      <Button type="link" size="small" danger>删除</Button>
                    </Space>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* 技能等级模态框 */}
      <Modal
        title={`${selectedWelderForSkills?.name} - 技能等级`}
        open={skillsVisible}
        onCancel={() => setSkillsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSkillsVisible(false)}>
            关闭
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            添加技能等级
          </Button>,
        ]}
        width={1000}
      >
        {selectedWelderForSkills && (
          <div>
            <Row gutter={16} className="mb-4">
              <Col span={6}>
                <Statistic
                  title="技能总数"
                  value={selectedWelderForSkills.skillLevels.length}
                  prefix={<TrophyOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="专家级"
                  value={selectedWelderForSkills.skillLevels.filter(sl => sl.level === 'expert').length}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="高级"
                  value={selectedWelderForSkills.skillLevels.filter(sl => sl.level === 'advanced').length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均评分"
                  value={Math.round(
                    selectedWelderForSkills.skillLevels.reduce((sum, sl) => sum + sl.score, 0) /
                    selectedWelderForSkills.skillLevels.length || 0
                  )}
                  suffix="/ 100"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>

            <Table
              dataSource={selectedWelderForSkills.skillLevels}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: '技能类型',
                  dataIndex: 'skillType',
                  key: 'skillType',
                  render: (text) => <Tag color="blue">{text}</Tag>,
                },
                {
                  title: '技能等级',
                  dataIndex: 'level',
                  key: 'level',
                  render: (level) => {
                    const levelConfig = {
                      beginner: { color: 'default', text: '初级' },
                      intermediate: { color: 'processing', text: '中级' },
                      advanced: { color: 'success', text: '高级' },
                      expert: { color: 'error', text: '专家' },
                    }
                    const config = levelConfig[level]
                    return <Tag color={config.color}>{config.text}</Tag>
                  },
                },
                {
                  title: '认证日期',
                  dataIndex: 'certificationDate',
                  key: 'certificationDate',
                  render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
                },
                {
                  title: '上次评估',
                  dataIndex: 'lastAssessment',
                  key: 'lastAssessment',
                  render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
                },
                {
                  title: '下次评估',
                  dataIndex: 'nextAssessment',
                  key: 'nextAssessment',
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
                  title: '评分',
                  dataIndex: 'score',
                  key: 'score',
                  render: (score: number) => (
                    <div>
                      <Text strong>{score}</Text>
                      <Text type="secondary">/100</Text>
                    </div>
                  ),
                },
                {
                  title: '评估人',
                  dataIndex: 'assessor',
                  key: 'assessor',
                },
                {
                  title: '备注',
                  dataIndex: 'remarks',
                  key: 'remarks',
                  ellipsis: true,
                },
                {
                  title: '操作',
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small">查看</Button>
                      <Button type="link" size="small">编辑</Button>
                      <Button type="link" size="small" danger>删除</Button>
                    </Space>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* 培训记录模态框 */}
      <Modal
        title={`${selectedWelderForTraining?.name} - 培训记录`}
        open={trainingVisible}
        onCancel={() => setTrainingVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTrainingVisible(false)}>
            关闭
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            添加培训记录
          </Button>,
        ]}
        width={1200}
      >
        {selectedWelderForTraining && (
          <div>
            <Row gutter={16} className="mb-4">
              <Col span={6}>
                <Statistic
                  title="培训总数"
                  value={selectedWelderForTraining.trainingRecords.length}
                  prefix={<BookOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已完成"
                  value={selectedWelderForTraining.trainingRecords.filter(tr => tr.status === 'completed').length}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="计划中"
                  value={selectedWelderForTraining.trainingRecords.filter(tr => tr.status === 'planned').length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="总费用"
                  value={selectedWelderForTraining.trainingRecords.reduce((sum, tr) => sum + tr.cost, 0)}
                  prefix="¥"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>

            <Table
              dataSource={selectedWelderForTraining.trainingRecords}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: '培训类型',
                  dataIndex: 'trainingType',
                  key: 'trainingType',
                  render: (text) => <Tag color="blue">{text}</Tag>,
                },
                {
                  title: '培训标题',
                  dataIndex: 'trainingTitle',
                  key: 'trainingTitle',
                  ellipsis: true,
                },
                {
                  title: '培训机构',
                  dataIndex: 'institution',
                  key: 'institution',
                },
                {
                  title: '讲师',
                  dataIndex: 'instructor',
                  key: 'instructor',
                },
                {
                  title: '培训时间',
                  key: 'period',
                  render: (_, record) => (
                    <div>
                      <div>{dayjs(record.startDate).format('YYYY-MM-DD')}</div>
                      <div className="text-xs text-gray-500">至 {dayjs(record.endDate).format('YYYY-MM-DD')}</div>
                    </div>
                  ),
                },
                {
                  title: '时长',
                  dataIndex: 'duration',
                  key: 'duration',
                  render: (duration: number) => `${duration}小时`,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    const statusConfig = {
                      completed: { color: 'success', text: '已完成' },
                      in_progress: { color: 'processing', text: '进行中' },
                      planned: { color: 'default', text: '计划中' },
                      cancelled: { color: 'error', text: '已取消' },
                    }
                    const config = statusConfig[status]
                    return <Tag color={config.color}>{config.text}</Tag>
                  },
                },
                {
                  title: '成绩',
                  dataIndex: 'score',
                  key: 'score',
                  render: (score?: number) => (
                    score ? (
                      <div>
                        <Text strong>{score}</Text>
                        <Text type="secondary">/100</Text>
                      </div>
                    ) : <Text type="secondary">-</Text>
                  ),
                },
                {
                  title: '证书',
                  dataIndex: 'certificate',
                  key: 'certificate',
                  render: (certificate?: string) => certificate ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>{certificate}</Tag>
                  ) : <Text type="secondary">-</Text>,
                },
                {
                  title: '费用',
                  dataIndex: 'cost',
                  key: 'cost',
                  render: (cost: number) => `¥${cost.toLocaleString()}`,
                },
                {
                  title: '操作',
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small">查看</Button>
                      <Button type="link" size="small">编辑</Button>
                      <Button type="link" size="small" danger>删除</Button>
                    </Space>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WelderList