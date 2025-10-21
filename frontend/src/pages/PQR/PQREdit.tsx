import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  Typography,
  Space,
  message,
  Steps,
  Alert,
  Upload,
  Descriptions,
  Divider,
} from 'antd'
import {
  SaveOutlined,
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  CheckOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { PQRRecord, PQRStatus } from '@/types'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { Step } = Steps

interface PQREditForm {
  // 基本信息
  pqr_number: string
  title: string
  test_date: string
  test_organization: string
  wps_id?: string
  status: PQRStatus

  // 材料信息
  base_material: string
  base_material_thickness: number
  filler_material: string
  filler_material_diameter: number
  welding_process: string
  joint_type: string
  welding_position: string

  // 测试结果
  tensile_strength: number
  yield_strength: number
  elongation: number
  impact_energy: number
  bend_test_result: string
  macro_examination: string

  // 其他信息
  notes: string
  attachments: any[]
}

const PQREdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<PQREditForm>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // 步骤配置
  const steps = [
    {
      title: '基本信息',
      description: '修改PQR的基本信息',
    },
    {
      title: '材料信息',
      description: '调整材料和工艺参数',
    },
    {
      title: '测试结果',
      description: '更新测试结果数据',
    },
    {
      title: '附件管理',
      description: '管理相关文件和证明',
    },
  ]

  // 模拟API调用获取PQR详情
  const fetchPQRDetail = async (pqrId: string): Promise<{ success: boolean; data: PQRRecord }> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData: PQRRecord = {
      id: pqrId,
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
    }

    return { success: true, data: mockData }
  }

  // 获取PQR详情
  const {
    data: pqrData,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useQuery({
    queryKey: ['pqrDetail', id],
    queryFn: () => fetchPQRDetail(id!),
    enabled: !!id,
    onSuccess: (data) => {
      if (data.success && data.data) {
        const pqr = data.data
        form.setFieldsValue({
          ...pqr,
          test_date: dayjs(pqr.test_date),
          base_material_thickness: 12.0,
          filler_material_diameter: 3.2,
          joint_type: 'Butt Joint',
          welding_position: '1G',
          tensile_strength: 520,
          yield_strength: 360,
          elongation: 25,
          impact_energy: 120,
          bend_test_result: '面弯和背弯试验均无裂纹，符合标准要求',
          macro_examination: '焊缝成型良好，无气孔、夹渣等缺陷',
          notes: '本次工艺评定针对管道对接焊缝，焊接工艺参数合理，测试结果满足标准要求',
        })
        setFormData(pqr)
      }
    },
  })

  // 更新PQR的mutation
  const updatePQRMutation = useMutation({
    mutationFn: async (data: PQREditForm) => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true, data: { id, ...data } }
    },
    onSuccess: () => {
      message.success('PQR更新成功')
      setHasChanges(false)
      navigate(`/pqr/${id}`)
    },
    onError: () => {
      message.error('更新失败，请稍后重试')
    },
  })

  // 处理步骤变化
  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  // 处理下一步
  const handleNext = async () => {
    try {
      // 验证当前步骤的表单
      const fields = getStepFields(currentStep)
      await form.validateFields(fields)

      // 保存当前步骤的数据
      const values = form.getFieldsValue(fields)
      setFormData(prev => ({ ...prev, ...values }))
      setHasChanges(true)

      // 进入下一步
      if (currentStep < steps.length - 1) {
        handleStepChange(currentStep + 1)
      } else {
        // 最后一步，提交表单
        handleSubmit()
      }
    } catch (error) {
      message.error('请完成当前步骤的必填项')
    }
  }

  // 处理上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1)
    }
  }

  // 获取当前步骤需要验证的字段
  const getStepFields = (step: number): string[] => {
    const stepFields: string[][] = [
      // 基本信息
      ['pqr_number', 'title', 'test_date', 'test_organization', 'status'],
      // 材料信息
      ['base_material', 'base_material_thickness', 'filler_material', 'welding_process', 'joint_type', 'welding_position'],
      // 测试结果
      ['tensile_strength', 'yield_strength', 'elongation', 'bend_test_result'],
      // 附件上传
      [],
    ]

    return stepFields[step] || []
  }

  // 处理表单提交
  const handleSubmit = async () => {
    setLoading(true)
    try {
      // 获取所有表单数据
      const allValues = form.getFieldsValue()
      const finalData = { ...formData, ...allValues }

      // 调用更新API
      await updatePQRMutation.mutateAsync(finalData)
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 处理取消
  const handleCancel = () => {
    if (hasChanges) {
      Modal.confirm({
        title: '确认取消？',
        icon: <ExclamationCircleOutlined />,
        content: '您有未保存的更改，确定要取消编辑吗？',
        okText: '确定',
        cancelText: '继续编辑',
        onOk: () => {
          navigate(`/pqr/${id}`)
        },
      })
    } else {
      navigate(`/pqr/${id}`)
    }
  }

  // 处理预览
  const handlePreview = () => {
    const allValues = form.getFieldsValue()
    const previewData = { ...formData, ...allValues }

    console.log('Preview data:', previewData)
    message.info('预览功能开发中')
  }

  // 处理表单值变化
  const handleValuesChange = (changedValues: any, allValues: any) => {
    setHasChanges(true)
  }

  // 渲染当前步骤的表单
  const renderStepForm = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="pqr_number"
                label="PQR编号"
                rules={[{ required: true, message: '请输入PQR编号' }]}
              >
                <Input placeholder="例如: PQR-2024-001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input placeholder="请输入PQR标题" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="test_date"
                label="测试日期"
                rules={[{ required: true, message: '请选择测试日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="test_organization"
                label="测试机构"
                rules={[{ required: true, message: '请输入测试机构' }]}
              >
                <Input placeholder="请输入测试机构名称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="pending">待处理</Option>
                  <Option value="qualified">合格</Option>
                  <Option value="failed">不合格</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="wps_id" label="关联WPS">
                <Select placeholder="请选择关联的WPS（可选）" allowClear>
                  <Option value="1">WPS-2024-001 - 碳钢管道对接焊工艺</Option>
                  <Option value="2">WPS-2024-002 - 不锈钢容器角焊缝工艺</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )

      case 1:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="base_material"
                label="母材"
                rules={[{ required: true, message: '请输入母材' }]}
              >
                <Input placeholder="例如: Q235" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="base_material_thickness"
                label="母材厚度 (mm)"
                rules={[{ required: true, message: '请输入母材厚度' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="请输入厚度"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="filler_material"
                label="焊材"
                rules={[{ required: true, message: '请输入焊材' }]}
              >
                <Input placeholder="例如: E7018" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="filler_material_diameter"
                label="焊材直径 (mm)"
                rules={[{ required: true, message: '请输入焊材直径' }]}
              >
                <InputNumber
                  min={0}
                  precision={1}
                  placeholder="请输入直径"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="welding_process"
                label="焊接方法"
                rules={[{ required: true, message: '请选择焊接方法' }]}
              >
                <Select placeholder="请选择焊接方法">
                  <Option value="SMAW">SMAW (手工焊)</Option>
                  <Option value="GMAW">GMAW (熔化极气体保护焊)</Option>
                  <Option value="GTAW">GTAW (钨极氩弧焊)</Option>
                  <Option value="FCAW">FCAW (药芯焊丝电弧焊)</Option>
                  <Option value="SAW">SAW (埋弧焊)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="joint_type"
                label="接头类型"
                rules={[{ required: true, message: '请选择接头类型' }]}
              >
                <Select placeholder="请选择接头类型">
                  <Option value="Butt Joint">对接接头</Option>
                  <Option value="T-Joint">T形接头</Option>
                  <Option value="Corner Joint">角接接头</Option>
                  <Option value="Lap Joint">搭接接头</Option>
                  <Option value="Edge Joint">边缘接头</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="welding_position"
                label="焊接位置"
                rules={[{ required: true, message: '请选择焊接位置' }]}
              >
                <Select placeholder="请选择焊接位置">
                  <Option value="1G">1G (平焊)</Option>
                  <Option value="2G">2G (横焊)</Option>
                  <Option value="3G">3G (立焊)</Option>
                  <Option value="4G">4G (仰焊)</Option>
                  <Option value="1F">1F (平角焊)</Option>
                  <Option value="2F">2F (横角焊)</Option>
                  <Option value="3F">3F (立角焊)</Option>
                  <Option value="4F">4F (仰角焊)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )

      case 2:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="tensile_strength"
                label="抗拉强度 (MPa)"
                rules={[{ required: true, message: '请输入抗拉强度' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="请输入抗拉强度"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="yield_strength"
                label="屈服强度 (MPa)"
                rules={[{ required: true, message: '请输入屈服强度' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="请输入屈服强度"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="elongation"
                label="延伸率 (%)"
                rules={[{ required: true, message: '请输入延伸率' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="请输入延伸率"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="impact_energy"
                label="冲击能量 (J)"
                rules={[{ required: true, message: '请输入冲击能量' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="请输入冲击能量"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="bend_test_result"
                label="弯曲试验结果"
                rules={[{ required: true, message: '请输入弯曲试验结果' }]}
              >
                <TextArea
                  rows={2}
                  placeholder="请描述弯曲试验结果"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="macro_examination"
                label="宏观检查结果"
                rules={[{ required: true, message: '请输入宏观检查结果' }]}
              >
                <TextArea
                  rows={2}
                  placeholder="请描述宏观检查结果"
                />
              </Form.Item>
            </Col>
          </Row>
        )

      case 3:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="attachments"
                label="附件管理"
              >
                <Upload.Dragger
                  name="files"
                  multiple
                  action="/api/upload"
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                  <p className="ant-upload-hint">
                    支持单个或批量上传。严格禁止上传公司数据或其他敏感信息。
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="notes" label="备注">
                <TextArea
                  rows={3}
                  placeholder="请输入其他备注信息"
                />
              </Form.Item>
            </Col>
          </Row>
        )

      default:
        return null
    }
  }

  if (isLoadingDetail) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center h-64">
          <span>加载中...</span>
        </div>
      </div>
    )
  }

  if (detailError) {
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

  return (
    <div className="page-container">
      <div className="page-header">
        <Space className="w-full justify-between">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
            >
              返回详情
            </Button>
            <Title level={2} className="mb-0">编辑PQR</Title>
          </Space>
          {hasChanges && (
            <Text type="warning">
              <ExclamationCircleOutlined /> 您有未保存的更改
            </Text>
          )}
        </Space>
      </div>

      <Card>
        {/* 步骤指示器 */}
        <Steps current={currentStep} className="mb-6">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={index < currentStep ? <CheckOutlined /> : undefined}
            />
          ))}
        </Steps>

        {/* 表单区域 */}
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          {renderStepForm()}
        </Form>

        {/* 操作按钮 */}
        <div className="flex justify-between mt-6">
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            上一步
          </Button>

          <Space>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={handlePreview}
            >
              预览
            </Button>
            <Button
              type="primary"
              icon={currentStep === steps.length - 1 ? <SaveOutlined /> : <RightOutlined />}
              onClick={handleNext}
              loading={loading || updatePQRMutation.isLoading}
            >
              {currentStep === steps.length - 1 ? '保存更改' : '下一步'}
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default PQREdit