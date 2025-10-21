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
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  InboxOutlined,
  FilterOutlined,
  MoreOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  BarcodeOutlined,
  QrcodeOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input
const { Title } = Typography

interface MaterialRecord {
  id: string
  materialCode: string
  materialName: string
  category: string
  specification: string
  brand: string
  manufacturer: string
  batchNumber: string
  currentStock: number
  unit: string
  minStock: number
  maxStock: number
  unitPrice: number
  totalPrice: number
  location: string
  supplier: string
  purchaseDate: string
  expiryDate: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired'
  qualityCertificate: string
  storageCondition: string
  lastInboundDate: string
  lastOutboundDate: string
  notes: string
}

interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  businessLicense: string
  qualityCertification: string
  rating: number
  cooperationYears: number
  totalPurchases: number
  lastPurchaseDate: string
  paymentTerms: string
  deliveryTerms: string
  status: 'active' | 'inactive' | 'suspended'
  materials: string[]
}

interface StockTransaction {
  id: string
  materialId: string
  materialName: string
  materialCode: string
  transactionType: 'inbound' | 'outbound'
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  balance: number
  operator: string
  department: string
  reason: string
  transactionDate: string
  reference: string
  batchNumber: string
}

const MaterialsList: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [materials, setMaterials] = useState<MaterialRecord[]>([])
  const [filteredData, setFilteredData] = useState<MaterialRecord[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'inbound' | 'outbound'>('create')
  const [currentMaterial, setCurrentMaterial] = useState<MaterialRecord | null>(null)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('materials')

  // 模拟数据
  useEffect(() => {
    generateMockData()
  }, [])

  const generateMockData = () => {
    const mockData: MaterialRecord[] = [
      {
        id: '1',
        materialCode: 'WELD001',
        materialName: 'J422焊条',
        category: '焊条',
        specification: 'Φ3.2mm',
        brand: '大桥',
        manufacturer: '天津大桥焊材集团有限公司',
        batchNumber: 'B20231215001',
        currentStock: 850,
        unit: 'kg',
        minStock: 100,
        maxStock: 1000,
        unitPrice: 12.5,
        totalPrice: 10625,
        location: 'A区-01-03',
        supplier: '天津大桥焊材集团',
        purchaseDate: '2023-12-15',
        expiryDate: '2025-12-15',
        status: 'in_stock',
        qualityCertificate: 'QC20231215001',
        storageCondition: '干燥阴凉处',
        lastInboundDate: '2023-12-15',
        lastOutboundDate: '2024-01-10',
        notes: '常规焊条，适用于碳钢焊接',
      },
      {
        id: '2',
        materialCode: 'WELD002',
        materialName: 'ER50-6焊丝',
        category: '焊丝',
        specification: 'Φ1.2mm',
        brand: '金桥',
        manufacturer: '天津金桥焊材集团有限公司',
        batchNumber: 'B20231120002',
        currentStock: 450,
        unit: 'kg',
        minStock: 200,
        maxStock: 800,
        unitPrice: 18.8,
        totalPrice: 8460,
        location: 'A区-02-01',
        supplier: '天津金桥焊材集团',
        purchaseDate: '2023-11-20',
        expiryDate: '2025-11-20',
        status: 'in_stock',
        qualityCertificate: 'QC20231120002',
        storageCondition: '干燥环境，防潮',
        lastInboundDate: '2023-11-20',
        lastOutboundDate: '2024-01-08',
        notes: '气保护焊丝，适用于碳钢和低合金钢',
      },
      {
        id: '3',
        materialCode: 'WELD003',
        materialName: 'J507焊条',
        category: '焊条',
        specification: 'Φ4.0mm',
        brand: '大西洋',
        manufacturer: '四川大西洋焊接材料股份有限公司',
        batchNumber: 'B20231015003',
        currentStock: 80,
        unit: 'kg',
        minStock: 100,
        maxStock: 800,
        unitPrice: 15.2,
        totalPrice: 1216,
        location: 'A区-01-05',
        supplier: '四川大西洋焊接材料',
        purchaseDate: '2023-10-15',
        expiryDate: '2025-10-15',
        status: 'low_stock',
        qualityCertificate: 'QC20231015003',
        storageCondition: '干燥阴凉处',
        lastInboundDate: '2023-10-15',
        lastOutboundDate: '2024-01-12',
        notes: '低氢焊条，适用于重要结构焊接',
      },
      {
        id: '4',
        materialCode: 'WELD004',
        materialName: 'H08Mn2SiA焊丝',
        category: '焊丝',
        specification: 'Φ1.0mm',
        brand: '神钢',
        manufacturer: '神户制钢所',
        batchNumber: 'B20230225004',
        currentStock: 15,
        unit: 'kg',
        minStock: 50,
        maxStock: 500,
        unitPrice: 32.5,
        totalPrice: 487.5,
        location: 'A区-02-03',
        supplier: '神钢焊接材料',
        purchaseDate: '2023-02-25',
        expiryDate: '2024-02-25',
        status: 'expired',
        qualityCertificate: 'QC20230225004',
        storageCondition: '干燥环境，防潮',
        lastInboundDate: '2023-02-25',
        lastOutboundDate: '2023-12-20',
        notes: '进口焊丝，已过期需要处理',
      },
      {
        id: '5',
        materialCode: 'GAS001',
        materialName: '二氧化碳保护气',
        category: '保护气体',
        specification: '99.9%纯度',
        brand: '林德',
        manufacturer: '林德集团',
        batchNumber: 'G20231210001',
        currentStock: 0,
        unit: '瓶',
        minStock: 5,
        maxStock: 20,
        unitPrice: 120,
        totalPrice: 0,
        location: 'B区-气体房',
        supplier: '林德气体',
        purchaseDate: '2023-12-10',
        expiryDate: '2024-12-10',
        status: 'out_of_stock',
        qualityCertificate: 'QC20231210001',
        storageCondition: '通风良好，远离火源',
        lastInboundDate: '2023-12-10',
        lastOutboundDate: '2024-01-15',
        notes: '焊接保护气体，需要及时补充',
      },
    ]

    setMaterials(mockData)
    setFilteredData(mockData)
  }

  // 获取统计数据
  const getMaterialsStats = (data: MaterialRecord[] = []) => {
    const totalValue = data.reduce((sum, item) => sum + item.totalPrice, 0)
    const lowStockCount = data.filter(item => item.status === 'low_stock').length
    const outOfStockCount = data.filter(item => item.status === 'out_of_stock').length
    const expiredCount = data.filter(item => item.status === 'expired').length
    const expiringCount = data.filter(item => {
      const daysUntil = dayjs(item.expiryDate).diff(dayjs(), 'day')
      return daysUntil > 0 && daysUntil <= 30
    }).length

    return {
      totalTypes: data.length,
      totalValue,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      expired: expiredCount,
      expiring: expiringCount,
    }
  }

  const stats = getMaterialsStats(filteredData)

  // 搜索过滤
  const handleSearch = (value: string) => {
    const filtered = materials.filter(
      item =>
        item.materialName.toLowerCase().includes(value.toLowerCase()) ||
        item.materialCode.toLowerCase().includes(value.toLowerCase()) ||
        item.category.toLowerCase().includes(value.toLowerCase()) ||
        item.specification.toLowerCase().includes(value.toLowerCase()) ||
        item.brand.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredData(filtered)
  }

  // 类别过滤
  const handleCategoryFilter = (category: string) => {
    if (category === 'all') {
      setFilteredData(materials)
    } else {
      const filtered = materials.filter(item => item.category === category)
      setFilteredData(filtered)
    }
  }

  // 状态过滤
  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilteredData(materials)
    } else {
      const filtered = materials.filter(item => item.status === status)
      setFilteredData(filtered)
    }
  }

  // 查看详情
  const handleView = (record: MaterialRecord) => {
    setCurrentMaterial(record)
    setModalType('view')
    setIsModalVisible(true)
    form.setFieldsValue(record)
  }

  // 编辑
  const handleEdit = (record: MaterialRecord) => {
    setCurrentMaterial(record)
    setModalType('edit')
    setIsModalVisible(true)
    form.setFieldsValue({
      ...record,
      purchaseDate: dayjs(record.purchaseDate),
      expiryDate: dayjs(record.expiryDate),
    })
  }

  // 删除
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个焊材吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const newMaterials = materials.filter(item => item.id !== id)
        setMaterials(newMaterials)
        setFilteredData(newMaterials)
        message.success('删除成功')
      },
    })
  }

  // 入库操作
  const handleInbound = (record: MaterialRecord) => {
    setCurrentMaterial(record)
    setModalType('inbound')
    setIsModalVisible(true)
    form.resetFields()
  }

  // 出库操作
  const handleOutbound = (record: MaterialRecord) => {
    if (record.currentStock === 0) {
      message.error('当前库存为0，无法出库')
      return
    }
    setCurrentMaterial(record)
    setModalType('outbound')
    setIsModalVisible(true)
    form.resetFields()
  }

  // 获取状态颜色和文本
  const getStatusConfig = (status: string) => {
    const statusMap = {
      in_stock: { color: 'success', text: '库存正常', icon: <CheckCircleOutlined /> },
      low_stock: { color: 'warning', text: '库存不足', icon: <WarningOutlined /> },
      out_of_stock: { color: 'error', text: '缺货', icon: <ExclamationCircleOutlined /> },
      expired: { color: 'error', text: '已过期', icon: <ExclamationCircleOutlined /> },
    }
    return statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null }
  }

  // 表格列定义
  const columns: ColumnsType<MaterialRecord> = [
    {
      title: '焊材信息',
      key: 'material',
      width: 280,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.materialName}</div>
          <div className="text-sm text-gray-500">编号: {record.materialCode}</div>
          <div className="text-xs text-gray-400">{record.specification} · {record.brand}</div>
        </div>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '当前库存',
      key: 'stock',
      width: 120,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.currentStock} {record.unit}</div>
          <div className="text-xs text-gray-500">
            最小: {record.minStock} / 最大: {record.maxStock}
          </div>
        </div>
      ),
    },
    {
      title: '库存状态',
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
      title: '单价/总价',
      key: 'price',
      width: 120,
      render: (_, record) => (
        <div>
          <div className="font-medium">¥{record.unitPrice}/{record.unit}</div>
          <div className="text-sm text-gray-600">¥{record.totalPrice.toFixed(2)}</div>
        </div>
      ),
    },
    {
      title: '存放位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
    },
    {
      title: '保质期',
      key: 'expiry',
      width: 120,
      render: (_, record) => {
        const daysUntil = dayjs(record.expiryDate).diff(dayjs(), 'day')
        let color = 'text-gray-600'
        if (daysUntil < 0) color = 'text-red-600 font-medium'
        else if (daysUntil < 30) color = 'text-orange-600'

        return (
          <div className={color}>
            <div>{dayjs(record.expiryDate).format('YYYY-MM-DD')}</div>
            <div className="text-xs">
              {daysUntil < 0 ? '已过期' : `${daysUntil}天后过期`}
            </div>
          </div>
        )
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
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
          <Tooltip title="入库">
            <Button
              type="text"
              size="small"
              icon={<InboxOutlined />}
              onClick={() => handleInbound(record)}
            />
          </Tooltip>
          <Tooltip title="出库">
            <Button
              type="text"
              size="small"
              icon={<ExportOutlined />}
              onClick={() => handleOutbound(record)}
              disabled={record.currentStock === 0}
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
                  key: 'delete',
                  label: '删除',
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

      if (modalType === 'inbound') {
        // 入库逻辑
        const quantity = values.quantity
        const newStock = currentMaterial!.currentStock + quantity
        const newTotalPrice = newStock * currentMaterial!.unitPrice

        const updatedMaterials = materials.map(item =>
          item.id === currentMaterial!.id
            ? {
                ...item,
                currentStock: newStock,
                totalPrice: newTotalPrice,
                lastInboundDate: dayjs().format('YYYY-MM-DD'),
              }
            : item
        )
        setMaterials(updatedMaterials)
        setFilteredData(updatedMaterials)
        message.success('入库成功')
      } else if (modalType === 'outbound') {
        // 出库逻辑
        const quantity = values.quantity
        if (quantity > currentMaterial!.currentStock) {
          message.error('出库数量不能超过当前库存')
          return
        }

        const newStock = currentMaterial!.currentStock - quantity
        const newTotalPrice = newStock * currentMaterial!.unitPrice

        const updatedMaterials = materials.map(item =>
          item.id === currentMaterial!.id
            ? {
                ...item,
                currentStock: newStock,
                totalPrice: newTotalPrice,
                lastOutboundDate: dayjs().format('YYYY-MM-DD'),
              }
            : item
        )
        setMaterials(updatedMaterials)
        setFilteredData(updatedMaterials)
        message.success('出库成功')
      } else {
        // 创建或编辑逻辑
        if (modalType === 'create') {
          const newMaterial: MaterialRecord = {
            ...values,
            id: Date.now().toString(),
            currentStock: values.currentStock || 0,
            totalPrice: (values.currentStock || 0) * values.unitPrice,
            purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
            expiryDate: values.expiryDate.format('YYYY-MM-DD'),
            status: values.currentStock >= values.minStock ? 'in_stock' : 'low_stock',
          }
          setMaterials([...materials, newMaterial])
          setFilteredData([...materials, newMaterial])
          message.success('创建成功')
        } else if (modalType === 'edit') {
          const updatedMaterials = materials.map(item =>
            item.id === currentMaterial!.id
              ? {
                  ...item,
                  ...values,
                  totalPrice: values.currentStock * values.unitPrice,
                  purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
                  expiryDate: values.expiryDate.format('YYYY-MM-DD'),
                  status: values.currentStock >= values.minStock ? 'in_stock' : 'low_stock',
                }
              : item
          )
          setMaterials(updatedMaterials)
          setFilteredData(updatedMaterials)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">焊材管理</h1>

        {/* 统计卡片 */}
        <Row gutter={16} className="mb-6">
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="焊材种类"
                value={stats.totalTypes}
                valueStyle={{ color: '#1890ff' }}
                prefix={<BarcodeOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="库存总值"
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
                title="库存不足"
                value={stats.lowStock}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="缺货"
                value={stats.outOfStock}
                valueStyle={{ color: '#f5222d' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="已过期"
                value={stats.expired}
                valueStyle={{ color: '#f5222d' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic
                title="即将过期"
                value={stats.expiring}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 预警信息 */}
        {(stats.lowStock > 0 || stats.outOfStock > 0 || stats.expired > 0) && (
          <Alert
            message={
              <div>
                {stats.lowStock > 0 && <div>• 有 {stats.lowStock} 种焊材库存不足，请及时补货</div>}
                {stats.outOfStock > 0 && <div>• 有 {stats.outOfStock} 种焊材已缺货，需要立即处理</div>}
                {stats.expired > 0 && <div>• 有 {stats.expired} 种焊材已过期，需要及时处理</div>}
                {stats.expiring > 0 && <div>• 有 {stats.expiring} 种焊材即将过期，请尽快使用</div>}
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
            key: 'materials',
            label: '焊材列表',
            children: (
              <div>
                {/* 工具栏 */}
                <Card className="mb-4">
                  <div className="flex justify-between items-center">
                    <Space size="middle">
                      <Search
                        placeholder="搜索焊材名称、编号、类别、规格、品牌"
                        allowClear
                        enterButton={<SearchOutlined />}
                        style={{ width: 350 }}
                        onSearch={handleSearch}
                        onChange={(e) => !e.target.value && handleSearch('')}
                      />
                      <Select
                        placeholder="类别筛选"
                        style={{ width: 120 }}
                        onChange={handleCategoryFilter}
                        defaultValue="all"
                      >
                        <Option value="all">全部类别</Option>
                        <Option value="焊条">焊条</Option>
                        <Option value="焊丝">焊丝</Option>
                        <Option value="焊剂">焊剂</Option>
                        <Option value="保护气体">保护气体</Option>
                      </Select>
                      <Select
                        placeholder="状态筛选"
                        style={{ width: 120 }}
                        onChange={handleStatusFilter}
                        defaultValue="all"
                      >
                        <Option value="all">全部状态</Option>
                        <Option value="in_stock">库存正常</Option>
                        <Option value="low_stock">库存不足</Option>
                        <Option value="out_of_stock">缺货</Option>
                        <Option value="expired">已过期</Option>
                      </Select>
                    </Space>

                    <Space>
                      <Button icon={<ImportOutlined />}>批量导入</Button>
                      <Button icon={<ExportOutlined />}>导出数据</Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/materials/create')}
                      >
                        新增焊材
                      </Button>
                    </Space>
                  </div>
                </Card>

                {/* 焊材列表表格 */}
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
              </div>
            ),
          },
          {
            key: 'suppliers',
            label: '供应商管理',
            children: (
              <Card>
                <SupplierManagement />
              </Card>
            ),
          },
          {
            key: 'calculator',
            label: '焊材计算',
            children: (
              <Card>
                <MaterialCalculator materials={materials} />
              </Card>
            ),
          },
          {
            key: 'transactions',
            label: '库存流水',
            children: (
              <Card>
                <StockTransactions />
              </Card>
            ),
          },
        ]}
      />

      {/* 焊材详情/编辑/入库/出库模态框 */}
      <Modal
        title={
          modalType === 'view' ? '焊材详情' :
          modalType === 'edit' ? '编辑焊材' :
          modalType === 'inbound' ? '入库操作' :
          modalType === 'outbound' ? '出库操作' :
          '新增焊材'
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
              {modalType === 'inbound' ? '确认入库' :
               modalType === 'outbound' ? '确认出库' :
               modalType === 'edit' ? '更新' : '创建'}
            </Button>,
          ]
        }
        width={modalType === 'view' ? 900 : 800}
      >
        {modalType === 'view' && currentMaterial && (
          <div>
            <Descriptions title="基本信息" column={2} bordered>
              <Descriptions.Item label="焊材名称">{currentMaterial.materialName}</Descriptions.Item>
              <Descriptions.Item label="焊材编号">{currentMaterial.materialCode}</Descriptions.Item>
              <Descriptions.Item label="类别">{currentMaterial.category}</Descriptions.Item>
              <Descriptions.Item label="规格">{currentMaterial.specification}</Descriptions.Item>
              <Descriptions.Item label="品牌">{currentMaterial.brand}</Descriptions.Item>
              <Descriptions.Item label="制造商">{currentMaterial.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="批号">{currentMaterial.batchNumber}</Descriptions.Item>
              <Descriptions.Item label="质量证书">{currentMaterial.qualityCertificate}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="库存信息" column={2} bordered>
              <Descriptions.Item label="当前库存">
                {currentMaterial.currentStock} {currentMaterial.unit}
              </Descriptions.Item>
              <Descriptions.Item label="最小库存">{currentMaterial.minStock} {currentMaterial.unit}</Descriptions.Item>
              <Descriptions.Item label="最大库存">{currentMaterial.maxStock} {currentMaterial.unit}</Descriptions.Item>
              <Descriptions.Item label="存放位置">{currentMaterial.location}</Descriptions.Item>
              <Descriptions.Item label="单价">¥{currentMaterial.unitPrice}/{currentMaterial.unit}</Descriptions.Item>
              <Descriptions.Item label="总价">¥{currentMaterial.totalPrice.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="库存状态">
                <Tag color={getStatusConfig(currentMaterial.status).color}>
                  {getStatusConfig(currentMaterial.status).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="储存条件">{currentMaterial.storageCondition}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="供应商信息" column={2} bordered>
              <Descriptions.Item label="供应商">{currentMaterial.supplier}</Descriptions.Item>
              <Descriptions.Item label="采购日期">{currentMaterial.purchaseDate}</Descriptions.Item>
              <Descriptions.Item label="到期日期">{currentMaterial.expiryDate}</Descriptions.Item>
              <Descriptions.Item label="最后入库">{currentMaterial.lastInboundDate}</Descriptions.Item>
              <Descriptions.Item label="最后出库">{currentMaterial.lastOutboundDate}</Descriptions.Item>
              <Descriptions.Item label="备注">{currentMaterial.notes}</Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {modalType === 'inbound' && currentMaterial && (
          <div>
            <Alert
              message="入库操作"
              description={`当前焊材：${currentMaterial.materialName}，当前库存：${currentMaterial.currentStock} ${currentMaterial.unit}`}
              type="info"
              showIcon
              className="mb-4"
            />
            <Form form={form} layout="vertical">
              <Form.Item
                name="quantity"
                label="入库数量"
                rules={[{ required: true, message: '请输入入库数量' }]}
              >
                <InputNumber
                  placeholder="请输入入库数量"
                  style={{ width: '100%' }}
                  min={1}
                  addonAfter={currentMaterial.unit}
                />
              </Form.Item>
              <Form.Item
                name="reason"
                label="入库原因"
                rules={[{ required: true, message: '请输入入库原因' }]}
              >
                <TextArea rows={3} placeholder="请输入入库原因" />
              </Form.Item>
            </Form>
          </div>
        )}

        {modalType === 'outbound' && currentMaterial && (
          <div>
            <Alert
              message="出库操作"
              description={`当前焊材：${currentMaterial.materialName}，当前库存：${currentMaterial.currentStock} ${currentMaterial.unit}`}
              type="warning"
              showIcon
              className="mb-4"
            />
            <Form form={form} layout="vertical">
              <Form.Item
                name="quantity"
                label="出库数量"
                rules={[
                  { required: true, message: '请输入出库数量' },
                  {
                    validator: (_, value) => {
                      if (value > currentMaterial.currentStock) {
                        return Promise.reject('出库数量不能超过当前库存')
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <InputNumber
                  placeholder="请输入出库数量"
                  style={{ width: '100%' }}
                  min={1}
                  max={currentMaterial.currentStock}
                  addonAfter={currentMaterial.unit}
                />
              </Form.Item>
              <Form.Item
                name="reason"
                label="出库原因"
                rules={[{ required: true, message: '请输入出库原因' }]}
              >
                <TextArea rows={3} placeholder="请输入出库原因" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

// 供应商管理组件
const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        name: '天津大桥焊材集团',
        contact: '张经理',
        phone: '022-12345678',
        email: 'zhang@daqiao.com',
        address: '天津市滨海新区',
        businessLicense: 'BL20230001',
        qualityCertification: 'ISO 9001',
        rating: 4.8,
        cooperationYears: 5,
        totalPurchases: 1250000,
        lastPurchaseDate: '2023-12-15',
        paymentTerms: '月结30天',
        deliveryTerms: '交货期3-5天',
        status: 'active',
        materials: ['J422焊条', 'J507焊条', '各种焊丝'],
      },
      {
        id: '2',
        name: '天津金桥焊材集团',
        contact: '李总',
        phone: '022-87654321',
        email: 'li@jinqiao.com',
        address: '天津市北辰区',
        businessLicense: 'BL20230002',
        qualityCertification: 'ISO 9001',
        rating: 4.6,
        cooperationYears: 3,
        totalPurchases: 860000,
        lastPurchaseDate: '2023-11-20',
        paymentTerms: '月结30天',
        deliveryTerms: '交货期2-4天',
        status: 'active',
        materials: ['ER50-6焊丝', '不锈钢焊丝'],
      },
    ]
    setSuppliers(mockSuppliers)
  }, [])

  const handleAddSupplier = () => {
    setSelectedSupplier(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    form.setFieldsValue(supplier)
    setModalVisible(true)
  }

  const handleSaveSupplier = async () => {
    try {
      const values = await form.validateFields()
      if (selectedSupplier) {
        setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? { ...s, ...values } : s))
        message.success('更新成功')
      } else {
        const newSupplier: Supplier = {
          ...values,
          id: Date.now().toString(),
          totalPurchases: 0,
          cooperationYears: 0,
          rating: 0,
          lastPurchaseDate: '',
          status: 'active',
          materials: [],
        }
        setSuppliers([...suppliers, newSupplier])
        message.success('添加成功')
      }
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const columns = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '合作年限',
      dataIndex: 'cooperationYears',
      key: 'cooperationYears',
      render: (years: number) => `${years}年`,
    },
    {
      title: '累计采购',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div>
          <span>{rating}</span>
          <span className="text-yellow-500 ml-1">★</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Supplier) => (
        <Space>
          <Button type="link" onClick={() => handleEditSupplier(record)}>
            编辑
          </Button>
          <Button type="link" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Title level={4}>供应商管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSupplier}>
          添加供应商
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={suppliers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={selectedSupplier ? '编辑供应商' : '添加供应商'}
        open={modalVisible}
        onOk={handleSaveSupplier}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="供应商名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact" label="联系人" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱" rules={[{ type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="businessLicense" label="营业执照号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qualityCertification" label="质量认证">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="paymentTerms" label="付款条件">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="deliveryTerms" label="交货条件">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

// 焊材计算组件
const MaterialCalculator: React.FC<{ materials: MaterialRecord[] }> = ({ materials }) => {
  const [form] = Form.useForm()
  const [calculationResult, setCalculationResult] = useState<any>(null)

  const handleCalculate = async () => {
    try {
      const values = await form.validateFields()
      const { weldType, materialThickness, weldLength, materialType, efficiency } = values

      // 焊材用量计算逻辑
      const getConsumptionRate = (type: string, thickness: number) => {
        const rates = {
          'SMAW': thickness <= 3 ? 0.08 : thickness <= 10 ? 0.12 : 0.18,
          'GMAW': thickness <= 3 ? 0.06 : thickness <= 10 ? 0.09 : 0.14,
          'GTAW': thickness <= 3 ? 0.04 : thickness <= 10 ? 0.06 : 0.10,
          'FCAW': thickness <= 3 ? 0.10 : thickness <= 10 ? 0.14 : 0.20,
        }
        return rates[type as keyof typeof rates] || 0.1
      }

      const consumptionRate = getConsumptionRate(weldType, materialThickness)
      const requiredWeight = (weldLength * materialThickness * consumptionRate) / (efficiency / 100)

      // 找到合适的材料
      const suitableMaterial = materials.find(m =>
        m.category === (weldType === 'SMAW' ? '焊条' : '焊丝') && m.status === 'in_stock'
      )

      const result = {
        requiredWeight: requiredWeight.toFixed(2),
        materialPrice: suitableMaterial ? suitableMaterial.unitPrice : 0,
        totalCost: suitableMaterial ? (requiredWeight * suitableMaterial.unitPrice).toFixed(2) : 0,
        suitableMaterial: suitableMaterial ? suitableMaterial.materialName : '无合适材料',
        recommendation: requiredWeight > (suitableMaterial?.currentStock || 0) ? '库存不足，建议补货' : '库存充足',
      }

      setCalculationResult(result)
    } catch (error) {
      message.error('计算失败，请检查输入参数')
    }
  }

  return (
    <div>
      <Title level={4} className="mb-4">焊材用量计算</Title>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="计算参数">
            <Form form={form} layout="vertical">
              <Form.Item name="weldType" label="焊接方法" rules={[{ required: true }]}>
                <Select placeholder="选择焊接方法">
                  <Option value="SMAW">焊条电弧焊 (SMAW)</Option>
                  <Option value="GMAW">熔化极气体保护焊 (GMAW)</Option>
                  <Option value="GTAW">钨极氩弧焊 (GTAW)</Option>
                  <Option value="FCAW">药芯焊丝电弧焊 (FCAW)</Option>
                </Select>
              </Form.Item>

              <Form.Item name="materialThickness" label="材料厚度 (mm)" rules={[{ required: true }]}>
                <InputNumber min={0.1} max={100} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="weldLength" label="焊缝长度 (m)" rules={[{ required: true }]}>
                <InputNumber min={0.1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="materialType" label="材料类型" rules={[{ required: true }]}>
                <Select placeholder="选择材料类型">
                  <Option value="carbon">碳钢</Option>
                  <Option value="stainless">不锈钢</Option>
                  <Option value="aluminum">铝合金</Option>
                  <Option value="alloy">合金钢</Option>
                </Select>
              </Form.Item>

              <Form.Item name="efficiency" label="焊接效率 (%)" initialValue={85}>
                <InputNumber min={50} max={100} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" onClick={handleCalculate} block>
                  计算用量
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="计算结果">
            {calculationResult ? (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="预计用量">{calculationResult.requiredWeight} kg</Descriptions.Item>
                <Descriptions.Item label="推荐材料">{calculationResult.suitableMaterial}</Descriptions.Item>
                <Descriptions.Item label="材料单价">¥{calculationResult.materialPrice}/kg</Descriptions.Item>
                <Descriptions.Item label="预估成本">¥{calculationResult.totalCost}</Descriptions.Item>
                <Descriptions.Item label="库存建议">{calculationResult.recommendation}</Descriptions.Item>
              </Descriptions>
            ) : (
              <div className="text-center text-gray-500 py-8">
                请输入计算参数并点击计算
              </div>
            )}
          </Card>

          <Card title="成本分析" className="mt-4">
            <div className="text-center text-gray-500 py-4">
              成本分析和优化建议功能开发中...
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

// 库存流水组件
const StockTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const mockTransactions: StockTransaction[] = [
      {
        id: '1',
        materialId: '1',
        materialName: 'J422焊条',
        materialCode: 'WELD001',
        transactionType: 'inbound',
        quantity: 100,
        unit: 'kg',
        unitPrice: 12.5,
        totalPrice: 1250,
        balance: 850,
        operator: '张三',
        department: '采购部',
        reason: '生产需要补货',
        transactionDate: '2024-01-15 09:30:00',
        reference: 'PO202401001',
        batchNumber: 'B20231215001',
      },
      {
        id: '2',
        materialId: '1',
        materialName: 'J422焊条',
        materialCode: 'WELD001',
        transactionType: 'outbound',
        quantity: 50,
        unit: 'kg',
        unitPrice: 12.5,
        totalPrice: 625,
        balance: 800,
        operator: '李四',
        department: '生产一部',
        reason: '项目A生产使用',
        transactionDate: '2024-01-16 14:20:00',
        reference: 'WO202401002',
        batchNumber: 'B20231215001',
      },
    ]
    setTransactions(mockTransactions)
  }, [])

  const columns = [
    {
      title: '时间',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '焊材信息',
      key: 'material',
      render: (_, record: StockTransaction) => (
        <div>
          <div>{record.materialName}</div>
          <div className="text-xs text-gray-500">{record.materialCode}</div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type: string) => (
        <Tag color={type === 'inbound' ? 'green' : 'red'}>
          {type === 'inbound' ? '入库' : '出库'}
        </Tag>
      ),
    },
    {
      title: '数量',
      key: 'quantity',
      render: (_, record: StockTransaction) => (
        <div>
          <div>{record.quantity} {record.unit}</div>
          <div className="text-sm text-gray-500">单价: ¥{record.unitPrice}</div>
        </div>
      ),
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '结余',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number, record: StockTransaction) => (
        <div>{balance} {record.unit}</div>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '事由',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '单号',
      dataIndex: 'reference',
      key: 'reference',
    },
  ]

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Title level={4}>库存流水记录</Title>
        <Space>
          <Button icon={<ExportOutlined />}>导出记录</Button>
          <Button icon={<CalendarOutlined />}>选择日期范围</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  )
}

export default MaterialsList