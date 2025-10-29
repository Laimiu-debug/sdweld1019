import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Descriptions,
  Spin,
  message,
  Divider,
  Empty,
  Tabs,
  Row,
  Col,
  Image,
  Table,
  Badge
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DownloadOutlined,
  CopyOutlined,
  FileTextOutlined,
  ToolOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  SettingOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  SwapOutlined,
  BarChartOutlined,
  HistoryOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ppqrService from '@/services/ppqr'
import { getPPQRModuleById } from '@/constants/ppqrModules'
import customModuleService from '@/services/customModules'
import dayjs from 'dayjs'
import { ApprovalButton } from '@/components/Approval/ApprovalButton'
import { ApprovalHistory } from '@/components/Approval/ApprovalHistory'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography

interface PPQRDetailData {
  id: number
  title: string
  ppqr_number: string
  revision: string
  status: string
  test_date?: string
  test_conclusion?: string
  convert_to_pqr?: string
  template_id?: string
  modules_data?: Record<string, any>
  created_at: string
  updated_at: string
  [key: string]: any
}

const PPQRDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [ppqrData, setPPQRData] = useState<PPQRDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [customModulesCache, setCustomModulesCache] = useState<Record<string, any>>({})

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      basic: <FileTextOutlined style={{ color: '#1890ff' }} />,
      material: <ToolOutlined style={{ color: '#52c41a' }} />,
      gas: <ExperimentOutlined style={{ color: '#faad14' }} />,
      electrical: <ThunderboltOutlined style={{ color: '#f5222d' }} />,
      motion: <DashboardOutlined style={{ color: '#722ed1' }} />,
      equipment: <SettingOutlined style={{ color: '#13c2c2' }} />,
      calculation: <CalculatorOutlined style={{ color: '#eb2f96' }} />,
      test: <ExperimentOutlined style={{ color: '#1890ff' }} />,
      comparison: <BarChartOutlined style={{ color: '#52c41a' }} />
    }
    return iconMap[category] || <FileTextOutlined />
  }

  // 获取分类名称
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      basic: '基本信息',
      material: '材料信息',
      gas: '气体信息',
      electrical: '电气参数',
      motion: '运动参数',
      equipment: '设备信息',
      calculation: '计算结果',
      test: '试验信息',
      comparison: '参数对比'
    }
    return categoryMap[category] || category
  }

  // 从 modules_data 中提取所有字段
  const extractAllFieldsFromModules = (modulesData: any) => {
    const extracted: Record<string, any> = {}

    if (!modulesData) return extracted

    Object.values(modulesData).forEach((module: any) => {
      if (module && module.data) {
        Object.assign(extracted, module.data)
      }
    })

    return extracted
  }

  // 获取 pPQR 详情和自定义模块
  useEffect(() => {
    const fetchPPQRDetail = async () => {
      if (!id) return

      try {
        setLoading(true)

        // 获取 pPQR 数据
        const response = await ppqrService.get(parseInt(id))
        setPPQRData(response)

        // 获取自定义模块定义
        if (response.modules_data) {
          const customModuleIds = new Set<string>()
          Object.values(response.modules_data).forEach((module: any) => {
            if (module.moduleId && !getPPQRModuleById(module.moduleId)) {
              customModuleIds.add(module.moduleId)
            }
          })

          // 加载自定义模块定义
          const customModules: Record<string, any> = {}
          for (const moduleId of customModuleIds) {
            try {
              const moduleData = await customModuleService.getCustomModule(moduleId)
              customModules[moduleId] = moduleData
            } catch (error) {
              console.error(`加载自定义模块 ${moduleId} 失败:`, error)
            }
          }
          setCustomModulesCache(customModules)
        }
      } catch (error: any) {
        console.error('获取pPQR详情失败:', error)
        message.error(error.response?.data?.detail || '获取pPQR详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchPPQRDetail()
  }, [id])

  // 处理编辑
  const handleEdit = () => {
    navigate(`/ppqr/${id}/edit`)
  }

  // 处理复制
  const handleCopy = async () => {
    if (!ppqrData) return
    try {
      // 创建新的 pPQR 数据，去掉 id 和时间戳
      const copyData = {
        ...ppqrData,
        title: `${ppqrData.title} (副本)`,
        ppqr_number: `${ppqrData.ppqr_number}-COPY-${Date.now()}`,
        status: 'draft',
      }
      delete (copyData as any).id
      delete (copyData as any).created_at
      delete (copyData as any).updated_at

      // 创建新 pPQR
      await ppqrService.create(copyData)
      message.success('复制成功')
      navigate('/ppqr')
    } catch (error: any) {
      console.error('复制pPQR失败:', error)
      message.error(error.response?.data?.detail || '复制失败')
    }
  }

  // 处理转换为PQR
  const handleConvertToPQR = async () => {
    if (!ppqrData) return
    try {
      await ppqrService.convertToPQR(ppqrData.id)
      message.success('转换成功')
      navigate('/pqr')
    } catch (error: any) {
      console.error('转换为PQR失败:', error)
      message.error(error.response?.data?.detail || '转换失败')
    }
  }

  // 处理导出PDF
  const handleExportPDF = async () => {
    if (!ppqrData) return
    try {
      const blob = await ppqrService.exportPDF(ppqrData.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${ppqrData.ppqr_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      message.success('导出成功')
    } catch (error: any) {
      console.error('导出PDF失败:', error)
      message.error(error.response?.data?.detail || '导出失败')
    }
  }

  // 渲染字段值
  const renderFieldValue = (fieldKey: string, value: any, fieldDef?: any) => {
    if (value === null || value === undefined || value === '') {
      return <Text type="secondary">-</Text>
    }

    // 如果是文件上传字段
    if (fieldDef?.type === 'file' || fieldDef?.type === 'image') {
      if (Array.isArray(value)) {
        return (
          <Space wrap>
            {value.map((file: any, index: number) => (
              <a key={index} href={file.url} target="_blank" rel="noopener noreferrer">
                {file.name || `文件${index + 1}`}
              </a>
            ))}
          </Space>
        )
      }
    }

    // 如果是图片字段
    if (fieldDef?.type === 'image' && Array.isArray(value)) {
      return (
        <Image.PreviewGroup>
          <Space wrap>
            {value.map((img: any, index: number) => (
              <Image
                key={index}
                width={100}
                src={img.url || img.thumbUrl}
                alt={img.name || `图片${index + 1}`}
              />
            ))}
          </Space>
        </Image.PreviewGroup>
      )
    }

    // 如果是表格字段
    if (fieldDef?.type === 'table' && Array.isArray(value)) {
      const columns = fieldDef.tableDefinition?.columns || []
      const tableColumns = columns.map((col: any) => ({
        title: col.label,
        dataIndex: col.key,
        key: col.key,
      }))
      return (
        <Table
          size="small"
          columns={tableColumns}
          dataSource={value}
          pagination={false}
          bordered
        />
      )
    }

    // 如果是对象
    if (typeof value === 'object' && !Array.isArray(value)) {
      return <pre>{JSON.stringify(value, null, 2)}</pre>
    }

    // 如果是布尔值
    if (typeof value === 'boolean') {
      return value ? <Tag color="success">是</Tag> : <Tag color="default">否</Tag>
    }

    // 如果是日期字段
    if (fieldDef?.type === 'date' && value) {
      return dayjs(value).format('YYYY-MM-DD')
    }

    // 默认显示文本
    return <Text>{String(value)}</Text>
  }

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    const configMap: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      draft: { color: 'default', icon: <FileTextOutlined />, text: '草稿' },
      review: { color: 'processing', icon: <ClockCircleOutlined />, text: '审核中' },
      approved: { color: 'success', icon: <CheckCircleOutlined />, text: '已批准' },
      rejected: { color: 'error', icon: <CloseCircleOutlined />, text: '已拒绝' },
    }
    return configMap[status] || configMap.draft
  }

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }} />
      </div>
    )
  }

  if (!ppqrData) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description="未找到pPQR数据" />
        </Card>
      </div>
    )
  }

  // 提取所有字段用于基本信息显示
  const allFields = extractAllFieldsFromModules(ppqrData.modules_data)
  const statusConfig = getStatusConfig(ppqrData.status)

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和操作按钮 */}
      <div style={{ marginBottom: '24px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/ppqr')}
            >
              返回列表
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {ppqrData.ppqr_number} - {ppqrData.title}
            </Title>
          </Space>
          <Space>
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.text}
            </Tag>
            {ppqrData.convert_to_pqr === 'yes' && (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                已转换为PQR
              </Tag>
            )}
          </Space>
        </Space>
      </div>

      {/* 审批历史 */}
      {ppqrData.approval_instance_id && (
        <Card
          title={
            <Space>
              <HistoryOutlined />
              <Text strong>审批历史</Text>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <ApprovalHistory instanceId={ppqrData.approval_instance_id} />
        </Card>
      )}

      {/* 操作按钮 */}
      <Card style={{ marginBottom: '16px' }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            编辑
          </Button>
          <Button
            icon={<CopyOutlined />}
            onClick={handleCopy}
          >
            复制
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportPDF}
          >
            导出PDF
          </Button>
          {ppqrData.convert_to_pqr !== 'yes' && (
            <Button
              icon={<SwapOutlined />}
              onClick={handleConvertToPQR}
            >
              转换为PQR
            </Button>
          )}

          {/* 审批按钮 */}
          <ApprovalButton
            documentType="ppqr"
            documentId={parseInt(id || '0')}
            documentNumber={ppqrData.ppqr_number}
            documentTitle={ppqrData.title}
            instanceId={ppqrData.approval_instance_id}
            status={ppqrData.approval_status || ppqrData.status}
            canSubmit={ppqrData.can_submit_approval || false}
            canApprove={ppqrData.can_approve || false}
            canCancel={ppqrData.submitter_id === user?.id}
            onSuccess={() => {
              // 刷新pPQR数据
              window.location.reload()
            }}
          />
        </Space>
      </Card>

      {/* 基本信息卡片 */}
      <Card style={{ marginBottom: '16px' }}>
        <Descriptions title="基本信息" column={3} bordered>
          <Descriptions.Item label="pPQR编号">{ppqrData.ppqr_number}</Descriptions.Item>
          <Descriptions.Item label="标题">{ppqrData.title}</Descriptions.Item>
          <Descriptions.Item label="版本">{ppqrData.revision || 'A'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="试验日期">
            {ppqrData.test_date ? dayjs(ppqrData.test_date).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="试验结论">
            {ppqrData.test_conclusion || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(ppqrData.created_at).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {dayjs(ppqrData.updated_at).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="转换为PQR">
            {ppqrData.convert_to_pqr === 'yes' ? (
              <Tag color="success">是</Tag>
            ) : ppqrData.convert_to_pqr === 'no' ? (
              <Tag color="default">否</Tag>
            ) : (
              <Tag color="warning">待定</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 模块化数据展示 */}
      {ppqrData.modules_data && Object.keys(ppqrData.modules_data).length > 0 ? (
        <Card>
          <Tabs
            items={Object.entries(ppqrData.modules_data).map(([instanceId, moduleContent]: [string, any]) => {
              // 获取模块定义（预设模块或自定义模块）
              const module = getPPQRModuleById(moduleContent.moduleId) || customModulesCache[moduleContent.moduleId]

              if (!module) {
                return {
                  key: instanceId,
                  label: moduleContent.customName || instanceId,
                  children: (
                    <Empty description={`模块 ${moduleContent.moduleId} 未找到`} />
                  )
                }
              }

              return {
                key: instanceId,
                label: (
                  <Space>
                    {getCategoryIcon(module.category)}
                    <Text>{moduleContent.customName || module.name}</Text>
                  </Space>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {Object.entries(moduleContent.data || {}).map(([fieldKey, value]: [string, any]) => {
                      const fieldDef = module?.fields?.[fieldKey]

                      return (
                        <Col key={fieldKey} xs={24} sm={12} md={8}>
                          <div style={{ marginBottom: '8px' }}>
                            <Text strong>{fieldDef?.label || fieldKey}</Text>
                          </div>
                          <div>
                            {renderFieldValue(fieldKey, value, fieldDef)}
                          </div>
                        </Col>
                      )
                    })}
                  </Row>
                )
              }
            })}
          />
        </Card>
      ) : (
        <Card>
          <Empty description="暂无模块数据" />
        </Card>
      )}
    </div>
  )
}

export default PPQRDetail