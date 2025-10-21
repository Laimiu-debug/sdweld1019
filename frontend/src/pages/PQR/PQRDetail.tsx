import React, { useState, useEffect } from 'react'
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
  Image,
  Divider,
  Spin,
  message,
  Modal,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { PQRRecord, PQRStatus } from '@/types'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography
const { TabPane } = Tabs

interface PQRDetailData extends PQRRecord {
  // 扩展字段
  base_material_thickness: number
  filler_material_diameter: number
  joint_type: string
  welding_position: string
  tensile_strength: number
  yield_strength: number
  elongation: number
  impact_energy: number
  bend_test_result: string
  macro_examination: string
  notes?: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    size: number
    url: string
  }>
  test_results?: Array<{
    test_type: string
    result: string
    standard: string
    actual_value: string
    qualified: boolean
  }>
  wps_info?: {
    id: string
    wps_number: string
    title: string
  }
}

const PQRDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { checkPermission } = useAuthStore()
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  // 模拟API调用获取PQR详情
  const fetchPQRDetail = async (pqrId: string): Promise<{ success: boolean; data: PQRDetailData }> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟详细数据
    const mockData: PQRDetailData = {
      id: pqrId,
      pqr_number: 'PQR-2024-001',
      title: '管道对接焊工艺评定',
      status: 'qualified',
      test_date: '2024-01-10',
      test_organization: '第三方检测机构',
      base_material: 'Q235',
      base_material_thickness: 12.0,
      filler_material: 'E7018',
      filler_material_diameter: 3.2,
      welding_process: 'SMAW',
      joint_type: 'Butt Joint',
      welding_position: '1G',
      tensile_strength: 520,
      yield_strength: 360,
      elongation: 25,
      impact_energy: 120,
      bend_test_result: '面弯和背弯试验均无裂纹，符合标准要求',
      macro_examination: '焊缝成型良好，无气孔、夹渣等缺陷',
      notes: '本次工艺评定针对管道对接焊缝，焊接工艺参数合理，测试结果满足标准要求',
      wps_id: 'wps1',
      created_at: '2024-01-10T16:45:00Z',
      updated_at: '2024-01-10T16:45:00Z',
      user_id: 'user1',
      attachments: [
        {
          id: '1',
          name: '拉伸试验报告.pdf',
          type: 'application/pdf',
          size: 1024000,
          url: '/api/files/1.pdf',
        },
        {
          id: '2',
          name: '弯曲试验照片.jpg',
          type: 'image/jpeg',
          size: 2048000,
          url: '/api/files/2.jpg',
        },
        {
          id: '3',
          name: '宏观检查报告.pdf',
          type: 'application/pdf',
          size: 800000,
          url: '/api/files/3.pdf',
        },
      ],
      test_results: [
        {
          test_type: '拉伸试验',
          result: '合格',
          standard: 'ASME IX QW-150',
          actual_value: '抗拉强度 520MPa',
          qualified: true,
        },
        {
          test_type: '弯曲试验',
          result: '合格',
          standard: 'ASME IX QW-160',
          actual_value: '面弯180°无裂纹',
          qualified: true,
        },
        {
          test_type: '冲击试验',
          result: '合格',
          standard: 'ASME IX QW-170',
          actual_value: '冲击能量 120J',
          qualified: true,
        },
        {
          test_type: '宏观检查',
          result: '合格',
          standard: 'ASME IX QW-180',
          actual_value: '焊缝成型良好',
          qualified: true,
        },
      ],
      wps_info: {
        id: 'wps1',
        wps_number: 'WPS-2024-001',
        title: '碳钢管道对接焊工艺',
      },
    }

    return { success: true, data: mockData }
  }

  // 获取PQR详情
  const {
    data: pqrData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pqrDetail', id],
    queryFn: () => fetchPQRDetail(id!),
    enabled: !!id,
  })

  const pqr = pqrData?.data

  // 获取状态配置
  const getStatusConfig = (status: PQRStatus) => {
    const configs = {
      pending: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: '待处理',
      },
      qualified: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: '合格',
      },
      failed: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: '不合格',
      },
    }
    return configs[status] || configs.pending
  }

  // 处理下载
  const handleDownload = (type: 'pdf' | 'excel', attachmentId?: string) => {
    if (attachmentId) {
      message.info(`开始下载附件`)
    } else {
      message.info(`开始导出${type.toUpperCase()}格式`)
    }
  }

  // 处理图片预览
  const handleImagePreview = (url: string) => {
    setPreviewImage(url)
    setPreviewVisible(true)
  }

  // 处理打印
  const handlePrint = () => {
    window.print()
  }

  // 处理分享
  const handleShare = () => {
    message.info('分享功能开发中')
  }

  // 测试结果表格列
  const testResultColumns = [
    {
      title: '测试项目',
      dataIndex: 'test_type',
      key: 'test_type',
    },
    {
      title: '标准要求',
      dataIndex: 'standard',
      key: 'standard',
    },
    {
      title: '实际结果',
      dataIndex: 'actual_value',
      key: 'actual_value',
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result: string, record: any) => (
        <Tag color={record.qualified ? 'success' : 'error'}>
          {result}
        </Tag>
      ),
    },
  ]

  // 附件列表列
  const attachmentColumns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
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
        <Space>
          {record.type.startsWith('image/') ? (
            <Button type="link" size="small" onClick={() => handleImagePreview(record.url)}>
              预览
            </Button>
          ) : null}
          <Button type="link" size="small" onClick={() => handleDownload('pdf', record.id)}>
            下载
          </Button>
        </Space>
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

  if (error || !pqr) {
    return (
      <div className="page-container">
        <Alert
          message="加载失败"
          description="无法加载PQR详情，请稍后重试"
          type="error"
          showIcon
        />
      </div>
    )
  }

  const statusConfig = getStatusConfig(pqr.status)

  return (
    <div className="page-container">
      <div className="page-header">
        <Space className="w-full justify-between">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/pqr')}
            >
              返回列表
            </Button>
            <Title level={2} className="mb-0">
              {pqr.pqr_number} - {pqr.title}
            </Title>
          </Space>
          <Space>
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.text}
            </Tag>
          </Space>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* 基本信息 */}
        <Col xs={24} lg={12}>
          <Card title="基本信息" className="h-full">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="PQR编号">{pqr.pqr_number}</Descriptions.Item>
              <Descriptions.Item label="标题">{pqr.title}</Descriptions.Item>
              <Descriptions.Item label="测试日期">
                {dayjs(pqr.test_date).format('YYYY年MM月DD日')}
              </Descriptions.Item>
              <Descriptions.Item label="测试机构">{pqr.test_organization}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(pqr.created_at).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              {pqr.wps_info && (
                <Descriptions.Item label="关联WPS">
                  <Button type="link" size="small" onClick={() => navigate(`/wps/${pqr.wps_info.id}`)}>
                    {pqr.wps_info.wps_number} - {pqr.wps_info.title}
                  </Button>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* 焊接工艺参数 */}
        <Col xs={24} lg={12}>
          <Card title="焊接工艺参数" className="h-full">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="母材">{pqr.base_material}</Descriptions.Item>
              <Descriptions.Item label="母材厚度">{pqr.base_material_thickness} mm</Descriptions.Item>
              <Descriptions.Item label="焊材">{pqr.filler_material}</Descriptions.Item>
              <Descriptions.Item label="焊材直径">{pqr.filler_material_diameter} mm</Descriptions.Item>
              <Descriptions.Item label="焊接方法">{pqr.welding_process}</Descriptions.Item>
              <Descriptions.Item label="接头类型">{pqr.joint_type}</Descriptions.Item>
              <Descriptions.Item label="焊接位置">{pqr.welding_position}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 测试结果 */}
        <Col xs={24} lg={12}>
          <Card title="机械性能测试结果" className="h-full">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="抗拉强度">{pqr.tensile_strength} MPa</Descriptions.Item>
              <Descriptions.Item label="屈服强度">{pqr.yield_strength} MPa</Descriptions.Item>
              <Descriptions.Item label="延伸率">{pqr.elongation}%</Descriptions.Item>
              <Descriptions.Item label="冲击能量">{pqr.impact_energy} J</Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <Text strong>弯曲试验结果：</Text>
              <br />
              <Text className="text-gray-600">{pqr.bend_test_result}</Text>
            </div>

            <Divider />

            <div>
              <Text strong>宏观检查结果：</Text>
              <br />
              <Text className="text-gray-600">{pqr.macro_examination}</Text>
            </div>
          </Card>
        </Col>

        {/* 操作按钮 */}
        <Col xs={24} lg={12}>
          <Card title="操作" className="h-full">
            <Space direction="vertical" className="w-full">
              <Space className="w-full">
                <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/pqr/${id}/edit`)}>
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

              {pqr.status === 'pending' && checkPermission('pqr.approve') && (
                <Alert
                  message="待处理状态"
                  description="此PQR正在等待审核批准"
                  type="warning"
                  showIcon
                />
              )}

              {pqr.status === 'failed' && (
                <Alert
                  message="不合格状态"
                  description="此PQR测试结果未达到标准要求"
                  type="error"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* 详细信息标签页 */}
        <Col xs={24}>
          <Card>
            <Tabs defaultActiveKey="results">
              <TabPane tab="测试结果详情" key="results">
                <Table
                  columns={testResultColumns}
                  dataSource={pqr.test_results}
                  rowKey="test_type"
                  pagination={false}
                  size="small"
                />
              </TabPane>

              <TabPane tab="附件文件" key="attachments">
                <Table
                  columns={attachmentColumns}
                  dataSource={pqr.attachments}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </TabPane>

              <TabPane tab="备注信息" key="notes">
                {pqr.notes ? (
                  <div className="p-4 bg-gray-50 rounded">
                    <pre className="whitespace-pre-wrap">{pqr.notes}</pre>
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

      {/* 图片预览模态框 */}
      <Modal
        visible={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ top: 20 }}
      >
        <Image src={previewImage} alt="预览图片" />
      </Modal>
    </div>
  )
}

export default PQRDetail