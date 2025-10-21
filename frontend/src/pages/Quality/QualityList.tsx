import React, { useState, useEffect, useRef } from 'react'
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
  Upload,
  Typography,
  Popconfirm,
  Spin,
  Empty,
} from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
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
  FileTextOutlined,
  UploadOutlined,
  CalendarOutlined,
  UserOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  BugOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography
const { Search } = Input
const { RangePicker } = DatePicker
const { Option } = Select

// 类型定义
type InspectionType = 'visual' | 'radiographic' | 'ultrasonic' | 'magnetic_particle' | 'liquid_penetrant' | 'destructive'
type InspectionResult = 'pass' | 'fail' | 'conditional'
type DefectSeverity = 'minor' | 'major' | 'critical'
type InspectionStatus = 'pending' | 'in_progress' | 'completed' | 'requires_follow_up' | 'cancelled'

interface QualityInspection {
  id: string
  user_id: string
  production_task_id: string
  inspection_number: string
  inspection_date: string
  next_inspection_date?: string
  inspector_name: string
  inspector_id: string
  inspection_type: InspectionType
  result: InspectionResult
  status: InspectionStatus
  defects_found: Record<string, any>
  corrective_actions: string
  follow_up_required: boolean
  follow_up_date?: string
  notes: string
  attachments: string[]
  created_at: string
  updated_at: string
}

interface DefectRecord {
  id: string
  inspection_id: string
  defect_type: string
  severity: DefectSeverity
  description: string
  location: string
  size: string
  quantity: number
  images: string[]
  repair_method: string
  repair_status: 'pending' | 'in_progress' | 'completed' | 'not_repairable'
  detected_by: string
  detected_date: string
}

interface QualityStatistics {
  total_inspections: number
  pending_inspections: number
  in_progress_inspections: number
  completed_inspections: number
  pass_rate: number
  defect_rate: number
  urgent_follow_ups: number
  overdue_inspections: number
}

