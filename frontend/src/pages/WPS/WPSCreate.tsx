import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  Divider,
  Tooltip,
  Badge,
  Modal,
  Descriptions,
  Tag,
} from 'antd'
import {
  SaveOutlined,
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  CheckOutlined,
  CopyOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  FireOutlined,
  ExperimentOutlined,
} from '@ant-design/icons'
import { WPSRecord } from '@/types'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { Step } = Steps

interface WPSCreateForm {
  // 基本信息
  wps_number: string
  title: string
  version: string
  priority: string
  standard: string
  specification_number: string
  
  // 焊接工艺参数
  base_material: string
  base_material_group: string
  base_material_thickness: number
  filler_material: string
  filler_material_classification: string
  welding_process: string
  welding_process_variant: string
  joint_type: string
  joint_design: string
  welding_position: string
  welding_position_progression: string
  
  // 温度参数
  preheat_temp_min: number
  preheat_temp_max: number
  interpass_temp_min: number
  interpass_temp_max: number
  
  // 电气参数
  current_range: string
  voltage_range: string
  travel_speed: string
  heat_input_range: string
  
  // 保护气体
  gas_shield_type: string
  gas_flow_rate: number
  
  // 钨极参数
  tungsten_electrode_type: string
  electrode_diameter: number
  
  // 技术信息
  technique_description: string
  welder_qualification_requirement: string
  notes: string
}

