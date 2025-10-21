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
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { PPQRRecord, PPQRStatus, PaginatedResponse } from '@/types'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography
const { Search } = Input
const { RangePicker } = DatePicker
const { Option } = Select

const PPQRList: React.FC = () => {
  const navigate = useNavigate()
  const { checkPermission, canCreateMore, user } = useAuthStore()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<PPQRStatus | ''>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  // 模拟API调用
  const fetchPPQRList = async ({
    page = 1,
    pageSize = 20,
    search = '',
    status = '',
    dateRange = null,
  }: {
    page?: number
    pageSize?: number
    search?: string
    status?: PPQRStatus | ''
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null
  }) => {
    // 模拟数据
    const mockData: PPQRRecord[] = [
      {
        id: '1',
        ppqr_number: 'PPQR-2024-001',
        title: '高压容器对接焊预备工艺评定',
        status: 'approved',
        planned_test_date: '2024-02-10',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-20T14:15:00Z',
        user_id: 'user1',
      },
      {
        id: '2',
        ppqr_number: 'PPQR-2024-002',
        title: '不锈钢管道角焊缝预备工艺评定',
        status: 'under_review',
        planned_test_date: '2024-02-15',
        created_at: '2024-01-18T09:20:00Z',
        updated_at: '2024-01-22T16:45:00Z',
        user_id: 'user1',
      },
      {
        id: '3',
        ppqr_number: 'PPQR-2024-003',
        title: '铝合金薄板对接焊预备工艺评定',
        status: 'rejected',
        planned_test_date: '2024-02-20',
        created_at: '2024-01-20T11:45:00Z',
        updated_at: '2024-01-25T10:30:00Z',
        user_id: 'user1',
      },
    ]

    // 模拟过滤
    let filteredData = mockData
    if (search) {
      filteredData = filteredData.filter(item =>
        item.ppqr_number.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (status) {
      filteredData = filteredData.filter(item => item.status === status)
    }
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = dayjs(item.planned_test_date)
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
    data: ppqrData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['ppqrList', pagination.current, pagination.pageSize, searchText, statusFilter, dateRange],
    queryFn: () =>
      fetchPPQRList({
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
      title: 'pPQR编号',
      dataIndex: 'ppqr_number',
      key: 'ppqr_number',
      width: 150,
      render: (text: string, record: PPQRRecord) => (
        <Button type="link" onClick={() => navigate(`/ppqr/${record.id}`)}>
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
      render: (status: PPQRStatus) => {
        const statusConfig = {
          draft: { color: 'default', text: '草稿' },
          under_review: { color: 'processing', text: '审核中' },
          approved: { color: 'success', text: '已批准' },
          rejected: { color: 'error', text: '已拒绝' },
        }
        const config = statusConfig[status] || statusConfig.draft
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '计划测试日期',
      dataIndex: 'planned_test_date',
      key: 'planned_test_date',
      width: 120,
      render: (date: string) => date && dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_, record: PPQRRecord) => (
        <Space>
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/ppqr/${record.id}`)}
            />
          </Tooltip>
          {checkPermission('ppqr.update') && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/ppqr/${record.id}/edit`)}
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
          {checkPermission('ppqr.delete') && (
            <Tooltip title="删除">
              <Popconfirm
                title="确定要删除这个pPQR吗？"
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
  const handleStatusFilter = (value: PPQRStatus | '') => {
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

  // 计算pPQR统计数据
  const getPPQRStats = (data: PPQRRecord[] = []) => {
    const stats = {
      total: data.length,
      approved: data.filter(item => item.status === 'approved').length,
      under_review: data.filter(item => item.status === 'under_review').length,
      rejected: data.filter(item => item.status === 'rejected').length,
      upcoming: data.filter(item => {
        const testDate = dayjs(item.planned_test_date)
        const now = dayjs()
        return testDate.isAfter(now) && testDate.diff(now, 'days') <= 7
      }).length,
    }
    return stats
  }

  // 获取pPQR配额
  const getPPQRQuota = (membershipTier: string) => {
    const quotaMap: Record<string, number> = {
      free: 0,
      personal_pro: 30,
      personal_advanced: 50,
      personal_flagship: 100,
      enterprise: 200,
      enterprise_pro: 400,
      enterprise_pro_max: 500,
    }
    return quotaMap[membershipTier] || 0
  }

  // 处理下载
  const handleDownload = (record: PPQRRecord) => {
    message.info(`开始下载 ${record.ppqr_number}`)
    // 这里应该调用实际的下载API
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
    <div className="ppqr-list-container">
      <div className="page-header">
        <div className="page-title">
          <Title level={2}>pPQR管理</Title>
          <Text type="secondary">
            预备工艺评定记录 (Prepared Procedure Qualification Record) 管理
          </Text>
        </div>
      </div>

      {/* 统计卡片 */}
      {ppqrData?.data?.items && (
        <Row gutter={[16, 16]} className="stats-cards">
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="总计"
                value={getPPQRStats(ppqrData.data.items).total}
                prefix={<SettingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="已批准"
                value={getPPQRStats(ppqrData.data.items).approved}
                prefix={<SettingOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="审核中"
                value={getPPQRStats(ppqrData.data.items).under_review}
                prefix={<SettingOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="7日内测试"
                value={getPPQRStats(ppqrData.data.items).upcoming}
                prefix={<SettingOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 配额提醒 */}
      {(() => {
        const tier = (user as any)?.member_tier || user?.membership_tier || 'personal_free'
        const quota = getPPQRQuota(tier)
        return quota > 0 && tier !== 'enterprise_pro_max' && (
          <Alert
            message={`pPQR配额使用情况: ${ppqrData?.data?.total || 0}/${quota}`}
            description={
              <Progress
                percent={((ppqrData?.data?.total || 0) / quota) * 100}
                status={
                  ((ppqrData?.data?.total || 0) / quota) >= 0.8
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
              placeholder="搜索pPQR编号或标题"
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
              <Option value="draft">草稿</Option>
              <Option value="under_review">审核中</Option>
              <Option value="approved">已批准</Option>
              <Option value="rejected">已拒绝</Option>
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
                onClick={() => navigate('/ppqr/create')}
                disabled={!canCreateMore('ppqr', ppqrData?.data?.total || 0)}
              >
                创建pPQR
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
                {checkPermission('ppqr.delete') && (
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
          dataSource={ppqrData?.data?.items}
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

export default PPQRList