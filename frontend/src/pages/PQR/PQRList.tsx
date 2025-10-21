import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Button,
  Space,
  Typography,
  Input,
  Select,
  DatePicker,
  Tag,
  Tooltip,
  Modal,
  message,
  Row,
  Col,
  Popconfirm,
  Badge,
  Statistic,
  Progress,
  Alert,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExperimentOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { PQRRecord, PQRStatus, PaginatedResponse } from '@/types'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography
const { Search } = Input
const { RangePicker } = DatePicker
const { Option } = Select

const PQRList: React.FC = () => {
  const navigate = useNavigate()
  const { checkPermission, canCreateMore, user } = useAuthStore()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<PQRStatus | ''>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  // 模拟API调用
  const fetchPQRList = async ({
    page = 1,
    pageSize = 20,
    search = '',
    status = '',
    dateRange = null,
  }: {
    page?: number
    pageSize?: number
    search?: string
    status?: PQRStatus | ''
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null
  }) => {
    // 模拟数据
    const mockData: PQRRecord[] = [
      {
        id: '1',
        pqr_number: 'PQR-2024-001',
        title: '管道对接焊工艺评定',
        status: 'qualified',
        test_date: '2024-01-10',
        test_organization: '第三方检测机构',
        base_material: 'Q235',
        filler_material: 'E7018',
        welding_process: 'SMAW',
        created_at: '2024-01-10T16:45:00Z',
        updated_at: '2024-01-10T16:45:00Z',
        user_id: 'user1',
      },
      {
        id: '2',
        pqr_number: 'PQR-2024-002',
        title: '不锈钢角焊缝工艺评定',
        status: 'pending',
        test_date: '2024-01-12',
        test_organization: '内部检测',
        base_material: '304',
        filler_material: 'ER308L',
        welding_process: 'GTAW',
        created_at: '2024-01-12T14:30:00Z',
        updated_at: '2024-01-12T14:30:00Z',
        user_id: 'user1',
      },
      {
        id: '3',
        pqr_number: 'PQR-2024-003',
        title: '铝合金薄板对接焊工艺评定',
        status: 'failed',
        test_date: '2024-01-08',
        test_organization: '第三方检测机构',
        base_material: '5052',
        filler_material: 'ER5356',
        welding_process: 'GMAW',
        created_at: '2024-01-08T11:20:00Z',
        updated_at: '2024-01-08T11:20:00Z',
        user_id: 'user1',
      },
    ]

    // 模拟过滤
    let filteredData = mockData
    if (search) {
      filteredData = filteredData.filter(item =>
        item.pqr_number.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (status) {
      filteredData = filteredData.filter(item => item.status === status)
    }
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = dayjs(item.test_date)
        return itemDate.isAfter(dateRange[0]) && itemDate.isBefore(dateRange[1])
      })
    }

    // 模拟分页
    const total = filteredData.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = filteredData.slice(startIndex, endIndex)

    return {
      success: true,
      data: {
        items,
        total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(total / pageSize),
        has_next: page < Math.ceil(total / pageSize),
        has_prev: page > 1,
      },
    }
  }

  // 使用React Query获取数据
  const {
    data: pqrData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['pqrList', pagination.current, pagination.pageSize, searchText, statusFilter, dateRange],
    queryFn: () =>
      fetchPQRList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
        status: statusFilter,
        dateRange,
      }),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setPagination(prev => ({
          ...prev,
          total: data.data?.total || 0,
        }))
      }
    },
  })

  // 表格列配置
  const columns = [
    {
      title: 'PQR编号',
      dataIndex: 'pqr_number',
      key: 'pqr_number',
      width: 150,
      render: (text: string, record: PQRRecord) => (
        <Button type="link" onClick={() => navigate(`/pqr/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PQRStatus) => {
        const statusConfig = {
          pending: { color: 'processing', text: '待处理' },
          qualified: { color: 'success', text: '合格' },
          failed: { color: 'error', text: '不合格' },
        }
        const config = statusConfig[status] || statusConfig.pending
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '测试日期',
      dataIndex: 'test_date',
      key: 'test_date',
      width: 120,
      render: (date: string) => date && dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '测试机构',
      dataIndex: 'test_organization',
      key: 'test_organization',
      width: 150,
      ellipsis: true,
    },
    {
      title: '母材',
      dataIndex: 'base_material',
      key: 'base_material',
      width: 100,
    },
    {
      title: '焊接方法',
      dataIndex: 'welding_process',
      key: 'welding_process',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_, record: PQRRecord) => (
        <Space>
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/pqr/${record.id}`)}
            />
          </Tooltip>
          {checkPermission('pqr.update') && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/pqr/${record.id}/edit`)}
              />
            </Tooltip>
          )}
          <Tooltip title="下载">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          {checkPermission('pqr.delete') && (
            <Tooltip title="删除">
              <Popconfirm
                title="确定要删除这个PQR吗？"
                description="删除后将无法恢复"
                onConfirm={() => handleDelete(record.id)}
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 处理状态筛选
  const handleStatusFilter = (value: PQRStatus | '') => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 处理日期范围筛选
  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    setDateRange(dates)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 处理表格分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }

  // 处理行选择
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  // 处理下载
  const handleDownload = (record: PQRRecord) => {
    message.info(`开始下载 ${record.pqr_number}`)
    // 这里应该调用实际的下载API
  }

  // 计算PQR统计数据
  const getPQRStats = (data: PQRRecord[] = []) => {
    const stats = {
      total: data.length,
      qualified: data.filter(item => item.status === 'qualified').length,
      pending: data.filter(item => item.status === 'pending').length,
      failed: data.filter(item => item.status === 'failed').length,
      thirdParty: data.filter(item => item.test_organization === '第三方检测机构').length,
    }
    return stats
  }

  // 获取PQR配额
  const getPQRQuota = (membershipTier: string) => {
    const quotaMap: Record<string, number> = {
      free: 10,
      personal_pro: 30,
      personal_advanced: 50,
      personal_flagship: 100,
      enterprise: 200,
      enterprise_pro: 400,
      enterprise_pro_max: 500,
    }
    return quotaMap[membershipTier] || 10
  }

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      // 这里应该调用实际的删除API
      message.success('删除成功')
      refetch()
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 处理批量操作
  const handleBatchOperation = async (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的记录')
      return
    }

    try {
      // 这里应该调用实际的批量操作API
      message.success(`${action}成功`)
      setSelectedRowKeys([])
      refetch()
    } catch (error) {
      message.error(`${action}失败`)
    }
  }

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  return (
    <div className="pqr-list-container">
      <div className="page-header">
        <div className="page-title">
          <Title level={2}>PQR管理</Title>
          <Text type="secondary">
            工艺评定记录 (Procedure Qualification Record) 管理
          </Text>
        </div>
      </div>

      {/* 统计卡片 */}
      {pqrData?.data?.items && (
        <Row gutter={[16, 16]} className="stats-cards">
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="总计"
                value={getPQRStats(pqrData.data.items).total}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="合格"
                value={getPQRStats(pqrData.data.items).qualified}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="待处理"
                value={getPQRStats(pqrData.data.items).pending}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="第三方检测"
                value={getPQRStats(pqrData.data.items).thirdParty}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 配额提醒 */}
      {(() => {
        const tier = (user as any)?.member_tier || user?.membership_tier || 'personal_free'
        return tier !== 'enterprise_pro_max' && (
          <Alert
            message={`PQR配额使用情况: ${pqrData?.data?.total || 0}/${getPQRQuota(tier)}`}
            description={
              <Progress
                percent={((pqrData?.data?.total || 0) / getPQRQuota(tier)) * 100}
                status={
                  ((pqrData?.data?.total || 0) / getPQRQuota(tier)) >= 0.8
                    ? 'exception'
                    : 'normal'
                }
              />
            }
            type="info"
            showIcon
            className="mb-4"
          />
        )
      })()}

      <Card>
        {/* 搜索和筛选区域 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索PQR编号或标题"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="筛选状态"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
            >
              <Option value="pending">待处理</Option>
              <Option value="qualified">合格</Option>
              <Option value="failed">不合格</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              size="large"
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/pqr/create')}
                disabled={!canCreateMore('pqr', pqrData?.data?.total || 0)}
              >
                创建PQR
              </Button>
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={() => refetch()}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 批量操作区域 */}
        {selectedRowKeys.length > 0 && (
          <Row className="mb-4">
            <Col span={24}>
              <Space>
                <span>已选择 {selectedRowKeys.length} 项</span>
                <Button onClick={() => handleBatchOperation('导出')}>
                  批量导出
                </Button>
                {checkPermission('pqr.delete') && (
                  <Popconfirm
                    title="确定要删除选中的记录吗？"
                    description="删除后将无法恢复"
                    onConfirm={() => handleBatchOperation('删除')}
                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button danger>批量删除</Button>
                  </Popconfirm>
                )}
              </Space>
            </Col>
          </Row>
        )}

        {/* 表格区域 */}
        <Table
          columns={columns}
          dataSource={pqrData?.data?.items}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: handleTableChange,
          }}
          loading={isLoading}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  )
}

export default PQRList