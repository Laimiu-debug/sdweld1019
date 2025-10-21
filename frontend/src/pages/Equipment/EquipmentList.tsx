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
  ToolOutlined,
  CalendarOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

interface EquipmentRecord {
  id: string
  equipmentCode: string
  equipmentName: string
  equipmentType: string
  manufacturer: string
  model: string
  serialNumber: string
  status: 'operational' | 'maintenance' | 'broken' | 'retired'
  location: string
  responsiblePerson: string
  purchaseDate: string
  purchasePrice: number
  warrantyExpiry: string
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  operatingHours: number
  utilizationRate: number
  maintenanceCost: number
  downtimeHours: number
  efficiency: number
  specifications: string
  notes: string
}

interface MaintenanceRecord {
  id: string
  equipmentId: string
  maintenanceType: string
  description: string
  cost: number
  duration: number
  technician: string
  status: string
  scheduledDate: string
  completedDate?: string
  nextMaintenanceDate?: string
  partsUsed: string[]
}

interface UsageRecord {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentCode: string
  operator: string
  project: string
  startTime: string
  endTime: string
  duration: number
  workload: string
  efficiency: number
  materialUsed: string
  materialConsumption: number
  issues: string
  status: 'normal' | 'abnormal' | 'error'
}

interface MaintenanceSchedule {
  id: string
  equipmentId: string
  equipmentName: string
  scheduleType: 'routine' | 'preventive' | 'inspection'
  title: string
  description: string
  plannedDate: string
  estimatedDuration: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTechnician: string
  estimatedCost: number
  requiredParts: string[]
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  lastUpdated: string
}

