import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  message,
  Typography,
  Row,
  Col,
  Divider,
} from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const EquipmentCreate: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('设备创建成功')
      navigate('/equipment')
    } catch (error) {
      message.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/equipment')}
          >
            返回设备列表
          </Button>
          <Title level={2}>添加新设备</Title>
        </Space>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            purchaseDate: dayjs(),
            status: 'operational',
            operatingHours: 0,
            utilizationRate: 0,
            downtimeHours: 0,
            efficiency: 100,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipmentCode"
                label="设备编号"
                rules={[{ required: true, message: '请输入设备编号' }]}
              >
                <Input placeholder="例如: EQP-2024-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="equipmentName"
                label="设备名称"
                rules={[{ required: true, message: '请输入设备名称' }]}
              >
                <Input placeholder="例如: 数字化逆变焊机" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipmentType"
                label="设备类型"
                rules={[{ required: true, message: '请选择设备类型' }]}
              >
                <Select placeholder="选择设备类型">
                  <Option value="焊机">焊机</Option>
                  <Option value="切割机">切割机</Option>
                  <Option value="检测设备">检测设备</Option>
                  <Option value="辅助设备">辅助设备</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="manufacturer"
                label="制造商"
                rules={[{ required: true, message: '请输入制造商' }]}
              >
                <Input placeholder="例如: 时代焊机" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="model"
                label="型号"
                rules={[{ required: true, message: '请输入型号' }]}
              >
                <Input placeholder="例如: ZX7-400" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="serialNumber"
                label="序列号"
                rules={[{ required: true, message: '请输入序列号' }]}
              >
                <Input placeholder="设备唯一序列号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="存放位置"
                rules={[{ required: true, message: '请输入存放位置' }]}
              >
                <Input placeholder="例如: 生产车间A区" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsiblePerson"
                label="负责人"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="设备负责人姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchaseDate"
                label="购买日期"
                rules={[{ required: true, message: '请选择购买日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="purchasePrice"
                label="购买价格"
                rules={[{ required: true, message: '请输入购买价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="warrantyExpiry"
                label="保修到期"
                rules={[{ required: true, message: '请选择保修到期日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="设备状态"
                rules={[{ required: true, message: '请选择设备状态' }]}
              >
                <Select placeholder="选择设备状态">
                  <Option value="operational">正常运行</Option>
                  <Option value="maintenance">维护中</Option>
                  <Option value="broken">故障</Option>
                  <Option value="retired">已报废</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="specifications"
            label="技术规格"
          >
            <TextArea
              rows={4}
              placeholder="请输入设备技术规格信息..."
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注信息"
          >
            <TextArea
              rows={3}
              placeholder="其他需要说明的信息..."
            />
          </Form.Item>

          <Divider />

          <div className="text-right">
            <Space>
              <Button onClick={() => navigate('/equipment')}>
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存设备
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default EquipmentCreate