const WPSCreate: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<WPSCreateForm>>({})
  const [previewVisible, setPreviewVisible] = useState(false)
  const [isCopyMode, setIsCopyMode] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, checkPermission } = useAuthStore()

  // 检查是否为复制模式
  useEffect(() => {
    const copyFromId = searchParams.get('copyFrom')
    if (copyFromId) {
      setIsCopyMode(true)
      // 这里应该加载复制的WPS数据
      loadCopyData(copyFromId)
    }
  }, [searchParams])

  // 加载复制数据
  const loadCopyData = async (id: string) => {
    try {
      // 模拟加载复制的WPS数据
      const copyData = {
        wps_number: `WPS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        title: '复制的WPS标题',
        version: '1.0',
        priority: 'normal',
        standard: 'AWS D1.1',
        base_material: 'Q235',
        filler_material: 'E7018',
        welding_process: 'SMAW',
        joint_type: 'Butt Joint',
        welding_position: '1G',
      }

      form.setFieldsValue(copyData)
      message.success('WPS数据已复制，请修改相关参数')
    } catch (error) {
      message.error('复制WPS失败')
    }
  }

  // 步骤配置
  const steps = [
    {
      title: '基本信息',
      description: '填写WPS的基本信息',
      icon: <FileTextOutlined />,
    },
    {
      title: '工艺参数',
      description: '设置焊接工艺参数',
      icon: <SettingOutlined />,
    },
    {
      title: '温度参数',
      description: '配置预热和层间温度',
      icon: <FireOutlined />,
    },
    {
      title: '电气参数',
      description: '设置电流、电压等参数',
      icon: <ThunderboltOutlined />,
    },
    {
      title: '保护气体',
      description: '配置保护气体参数',
      icon: <ExperimentOutlined />,
    },
    {
      title: '技术信息',
      description: '填写技术描述和要求',
      icon: <InfoCircleOutlined />,
    },
  ]

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
      ['wps_number', 'title', 'version', 'priority', 'standard'],
      // 工艺参数
      ['base_material', 'filler_material', 'welding_process', 'joint_type', 'welding_position'],
      // 温度参数
      ['preheat_temp_min', 'preheat_temp_max', 'interpass_temp_min', 'interpass_temp_max'],
      // 电气参数
      ['current_range', 'voltage_range', 'travel_speed'],
      // 保护气体
      ['gas_shield_type', 'gas_flow_rate'],
      // 技术信息
      ['technique_description'],
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
      
      // 这里应该调用实际的API创建WPS
      console.log('Creating WPS with data:', finalData)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('WPS创建成功')
      navigate('/wps')
    } catch (error) {
      message.error('创建失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理预览
  const handlePreview = () => {
    const allValues = form.getFieldsValue()
    const previewData = { ...formData, ...allValues }

    setPreviewVisible(true)
  }

  // 渲染预览内容
  const renderPreviewContent = () => {
    const allValues = form.getFieldsValue()
    const previewData = { ...formData, ...allValues }

    return (
      <div className="wps-preview">
        <Descriptions title={previewData.title || 'WPS预览'} bordered column={2}>
          <Descriptions.Item label="WPS编号">
            {previewData.wps_number || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="版本">
            {previewData.version || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag color={
              previewData.priority === 'high' ? 'red' :
              previewData.priority === 'urgent' ? 'red' :
              previewData.priority === 'low' ? 'default' : 'blue'
            }>
              {previewData.priority === 'high' ? '高' :
               previewData.priority === 'urgent' ? '紧急' :
               previewData.priority === 'low' ? '低' : '普通'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="标准">
            {previewData.standard || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="母材" span={2}>
            {previewData.base_material || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="焊材" span={2}>
            {previewData.filler_material || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="焊接方法" span={2}>
            {previewData.welding_process || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="接头类型" span={2}>
            {previewData.joint_type || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="焊接位置" span={2}>
            {previewData.welding_position || '-'}
          </Descriptions.Item>
          {previewData.technique_description && (
            <Descriptions.Item label="工艺描述" span={2}>
              {previewData.technique_description}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>
    )
  }

  // 渲染当前步骤的表单
  const renderStepForm = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="wps_number"
                label="WPS编号"
                rules={[{ required: true, message: '请输入WPS编号' }]}
              >
                <Input placeholder="例如: WPS-2024-001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input placeholder="请输入WPS标题" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="version"
                label="版本"
                initialValue="1.0"
                rules={[{ required: true, message: '请输入版本' }]}
              >
                <Input placeholder="例如: 1.0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="priority"
                label="优先级"
                initialValue="normal"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="low">低</Option>
                  <Option value="normal">普通</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="standard"
                label="标准"
                rules={[{ required: true, message: '请选择标准' }]}
              >
                <Select placeholder="请选择标准">
                  <Option value="AWS D1.1">AWS D1.1</Option>
                  <Option value="ASME Section IX">ASME Section IX</Option>
                  <Option value="ISO 15614-1">ISO 15614-1</Option>
                  <Option value="GB/T 19869">GB/T 19869</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="specification_number" label="规范编号">
                <Input placeholder="请输入规范编号" />
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
              <Form.Item name="base_material_group" label="母材组号">
                <Input placeholder="例如: 1" />
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
              <Form.Item name="filler_material_classification" label="焊材分类">
                <Input placeholder="例如: A1" />
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
              <Form.Item name="welding_process_variant" label="焊接方法变体">
                <Input placeholder="请输入焊接方法变体" />
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
              <Form.Item name="joint_design" label="接头设计">
                <TextArea rows={2} placeholder="请描述接头设计" />
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
            <Col xs={24} sm={12}>
              <Form.Item name="welding_position_progression" label="焊接位置进展">
                <Select placeholder="请选择焊接位置进展">
                  <Option value="vertical">垂直</Option>
                  <Option value="horizontal">水平</Option>
                  <Option value="overhead">仰焊</Option>
                  <Option value="inclined">倾斜</Option>
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
                name="preheat_temp_min"
                label="最低预热温度 (°C)"
                rules={[{ required: true, message: '请输入最低预热温度' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="请输入最低预热温度"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="preheat_temp_max"
                label="最高预热温度 (°C)"
                rules={[{ required: true, message: '请输入最高预热温度' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="请输入最高预热温度"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="interpass_temp_min"
                label="最低层间温度 (°C)"
                rules={[{ required: true, message: '请输入最低层间温度' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="请输入最低层间温度"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="interpass_temp_max"
                label="最高层间温度 (°C)"
                rules={[{ required: true, message: '请输入最高层间温度' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="请输入最高层间温度"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        )
      
      case 3:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="current_range"
                label="电流范围"
                rules={[{ required: true, message: '请输入电流范围' }]}
              >
                <Input placeholder="例如: 90-130A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="voltage_range"
                label="电压范围"
                rules={[{ required: true, message: '请输入电压范围' }]}
              >
                <Input placeholder="例如: 22-28V" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="travel_speed"
                label="焊接速度"
                rules={[{ required: true, message: '请输入焊接速度' }]}
              >
                <Input placeholder="例如: 3-5 cm/min" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="heat_input_range" label="热输入范围">
                <Input placeholder="例如: 0.8-1.5 kJ/mm" />
              </Form.Item>
            </Col>
          </Row>
        )
      
      case 4:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gas_shield_type"
                label="保护气体类型"
                rules={[{ required: true, message: '请选择保护气体类型' }]}
              >
                <Select placeholder="请选择保护气体类型">
                  <Option value="Ar">氩气 (Ar)</Option>
                  <Option value="CO2">二氧化碳 (CO2)</Option>
                  <Option value="Ar+CO2">氩气+二氧化碳混合气</Option>
                  <Option value="He">氦气 (He)</Option>
                  <Option value="N2">氮气 (N2)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gas_flow_rate"
                label="气体流量 (L/min)"
                rules={[{ required: true, message: '请输入气体流量' }]}
              >
                <InputNumber
                  min={0}
                  precision={1}
                  placeholder="请输入气体流量"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="tungsten_electrode_type" label="钨极类型">
                <Select placeholder="请选择钨极类型">
                  <Option value="Pure W">纯钨</Option>
                  <Option value="Thoriated W">钍钨</Option>
                  <Option value="Ceriated W">铈钨</Option>
                  <Option value="Lanthanated W">镧钨</Option>
                  <Option value="Zirconiated W">锆钨</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="electrode_diameter" label="电极直径 (mm)">
                <InputNumber
                  min={0}
                  precision={1}
                  placeholder="请输入电极直径"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        )
      
      case 5:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="technique_description"
                label="工艺描述"
                rules={[{ required: true, message: '请输入工艺描述' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请详细描述焊接工艺方法和注意事项"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="welder_qualification_requirement" label="焊工资质要求">
                <TextArea
                  rows={3}
                  placeholder="请描述焊工需要具备的资质和技能要求"
                />
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

  return (
    <div className="wps-create-container">
      <div className="page-header">
        <div className="page-title">
          <Title level={2}>
            {isCopyMode ? '复制WPS' : '创建WPS'}
            {isCopyMode && <Tag color="blue" className="ml-2">复制模式</Tag>}
          </Title>
          <Text type="secondary">
            按照步骤填写完整的焊接工艺规程信息
          </Text>
        </div>
        <Space>
          <Tooltip title="查看帮助文档">
            <Button icon={<QuestionCircleOutlined />} />
          </Tooltip>
        </Space>
      </div>

      {/* 复制模式提示 */}
      {isCopyMode && (
        <Alert
          message="复制模式"
          description="您正在基于现有WPS创建新规程，请根据需要修改相关参数。"
          type="info"
          showIcon
          closable
          className="mb-4"
        />
      )}

      <Card className="wps-create-card">
        {/* 步骤指示器 */}
        <Steps current={currentStep} className="create-steps mb-6">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
              status={index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait'}
            />
          ))}
        </Steps>

        {/* 表单区域 */}
        <div className="form-section">
          <div className="step-header">
            <div className="step-title">
              {steps[currentStep].icon}
              <Title level={4}>{steps[currentStep].title}</Title>
            </div>
            <Text type="secondary">{steps[currentStep].description}</Text>
          </div>

          <Divider className="step-divider" />

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              version: '1.0',
              priority: 'normal',
            }}
          >
            {renderStepForm()}
          </Form>
        </div>

        {/* 操作按钮 */}
        <div className="form-actions">
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrev}
            disabled={currentStep === 0}
            size="large"
          >
            上一步
          </Button>

          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={handlePreview}
              size="large"
            >
              预览
            </Button>
            <Button
              type="primary"
              icon={currentStep === steps.length - 1 ? <SaveOutlined /> : <RightOutlined />}
              onClick={handleNext}
              loading={loading}
              size="large"
            >
              {currentStep === steps.length - 1 ? '创建WPS' : '下一步'}
            </Button>
          </Space>
        </div>
      </Card>

      {/* 预览模态框 */}
      <Modal
        title="WPS预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button key="save" type="primary" onClick={handleSubmit}>
            创建WPS
          </Button>,
        ]}
        width={800}
        className="wps-preview-modal"
      >
        {renderPreviewContent()}
      </Modal>
    </div>
  )
}

export default WPSCreate