const EquipmentList: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [equipment, setEquipment] = useState<EquipmentRecord[]>([])
  const [filteredData, setFilteredData] = useState<EquipmentRecord[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'maintenance'>('create')
  const [currentEquipment, setCurrentEquipment] = useState<EquipmentRecord | null>(null)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('equipment')

  // 模拟数据
  useEffect(() => {
    generateMockData()
  }, [])

  const generateMockData = () => {
    const mockData: EquipmentRecord[] = [
      {
        id: '1',
        equipmentCode: 'EQP-2024-001',
        equipmentName: '数字化逆变焊机',
        equipmentType: '焊机',
        manufacturer: '松下',
        model: 'YD-400KR2',
        serialNumber: 'SN20240101001',
        status: 'operational',
        location: 'A区-焊接工位01',
        responsiblePerson: '张师傅',
        purchaseDate: '2024-01-10',
        purchasePrice: 28000,
        warrantyExpiry: '2026-01-10',
        lastMaintenanceDate: '2024-01-15',
        nextMaintenanceDate: '2024-07-15',
        operatingHours: 1250,
        utilizationRate: 85,
        maintenanceCost: 1200,
        downtimeHours: 24,
        efficiency: 92,
        specifications: '400A，逆变技术，数字化控制',
        notes: '主要设备，运行稳定，定期保养',
      },
      {
        id: '2',
        equipmentCode: 'EQP-2024-002',
        equipmentName: '等离子切割机',
        equipmentType: '切割机',
        manufacturer: '海宝',
        model: 'Powermax45',
        serialNumber: 'SN20240202001',
        status: 'maintenance',
        location: 'A区-切割工位02',
        responsiblePerson: '李师傅',
        purchaseDate: '2023-12-15',
        purchasePrice: 35000,
        warrantyExpiry: '2025-12-15',
        lastMaintenanceDate: '2024-01-20',
        nextMaintenanceDate: '2024-04-20',
        operatingHours: 890,
        utilizationRate: 65,
        maintenanceCost: 2800,
        downtimeHours: 72,
        efficiency: 88,
        specifications: '45A，等离子切割，厚度12mm',
        notes: '正在维护中，更换割嘴和电极',
      },
      {
        id: '3',
        equipmentCode: 'EQP-2024-003',
        equipmentName: '超声波探伤仪',
        equipmentType: '检测设备',
        manufacturer: '汕头超声',
        model: 'CTS-22',
        serialNumber: 'SN20230315001',
        status: 'broken',
        location: 'B区-质检室',
        responsiblePerson: '王工',
        purchaseDate: '2023-03-10',
        purchasePrice: 45000,
        warrantyExpiry: '2025-03-10',
        lastMaintenanceDate: '2024-01-05',
        nextMaintenanceDate: '2024-04-05',
        operatingHours: 560,
        utilizationRate: 45,
        maintenanceCost: 3500,
        downtimeHours: 120,
        efficiency: 0,
        specifications: '数字式，频率2.5MHz',
        notes: '设备故障，需要返厂维修',
      },
      {
        id: '4',
        equipmentCode: 'EQP-2024-004',
        equipmentName: 'CO2焊机',
        equipmentType: '焊机',
        manufacturer: '奥太',
        model: 'OTC-500',
        serialNumber: 'SN20230601001',
        status: 'operational',
        location: 'A区-焊接工位03',
        responsiblePerson: '刘师傅',
        purchaseDate: '2023-06-01',
        purchasePrice: 22000,
        warrantyExpiry: '2025-06-01',
        lastMaintenanceDate: '2023-12-01',
        nextMaintenanceDate: '2024-06-01',
        operatingHours: 980,
        utilizationRate: 78,
        maintenanceCost: 800,
        downtimeHours: 12,
        efficiency: 90,
        specifications: '500A，气体保护焊',
        notes: '设备运行良好，定期检查送丝机构',
      },
      {
        id: '5',
        equipmentCode: 'EQP-2024-005',
        equipmentName: '点焊机',
        equipmentType: '焊机',
        manufacturer: '小松',
        model: 'DN-16',
        serialNumber: 'SN20230915001',
        status: 'operational',
        location: 'A区-焊接工位04',
        responsiblePerson: '陈师傅',
        purchaseDate: '2023-09-15',
        purchasePrice: 18000,
        warrantyExpiry: '2025-09-15',
        lastMaintenanceDate: '2024-01-10',
        nextMaintenanceDate: '2024-07-10',
        operatingHours: 670,
        utilizationRate: 70,
        maintenanceCost: 600,
        downtimeHours: 8,
        efficiency: 94,
        specifications: '16KVA，中频逆变',
        notes: '新设备，性能稳定',
      },
    ]

    setEquipment(mockData)
    setFilteredData(mockData)
  }

  // 获取统计数据
  const getEquipmentStats = (data: EquipmentRecord[] = []) => {
    const totalValue = data.reduce((sum, item) => sum + item.purchasePrice, 0)
    const operationalCount = data.filter(item => item.status === 'operational').length
    const maintenanceCount = data.filter(item => item.status === 'maintenance').length
    const brokenCount = data.filter(item => item.status === 'broken').length
    const maintenanceDueCount = data.filter(item => {
      const daysUntil = dayjs(item.nextMaintenanceDate).diff(dayjs(), 'day')
      return daysUntil <= 7 && daysUntil >= 0
    }).length
    const overdueCount = data.filter(item => {
      const daysUntil = dayjs(item.nextMaintenanceDate).diff(dayjs(), 'day')
      return daysUntil < 0
    }).length

    const avgUtilization = data.length > 0
      ? Math.round(data.reduce((sum, item) => sum + item.utilizationRate, 0) / data.length)
      : 0

    return {
      total: data.length,
      totalValue,
      operational: operationalCount,
      maintenance: maintenanceCount,
      broken: brokenCount,
      maintenanceDue: maintenanceDueCount,
      overdue: overdueCount,
      avgUtilization,
    }
  }

  const stats = getEquipmentStats(filteredData)

  // 搜索过滤
  const handleSearch = (value: string) => {
    const filtered = equipment.filter(
      item =>
        item.equipmentName.toLowerCase().includes(value.toLowerCase()) ||
        item.equipmentCode.toLowerCase().includes(value.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(value.toLowerCase()) ||
        item.model.toLowerCase().includes(value.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredData(filtered)
  }

  // 类型过滤
  const handleTypeFilter = (type: string) => {
    if (type === 'all') {
      setFilteredData(equipment)
    } else {
      const filtered = equipment.filter(item => item.equipmentType === type)
      setFilteredData(filtered)
    }
  }

  // 状态过滤
  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilteredData(equipment)
    } else {
      const filtered = equipment.filter(item => item.status === status)
      setFilteredData(filtered)
    }
  }

  // 查看详情
  const handleView = (record: EquipmentRecord) => {
    setCurrentEquipment(record)
    setModalType('view')
    setIsModalVisible(true)
    form.setFieldsValue(record)
  }

  // 编辑
  const handleEdit = (record: EquipmentRecord) => {
    setCurrentEquipment(record)
    setModalType('edit')
    setIsModalVisible(true)
    form.setFieldsValue({
      ...record,
      purchaseDate: dayjs(record.purchaseDate),
      warrantyExpiry: dayjs(record.warrantyExpiry),
      lastMaintenanceDate: dayjs(record.lastMaintenanceDate),
      nextMaintenanceDate: dayjs(record.nextMaintenanceDate),
    })
  }

  // 删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个设备吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const newEquipment = equipment.filter(item => item.id !== id)
        setEquipment(newEquipment)
        setFilteredData(newEquipment)
        message.success('删除成功')
      },
    })
  }

  // 维护记录
  const handleMaintenance = (record: EquipmentRecord) => {
    setCurrentEquipment(record)
    setModalType('maintenance')
    setIsModalVisible(true)
    form.resetFields()
  }

  // 获取状态颜色和文本
  const getStatusConfig = (status: string) => {
    const statusMap = {
      operational: { color: 'success', text: '正常运行', icon: <CheckCircleOutlined /> },
      maintenance: { color: 'processing', text: '维护中', icon: <ToolOutlined /> },
      broken: { color: 'error', text: '故障', icon: <WarningOutlined /> },
      retired: { color: 'default', text: '已报废', icon: <ExclamationCircleOutlined /> },
    }
    return statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null }
  }

  // 表格列定义
  const columns: ColumnsType<EquipmentRecord> = [
    {
      title: '设备信息',
      key: 'equipment',
      width: 280,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.equipmentName}</div>
          <div className="text-sm text-gray-500">编号: {record.equipmentCode}</div>
          <div className="text-xs text-gray-400">{record.manufacturer} · {record.model}</div>
        </div>
      ),
    },
    {
      title: '设备类型',
      dataIndex: 'equipmentType',
      key: 'equipmentType',
      width: 100,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
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
      title: '位置/负责人',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.location}</div>
          <div className="text-xs text-gray-500">{record.responsiblePerson}</div>
        </div>
      ),
    },
    {
      title: '使用率',
      key: 'utilization',
      width: 120,
      render: (_, record) => (
        <div>
          <Progress
            percent={record.utilizationRate}
            size="small"
            status={record.utilizationRate >= 80 ? 'success' : record.utilizationRate >= 60 ? 'normal' : 'exception'}
          />
          <div className="text-xs text-gray-500 mt-1">{record.utilizationRate}%</div>
        </div>
      ),
    },
    {
      title: '效率',
      key: 'efficiency',
      width: 100,
      render: (_, record) => {
        if (record.status === 'broken') {
          return <span className="text-red-600">0%</span>
        }
        return (
          <span className={record.efficiency >= 90 ? 'text-green-600' : record.efficiency >= 80 ? 'text-blue-600' : 'text-orange-600'}>
            {record.efficiency}%
          </span>
        )
      },
    },
    {
      title: '下次维护',
      key: 'maintenance',
      width: 120,
      render: (_, record) => {
        const daysUntil = dayjs(record.nextMaintenanceDate).diff(dayjs(), 'day')
        let color = 'text-gray-600'
        if (daysUntil < 0) color = 'text-red-600 font-medium'
        else if (daysUntil <= 7) color = 'text-orange-600'

        return (
          <div className={color}>
            <div>{dayjs(record.nextMaintenanceDate).format('YYYY-MM-DD')}</div>
            <div className="text-xs">
              {daysUntil < 0 ? '已逾期' : daysUntil <= 7 ? `${daysUntil}天后` : `${daysUntil}天后`}
            </div>
          </div>
        )
      },
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
          <Tooltip title="维护记录">
            <Button
              type="text"
              size="small"
              icon={<ToolOutlined />}
              onClick={() => handleMaintenance(record)}
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
          <Dropdown
            menu={{
              items: [
                {
                  key: 'maintenance',
                  label: '计划维护',
                  icon: <CalendarOutlined />,
                  onClick: () => handleMaintenance(record),
                },
                {
                  key: 'delete',
                  label: '删除设备',
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

      if (modalType === 'maintenance') {
        // 维护记录逻辑
        message.success('维护记录已添加')
      } else {
        // 创建或编辑逻辑
        if (modalType === 'create') {
          const newEquipment: EquipmentRecord = {
            ...values,
            id: Date.now().toString(),
            operatingHours: 0,
            utilizationRate: 0,
            maintenanceCost: 0,
            downtimeHours: 0,
            efficiency: 100,
            purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
            warrantyExpiry: values.warrantyExpiry.format('YYYY-MM-DD'),
            lastMaintenanceDate: values.lastMaintenanceDate.format('YYYY-MM-DD'),
            nextMaintenanceDate: values.nextMaintenanceDate.format('YYYY-MM-DD'),
          }
          setEquipment([...equipment, newEquipment])
          setFilteredData([...equipment, newEquipment])
          message.success('创建成功')
        } else if (modalType === 'edit') {
          const updatedEquipment = equipment.map(item =>
            item.id === currentEquipment!.id
              ? {
                  ...item,
                  ...values,
                  purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
                  warrantyExpiry: values.warrantyExpiry.format('YYYY-MM-DD'),
                  lastMaintenanceDate: values.lastMaintenanceDate.format('YYYY-MM-DD'),
                  nextMaintenanceDate: values.nextMaintenanceDate.format('YYYY-MM-DD'),
                }
              : item
          )
          setEquipment(updatedEquipment)
          setFilteredData(updatedEquipment)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">设备管理</h1>

        {/* 统计卡片 */}
        <Row gutter={16} className="mb-6">
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="设备总数"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
                prefix={<SettingOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="设备总值"
                value={stats.totalValue}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="正常运行"
                value={stats.operational}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="维护中"
                value={stats.maintenance}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="故障"
                value={stats.broken}
                valueStyle={{ color: '#f5222d' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="平均使用率"
                value={stats.avgUtilization}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
                prefix={<SettingOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 预警信息 */}
        {(stats.overdue > 0 || stats.maintenanceDue > 0) && (
          <Alert
            message={
              <div>
                {stats.overdue > 0 && <div>• 有 {stats.overdue} 台设备维护已逾期，请立即处理</div>}
                {stats.maintenanceDue > 0 && <div>• 有 {stats.maintenanceDue} 台设备即将到期维护</div>}
              </div>
            }
            type="warning"
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
            key: 'equipment',
            label: '设备列表',
            children: (
              <>
                {/* 工具栏 */}
                <Card className="mb-4">
                  <div className="flex justify-between items-center">
                    <Space size="middle">
                      <Search
                        placeholder="搜索设备名称、编号、制造商、型号、序列号"
                        allowClear
                        enterButton={<SearchOutlined />}
                        style={{ width: 350 }}
                        onSearch={handleSearch}
                        onChange={(e) => !e.target.value && handleSearch('')}
                      />
                      <Select
                        placeholder="类型筛选"
                        style={{ width: 120 }}
                        onChange={handleTypeFilter}
                        defaultValue="all"
                      >
                        <Option value="all">全部类型</Option>
                        <Option value="焊机">焊机</Option>
                        <Option value="切割机">切割机</Option>
                        <Option value="检测设备">检测设备</Option>
                        <Option value="辅助设备">辅助设备</Option>
                      </Select>
                      <Select
                        placeholder="状态筛选"
                        style={{ width: 120 }}
                        onChange={handleStatusFilter}
                        defaultValue="all"
                      >
                        <Option value="all">全部状态</Option>
                        <Option value="operational">正常运行</Option>
                        <Option value="maintenance">维护中</Option>
                        <Option value="broken">故障</Option>
                        <Option value="retired">已报废</Option>
                      </Select>
                    </Space>

                    <Space>
                      <Button icon={<ImportOutlined />}>批量导入</Button>
                      <Button icon={<ExportOutlined />}>导出数据</Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/equipment/create')}
                      >
                        新增设备
                      </Button>
                    </Space>
                  </div>
                </Card>

                {/* 设备列表表格 */}
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
            key: 'maintenance',
            label: '维护记录',
            children: (
              <Card>
                <MaintenanceRecords equipment={equipment} />
              </Card>
            ),
          },
          {
            key: 'usage',
            label: '使用记录',
            children: (
              <Card>
                <UsageRecords equipment={equipment} />
              </Card>
            ),
          },
          {
            key: 'schedule',
            label: '维护计划',
            children: (
              <Card>
                <MaintenanceSchedule equipment={equipment} />
              </Card>
            ),
          },
        ]}
      />

      {/* 设备详情/编辑/维护模态框 */}
      <Modal
        title={
          modalType === 'view' ? '设备详情' :
          modalType === 'edit' ? '编辑设备' :
          modalType === 'maintenance' ? '维护记录' :
          '新增设备'
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
              {modalType === 'maintenance' ? '添加记录' :
               modalType === 'edit' ? '更新' : '创建'}
            </Button>,
          ]
        }
        width={modalType === 'view' ? 1000 : 800}
      >
        {modalType === 'view' && currentEquipment && (
          <div>
            <Descriptions title="基本信息" column={2} bordered>
              <Descriptions.Item label="设备名称">{currentEquipment.equipmentName}</Descriptions.Item>
              <Descriptions.Item label="设备编号">{currentEquipment.equipmentCode}</Descriptions.Item>
              <Descriptions.Item label="设备类型">{currentEquipment.equipmentType}</Descriptions.Item>
              <Descriptions.Item label="制造商">{currentEquipment.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="型号">{currentEquipment.model}</Descriptions.Item>
              <Descriptions.Item label="序列号">{currentEquipment.serialNumber}</Descriptions.Item>
              <Descriptions.Item label="位置">{currentEquipment.location}</Descriptions.Item>
              <Descriptions.Item label="负责人">{currentEquipment.responsiblePerson}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusConfig(currentEquipment.status).color}>
                  {getStatusConfig(currentEquipment.status).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="技术规格">{currentEquipment.specifications}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="运行数据" column={2} bordered>
              <Descriptions.Item label="运行工时">{currentEquipment.operatingHours} 小时</Descriptions.Item>
              <Descriptions.Item label="使用率">{currentEquipment.utilizationRate}%</Descriptions.Item>
              <Descriptions.Item label="设备效率">{currentEquipment.efficiency}%</Descriptions.Item>
              <Descriptions.Item label="停机时间">{currentEquipment.downtimeHours} 小时</Descriptions.Item>
              <Descriptions.Item label="维护成本">¥{currentEquipment.maintenanceCost}</Descriptions.Item>
              <Descriptions.Item label="使用率">
                <Progress percent={currentEquipment.utilizationRate} size="small" />
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="维护信息" column={2} bordered>
              <Descriptions.Item label="上次维护">{currentEquipment.lastMaintenanceDate}</Descriptions.Item>
              <Descriptions.Item label="下次维护">{currentEquipment.nextMaintenanceDate}</Descriptions.Item>
              <Descriptions.Item label="购买日期">{currentEquipment.purchaseDate}</Descriptions.Item>
              <Descriptions.Item label="保修到期">{currentEquipment.warrantyExpiry}</Descriptions.Item>
              <Descriptions.Item label="购买价格">¥{currentEquipment.purchasePrice}</Descriptions.Item>
              <Descriptions.Item label="备注">{currentEquipment.notes}</Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {modalType === 'maintenance' && currentEquipment && (
          <div>
            <Alert
              message="维护记录"
              description={`设备：${currentEquipment.equipmentName}，编号：${currentEquipment.equipmentCode}`}
              type="info"
              showIcon
              className="mb-4"
            />
            <Form form={form} layout="vertical">
              <Form.Item
                name="maintenanceType"
                label="维护类型"
                rules={[{ required: true, message: '请选择维护类型' }]}
              >
                <Select placeholder="请选择维护类型">
                  <Option value="routine">例行维护</Option>
                  <Option value="preventive">预防性维护</Option>
                  <Option value="corrective">故障维修</Option>
                  <Option value="emergency">紧急维修</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="description"
                label="维护描述"
                rules={[{ required: true, message: '请输入维护描述' }]}
              >
                <TextArea rows={3} placeholder="请详细描述维护内容" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="cost"
                    label="维护费用"
                    rules={[{ required: true, message: '请输入维护费用' }]}
                  >
                    <InputNumber
                      placeholder="请输入维护费用"
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      prefix="¥"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="duration"
                    label="维护时长"
                    rules={[{ required: true, message: '请输入维护时长' }]}
                  >
                    <InputNumber
                      placeholder="请输入维护时长"
                      style={{ width: '100%' }}
                      min={0}
                      suffix="小时"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="technician"
                label="维护人员"
                rules={[{ required: true, message: '请输入维护人员' }]}
              >
                <Input placeholder="请输入维护人员姓名" />
              </Form.Item>
              <Form.Item
                name="partsUsed"
                label="使用备件"
              >
                <TextArea rows={2} placeholder="请列出使用的备件" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

// 维护记录组件
const MaintenanceRecords: React.FC<{ equipment: EquipmentRecord[] }> = ({ equipment }) => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const mockRecords: MaintenanceRecord[] = [
      {
        id: '1',
        equipmentId: '1',
        maintenanceType: 'routine',
        description: '例行维护，清洁设备，检查电缆连接',
        cost: 800,
        duration: 4,
        technician: '张技师',
        status: 'completed',
        scheduledDate: '2024-01-15',
        completedDate: '2024-01-15',
        nextMaintenanceDate: '2024-04-15',
        partsUsed: ['清洁剂', '电缆接头'],
      },
      {
        id: '2',
        equipmentId: '2',
        maintenanceType: 'corrective',
        description: '故障维修，更换等离子割嘴和电极',
        cost: 2500,
        duration: 6,
        technician: '李技师',
        status: 'completed',
        scheduledDate: '2024-01-20',
        completedDate: '2024-01-21',
        nextMaintenanceDate: '2024-04-20',
        partsUsed: ['等离子割嘴', '电极', '密封圈'],
      },
      {
        id: '3',
        equipmentId: '3',
        maintenanceType: 'corrective',
        description: '设备故障，超声波探伤仪无法启动',
        cost: 3500,
        duration: 8,
        technician: '王技师',
        status: 'in_progress',
        scheduledDate: '2024-01-25',
        partsUsed: [],
      },
    ]
    setRecords(mockRecords)
  }, [])

  const columns = [
    {
      title: '维护日期',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '设备',
      key: 'equipment',
      render: (_, record: MaintenanceRecord) => {
        const eq = equipment.find(e => e.id === record.equipmentId)
        return eq ? `${eq.equipmentName} (${eq.equipmentCode})` : '未知设备'
      },
    },
    {
      title: '维护类型',
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
      render: (type: string) => {
        const typeMap = {
          routine: { color: 'blue', text: '例行维护' },
          preventive: { color: 'green', text: '预防性维护' },
          corrective: { color: 'orange', text: '故障维修' },
          emergency: { color: 'red', text: '紧急维修' },
        }
        const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '维护人员',
      dataIndex: 'technician',
      key: 'technician',
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => `¥${cost}`,
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
      render: (status: string) => {
        const statusMap = {
          completed: { color: 'success', text: '已完成' },
          in_progress: { color: 'processing', text: '进行中' },
          scheduled: { color: 'default', text: '已计划' },
          cancelled: { color: 'error', text: '已取消' },
        }
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
  ]

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Title level={4}>维护记录</Title>
        <Space>
          <Button icon={<ExportOutlined />}>导出记录</Button>
          <Button icon={<CalendarOutlined />}>选择日期范围</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
    </div>
  )
}

// 使用记录组件
const UsageRecords: React.FC<{ equipment: EquipmentRecord[] }> = ({ equipment }) => {
  const [records, setRecords] = useState<UsageRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const mockRecords: UsageRecord[] = [
      {
        id: '1',
        equipmentId: '1',
        equipmentName: '数字化逆变焊机',
        equipmentCode: 'EQP-2024-001',
        operator: '张师傅',
        project: '项目A-压力容器',
        startTime: '2024-01-16 08:00',
        endTime: '2024-01-16 17:30',
        duration: 9.5,
        workload: '焊接厚度12mm钢板',
        efficiency: 94,
        materialUsed: 'J422焊条',
        materialConsumption: 2.5,
        issues: '无异常',
        status: 'normal',
      },
      {
        id: '2',
        equipmentId: '4',
        equipmentName: 'CO2焊机',
        equipmentCode: 'EQP-2024-004',
        operator: '李师傅',
        project: '项目B-管道焊接',
        startTime: '2024-01-16 08:30',
        endTime: '2024-01-16 16:45',
        duration: 8.25,
        workload: '焊接DN100管道',
        efficiency: 88,
        materialUsed: 'ER50-6焊丝',
        materialConsumption: 3.2,
        issues: '送丝轻微不畅',
        status: 'abnormal',
      },
      {
        id: '3',
        equipmentId: '2',
        equipmentName: '等离子切割机',
        equipmentCode: 'EQP-2024-002',
        operator: '王师傅',
        project: '项目C-钢结构',
        startTime: '2024-01-15 09:00',
        endTime: '2024-01-15 12:30',
        duration: 3.5,
        workload: '切割10mm钢板',
        efficiency: 0,
        materialUsed: '无',
        materialConsumption: 0,
        issues: '设备故障，切割中断',
        status: 'error',
      },
    ]
    setRecords(mockRecords)
  }, [])

  const columns = [
    {
      title: '使用时间',
      key: 'time',
      render: (_, record: UsageRecord) => (
        <div>
          <div>{dayjs(record.startTime).format('YYYY-MM-DD')}</div>
          <div className="text-xs text-gray-500">
            {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: '设备信息',
      key: 'equipment',
      render: (_, record: UsageRecord) => (
        <div>
          <div>{record.equipmentName}</div>
          <div className="text-xs text-gray-500">{record.equipmentCode}</div>
        </div>
      ),
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: '使用时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration}小时`,
    },
    {
      title: '工作内容',
      dataIndex: 'workload',
      key: 'workload',
      ellipsis: true,
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency: number) => {
        if (efficiency === 0) return <span className="text-red-600">0%</span>
        return (
          <span className={efficiency >= 90 ? 'text-green-600' : efficiency >= 80 ? 'text-blue-600' : 'text-orange-600'}>
            {efficiency}%
          </span>
        )
      },
    },
    {
      title: '材料消耗',
      key: 'materials',
      render: (_, record: UsageRecord) => (
        <div>
          <div>{record.materialUsed}</div>
          <div className="text-xs text-gray-500">{record.materialConsumption} {record.materialUsed.includes('焊条') ? 'kg' : 'm'}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          normal: { color: 'success', text: '正常' },
          abnormal: { color: 'warning', text: '异常' },
          error: { color: 'error', text: '故障' },
        }
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '问题描述',
      dataIndex: 'issues',
      key: 'issues',
      ellipsis: true,
    },
  ]

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Title level={4}>设备使用记录</Title>
        <Space>
          <Button icon={<ExportOutlined />}>导出记录</Button>
          <Button icon={<CalendarOutlined />}>选择日期范围</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  )
}

// 维护计划组件
const MaintenanceSchedule: React.FC<{ equipment: EquipmentRecord[] }> = ({ equipment }) => {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const mockSchedules: MaintenanceSchedule[] = [
      {
        id: '1',
        equipmentId: '1',
        equipmentName: '数字化逆变焊机',
        scheduleType: 'routine',
        title: '季度例行维护',
        description: '清洁设备内部灰尘，检查风扇运转，校准电流参数',
        plannedDate: '2024-04-15',
        estimatedDuration: 4,
        priority: 'medium',
        assignedTechnician: '张技师',
        estimatedCost: 1200,
        requiredParts: ['清洁剂', '润滑油', '标准件'],
        status: 'scheduled',
        createdAt: '2024-01-15',
        lastUpdated: '2024-01-15',
      },
      {
        id: '2',
        equipmentId: '4',
        equipmentName: 'CO2焊机',
        scheduleType: 'preventive',
        title: '送丝机构保养',
        description: '检查送丝轮磨损，更换送丝软管，清理导电嘴',
        plannedDate: '2024-02-20',
        estimatedDuration: 3,
        priority: 'low',
        assignedTechnician: '李技师',
        estimatedCost: 800,
        requiredParts: ['送丝轮', '送丝软管', '导电嘴'],
        status: 'scheduled',
        createdAt: '2024-01-10',
        lastUpdated: '2024-01-10',
      },
      {
        id: '3',
        equipmentId: '3',
        equipmentName: '超声波探伤仪',
        scheduleType: 'corrective',
        title: '紧急故障维修',
        description: '设备无法启动，需要检查电源和主板',
        plannedDate: '2024-01-28',
        estimatedDuration: 8,
        priority: 'urgent',
        assignedTechnician: '王技师',
        estimatedCost: 3500,
        requiredParts: ['电源模块', '备用电池'],
        status: 'scheduled',
        createdAt: '2024-01-25',
        lastUpdated: '2024-01-26',
      },
    ]
    setSchedules(mockSchedules)
  }, [])

  const columns = [
    {
      title: '计划日期',
      dataIndex: 'plannedDate',
      key: 'plannedDate',
      render: (date: string) => {
        const daysUntil = dayjs(date).diff(dayjs(), 'day')
        let color = 'text-gray-600'
        if (daysUntil < 0) color = 'text-red-600 font-medium'
        else if (daysUntil <= 7) color = 'text-orange-600'

        return (
          <div className={color}>
            <div>{dayjs(date).format('YYYY-MM-DD')}</div>
            <div className="text-xs">
              {daysUntil < 0 ? '已逾期' : `${daysUntil}天后`}
            </div>
          </div>
        )
      },
    },
    {
      title: '设备',
      key: 'equipment',
      render: (_, record: MaintenanceSchedule) => (
        <div>
          <div>{record.equipmentName}</div>
          <div className="text-xs text-gray-500">
            {equipment.find(e => e.id === record.equipmentId)?.equipmentCode}
          </div>
        </div>
      ),
    },
    {
      title: '计划类型',
      dataIndex: 'scheduleType',
      key: 'scheduleType',
      render: (type: string) => {
        const typeMap = {
          routine: { color: 'blue', text: '例行维护' },
          preventive: { color: 'green', text: '预防性维护' },
          inspection: { color: 'purple', text: '检查' },
        }
        const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const priorityMap = {
          low: { color: 'default', text: '低' },
          medium: { color: 'blue', text: '中' },
          high: { color: 'orange', text: '高' },
          urgent: { color: 'red', text: '紧急' },
        }
        const config = priorityMap[priority as keyof typeof priorityMap] || { color: 'default', text: priority }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '负责人',
      dataIndex: 'assignedTechnician',
      key: 'assignedTechnician',
    },
    {
      title: '预计时长',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      render: (duration: number) => `${duration}小时`,
    },
    {
      title: '预计费用',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (cost: number) => `¥${cost}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          scheduled: { color: 'default', text: '已计划' },
          in_progress: { color: 'processing', text: '进行中' },
          completed: { color: 'success', text: '已完成' },
          cancelled: { color: 'error', text: '已取消' },
        }
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: MaintenanceSchedule) => (
        <Space>
          <Button type="link" size="small">
            编辑
          </Button>
          <Button type="link" size="small" danger>
            取消
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Title level={4}>维护计划</Title>
        <Space>
          <Button icon={<PlusOutlined />}>添加计划</Button>
          <Button icon={<ExportOutlined />}>导出计划</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={schedules}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  )
}

export default EquipmentList