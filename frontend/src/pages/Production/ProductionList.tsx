import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  message,
  Tooltip,
  Dropdown,
  Badge,
  Row,
  Col,
  Statistic,
  Alert,
  Divider,
  Tabs,
  Descriptions,
  Progress,
  Timeline,
  Avatar,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  FilterOutlined,
  MoreOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  UserOutlined,
  ToolOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

interface ProductionTask {
  id: string
  taskNumber: string
  taskName: string
  projectName: string
  projectCode: string
  wpsId: string
  wpsName: string
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assignedWelder: string
  assignedWelderId: string
  assignedEquipment: string
  assignedEquipmentId: string
  startDate: string
  endDate: string
  actualStartDate?: string
  actualEndDate?: string
  progressPercentage: number
  estimatedHours: number
  actualHours: number
  materials: string[]
  qualityRequirements: string
  specifications: string
  location: string
  supervisor: string
  notes: string
  createdDate: string
  updatedDate: string
  createdBy: string
}

interface ProductionLog {
  id: string
  taskId: string
  action: string
  timestamp: string
  operator: string
  details: string
  previousStatus?: string
  newStatus?: string
}

const ProductionList: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<ProductionTask[]>([])
  const [filteredData, setFilteredData] = useState<ProductionTask[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'start' | 'pause' | 'complete'>('create')
  const [currentTask, setCurrentTask] = useState<ProductionTask | null>(null)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('tasks')

  // 模拟数据
  useEffect(() => {
    generateMockData()
  }, [])

  const generateMockData = () => {
    const mockData: ProductionTask[] = [
      {
        id: '1',
        taskNumber: 'TSK-2024-001',
        taskName: '压力容器筒体焊接',
        projectName: '化工厂扩建项目',
        projectCode: 'PRJ-2024-001',
        wpsId: 'WPS-001',
        wpsName: '碳钢对接焊缝WPS',
        status: 'in_progress',
        priority: 'high',
        assignedWelder: '张师傅',
        assignedWelderId: 'WELD001',
        assignedEquipment: '数字化逆变焊机',
        assignedEquipmentId: 'EQP-001',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        actualStartDate: '2024-01-15',
        progressPercentage: 65,
        estimatedHours: 40,
        actualHours: 26,
        materials: ['J422焊条', 'CO2气体', '焊丝'],
        qualityRequirements: 'RT检测，II级合格',
        specifications: '壁厚12mm，材质Q345R',
        location: 'A区-焊接工位01',
        supervisor: '李主管',
        notes: '重点监控项目，需要严格按照WPS执行',
        createdDate: '2024-01-10',
        updatedDate: '2024-01-16',
        createdBy: '生产计划员',
      },
      {
        id: '2',
        taskNumber: 'TSK-2024-002',
        taskName: '管道对接焊缝修复',
        projectName: '设备维护项目',
        projectCode: 'PRJ-2024-002',
        wpsId: 'WPS-002',
        wpsName: '不锈钢管道WPS',
        status: 'pending',
        priority: 'normal',
        assignedWelder: '李师傅',
        assignedWelderId: 'WELD002',
        assignedEquipment: 'CO2焊机',
        assignedEquipmentId: 'EQP-002',
        startDate: '2024-01-18',
        endDate: '2024-01-19',
        progressPercentage: 0,
        estimatedHours: 16,
        actualHours: 0,
        materials: ['ER308L焊丝', '氩气'],
        qualityRequirements: 'PT检测，无裂纹',
        specifications: '规格DN100，材质304不锈钢',
        location: 'B区-管道工位02',
        supervisor: '王主管',
        notes: '需要准备特殊焊材，确保保护气体充足',
        createdDate: '2024-01-14',
        updatedDate: '2024-01-16',
        createdBy: '生产计划员',
      },
      {
        id: '3',
        taskNumber: 'TSK-2024-003',
        taskName: '不锈钢储罐焊接',
        projectName: '新建储罐项目',
        projectCode: 'PRJ-2024-003',
        wpsId: 'WPS-003',
        wpsName: '储罐底板WPS',
        status: 'completed',
        priority: 'urgent',
        assignedWelder: '王师傅',
        assignedWelderId: 'WELD003',
        assignedEquipment: '点焊机',
        assignedEquipmentId: 'EQP-003',
        startDate: '2024-01-12',
        endDate: '2024-01-25',
        actualStartDate: '2024-01-12',
        actualEndDate: '2024-01-24',
        progressPercentage: 100,
        estimatedHours: 80,
        actualHours: 75,
        materials: ['E308-16焊条', '焊剂'],
        qualityRequirements: 'RT+UT检测，I级合格',
        specifications: '容量50m³，厚度8mm',
        location: 'C区-储罐工位01',
        supervisor: '张总工',
        notes: '已完成质量检验，符合设计要求',
        createdDate: '2024-01-08',
        updatedDate: '2024-01-24',
        createdBy: '生产计划员',
      },
      {
        id: '4',
        taskNumber: 'TSK-2024-004',
        taskName: '钢结构桥梁焊接',
        projectName: '市政桥梁项目',
        projectCode: 'PRJ-2024-004',
        wpsId: 'WPS-004',
        wpsName: '桥梁钢结构WPS',
        status: 'paused',
        priority: 'urgent',
        assignedWelder: '刘师傅',
        assignedWelderId: 'WELD004',
        assignedEquipment: '埋弧焊机',
        assignedEquipmentId: 'EQP-004',
        startDate: '2024-01-10',
        endDate: '2024-01-30',
        actualStartDate: '2024-01-10',
        progressPercentage: 45,
        estimatedHours: 120,
        actualHours: 54,
        materials: ['H08MnA焊丝', '焊剂HJ431'],
        qualityRequirements: 'UT检测，II级合格',
        specifications: 'Q345qDNH桥梁钢',
        location: 'D区-桥梁工位01',
        supervisor: '陈工程师',
        notes: '因天气原因暂停，待天气好转后继续',
        createdDate: '2024-01-05',
        updatedDate: '2024-01-16',
        createdBy: '生产计划员',
      },
      {
        id: '5',
        taskNumber: 'TSK-2024-005',
        taskName: '压力管道预制',
        projectName: '工厂改造项目',
        projectCode: 'PRJ-2024-005',
        wpsId: 'WPS-005',
        wpsName: '管道预制WPS',
        status: 'in_progress',
        priority: 'high',
        assignedWelder: '陈师傅',
        assignedWelderId: 'WELD005',
        assignedEquipment: '等离子切割机',
        assignedEquipmentId: 'EQP-005',
        startDate: '2024-01-16',
        endDate: '2024-01-22',
        actualStartDate: '2024-01-16',
        progressPercentage: 25,
        estimatedHours: 60,
        actualHours: 15,
        materials: ['ER70S-6焊丝', 'CO2气体'],
        qualityRequirements: 'RT检测，II级合格',
        specifications: '规格DN150-DN300',
        location: 'E区-预制工位01',
        supervisor: '赵主管',
        notes: '管道预制项目，需要严格控制尺寸公差',
        createdDate: '2024-01-15',
        updatedDate: '2024-01-17',
        createdBy: '生产计划员',
      },
    ]

    setTasks(mockData)
    setFilteredData(mockData)
  }

  // 获取统计数据
  const getTaskStats = (data: ProductionTask[] = []) => {
    const totalTasks = data.length
    const inProgressCount = data.filter(item => item.status === 'in_progress').length
    const pendingCount = data.filter(item => item.status === 'pending').length
    const completedCount = data.filter(item => item.status === 'completed').length
    const pausedCount = data.filter(item => item.status === 'paused').length
    const urgentCount = data.filter(item => item.priority === 'urgent').length
    const overdueCount = data.filter(item => {
      const isOverdue = dayjs(item.endDate).isBefore(dayjs()) && item.status !== 'completed'
      return isOverdue
    }).length

    const avgProgress = data.length > 0
      ? Math.round(data.reduce((sum, item) => sum + item.progressPercentage, 0) / data.length)
      : 0

    const totalEstimatedHours = data.reduce((sum, item) => sum + item.estimatedHours, 0)
    const totalActualHours = data.reduce((sum, item) => sum + item.actualHours, 0)

    return {
      totalTasks,
      inProgress: inProgressCount,
      pending: pendingCount,
      completed: completedCount,
      paused: pausedCount,
      urgent: urgentCount,
      overdue: overdueCount,
      avgProgress,
      totalEstimatedHours,
      totalActualHours,
      efficiency: totalEstimatedHours > 0 ? Math.round((totalActualHours / totalEstimatedHours) * 100) : 0,
    }
  }

  const stats = getTaskStats(filteredData)

  // 搜索过滤
  const handleSearch = (value: string) => {
    const filtered = tasks.filter(
      item =>
        item.taskName.toLowerCase().includes(value.toLowerCase()) ||
        item.taskNumber.toLowerCase().includes(value.toLowerCase()) ||
        item.projectName.toLowerCase().includes(value.toLowerCase()) ||
        item.projectCode.toLowerCase().includes(value.toLowerCase()) ||
        item.assignedWelder.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredData(filtered)
  }

  // 状态过滤
  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilteredData(tasks)
    } else {
      const filtered = tasks.filter(item => item.status === status)
      setFilteredData(filtered)
    }
  }

  // 优先级过滤
  const handlePriorityFilter = (priority: string) => {
    if (priority === 'all') {
      setFilteredData(tasks)
    } else {
      const filtered = tasks.filter(item => item.priority === priority)
      setFilteredData(filtered)
    }
  }

  // 查看详情
  const handleView = (record: ProductionTask) => {
    setCurrentTask(record)
    setModalType('view')
    setIsModalVisible(true)
    form.setFieldsValue(record)
  }

  // 编辑
  const handleEdit = (record: ProductionTask) => {
    setCurrentTask(record)
    setModalType('edit')
    setIsModalVisible(true)
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      actualStartDate: record.actualStartDate ? dayjs(record.actualStartDate) : null,
      actualEndDate: record.actualEndDate ? dayjs(record.actualEndDate) : null,
    })
  }

  // 开始任务
  const handleStartTask = (record: ProductionTask) => {
    setCurrentTask(record)
    setModalType('start')
    setIsModalVisible(true)
    form.resetFields()
  }

  // 暂停任务
  const handlePauseTask = (record: ProductionTask) => {
    setCurrentTask(record)
    setModalType('pause')
    setIsModalVisible(true)
    form.resetFields()
  }

  // 完成任务
  const handleCompleteTask = (record: ProductionTask) => {
    setCurrentTask(record)
    setModalType('complete')
    setIsModalVisible(true)
    form.resetFields()
  }

  // 删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个生产任务吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const newTasks = tasks.filter(item => item.id !== id)
        setTasks(newTasks)
        setFilteredData(newTasks)
        message.success('删除成功')
      },
    })
  }

  // 获取状态颜色和文本
  const getStatusConfig = (status: string) => {
    const statusMap = {
      pending: { color: 'default', text: '待开始', icon: <ClockCircleOutlined /> },
      in_progress: { color: 'processing', text: '进行中', icon: <PlayCircleOutlined /> },
      completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      paused: { color: 'warning', text: '已暂停', icon: <PauseCircleOutlined /> },
      cancelled: { color: 'error', text: '已取消', icon: <StopOutlined /> },
    }
    return statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null }
  }

  // 获取优先级颜色和文本
  const getPriorityConfig = (priority: string) => {
    const priorityMap = {
      low: { color: 'default', text: '低', icon: null },
      normal: { color: 'blue', text: '普通', icon: null },
      high: { color: 'orange', text: '高', icon: <WarningOutlined /> },
      urgent: { color: 'red', text: '紧急', icon: <FireOutlined /> },
    }
    return priorityMap[priority as keyof typeof priorityMap] || { color: 'default', text: priority, icon: null }
  }

  // 表格列定义
  const columns: ColumnsType<ProductionTask> = [
    {
      title: '任务信息',
      key: 'task',
      width: 280,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.taskName}</div>
          <div className="text-sm text-gray-500">{record.taskNumber}</div>
          <div className="text-xs text-gray-400">{record.projectCode} · {record.projectName}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = getStatusConfig(status)
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const config = getPriorityConfig(priority)
        return (
          <Tag color={config.color}>
            {config.icon} {config.text}
          </Tag>
        )
      },
    },
    {
      title: '进度',
      key: 'progress',
      width: 150,
      render: (_, record) => (
        <div>
          <Progress
            percent={record.progressPercentage}
            size="small"
            status={record.progressPercentage === 100 ? 'success' : 'normal'}
          />
          <div className="text-xs text-gray-500 mt-1">
            {record.actualHours}h / {record.estimatedHours}h
          </div>
        </div>
      ),
    },
    {
      title: '焊工/设备',
      key: 'assignment',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-sm flex items-center">
            <UserOutlined className="mr-1" />
            {record.assignedWelder}
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <ToolOutlined className="mr-1" />
            {record.assignedEquipment}
          </div>
        </div>
      ),
    },
    {
      title: '计划时间',
      key: 'schedule',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.startDate}</div>
          <div className="text-xs text-gray-500">~ {record.endDate}</div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="开始任务">
              <Button
                type="text"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartTask(record)}
              />
            </Tooltip>
          )}
          {record.status === 'in_progress' && (
            <>
              <Tooltip title="暂停任务">
                <Button
                  type="text"
                  size="small"
                  icon={<PauseCircleOutlined />}
                  onClick={() => handlePauseTask(record)}
                />
              </Tooltip>
              <Tooltip title="完成任务">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleCompleteTask(record)}
                />
              </Tooltip>
            </>
          )}
          {record.status === 'paused' && (
            <Tooltip title="继续任务">
              <Button
                type="text"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartTask(record)}
              />
            </Tooltip>
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'delete',
                  label: '删除任务',
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

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (modalType === 'start') {
        // 开始任务逻辑
        const updatedTasks = tasks.map(item =>
          item.id === currentTask!.id
            ? {
                ...item,
                status: 'in_progress',
                actualStartDate: dayjs().format('YYYY-MM-DD'),
                progressPercentage: 5,
                actualHours: 0,
              }
            : item
        )
        setTasks(updatedTasks)
        setFilteredData(updatedTasks)
        message.success('任务已开始')
      } else if (modalType === 'pause') {
        // 暂停任务逻辑
        const updatedTasks = tasks.map(item =>
          item.id === currentTask!.id
            ? {
                ...item,
                status: 'paused',
              }
            : item
        )
        setTasks(updatedTasks)
        setFilteredData(updatedTasks)
        message.success('任务已暂停')
      } else if (modalType === 'complete') {
        // 完成任务逻辑
        const updatedTasks = tasks.map(item =>
          item.id === currentTask!.id
            ? {
                ...item,
                status: 'completed',
                actualEndDate: dayjs().format('YYYY-MM-DD'),
                progressPercentage: 100,
              }
            : item
        )
        setTasks(updatedTasks)
        setFilteredData(updatedTasks)
        message.success('任务已完成')
      } else {
        // 创建或编辑逻辑
        if (modalType === 'create') {
          const newTask: ProductionTask = {
            ...values,
            id: Date.now().toString(),
            progressPercentage: 0,
            actualHours: 0,
            startDate: values.startDate.format('YYYY-MM-DD'),
            endDate: values.endDate.format('YYYY-MM-DD'),
            createdDate: dayjs().format('YYYY-MM-DD'),
            updatedDate: dayjs().format('YYYY-MM-DD'),
            createdBy: '当前用户',
          }
          setTasks([...tasks, newTask])
          setFilteredData([...tasks, newTask])
          message.success('创建成功')
        } else if (modalType === 'edit') {
          const updatedTasks = tasks.map(item =>
            item.id === currentTask!.id
              ? {
                  ...item,
                  ...values,
                  startDate: values.startDate.format('YYYY-MM-DD'),
                  endDate: values.endDate.format('YYYY-MM-DD'),
                  updatedDate: dayjs().format('YYYY-MM-DD'),
                }
              : item
          )
          setTasks(updatedTasks)
          setFilteredData(updatedTasks)
          message.success('更新成功')
        }
      }

      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      {/* 页面标题和统计 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">生产管理</h1>

        {/* 统计卡片 */}
        <Row gutter={16} className="mb-6">
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="任务总数"
                value={stats.totalTasks}
                valueStyle={{ color: '#1890ff' }}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="进行中"
                value={stats.inProgress}
                valueStyle={{ color: '#52c41a' }}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="已完成"
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="紧急任务"
                value={stats.urgent}
                valueStyle={{ color: '#f5222d' }}
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="平均进度"
                value={stats.avgProgress}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="工时效率"
                value={stats.efficiency}
                suffix="%"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 预警信息 */}
        {stats.overdue > 0 && (
          <Alert
            message={`有 ${stats.overdue} 个任务已逾期，请及时处理`}
            type="error"
            showIcon
            closable
            className="mb-4"
          />
        )}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'tasks',
            label: '生产任务',
            children: (
              <>
                {/* 工具栏 */}
                <Card className="mb-4">
                  <div className="flex justify-between items-center">
                    <Space size="middle">
                      <Search
                        placeholder="搜索任务名称、编号、项目、焊工"
                        allowClear
                        enterButton={<SearchOutlined />}
                        style={{ width: 350 }}
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
                        <Option value="pending">待开始</Option>
                        <Option value="in_progress">进行中</Option>
                        <Option value="completed">已完成</Option>
                        <Option value="paused">已暂停</Option>
                        <Option value="cancelled">已取消</Option>
                      </Select>
                      <Select
                        placeholder="优先级筛选"
                        style={{ width: 120 }}
                        onChange={handlePriorityFilter}
                        defaultValue="all"
                      >
                        <Option value="all">全部优先级</Option>
                        <Option value="low">低</Option>
                        <Option value="normal">普通</Option>
                        <Option value="high">高</Option>
                        <Option value="urgent">紧急</Option>
                      </Select>
                    </Space>

                    <Space>
                      <Button icon={<ImportOutlined />}>批量导入</Button>
                      <Button icon={<ExportOutlined />}>导出数据</Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/production/create')}
                      >
                        创建任务
                      </Button>
                    </Space>
                  </div>
                </Card>

                {/* 生产任务列表表格 */}
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
                    scroll={{ x: 1400 }}
                  />
                </Card>
              </>
            ),
          },
          {
            key: 'logs',
            label: '生产日志',
            children: (
              <Card>
                <div className="text-center text-gray-500 py-8">
                  生产日志功能开发中...
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* 任务详情/编辑/状态变更模态框 */}
      <Modal
        title={
          modalType === 'view' ? '任务详情' :
          modalType === 'edit' ? '编辑任务' :
          modalType === 'start' ? '开始任务' :
          modalType === 'pause' ? '暂停任务' :
          modalType === 'complete' ? '完成任务' :
          '创建任务'
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={
          modalType === 'view' ? [
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
              loading={loading}
              onClick={handleSubmit}
            >
              {modalType === 'start' ? '确认开始' :
               modalType === 'pause' ? '确认暂停' :
               modalType === 'complete' ? '确认完成' :
               modalType === 'edit' ? '更新' : '创建'}
            </Button>,
          ]
        }
        width={modalType === 'view' ? 1000 : 800}
      >
        {modalType === 'view' && currentTask && (
          <div>
            <Descriptions title="基本信息" column={2} bordered>
              <Descriptions.Item label="任务名称">{currentTask.taskName}</Descriptions.Item>
              <Descriptions.Item label="任务编号">{currentTask.taskNumber}</Descriptions.Item>
              <Descriptions.Item label="项目名称">{currentTask.projectName}</Descriptions.Item>
              <Descriptions.Item label="项目编号">{currentTask.projectCode}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusConfig(currentTask.status).color}>
                  {getStatusConfig(currentTask.status).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getPriorityConfig(currentTask.priority).color}>
                  {getPriorityConfig(currentTask.priority).text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="执行信息" column={2} bordered>
              <Descriptions.Item label="焊工">{currentTask.assignedWelder}</Descriptions.Item>
              <Descriptions.Item label="设备">{currentTask.assignedEquipment}</Descriptions.Item>
              <Descriptions.Item label="位置">{currentTask.location}</Descriptions.Item>
              <Descriptions.Item label="监工">{currentTask.supervisor}</Descriptions.Item>
              <Descriptions.Item label="计划时间">
                {currentTask.startDate} ~ {currentTask.endDate}
              </Descriptions.Item>
              <Descriptions.Item label="实际时间">
                {currentTask.actualStartDate || '未开始'} ~ {currentTask.actualEndDate || '进行中'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="进度信息" column={2} bordered>
              <Descriptions.Item label="进度">
                <Progress percent={currentTask.progressPercentage} />
              </Descriptions.Item>
              <Descriptions.Item label="工时">
                {currentTask.actualHours}h / {currentTask.estimatedHours}h
              </Descriptions.Item>
              <Descriptions.Item label="WPS">{currentTask.wpsName}</Descriptions.Item>
              <Descriptions.Item label="规格">{currentTask.specifications}</Descriptions.Item>
              <Descriptions.Item label="质量要求" span={2}>
                {currentTask.qualityRequirements}
              </Descriptions.Item>
              <Descriptions.Item label="使用材料" span={2}>
                {currentTask.materials.join(', ')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="其他信息" column={1} bordered>
              <Descriptions.Item label="备注">{currentTask.notes}</Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {modalType === 'start' && currentTask && (
          <div>
            <Alert
              message="开始任务"
              description={`确定要开始任务 "${currentTask.taskName}" 吗？`}
              type="info"
              showIcon
              className="mb-4"
            />
            <Form form={form} layout="vertical">
              <Form.Item
                name="notes"
                label="开始备注"
              >
                <TextArea rows={3} placeholder="请输入开始任务的备注信息" />
              </Form.Item>
            </Form>
          </div>
        )}

        {modalType === 'pause' && currentTask && (
          <div>
            <Alert
              message="暂停任务"
              description={`确定要暂停任务 "${currentTask.taskName}" 吗？`}
              type="warning"
              showIcon
              className="mb-4"
            />
            <Form form={form} layout="vertical">
              <Form.Item
                name="reason"
                label="暂停原因"
                rules={[{ required: true, message: '请输入暂停原因' }]}
              >
                <TextArea rows={3} placeholder="请输入暂停任务的原因" />
              </Form.Item>
            </Form>
          </div>
        )}

        {modalType === 'complete' && currentTask && (
          <div>
            <Alert
              message="完成任务"
              description={`确定要完成任务 "${currentTask.taskName}" 吗？`}
              type="success"
              showIcon
              className="mb-4"
            />
            <Form form={form} layout="vertical">
              <Form.Item
                name="actualHours"
                label="实际工时"
                rules={[{ required: true, message: '请输入实际工时' }]}
              >
                <InputNumber
                  placeholder="请输入实际工时"
                  style={{ width: '100%' }}
                  min={0}
                  suffix="小时"
                />
              </Form.Item>
              <Form.Item
                name="qualityResult"
                label="质量检验结果"
                rules={[{ required: true, message: '请输入质量检验结果' }]}
              >
                <TextArea rows={3} placeholder="请输入质量检验结果" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProductionList