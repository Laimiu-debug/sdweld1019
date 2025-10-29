import React, { useState } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Input,
  Select,
  Tag,
  Tooltip,
  message,
  Row,
  Col,
  Popconfirm,
  Statistic,
  Progress,
  Alert,
  Divider,
  Spin,
  Empty,
  Pagination,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  CopyOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useAuthStore } from '@/store/authStore'
import ppqrService, { PPQRSummary } from '@/services/ppqr'
import { ApprovalButton } from '@/components/Approval/ApprovalButton'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

const PPQRList: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { checkPermission, canCreateMore, user } = useAuthStore()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [conclusionFilter, setConclusionFilter] = useState<string>('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  // 使用真实API获取pPQR列表
  const {
    data: ppqrData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['ppqrList', pagination.current, pagination.pageSize, searchText, statusFilter, conclusionFilter],
    queryFn: async () => {
      const result = await ppqrService.list({
        page: pagination.current,
        page_size: pagination.pageSize,
        keyword: searchText || undefined,
        status: statusFilter || undefined,
        test_conclusion: conclusionFilter || undefined,
      })
      setPagination(prev => ({ ...prev, total: result.total }))
      return result
    },
  })

  // 删除pPQR
  const deleteMutation = useMutation({
    mutationFn: (id: number) => ppqrService.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['ppqrList'] })
    },
    onError: () => {
      message.error('删除失败')
    },
  })

  // 复制pPQR
  const duplicateMutation = useMutation({
    mutationFn: (id: number) => ppqrService.duplicate(id),
    onSuccess: () => {
      message.success('复制成功')
      queryClient.invalidateQueries({ queryKey: ['ppqrList'] })
    },
    onError: () => {
      message.error('复制失败')
    },
  })



  // 获取状态配置
  const getStatusConfig = (status: string) => {
    const configMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      testing: { color: 'processing', text: '试验中' },
      completed: { color: 'success', text: '已完成' },
      converted: { color: 'cyan', text: '已转换' },
    }
    return configMap[status] || { color: 'default', text: status }
  }

  // 获取试验结论配置
  const getConclusionConfig = (conclusion: string | undefined) => {
    if (!conclusion) return null
    const configMap: Record<string, { color: string; text: string }> = {
      qualified: { color: 'success', text: '合格' },
      pending: { color: 'warning', text: '待定' },
      failed: { color: 'error', text: '不合格' },
    }
    return configMap[conclusion] || { color: 'default', text: conclusion }
  }

  // 渲染pPQR卡片
  const renderPPQRCard = (record: PPQRSummary) => {
    const statusConfig = getStatusConfig(record.status)
    const conclusionConfig = getConclusionConfig(record.test_conclusion)

    return (
      <Card
        key={record.id}
        className="ppqr-card"
        hoverable
        style={{ marginBottom: 16 }}
        cover={
          <div style={{ padding: '16px', backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={0}>
                  <Text strong style={{ fontSize: 16 }}>
                    {record.ppqr_number}
                  </Text>
                  <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
                    {record.title}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" size={4} align="end">
                  <Space>
                    <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                    {record.convert_to_pqr === 'yes' && <Tag color="success">已转PQR</Tag>}
                    {record.approval_status && (
                      <Tag
                        color={
                          record.approval_status === 'approved'
                            ? 'success'
                            : record.approval_status === 'rejected'
                            ? 'error'
                            : record.approval_status === 'pending' || record.approval_status === 'in_progress'
                            ? 'processing'
                            : 'default'
                        }
                        icon={
                          record.approval_status === 'approved' ? (
                            <CheckCircleOutlined />
                          ) : record.approval_status === 'rejected' ? (
                            <CloseCircleOutlined />
                          ) : record.approval_status === 'pending' || record.approval_status === 'in_progress' ? (
                            <ClockCircleOutlined />
                          ) : null
                        }
                      >
                        {record.approval_status === 'approved'
                          ? '已批准'
                          : record.approval_status === 'rejected'
                          ? '已拒绝'
                          : record.approval_status === 'pending'
                          ? '待审批'
                          : record.approval_status === 'in_progress'
                          ? '审批中'
                          : record.approval_status}
                      </Tag>
                    )}
                  </Space>
                  {record.workflow_name && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      工作流: {record.workflow_name}
                    </Text>
                  )}
                </Space>
              </Col>
            </Row>
          </div>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Row justify="space-between">
            <Col>
              <Text type="secondary">版本:</Text>
              <Text style={{ marginLeft: 8 }}>{record.revision || 'A'}</Text>
            </Col>
            <Col>
              <Text type="secondary">试验日期:</Text>
              <Text style={{ marginLeft: 8 }}>
                {record.test_date ? dayjs(record.test_date).format('YYYY-MM-DD') : '-'}
              </Text>
            </Col>
          </Row>
          <Row justify="space-between">
            <Col>
              <Text type="secondary">试验结论:</Text>
              <Text style={{ marginLeft: 8 }}>
                {conclusionConfig ? (
                  <Tag color={conclusionConfig.color}>{conclusionConfig.text}</Tag>
                ) : (
                  '-'
                )}
              </Text>
            </Col>
            <Col>
              <Text type="secondary">创建时间:</Text>
              <Text style={{ marginLeft: 8 }}>{dayjs(record.created_at).format('YYYY-MM-DD')}</Text>
            </Col>
          </Row>
        </Space>

        <Divider style={{ margin: '12px 0' }} />

        {/* 审批状态提示 */}
        {record.approval_status === 'approved' && (
          <Alert
            message="已批准"
            description="此pPQR已通过审批，试验结果有效"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 12 }}
          />
        )}

        {record.approval_status === 'rejected' && (
          <Alert
            message="已拒绝"
            description="此pPQR审批被拒绝，需要修改后重新提交"
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
            style={{ marginBottom: 12 }}
          />
        )}

        {(record.approval_status === 'pending' || record.approval_status === 'in_progress') && (
          <Alert
            message="审批中"
            description="此pPQR正在审批流程中，请等待审批完成"
            type="warning"
            showIcon
            icon={<ClockCircleOutlined />}
            style={{ marginBottom: 12 }}
          />
        )}

        {!record.approval_status && record.status === 'draft' && (
          <Alert
            message="草稿状态"
            description="此pPQR处于草稿状态，可以提交审批"
            type="info"
            showIcon
            icon={<ClockCircleOutlined />}
            style={{ marginBottom: 12 }}
          />
        )}

        {/* 操作按钮 */}
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Tooltip title="查看详情">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => navigate(`/ppqr/${record.id}`)}
              >
                查看
              </Button>
            </Tooltip>

            {checkPermission('ppqr.update') && (
              <Tooltip title="编辑">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => navigate(`/ppqr/${record.id}/edit`)}
                >
                  编辑
                </Button>
              </Tooltip>
            )}

            <Tooltip title="复制">
              <Button
                icon={<CopyOutlined />}
                size="small"
                onClick={() => handleDuplicate(record.id)}
              >
                复制
              </Button>
            </Tooltip>

            <Tooltip title="导出PDF">
              <Button
                icon={<FilePdfOutlined />}
                size="small"
                onClick={() => handleExportPDF(record.id, record.ppqr_number)}
              >
                PDF
              </Button>
            </Tooltip>

            {record.convert_to_pqr !== 'yes' && (
              <Tooltip title="转换为PQR">
                <Popconfirm
                  title="确定要转换为PQR吗？"
                  onConfirm={() => handleConvertToPQR(record.id)}
                  icon={<ExclamationCircleOutlined style={{ color: '#1890ff' }} />}
                >
                  <Button
                    icon={<SwapOutlined />}
                    size="small"
                  >
                    转PQR
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}

            {/* 审批按钮 */}
            <ApprovalButton
              documentType="ppqr"
              documentId={parseInt(record.id)}
              documentNumber={record.ppqr_number}
              documentTitle={record.title}
              instanceId={record.approval_instance_id}
              status={record.approval_status || record.status}
              canSubmit={record.can_submit_approval}
              canApprove={record.can_approve}
              canCancel={record.submitter_id === user?.id}
              onSuccess={refetch}
              size="small"
            />
          </Space>

          <Space>
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
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    删除
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        </Space>
      </Card>
    )
  }

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 处理状态筛选
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 处理结论筛选
  const handleConclusionFilter = (value: string) => {
    setConclusionFilter(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }

  // 处理删除
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  // 处理复制
  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate(id)
  }

  // 处理导出PDF
  const handleExportPDF = async (id: number, title: string) => {
    try {
      const blob = await ppqrService.exportPDF(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  // 处理转换为PQR
  const handleConvertToPQR = async (id: number) => {
    try {
      await ppqrService.convertToPQR(id)
      message.success('转换成功')
      queryClient.invalidateQueries({ queryKey: ['ppqrList'] })
    } catch (error) {
      message.error('转换失败')
    }
  }

  // 计算统计数据
  const getPPQRStats = () => {
    const items = ppqrData?.items || []
    return {
      total: ppqrData?.total || 0,
      draft: items.filter((item: PPQRSummary) => item.status === 'draft').length,
      testing: items.filter((item: PPQRSummary) => item.status === 'testing').length,
      completed: items.filter((item: PPQRSummary) => item.status === 'completed').length,
      converted: items.filter((item: PPQRSummary) => item.status === 'converted').length,
    }
  }

  const stats = getPPQRStats()

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

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ExperimentOutlined /> pPQR管理
        </Title>
        <Text type="secondary">
          预备工艺评定记录 (Preliminary Procedure Qualification Record) 管理
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总计"
              value={stats.total}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="草稿"
              value={stats.draft}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="试验中"
              value={stats.testing}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 配额提醒 */}
      {user && canCreateMore && canCreateMore('ppqr', user.ppqr_quota_used || 0) === false && (
        <Alert
          message="pPQR配额已用完"
          description="您已达到当前会员等级的pPQR创建上限，请升级会员以创建更多pPQR。"
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* 主内容卡片 */}
      <Card>
        {/* 搜索和筛选区域 */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索pPQR编号或标题"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="筛选状态"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
              value={statusFilter || undefined}
            >
              <Option value="">全部</Option>
              <Option value="draft">草稿</Option>
              <Option value="testing">试验中</Option>
              <Option value="completed">已完成</Option>
              <Option value="converted">已转换</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="试验结论"
              allowClear
              style={{ width: '100%' }}
              onChange={handleConclusionFilter}
              value={conclusionFilter || undefined}
            >
              <Option value="">全部</Option>
              <Option value="qualified">合格</Option>
              <Option value="unqualified">不合格</Option>
              <Option value="pending">待定</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/ppqr/create')}
              >
                创建pPQR
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider />

        {/* 配额进度条 */}
        {user && (
          <div style={{ marginBottom: '16px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Text type="secondary">
                  pPQR配额使用情况: {user.ppqr_quota_used || 0} / {getPPQRQuota(user.member_tier || 'free')}
                </Text>
              </Col>
              <Col>
                <Text type="secondary">
                  {Math.round(((user.ppqr_quota_used || 0) / getPPQRQuota(user.member_tier || 'free')) * 100)}%
                </Text>
              </Col>
            </Row>
            <Progress
              percent={Math.round(((user.ppqr_quota_used || 0) / getPPQRQuota(user.member_tier || 'free')) * 100)}
              status={
                (user.ppqr_quota_used || 0) >= getPPQRQuota(user.member_tier || 'free')
                  ? 'exception'
                  : 'active'
              }
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>
        )}

        {/* 卡片列表区域 */}
        <Spin spinning={isLoading}>
          {ppqrData?.items && ppqrData.items.length > 0 ? (
            <>
              {ppqrData.items.map((record: PPQRSummary) => renderPPQRCard(record))}

              {/* 分页 */}
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                  onChange={handlePageChange}
                  pageSizeOptions={['10', '20', '50', '100']}
                />
              </div>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无pPQR记录"
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/ppqr/create')}>
                创建第一个pPQR
              </Button>
            </Empty>
          )}
        </Spin>
      </Card>
    </div>
  )
}

export default PPQRList