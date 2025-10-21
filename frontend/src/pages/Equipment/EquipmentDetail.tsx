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
  Divider,
  Tabs,
  Table,
  Timeline,
  Badge,
  Progress,
  Statistic,
  Avatar,
  Tooltip,
  Modal,
  message,
  Alert,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ToolOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { Equipment, EquipmentStatus, EquipmentType } from '@/types'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('info')

  // 模拟获取设备详情数据
  const equipmentData: Equipment = {
    id: id || '1',
    user_id: 'user1',
    equipment_code: 'EQP-2024-001',
    equipment_name: '数字化逆变焊机',
    equipment_type: 'welding_machine',
    manufacturer: '松下',
    model: 'YD-400KR2',
    serial_number: 'SN20240101001',
    status: 'operational',
    purchase_date: '2024-01-10',
    last_maintenance_date: '2024-01-15',
    next_maintenance_date: '2024-07-15',
    created_at: '2024-01-10T10:30:00Z',
    updated_at: '2024-01-10T10:30:00Z',
  }

  // 模拟维护记录
  const maintenanceRecords = [
    {
      id: '1',
      date: '2024-01-15',
      type: '定期维护',
      description: '更换焊枪配件，清理内部灰尘',
      technician: '张技师',
      cost: 350,
      nextMaintenanceDate: '2024-07-15',
    },
    {
      id: '2',
      date: '2023-10-20',
      type: '故障维修',
      description: '更换电源模块',
      technician: '李工程师',
      cost: 1200,
      nextMaintenanceDate: '2024-01-15',
    },
  ]

  // 模拟使用记录
  const usageRecords = [
    {
      id: '1',
      date: '2024-01-20',
      project: '压力容器项目',
      operator: '王焊工',
      duration: 8, // 小时
      status: '正常',
    },
    {
      id: '2',
      date: '2024-01-18',
      project: '管道焊接项目',
      operator: '李焊工',
      duration: 6,
      status: '正常',
    },
  ]

  // 模拟故障记录
  const faultRecords = [
    {
      id: '1',
      date: '2023-10-15',
      type: '电源故障',
      description: '设备无法启动，电源指示灯不亮',
      reporter: '王操作员',
      resolved: true,
      resolveDate: '2023-10-20',
      resolver: '李工程师',
      solution: '更换电源模块',
    },
  ]

  // 获取设备类型显示名称
  const getEquipmentTypeName = (type: EquipmentType) => {
    const typeNames: Record<EquipmentType, { color: string; text: string }> = {
      'welding_machine': { color: 'blue', text: '焊机' },
      'cutting_machine': { color: 'green', text: '切割机' },
      'testing_equipment': { color: 'orange', text: '检测设备' },
      'auxiliary_equipment': { color: 'purple', text: '辅助设备' },
    }
    return typeNames[type] || { color: 'default', text: type }
  }

  // 获取设备状态显示名称
  const getEquipmentStatusName = (status: EquipmentStatus) => {
    const statusNames: Record<EquipmentStatus, { color: string; text: string; icon: React.ReactNode }> = {
      'operational': { color: 'success', text: '正常运行', icon: <CheckCircleOutlined /> },
      'maintenance': { color: 'processing', text: '维护中', icon: <ToolOutlined /> },
      'broken': { color: 'error', text: '故障', icon: <ExclamationCircleOutlined /> },
      'retired': { color: 'default', text: '已报废', icon: <ClockCircleOutlined /> },
    }
    return statusNames[status] || statusNames['operational']
  }

  // 获取维护状态
  const getMaintenanceStatus = (nextMaintenanceDate: string) => {
    const now = dayjs()
    const nextDate = dayjs(nextMaintenanceDate)
    const diffDays = nextDate.diff(now, 'days')
    
    if (diffDays < 0) {
      return { color: 'error', text: '已逾期', icon: <ExclamationCircleOutlined /> }
    } else if (diffDays <= 7) {
      return { color: 'warning', text: '即将到期', icon: <WarningOutlined /> }
    } else {
      return { color: 'success', text: '正常', icon: <CheckCircleOutlined /> }
    }
  }

  const equipmentStatus = getEquipmentStatusName(equipmentData.status)
  const maintenanceStatus = getMaintenanceStatus(equipmentData.next_maintenance_date || '')

  // 处理编辑
  const handleEdit = () => {
    navigate(`/equipment/${id}/edit`)
  }

  // 处理删除
  const handleDelete = () => {
    Modal.confirm({
      title: '确定要删除这个设备吗？',
      icon: <ExclamationCircleOutlined />,
      content: '删除后将无法恢复',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
        navigate('/equipment')
      },
    })
  }

  // 处理添加维护记录
  const handleAddMaintenance = () => {
    message.info('添加维护记录功能开发中')
  }

  // 维护记录表格列
  const maintenanceColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '定期维护' ? 'blue' : 'orange'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '技术员',
      dataIndex: 'technician',
      key: 'technician',
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => `¥${cost}`,
    },
    {
      title: '下次维护',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
  ]

  // 使用记录表格列
  const usageColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '使用时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration}小时`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '正常' ? 'success' : 'error'}>
          {status}
        </Tag>
      ),
    },
  ]

  // 故障记录表格列
  const faultColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '故障类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="red">{type}</Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '报告人',
      dataIndex: 'reporter',
      key: 'reporter',
    },
    {
      title: '状态',
      dataIndex: 'resolved',
      key: 'resolved',
      render: (resolved: boolean) => (
        <Tag color={resolved ? 'success' : 'error'}>
          {resolved ? '已解决' : '未解决'}
        </Tag>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/equipment')}
          >
            返回列表
          </Button>
          <Title level={2}>设备详情</Title>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'info',
                  label: '基本信息',
                  children: (
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="设备编号">
                        {equipmentData.equipment_code}
                      </Descriptions.Item>
                      <Descriptions.Item label="设备名称">
                        {equipmentData.equipment_name}
                      </Descriptions.Item>
                      <Descriptions.Item label="设备类型">
                        <Tag color={getEquipmentTypeName(equipmentData.equipment_type).color}>
                          {getEquipmentTypeName(equipmentData.equipment_type).text}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="制造商">
                        {equipmentData.manufacturer}
                      </Descriptions.Item>
                      <Descriptions.Item label="型号">
                        {equipmentData.model}
                      </Descriptions.Item>
                      <Descriptions.Item label="序列号">
                        {equipmentData.serial_number}
                      </Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <Tag color={equipmentStatus.color} icon={equipmentStatus.icon}>
                          {equipmentStatus.text}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="购买日期">
                        {dayjs(equipmentData.purchase_date).format('YYYY-MM-DD')}
                      </Descriptions.Item>
                      <Descriptions.Item label="上次维护日期">
                        {dayjs(equipmentData.last_maintenance_date || '').format('YYYY-MM-DD')}
                      </Descriptions.Item>
                      <Descriptions.Item label="下次维护日期">
                        <Space>
                          <Text>{dayjs(equipmentData.next_maintenance_date || '').format('YYYY-MM-DD')}</Text>
                          <Tag color={maintenanceStatus.color} icon={maintenanceStatus.icon}>
                            {maintenanceStatus.text}
                          </Tag>
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                  )
                },
                {
                  key: 'maintenance',
                  label: '维护记录',
                  children: (
                    <Table
                      dataSource={maintenanceRecords}
                      columns={maintenanceColumns}
                      rowKey="id"
                      pagination={false}
                    />
                  )
                },
                {
                  key: 'usage',
                  label: '使用记录',
                  children: (
                    <Table
                      dataSource={usageRecords}
                      columns={usageColumns}
                      rowKey="id"
                      pagination={false}
                    />
                  )
                },
                {
                  key: 'fault',
                  label: '故障记录',
                  children: (
                    <Table
                      dataSource={faultRecords}
                      columns={faultColumns}
                      rowKey="id"
                      pagination={false}
                    />
                  )
                }
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="设备状态">
            <div className="text-center p-4">
              <div className="mb-4">
                <Avatar size={64} icon={<ToolOutlined />} className="mb-3" />
                <Title level={4}>{equipmentData.equipment_name}</Title>
                <Tag color={equipmentStatus.color} icon={equipmentStatus.icon}>
                  {equipmentStatus.text}
                </Tag>
              </div>
              <Divider />
              <div className="mb-4">
                <Text>设备编号: {equipmentData.equipment_code}</Text>
              </div>
              <div className="mb-4">
                <Text>序列号: {equipmentData.serial_number}</Text>
              </div>
            </div>
          </Card>

          <Card title="维护状态" className="mt-6">
            <div className="p-4">
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between">
                  <Text>上次维护:</Text>
                  <Text>{dayjs(equipmentData.last_maintenance_date || '').format('YYYY-MM-DD')}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>下次维护:</Text>
                  <Text>{dayjs(equipmentData.next_maintenance_date || '').format('YYYY-MM-DD')}</Text>
                </div>
                <div className="mt-3">
                  <Tag color={maintenanceStatus.color} icon={maintenanceStatus.icon}>
                    {maintenanceStatus.text}
                  </Tag>
                </div>
              </Space>
            </div>
          </Card>

          <Card title="设备信息" className="mt-6">
            <div className="p-4">
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between">
                  <Text>制造商:</Text>
                  <Text>{equipmentData.manufacturer}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>型号:</Text>
                  <Text>{equipmentData.model}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>购买日期:</Text>
                  <Text>{dayjs(equipmentData.purchase_date).format('YYYY-MM-DD')}</Text>
                </div>
              </Space>
            </div>
          </Card>

          <Card title="操作" className="mt-6">
            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                icon={<EditOutlined />}
                block
                onClick={handleEdit}
              >
                编辑设备
              </Button>
              <Button
                icon={<PlusOutlined />}
                block
                onClick={handleAddMaintenance}
              >
                添加维护记录
              </Button>
              <Button
                icon={<DownloadOutlined />}
                block
              >
                导出信息
              </Button>
              <Button
                icon={<DeleteOutlined />}
                block
                danger
                onClick={handleDelete}
              >
                删除设备
              </Button>
            </Space>
          </Card>

          {maintenanceStatus.color === 'warning' && (
            <Alert
              message="维护即将到期"
              description={`设备计划维护日期为 ${dayjs(equipmentData.next_maintenance_date || '').format('YYYY-MM-DD')}，请及时安排维护`}
              type="warning"
              showIcon
              className="mt-6"
            />
          )}

          {maintenanceStatus.color === 'error' && (
            <Alert
              message="维护已逾期"
              description={`设备计划维护日期为 ${dayjs(equipmentData.next_maintenance_date || '').format('YYYY-MM-DD')}，已逾期，请立即安排维护`}
              type="error"
              showIcon
              className="mt-6"
            />
          )}
        </Col>
      </Row>
    </div>
  )
}

export default EquipmentDetail