const QualityList: React.FC = () => {
  const navigate = useNavigate()
  const { checkPermission, canCreateMore } = useAuthStore()
  const tableRef = useRef<any>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<InspectionType | ''>('')
  const [resultFilter, setResultFilter] = useState<InspectionResult | ''>('')
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | ''>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  // 模拟API调用 - 获取统计数据
  const fetchQualityStatistics = async (): Promise<QualityStatistics> => {
    return {
      total_inspections: 156,
      pending_inspections: 12,
      in_progress_inspections: 8,
      completed_inspections: 136,
      pass_rate: 92.5,
      defect_rate: 7.5,
      urgent_follow_ups: 5,
      overdue_inspections: 3,
    }
  }

  // 模拟API调用 - 获取质量检验列表
  const fetchQualityList = async ({
    page = 1,
    pageSize = 20,
    search = '',
    type = '',
    result = '',
    status = '',
    dateRange = null,
  }: {
    page?: number
    pageSize?: number
    search?: string
    type?: InspectionType | ''
    result?: InspectionResult | ''
    status?: InspectionStatus | ''
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null
  }) => {
    // 模拟数据
    const mockData: QualityInspection[] = [
      {
        id: '1',
        user_id: 'user1',
        production_task_id: '1',
        inspection_number: 'INS-2024-001',
        inspection_date: '2024-01-15',
        next_inspection_date: '2024-07-15',
        inspector_name: '张检验员',
        inspector_id: 'ins001',
        inspection_type: 'visual',
        result: 'pass',
        status: 'completed',
        defects_found: {},
        corrective_actions: '无',
        follow_up_required: false,
        notes: '焊缝外观良好，无可见缺陷',
        attachments: ['INS-2024-001-1.jpg', 'INS-2024-001-2.jpg'],
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        user_id: 'user1',
        production_task_id: '2',
        inspection_number: 'INS-2024-002',
        inspection_date: '2024-01-18',
        next_inspection_date: '2024-01-25',
        inspector_name: '李检验员',
        inspector_id: 'ins002',
        inspection_type: 'radiographic',
        result: 'fail',
        status: 'requires_follow_up',
        defects_found: {
          '裂纹': '长度5mm，深度2mm',
          '气孔': '直径1-2mm，数量3个',
        },
        corrective_actions: '对缺陷部位进行返修，重新进行检验',
        follow_up_required: true,
        follow_up_date: '2024-01-25',
        notes: '发现裂纹和气孔缺陷，需要立即返修',
        attachments: ['INS-2024-002-RT-1.jpg'],
        created_at: '2024-01-18T14:20:00Z',
        updated_at: '2024-01-18T14:20:00Z',
      },
      {
        id: '3',
        user_id: 'user1',
        production_task_id: '3',
        inspection_number: 'INS-2024-003',
        inspection_date: '2024-01-20',
        next_inspection_date: '2024-04-20',
        inspector_name: '王检验员',
        inspector_id: 'ins003',
        inspection_type: 'ultrasonic',
        result: 'conditional',
        status: 'completed',
        defects_found: {
          '未熔合': '深度1mm，长度10mm',
        },
        corrective_actions: '监控缺陷发展情况，定期复查',
        follow_up_required: true,
        follow_up_date: '2024-02-20',
        notes: '发现轻微未熔合，不影响使用，但需要监控',
        attachments: ['INS-2024-003-UT-1.jpg'],
        created_at: '2024-01-20T09:10:00Z',
        updated_at: '2024-01-20T09:10:00Z',
      },
      {
        id: '4',
        user_id: 'user1',
        production_task_id: '4',
        inspection_number: 'INS-2024-004',
        inspection_date: '2024-02-05',
        next_inspection_date: '2024-02-12',
        inspector_name: '赵检验员',
        inspector_id: 'ins004',
        inspection_type: 'magnetic_particle',
        result: 'pass',
        status: 'in_progress',
        defects_found: {},
        corrective_actions: '无',
        follow_up_required: false,
        notes: '磁粉检验进行中',
        attachments: [],
        created_at: '2024-02-05T11:15:00Z',
        updated_at: '2024-02-05T11:15:00Z',
      },
      {
        id: '5',
        user_id: 'user1',
        production_task_id: '5',
        inspection_number: 'INS-2024-005',
        inspection_date: '2024-02-08',
        next_inspection_date: '2024-02-15',
        inspector_name: '钱检验员',
        inspector_id: 'ins005',
        inspection_type: 'liquid_penetrant',
        result: 'fail',
        status: 'requires_follow_up',
        defects_found: {
          '表面裂纹': '长度3mm，深度0.5mm',
        },
        corrective_actions: '打磨去除裂纹，重新渗透检验',
        follow_up_required: true,
        follow_up_date: '2024-02-15',
        notes: '表面发现微小裂纹，需要处理',
        attachments: ['INS-2024-005-PT-1.jpg', 'INS-2024-005-PT-2.jpg'],
        created_at: '2024-02-08T16:30:00Z',
        updated_at: '2024-02-08T16:30:00Z',
      },
    ]

    // 模拟过滤
    let filteredData = mockData
    if (search) {
      filteredData = filteredData.filter(item =>
        item.inspection_number.toLowerCase().includes(search.toLowerCase()) ||
        item.inspector_name.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (type) {
      filteredData = filteredData.filter(item => item.inspection_type === type)
    }
    if (result) {
      filteredData = filteredData.filter(item => item.result === result)
    }
    if (status) {
      filteredData = filteredData.filter(item => item.status === status)
    }
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = dayjs(item.inspection_date)
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

  // 使用React Query获取统计数据
  const { data: statistics } = useQuery({
    queryKey: ['qualityStatistics'],
    queryFn: fetchQualityStatistics,
    refetchInterval: 30000, // 30秒刷新一次统计数据
  })

  // 使用React Query获取质量检验数据
  const {
    data: qualityData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['qualityList', pagination.current, pagination.pageSize, searchText, typeFilter, resultFilter, statusFilter, dateRange],
    queryFn: () =>
      fetchQualityList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
        type: typeFilter,
        result: resultFilter,
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

  // 辅助函数 - 获取检验状态配置
  const getStatusConfig = (status: InspectionStatus) => {
    const statusMap = {
      pending: { color: 'default', text: '待开始', icon: <ClockCircleOutlined /> },
      in_progress: { color: 'processing', text: '进行中', icon: <PlayCircleOutlined /> },
      completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      requires_follow_up: { color: 'warning', text: '需要跟进', icon: <ExclamationCircleOutlined /> },
      cancelled: { color: 'error', text: '已取消', icon: <StopOutlined /> },
    }
    return statusMap[status] || { color: 'default', text: status, icon: null }
  }

  // 辅助函数 - 获取检验类型配置
  const getInspectionTypeConfig = (type: InspectionType) => {
    const typeConfig: Record<InspectionType, { color: string; text: string }> = {
      visual: { color: 'blue', text: '外观检验' },
      radiographic: { color: 'green', text: '射线检验' },
      ultrasonic: { color: 'orange', text: '超声波检验' },
      magnetic_particle: { color: 'purple', text: '磁粉检验' },
      liquid_penetrant: { color: 'cyan', text: '渗透检验' },
      destructive: { color: 'red', text: '破坏性检验' },
    }
    return typeConfig[type] || { color: 'default', text: type }
  }

  // 辅助函数 - 获取检验结果配置
  const getResultConfig = (result: InspectionResult) => {
    const resultConfig: Record<InspectionResult, { color: string; text: string; icon: React.ReactNode }> = {
      pass: { color: 'success', text: '合格', icon: <CheckCircleOutlined /> },
      fail: { color: 'error', text: '不合格', icon: <CloseCircleOutlined /> },
      conditional: { color: 'warning', text: '有条件合格', icon: <ExclamationCircleOutlined /> },
    }
    return resultConfig[result] || resultConfig.pass
  }

  // 表格列配置
  const columns: ColumnsType<QualityInspection> = [
    {
      title: '检验编号',
      dataIndex: 'inspection_number',
      key: 'inspection_number',
      width: 150,
      fixed: 'left',
      render: (text: string, record: QualityInspection) => (
        <Button type="link" onClick={() => navigate(`/quality/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: '检验类型',
      dataIndex: 'inspection_type',
      key: 'inspection_type',
      width: 120,
      render: (type: InspectionType) => {
        const config = getInspectionTypeConfig(type)
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '检验状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: InspectionStatus) => {
        const config = getStatusConfig(status)
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: '检验结果',
      dataIndex: 'result',
      key: 'result',
      width: 120,
      render: (result: InspectionResult) => {
        const config = getResultConfig(result)
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: '检验日期',
      dataIndex: 'inspection_date',
      key: 'inspection_date',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '检验员',
      dataIndex: 'inspector_name',
      key: 'inspector_name',
      width: 100,
      render: (name: string, record: QualityInspection) => (
        <Space direction="vertical" size="small">
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.inspector_id}
          </Text>
        </Space>
      ),
    },
    {
      title: '生产任务',
      dataIndex: 'production_task_id',
      key: 'production_task_id',
      width: 150,
      render: (taskId: string) => {
        const taskNames: Record<string, string> = {
          '1': '压力容器筒体焊接',
          '2': '管道对接焊缝修复',
          '3': '不锈钢储罐焊接',
          '4': '热交换器管束焊接',
          '5': '储罐罐底焊接',
        }
        return (
          <Space direction="vertical" size="small">
            <Text>{taskNames[taskId] || '未知任务'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              任务ID: {taskId}
            </Text>
          </Space>
        )
      },
    },
    {
      title: '缺陷情况',
      dataIndex: 'defects_found',
      key: 'defects_found',
      width: 150,
      render: (defects: Record<string, any>) => {
        const defectCount = Object.keys(defects).length
        if (defectCount === 0) {
          return <Tag color="success">无缺陷</Tag>
        } else {
          return (
            <Space direction="vertical" size="small">
              <Badge count={defectCount} style={{ backgroundColor: '#f5222d' }} />
              <Text type="secondary">发现缺陷</Text>
            </Space>
          )
        }
      },
    },
    {
      title: '跟进行动',
      key: 'follow_up',
      width: 150,
      render: (_, record: QualityInspection) => {
        if (!record.follow_up_required) {
          return <Tag color="success">无需跟进</Tag>
        }

        const isOverdue = record.follow_up_date && dayjs(record.follow_up_date).isBefore(dayjs())
        const isDueSoon = record.follow_up_date && dayjs(record.follow_up_date).diff(dayjs(), 'days') <= 3

        return (
          <Space direction="vertical" size="small">
            <Tag color={isOverdue ? 'error' : isDueSoon ? 'warning' : 'processing'}>
              需要跟进
            </Tag>
            {record.follow_up_date && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                截止: {dayjs(record.follow_up_date).format('MM-DD')}
              </Text>
            )}
          </Space>
        )
      },
    },
    {
      title: '下次检验',
      dataIndex: 'next_inspection_date',
      key: 'next_inspection_date',
      width: 130,
      render: (date: string) => {
        if (!date) return '-'

        const isOverdue = dayjs(date).isBefore(dayjs())
        const isDueSoon = dayjs(date).diff(dayjs(), 'days') <= 7

        return (
          <Space direction="vertical" size="small">
            <Text>{dayjs(date).format('YYYY-MM-DD')}</Text>
            {isOverdue && <Tag color="error" style={{ fontSize: '11px' }}>已逾期</Tag>}
            {!isOverdue && isDueSoon && <Tag color="warning" style={{ fontSize: '11px' }}>即将到期</Tag>}
          </Space>
        )
      },
    },
    {
      title: '附件',
      dataIndex: 'attachments',
      key: 'attachments',
      width: 80,
      render: (attachments: string[]) => {
        if (attachments.length === 0) {
          return <Text type="secondary">-</Text>
        }
        return (
          <Space>
            <CameraOutlined />
            <Text>{attachments.length}</Text>
          </Space>
        )
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record: QualityInspection) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/quality/${record.id}`)}
            />
          </Tooltip>
          {checkPermission('quality.update') && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/quality/${record.id}/edit`)}
              />
            </Tooltip>
          )}
          <Tooltip title="更多操作">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'view-report',
                    label: '查看报告',
                    icon: <FileTextOutlined />,
                    onClick: () => navigate(`/quality/${record.id}/report`),
                  },
                  {
                    key: 'export',
                    label: '导出数据',
                    icon: <ExportOutlined />,
                    onClick: () => handleExport(record.id),
                  },
                  ...(checkPermission('quality.delete') ? [
                    {
                      type: 'divider',
                    },
                    {
                      key: 'delete',
                      label: '删除',
                      icon: <DeleteOutlined />,
                      danger: true,
                      onClick: () => handleDelete(record.id),
                    },
                  ] : []),
                ],
              }}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Tooltip>
        </Space>
      ),
    },
  ]

  // 处理函数
  const handleSearch = (value: string) => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleTypeFilter = (value: InspectionType | '') => {
    setTypeFilter(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleResultFilter = (value: InspectionResult | '') => {
    setResultFilter(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleStatusFilter = (value: InspectionStatus | '') => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    setDateRange(dates)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }

  const handleExport = async (id: string) => {
    try {
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      message.success('删除成功')
      refetch()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleBatchOperation = async (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的记录')
      return
    }

    try {
      message.success(`${action}成功`)
      setSelectedRowKeys([])
      refetch()
    } catch (error) {
      message.error(`${action}失败`)
    }
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={2}>质量管理</Title>
      </div>

      {/* 统计卡片区域 */}
      {statistics && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="总检验数"
                value={statistics.total_inspections}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="合格率"
                value={statistics.pass_rate}
                precision={1}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="待跟进"
                value={statistics.urgent_follow_ups}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="逾期检验"
                value={statistics.overdue_inspections}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        {/* 搜索和筛选区域 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索检验编号或检验员"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="检验类型"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={handleTypeFilter}
            >
              <Option value="visual">外观检验</Option>
              <Option value="radiographic">射线检验</Option>
              <Option value="ultrasonic">超声波检验</Option>
              <Option value="magnetic_particle">磁粉检验</Option>
              <Option value="liquid_penetrant">渗透检验</Option>
              <Option value="destructive">破坏性检验</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="检验状态"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
            >
              <Option value="pending">待开始</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="requires_follow_up">需要跟进</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="检验结果"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={handleResultFilter}
            >
              <Option value="pass">合格</Option>
              <Option value="fail">不合格</Option>
              <Option value="conditional">有条件合格</Option>
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
        </Row>

        {/* 操作按钮区域 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/quality/create')}
                disabled={!canCreateMore('quality', qualityData?.data?.total || 0)}
              >
                创建检验
              </Button>
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={() => refetch()}
              >
                刷新
              </Button>
              <Button
                icon={<ExportOutlined />}
                size="large"
                onClick={() => handleBatchOperation('导出')}
              >
                批量导出
              </Button>
              <Button
                icon={<ImportOutlined />}
                size="large"
              >
                导入数据
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 批量操作区域 */}
        {selectedRowKeys.length > 0 && (
          <Alert
            message={`已选择 ${selectedRowKeys.length} 项`}
            description={
              <Space>
                <Button size="small" onClick={() => handleBatchOperation('批量导出')}>
                  批量导出
                </Button>
                {checkPermission('quality.delete') && (
                  <Popconfirm
                    title="确定要删除选中的记录吗？"
                    description="删除后将无法恢复"
                    onConfirm={() => handleBatchOperation('删除')}
                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button size="small" danger>
                      批量删除
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            }
            type="info"
            showIcon
            className="mb-4"
            closable
            onClose={() => setSelectedRowKeys([])}
          />
        )}

        {/* 表格区域 */}
        <Table<QualityInspection>
          ref={tableRef}
          columns={columns}
          dataSource={qualityData?.data?.items}
          rowKey="id"
          loading={isLoading}
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
          rowSelection={rowSelection}
          scroll={{ x: 1600 }}
          size="middle"
          // 配置避免使用 findDOMNode
          getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
          // 优化渲染性能
          components={{
            body: {
              // 自定义表格体组件，避免 findDOMNode
              cell: ({ children, ...props }) => (
                <td {...props}>{children}</td>
              ),
            },
          }}
        />
      </Card>
    </div>
  )
}

export default QualityList