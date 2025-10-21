import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Descriptions,
  Row,
  Col,
  Alert,
  Tabs,
  Table,
  Divider,
  Spin,
  message,
  Modal,
  Progress,
  Timeline,
  Badge,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { PPQRRecord, PPQRStatus } from '@/types'
import { useAuthStore } from '@/store/authStore'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

interface PPQRDetailData extends PPQRRecord {
  // 扩展字段
  base_material_thickness: number
  filler_material: string
  welding_process: string
  joint_type: string
  welding_position: string
  proposed_parameters: {
    current_range: string
    voltage_range: string
    travel_speed: string
    heat_input_range: string
  }
  review_comments: string
  notes?: string
  reviewer_info?: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  review_history?: Array<{
    id: string
    action: string
    status: string
    comment: string
    reviewer: string
    timestamp: string
  }>
  attachments?: Array<{
    id: string
    name: string
    type: string
    size: number
    url: string
  }>
  risk_assessment?: {
    technical_feasibility: number
    risk_level: 'low' | 'medium' | 'high'
    compliance_score: number
    recommendations: string[]
  }
}

const PPQRDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { checkPermission } = useAuthStore()
  const [previewVisible, setPreviewVisible] = useState(false)

  // 模拟API调用获取pPQR详情
  const fetchPPQRDetail = async (ppqrId: string): Promise<{ success: boolean; data: PPQRDetailData }> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟详细数据
    const mockData: PPQRDetailData = {
      id: ppqrId,
      ppqr_number: 'PPQR-2024-001',
      title: '高压容器对接焊预备工艺评定',
      status: 'approved',
      planned_test_date: '2024-02-10',
      base_material: 'Q235',
      base_material_thickness: 12.0,
      filler_material: 'E7018',
      welding_process: 'SMAW',
      joint_type: 'Butt Joint',
      welding_position: '1G',
      proposed_parameters: {
        current_range: '90-130A',
        voltage_range: '22-28V',
        travel_speed: '3-5 cm/min',
        heat_input_range: '0.8-1.5 kJ/mm',
      },
      review_comments: '该预备工艺参数合理，技术可行性高，建议进行正式PQR测试。焊接参数范围符合相关标准要求，热输入控制合理，工艺方案可行。风险评估为低风险，符合ASME IX标准要求。',
      notes: '本项目针对高压容器的特殊要求，采用了保守的焊接参数范围。建议在正式测试前进行工艺试验验证。',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:15:00Z',
      user_id: 'user1',
      reviewer_info: {
        id: 'reviewer1',
        name: '张工程师',
        role: '高级焊接工程师',
        avatar: '/avatars/reviewer1.jpg',
      },
      review_history: [
        {
          id: '1',
          action: 'submit',
          status: 'draft',
          comment: '提交预备工艺评定申请',
          reviewer: '李工程师',
          timestamp: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          action: 'review',
          status: 'under_review',
          comment: '开始审核，技术方案看起来合理',
          reviewer: '张工程师',
          timestamp: '2024-01-18T14:20:00Z',
        },
        {
          id: '3',
          action: 'approve',
          status: 'approved',
          comment: '审核通过，建议进行正式PQR测试',
          reviewer: '张工程师',
          timestamp: '2024-01-20T14:15:00Z',
        },
      ],
      attachments: [
        {
          id: '1',
          name: '预备工艺方案.pdf',
          type: 'application/pdf',
          size: 1024000,
          url: '/api/files/1.pdf',
        },
        {
          id: '2',
          name: '技术评估报告.pdf',
          type: 'application/pdf',
          size: 1500000,
          url: '/api/files/2.pdf',
        },
        {
          id: '3',
          name: '风险评估表.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 500000,
          url: '/api/files/3.xlsx',
        },
      ],
      risk_assessment: {
        technical_feasibility: 85,
        risk_level: 'low',
        compliance_score: 92,
        recommendations: [
          '建议在正式测试前进行小规模试验',
          '重点关注热输入控制',
          '做好焊接过程监控记录',
        ],
      },
    }

    return { success: true, data: mockData }
  }

  // 获取pPQR详情
  const {
    data: ppqrData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ppqrDetail', id],
    queryFn: () => fetchPPQRDetail(id!),
    enabled: !!id,
  })

  const ppqr = ppqrData?.data

  // 获取状态配置
  const getStatusConfig = (status: PPQRStatus) => {
    const configs = {
      draft: {
        color: 'default',
        icon: <FileTextOutlined />,
        text: '草稿',
      },
      under_review: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: '审核中',
      },
      approved: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: '已批准',
      },
      rejected: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: '已拒绝',
      },
    }
    return configs[status] || configs.draft
  }

  // 获取风险等级配置
  const getRiskConfig = (level: string) => {
    const configs = {
      low: { color: 'success', text: '低风险' },
      medium: { color: 'warning', text: '中等风险' },
      high: { color: 'error', text: '高风险' },
    }
    return configs[level as keyof typeof configs] || configs.low
  }

  // 处理下载
  const handleDownload = (type: 'pdf' | 'excel', attachmentId?: string) => {
    if (attachmentId) {
      message.info(`开始下载附件`)
    } else {
      message.info(`开始导出${type.toUpperCase()}格式`)
    }
  }

  // 处理打印
  const handlePrint = () => {
    window.print()
  }

  // 处理分享
  const handleShare = () => {
    message.info('分享功能开发中')
  }

  // 审核历史表格列
  const reviewHistoryColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => {
        const actionMap: Record<string, string> = {
          submit: '提交',
          review: '审核',
          approve: '批准',
          reject: '拒绝',
        }
        return actionMap[action] || action
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status as PPQRStatus)
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '操作人',
      dataIndex: 'reviewer',
      key: 'reviewer',
    },
    {
      title: '意见',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
  ]

  // 附件列表列
  const attachmentColumns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <FileTextOutlined />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          'application/pdf': 'PDF',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
          'image/jpeg': 'JPEG',
          'image/png': 'PNG',
        }
        return typeMap[type] || type
      },
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => {
        if (size < 1024) return `${size} B`
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
        return `${(size / (1024 * 1024)).toFixed(1)} MB`
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button type="link" size="small" onClick={() => handleDownload('pdf', record.id)}>
          下载
        </Button>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4">
              <Text>加载中...</Text>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ppqr) {
    return (
      <div className="page-container">
        <Alert
          message="加载失败"
          description="无法加载pPQR详情，请稍后重试"
          type="error"
          showIcon
        />
      </div>
    )
  }

  const statusConfig = getStatusConfig(ppqr.status)
  const riskConfig = getRiskConfig(ppqr.risk_assessment?.risk_level || 'low')

  return (
    <div className="page-container">
      <div className="page-header">
        <Space className="w-full justify-between">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/ppqr')}
            >
              返回列表
            </Button>
            <Title level={2} className="mb-0">
              {ppqr.ppqr_number} - {ppqr.title}
            </Title>
          </Space>
          <Space>
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.text}
            </Tag>
            <Tag color={riskConfig.color}>
              {riskConfig.text}
            </Tag>
          </Space>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* 基本信息 */}
        <Col xs={24} lg={12}>
          <Card title="基本信息" className="h-full">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="pPQR编号">{ppqr.ppqr_number}</Descriptions.Item>
              <Descriptions.Item label="标题">{ppqr.title}</Descriptions.Item>
              <Descriptions.Item label="计划测试日期">
                {dayjs(ppqr.planned_test_date).format('YYYY年MM月DD日')}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(ppqr.created_at).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(ppqr.updated_at).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              {ppqr.reviewer_info && (
                <Descriptions.Item label="审核人">
                  <Space>
                    <UserOutlined />
                    <span>{ppqr.reviewer_info.name}</span>
                    <Tag size="small">{ppqr.reviewer_info.role}</Tag>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* 工艺参数 */}
        <Col xs={24} lg={12}>
          <Card title="预备工艺参数" className="h-full">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="母材">{ppqr.base_material}</Descriptions.Item>
              <Descriptions.Item label="母材厚度">{ppqr.base_material_thickness} mm</Descriptions.Item>
              <Descriptions.Item label="焊材">{ppqr.filler_material}</Descriptions.Item>
              <Descriptions.Item label="焊接方法">{ppqr.welding_process}</Descriptions.Item>
              <Descriptions.Item label="接头类型">{ppqr.joint_type}</Descriptions.Item>
              <Descriptions.Item label="焊接位置">{ppqr.welding_position}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <Text strong>建议参数范围：</Text>
              <div className="mt-2 space-y-1">
                <div>• 电流范围：{ppqr.proposed_parameters.current_range}</div>
                <div>• 电压范围：{ppqr.proposed_parameters.voltage_range}</div>
                <div>• 焊接速度：{ppqr.proposed_parameters.travel_speed}</div>
                <div>• 热输入范围：{ppqr.proposed_parameters.heat_input_range}</div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 风险评估 */}
        {ppqr.risk_assessment && (
          <Col xs={24} lg={12}>
            <Card title="风险评估" className="h-full">
              <Space direction="vertical" className="w-full">
                <div>
                  <Text strong>技术可行性：</Text>
                  <Progress
                    percent={ppqr.risk_assessment.technical_feasibility}
                    status="active"
                    strokeColor={{ from: '#108ee9', to: '#87d068' }}
                  />
                </div>
                <div>
                  <Text strong>合规性评分：</Text>
                  <Progress
                    percent={ppqr.risk_assessment.compliance_score}
                    status="active"
                    strokeColor={{ from: '#108ee9', to: '#87d068' }}
                  />
                </div>
                <div>
                  <Text strong>建议：</Text>
                  <ul className="mt-2 ml-4">
                    {ppqr.risk_assessment.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              </Space>
            </Card>
          </Col>
        )}

        {/* 操作按钮 */}
        <Col xs={24} lg={12}>
          <Card title="操作" className="h-full">
            <Space direction="vertical" className="w-full">
              <Space className="w-full">
                <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/ppqr/${id}/edit`)}>
                  编辑
                </Button>
                <Button icon={<DownloadOutlined />} onClick={() => handleDownload('pdf')}>
                  下载PDF
                </Button>
                <Button icon={<DownloadOutlined />} onClick={() => handleDownload('excel')}>
                  下载Excel
                </Button>
                <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                  打印
                </Button>
                <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                  分享
                </Button>
              </Space>

              {ppqr.status === 'under_review' && checkPermission('ppqr.approve') && (
                <Alert
                  message="待审核状态"
                  description="此pPQR正在等待审核批准"
                  type="warning"
                  showIcon
                />
              )}

              {ppqr.status === 'rejected' && (
                <Alert
                  message="已拒绝状态"
                  description="此pPQR审核未通过，请查看审核意见并修改"
                  type="error"
                  showIcon
                />
              )}

              {ppqr.status === 'approved' && (
                <Alert
                  message="已批准"
                  description="此pPQR已审核通过，可以转为正式PQR进行测试"
                  type="success"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* 详细信息标签页 */}
        <Col xs={24}>
          <Card>
            <Tabs defaultActiveKey="review">
              <TabPane tab="评审意见" key="review">
                <div className="p-4 bg-gray-50 rounded">
                  <Paragraph>
                    {ppqr.review_comments}
                  </Paragraph>
                </div>
              </TabPane>

              <TabPane tab="审核历史" key="history">
                <Table
                  columns={reviewHistoryColumns}
                  dataSource={ppqr.review_history}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </TabPane>

              <TabPane tab="附件文件" key="attachments">
                <Table
                  columns={attachmentColumns}
                  dataSource={ppqr.attachments}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </TabPane>

              <TabPane tab="备注信息" key="notes">
                {ppqr.notes ? (
                  <div className="p-4 bg-gray-50 rounded">
                    <pre className="whitespace-pre-wrap">{ppqr.notes}</pre>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    暂无备注信息
                  </div>
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default PPQRDetail