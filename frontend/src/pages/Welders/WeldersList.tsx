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
} from 'antd'
import { Text } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Welder, PaginatedResponse } from '@/types'
import { useAuthStore } from '@/store/authStore'

const { Title } = Typography
const { Search } = Input
const { RangePicker } = DatePicker
const { Option } = Select

const WeldersList: React.FC = () => {
  const navigate = useNavigate()
  const { checkPermission, canCreateMore } = useAuthStore()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  // 模拟API调用
  const fetchWeldersList = async ({
    page = 1,
    pageSize = 20,
    search = '',
    status = '',
    dateRange = null,
  }: {
    page?: number
    pageSize?: number
    search?: string
    status?: boolean | ''
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null
  }) => {
    // 模拟数据
    const mockData: Welder[] = [
      {
        id: '1',
        user_id: 'user1',
        welder_code: 'WLD-2024-001',
        full_name: '张三',
        id_number: '110101199001011234',
        phone: '13800138000',
        certification_number: 'GMAW-3G-2023-001',
        certification_level: '高级',
        certification_date: '2023-01-15',
        expiry_date: '2025-01-14',
        qualified_processes: ['GMAW', 'GTAW', 'SMAW'],
        is_active: true,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        user_id: 'user1',
        welder_code: 'WLD-2024-002',
        full_name: '李四',
        id_number: '110101199002022345',
        phone: '13900139000',
        certification_number: 'GTAW-6G-2022-002',
        certification_level: '中级',
        certification_date: '2022-03-20',
        expiry_date: '2024-03-19',
        qualified_processes: ['GTAW', 'FCAW'],
        is_active: true,
        created_at: '2024-01-14T15:20:00Z',
        updated_at: '2024-01-20T09:10:00Z',
      },
      {
        id: '3',
        user_id: 'user1',
        welder_code: 'WLD-2024-003',
        full_name: '王五',
        id_number: '110101199003033456',
        phone: '13700137000',
        certification_number: 'SMAW-2G-2021-003',
        certification_level: '初级',
        certification_date: '2021-05-10',
        expiry_date: '2023-05-09',
        qualified_processes: ['SMAW'],
        is_active: false,
        created_at: '2024-01-13T08:45:00Z',
        updated_at: '2024-01-13T08:45:00Z',
      },
    ]

    // 模拟过滤
    let filteredData = mockData
    if (search) {
      filteredData = filteredData.filter(item =>
        item.welder_code.toLowerCase().includes(search.toLowerCase()) ||
        item.full_name.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (status !== '') {
      filteredData = filteredData.filter(item => item.is_active === status)
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
    data: weldersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['weldersList', pagination.current, pagination.pageSize, searchText, statusFilter, dateRange],
    queryFn: () =>
      fetchWeldersList({
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
      title: '焊工编号',
      dataIndex: 'welder_code',
      key: 'welder_code',
      width: 150,
      render: (text: string, record: Welder) => (
        <Button type="link" onClick={() => navigate(`/welders/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 100,
    },
    {
      title: '身份证号',
      dataIndex: 'id_number',
      key: 'id_number',
      width: 180,
      render: (idNumber: string) => {
        // 隐藏中间部分身份证号
        if (idNumber && idNumber.length >= 10) {
          return `${idNumber.substring(0, 6)}********${idNumber.substring(idNumber.length - 4)}`
        }
        return idNumber
      },
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (phone: string) => {
        // 隐藏中间部分手机号
        if (phone && phone.length >= 7) {
          return `${phone.substring(0, 3)}****${phone.substring(phone.length - 4)}`
        }
        return phone
      },
    },
    {
      title: '证书编号',
      dataIndex: 'certification_number',
      key: 'certification_number',
      width: 180,
    },
    {
      title: '证书等级',
      dataIndex: 'certification_level',
      key: 'certification_level',
      width: 100,
      render: (level: string) => {
        const levelConfig: Record<string, { color: string; text: string }> = {
          '初级': { color: 'default', text: '初级' },
          '中级': { color: 'processing', text: '中级' },
          '高级': { color: 'success', text: '高级' },
          '技师': { color: 'warning', text: '技师' },
          '高级技师': { color: 'error', text: '高级技师' },
        }
        const config = levelConfig[level] || levelConfig['初级']
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '证书有效期',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 120,
      render: (expiryDate: string) => {
        const isExpired = dayjs(expiryDate).isBefore(dayjs())
        const isExpiringSoon = dayjs(expiryDate).diff(dayjs(), 'days') <= 30
        
        return (
          <Space>
            <Text>{dayjs(expiryDate).format('YYYY-MM-DD')}</Text>
            {isExpired && <Tag color="error">已过期</Tag>}
            {!isExpired && isExpiringSoon && <Tag color="warning">即将过期</Tag>}
          </Space>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '在职' : '离职'}
        </Tag>
      ),
    },
    {
      title: '资质工艺',
      dataIndex: 'qualified_processes',
      key: 'qualified_processes',
      width: 150,
      render: (processes: string[]) => (
        <Space wrap>
          {processes.map(process => (
            <Tag key={process} color="blue" style={{ fontSize: '12px' }}>
              {process}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_, record: Welder) => (
        <Space>
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/welders/${record.id}`)}
            />
          </Tooltip>
          {checkPermission('welders.update') && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/welders/${record.id}/edit`)}
              />
            </Tooltip>
          )}
          {checkPermission('welders.delete') && (
            <Tooltip title="删除">
              <Popconfirm
                title="确定要删除这个焊工吗？"
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
  const handleStatusFilter = (value: boolean | '') => {
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
    <div className="page-container">
      <div className="page-header">
        <Title level={2}>焊工管理</Title>
      </div>

      <Card>
        {/* 搜索和筛选区域 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索焊工编号或姓名"
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
              <Option value={true}>在职</Option>
              <Option value={false}>离职</Option>
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
                onClick={() => navigate('/welders/create')}
                disabled={!canCreateMore('welders', weldersData?.data?.total || 0)}
              >
                添加焊工
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
                {checkPermission('welders.delete') && (
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
          dataSource={weldersData?.data?.items}
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
          scroll={{ x: 1600 }}
        />
      </Card>
    </div>
  )
}

export default WeldersList