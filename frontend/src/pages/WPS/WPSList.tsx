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
  Dropdown,
  Empty,
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
  FileTextOutlined,
  MoreOutlined,
  CopyOutlined,
  UploadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  ExportOutlined,
  PrinterOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { WPSRecord, WPSStatus, PaginatedResponse } from '@/types'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography
const { Search } = Input
const { RangePicker } = DatePicker
const { Option } = Select

const WPSList: React.FC = () => {
  const navigate = useNavigate()
  const { checkPermission, canCreateMore, user } = useAuthStore()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<WPSStatus | ''>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  // 计算WPS统计数据
  const getWPSStats = (data: WPSRecord[] = []) => {
    const stats = {
      total: data.length,
      approved: data.filter(item => item.status === 'approved').length,
      review: data.filter(item => item.status === 'review').length,
      draft: data.filter(item => item.status === 'draft').length,
      highPriority: data.filter(item => item.priority === 'high' || item.priority === 'urgent').length,
    }
    return stats
  }

  // 模拟API调用
  const fetchWPSList = async ({
    page = 1,
    pageSize = 20,
    search = '',
    status = '',
    dateRange = null,
  }: {
    page?: number
    pageSize?: number
    search?: string
    status?: WPSStatus | ''
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null
  }) => {
    // 这里应该调用实际的API
    // 模拟数据
    const mockData: WPSRecord[] = [
      {
        id: '1',
        wps_number: 'WPS-2024-001',
        title: '碳钢管道对接焊工艺',
        status: 'approved',
        priority: 'normal',
        standard: 'AWS D1.1',
        base_material: 'Q235',
        filler_material: 'E7018',
        welding_process: 'SMAW',
        joint_type: 'Butt Joint',
        welding_position: '1G',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        user_id: 'user1',
        view_count: 25,
        download_count: 5,
      },
      {
        id: '2',
        wps_number: 'WPS-2024-002',
        title: '不锈钢容器角焊缝工艺',
        status: 'review',
        priority: 'high',
        standard: 'ASME Section IX',
        base_material: '304',
        filler_material: 'ER308L',
        welding_process: 'GTAW',
        joint_type: 'T-Joint',
        welding_position: '2F',
        created_at: '2024-01-14T15:20:00Z',
        updated_at: '2024-01-15T09:10:00Z',
        user_id: 'user1',
        view_count: 18,
        download_count: 2,
      },
      {
        id: '3',
        wps_number: 'WPS-2024-003',
        title: '铝合金薄板对接焊工艺',
        status: 'draft',
        priority: 'low',
        standard: 'ISO 15614-1',
        base_material: '5052',
        filler_material: 'ER5356',
        welding_process: 'GMAW',
        joint_type: 'Butt Joint',
        welding_position: 'PA',
        created_at: '2024-01-13T08:45:00Z',
        updated_at: '2024-01-13T08:45:00Z',
        user_id: 'user1',
        view_count: 5,
        download_count: 0,
      },
    ]

    // 模拟过滤
    let filteredData = mockData
    if (search) {
      filteredData = filteredData.filter(item =>
        item.wps_number.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (status) {
      filteredData = filteredData.filter(item => item.status === status)
    }
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = dayjs(item.created_at)
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
    data: wpsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['wpsList', pagination.current, pagination.pageSize, searchText, statusFilter, dateRange],
    queryFn: () =>
      fetchWPSList({
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
      title: 'WPS编号',
      dataIndex: 'wps_number',
      key: 'wps_number',
      width: 150,
      render: (text: string, record: WPSRecord) => (
        <Button type="link" onClick={() => navigate(`/wps/${record.id}`)}>
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
      render: (status: WPSStatus) => {
        const statusConfig = {
          draft: { color: 'default', text: '草稿' },
          review: { color: 'processing', text: '审核中' },
          approved: { color: 'success', text: '已批准' },
          rejected: { color: 'error', text: '已拒绝' },
          archived: { color: 'default', text: '已归档' },
          obsolete: { color: 'warning', text: '已过时' },
        }
        const config = statusConfig[status] || statusConfig.draft
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const priorityConfig = {
          low: { color: 'default', text: '低' },
          normal: { color: 'blue', text: '普通' },
          high: { color: 'orange', text: '高' },
          urgent: { color: 'red', text: '紧急' },
        }
        const config = priorityConfig[priority] || priorityConfig.normal
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '标准',
      dataIndex: 'standard',
      key: 'standard',
      width: 120,
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
      render: (_, record: WPSRecord) => (
        <Space>
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/wps/${record.id}`)}
            />
          </Tooltip>
          {checkPermission('wps.update') && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/wps/${record.id}/edit`)}
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
          {checkPermission('wps.delete') && (
            <Tooltip title="删除">
              <Popconfirm
                title="确定要删除这个WPS吗？"
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
  const handleStatusFilter = (value: WPSStatus | '') => {
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
  const handleDownload = (record: WPSRecord) => {
    message.info(`开始下载 ${record.wps_number}`)
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

  // 获取WPS配额
  const getWPSQuota = (membershipTier: string) => {
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

  // 处理复制
  const handleCopy = (record: WPSRecord) => {
    navigate(`/wps/create?copyFrom=${record.id}`)
  }

  // 处理导出PDF
  const handleExportPDF = (record: WPSRecord) => {
    if (!checkPermission('wps.export_pdf')) {
      message.warning('您的会员等级不支持导出PDF功能')
      return
    }
    message.info(`正在导出 ${record.wps_number} 的PDF文件`)
    // 这里应该调用实际的导出API
  }

  // 处理导出Excel
  const handleExportExcel = (record: WPSRecord) => {
    if (!checkPermission('wps.export_excel')) {
      message.warning('您的会员等级不支持导出Excel功能')
      return
    }
    message.info(`正在导出 ${record.wps_number} 的Excel文件`)
    // 这里应该调用实际的导出API
  }

  // 处理打印
  const handlePrint = (record: WPSRecord) => {
    message.info(`正在准备打印 ${record.wps_number}`)
    window.open(`/wps/${record.id}/print`)
  }

  // 处理查看历史版本
  const handleViewHistory = (record: WPSRecord) => {
    if (!checkPermission('wps.version_control')) {
      message.warning('您的会员等级不支持版本控制功能')
      return
    }
    Modal.info({
      title: `${record.wps_number} - 版本历史`,
      content: (
        <div>
          <p>当前版本: {record.version}</p>
          <p>创建时间: {dayjs(record.created_at).format('YYYY-MM-DD HH:mm')}</p>
          <p>最后更新: {dayjs(record.updated_at).format('YYYY-MM-DD HH:mm')}</p>
        </div>
      ),
      width: 600,
    })
  }

  // 处理导入
  const handleImport = () => {
    if (!checkPermission('wps.import')) {
      message.warning('您的会员等级不支持导入功能')
      return
    }
    Modal.info({
      title: '导入Excel文件',
      content: (
        <div>
          <p>请选择要导入的Excel文件</p>
          <p>支持的格式: .xlsx, .xls</p>
          <p>文件大小限制: 10MB</p>
        </div>
      ),
      width: 600,
    })
  }

  // 处理导出全部
  const handleExportAll = () => {
    if (!checkPermission('wps.export_all')) {
      message.warning('您的会员等级不支持批量导出功能')
      return
    }
    message.info('正在导出所有WPS记录')
  }

  // 处理批量导出
  const handleBatchExport = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要导出的记录')
      return
    }
    message.info(`正在导出选中的 ${selectedRowKeys.length} 条记录`)
  }

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录')
      return
    }
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条WPS记录吗？删除后将无法恢复。`,
      okText: '确定删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        message.success('批量删除成功')
        setSelectedRowKeys([])
        refetch()
      },
    })
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

  // 获取更多操作菜单项
  const getMoreActions = (record: WPSRecord) => [
    {
      key: 'copy',
      label: '复制WPS',
      icon: <CopyOutlined />,
      onClick: () => handleCopy(record),
    },
    {
      key: 'export-pdf',
      label: '导出PDF',
      icon: <FilePdfOutlined />,
      onClick: () => handleExportPDF(record),
    },
    {
      key: 'export-excel',
      label: '导出Excel',
      icon: <FileExcelOutlined />,
      onClick: () => handleExportExcel(record),
    },
    {
      key: 'print',
      label: '打印',
      icon: <PrinterOutlined />,
      onClick: () => handlePrint(record),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'view-history',
      label: '查看历史版本',
      icon: <FileTextOutlined />,
      onClick: () => handleViewHistory(record),
    },
  ]

  // 获取批量操作菜单项
  const getBatchActions = () => [
    {
      key: 'export-selected',
      label: '导出选中',
      icon: <ExportOutlined />,
      onClick: () => handleBatchExport(),
    },
    {
      key: 'delete-selected',
      label: '删除选中',
      icon: <DeleteOutlined />,
      onClick: () => handleBatchDelete(),
      danger: true,
    },
  ]

  return (
    <div className="wps-list-container">
      <div className="page-header">
        <div className="page-title">
          <Title level={2}>WPS管理</Title>
          <Text type="secondary">
            焊接工艺规程 (Welding Procedure Specification) 管理
          </Text>
        </div>
        <Space>
          <Button
            icon={<UploadOutlined />}
            onClick={() => handleImport()}
          >
            导入Excel
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={() => handleExportAll()}
          >
            导出全部
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      {wpsData?.data?.items && (
        <Row gutter={[16, 16]} className="stats-cards">
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="总计"
                value={getWPSStats(wpsData.data.items).total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="已批准"
                value={getWPSStats(wpsData.data.items).approved}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="审核中"
                value={getWPSStats(wpsData.data.items).review}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="高优先级"
                value={getWPSStats(wpsData.data.items).highPriority}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#f5222d' }}
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
            message={`WPS配额使用情况: ${wpsData?.data?.total || 0}/${getWPSQuota(tier)}`}
            description={
              <Progress
                percent={((wpsData?.data?.total || 0) / getWPSQuota(tier)) * 100}
                status={
                  ((wpsData?.data?.total || 0) / getWPSQuota(tier)) >= 0.8
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

      <Card className="wps-table-card">
        {/* 搜索和筛选区域 */}
        <Row gutter={[16, 16]} className="search-filters">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索WPS编号或标题"
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
              <Option value="review">审核中</Option>
              <Option value="approved">已批准</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="archived">已归档</Option>
              <Option value="obsolete">已过时</Option>
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
                onClick={() => navigate('/wps/create')}
                disabled={!canCreateMore('wps', wpsData?.data?.total || 0)}
              >
                创建WPS
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
                <Text>已选择 {selectedRowKeys.length} 项</Text>
                <Button onClick={() => handleBatchOperation('导出')}>
                  批量导出
                </Button>
                {checkPermission('wps.delete') && (
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
          dataSource={wpsData?.data?.items}
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

export default WPSList