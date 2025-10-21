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
  Avatar,
  Tooltip,
  Modal,
  message,
  Alert,
  Progress,
  Statistic,
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
  UserOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Welder } from '@/types'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const WeldersDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('info')

  // 模拟获取焊工详情数据
  const welderData: Welder = {
    id: id || '1',
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
  }

  // 模拟工作经历
  const workHistory = [
    {
      id: '1',
      project: '压力容器制造项目',
      position: '主焊工',
      startDate: '2023-06-01',
      endDate: '2023-12-31',
      status: '已完成',
      performance: '优秀',
    },
    {
      id: '2',
      project: '管道安装工程',
      position: '焊工',
      startDate: '2023-01-15',
      endDate: '2023-05-30',
      status: '已完成',
      performance: '良好',
    },
  ]

  // 模拟培训记录
  const trainingRecords = [
    {
      id: '1',
      name: '高级焊接技术培训',
      type: '技能提升',
      date: '2023-10-15',
      duration: '5天',
      result: '合格',
      certificate: '有',
    },
    {
      id: '2',
      name: '安全操作培训',
      type: '安全培训',
      date: '2023-03-20',
      duration: '1天',
      result: '合格',
      certificate: '有',
    },
  ]

  // 模拟考核记录
  const assessmentRecords = [
    {
      id: '1',
      name: '年度技能考核',
      date: '2023-12-10',
      score: 92,
      level: '优秀',
      assessor: '李考核员',
    },
    {
      id: '2',
      name: '安全知识测试',
      date: '2023-06-15',
      score: 88,
      level: '良好',
      assessor: '王安全员',
    },
  ]

  // 获取证书等级显示名称
  const getCertificationLevelName = (level: string) => {
    const levelNames: Record<string, { color: string; text: string }> = {
      '初级': { color: 'default', text: '初级' },
      '中级': { color: 'processing', text: '中级' },
      '高级': { color: 'success', text: '高级' },
      '技师': { color: 'warning', text: '技师' },
      '高级技师': { color: 'error', text: '高级技师' },
    }
    return levelNames[level] || levelNames['初级']
  }

  // 获取证书状态
  const getCertificationStatus = (expiryDate: string) => {
    const now = dayjs()
    const expiry = dayjs(expiryDate)
    const diffDays = expiry.diff(now, 'days')
    
    if (diffDays < 0) {
      return { color: 'error', text: '已过期', icon: <ExclamationCircleOutlined /> }
    } else if (diffDays <= 30) {
      return { color: 'warning', text: '即将过期', icon: <WarningOutlined /> }
    } else {
      return { color: 'success', text: '有效', icon: <CheckCircleOutlined /> }
    }
  }

  const certStatus = getCertificationStatus(welderData.expiry_date || '')

  // 处理编辑
  const handleEdit = () => {
    navigate(`/welders/${id}/edit`)
  }

  // 处理删除
  const handleDelete = () => {
    Modal.confirm({
      title: '确定要删除这个焊工吗？',
      icon: <ExclamationCircleOutlined />,
      content: '删除后将无法恢复',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
        navigate('/welders')
      },
    })
  }

  // 隐藏身份证号中间部分
  const maskIdNumber = (idNumber: string) => {
    if (idNumber && idNumber.length >= 10) {
      return `${idNumber.substring(0, 6)}********${idNumber.substring(idNumber.length - 4)}`
    }
    return idNumber
  }

  // 隐藏手机号中间部分
  const maskPhoneNumber = (phone: string) => {
    if (phone && phone.length >= 7) {
      return `${phone.substring(0, 3)}****${phone.substring(phone.length - 4)}`
    }
    return phone
  }

  // 工作经历表格列
  const workHistoryColumns = [
    {
      title: '项目名称',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '已完成' ? 'success' : 'processing'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '绩效',
      dataIndex: 'performance',
      key: 'performance',
      render: (performance: string) => (
        <Tag color={performance === '优秀' ? 'success' : performance === '良好' ? 'processing' : 'default'}>
          {performance}
        </Tag>
      ),
    },
  ]

  // 培训记录表格列
  const trainingColumns = [
    {
      title: '培训名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '技能提升' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => (
        <Tag color={result === '合格' ? 'success' : 'error'}>
          {result}
        </Tag>
      ),
    },
    {
      title: '证书',
      dataIndex: 'certificate',
      key: 'certificate',
      render: (certificate: string) => (
        <Tag color={certificate === '有' ? 'success' : 'default'}>
          {certificate}
        </Tag>
      ),
    },
  ]

  // 考核记录表格列
  const assessmentColumns = [
    {
      title: '考核名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '分数',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Text strong style={{ color: score >= 90 ? '#52c41a' : score >= 80 ? '#1890ff' : '#fa8c16' }}>
          {score}
        </Text>
      ),
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={level === '优秀' ? 'success' : level === '良好' ? 'processing' : 'default'}>
          {level}
        </Tag>
      ),
    },
    {
      title: '考核人',
      dataIndex: 'assessor',
      key: 'assessor',
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/welders')}
          >
            返回列表
          </Button>
          <Title level={2}>焊工详情</Title>
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
                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={8}>
                        <div className="text-center">
                          <Avatar size={120} icon={<UserOutlined />} src="" />
                          <Title level={3} className="mt-3">
                            {welderData.full_name}
                          </Title>
                          <Tag color="blue">{welderData.welder_code}</Tag>
                        </div>
                      </Col>
                      <Col xs={24} md={16}>
                        <Descriptions bordered column={2}>
                          <Descriptions.Item label="焊工编号">
                            {welderData.welder_code}
                          </Descriptions.Item>
                          <Descriptions.Item label="姓名">
                            {welderData.full_name}
                          </Descriptions.Item>
                          <Descriptions.Item label="身份证号">
                            {maskIdNumber(welderData.id_number || '')}
                          </Descriptions.Item>
                          <Descriptions.Item label="联系电话">
                            {maskPhoneNumber(welderData.phone || '')}
                          </Descriptions.Item>
                          <Descriptions.Item label="证书编号">
                            {welderData.certification_number}
                          </Descriptions.Item>
                          <Descriptions.Item label="证书等级">
                            <Tag color={getCertificationLevelName(welderData.certification_level || '').color}>
                              {getCertificationLevelName(welderData.certification_level || '').text}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="发证日期">
                            {dayjs(welderData.certification_date).format('YYYY-MM-DD')}
                          </Descriptions.Item>
                          <Descriptions.Item label="有效期至">
                            <Space>
                              <Text>{dayjs(welderData.expiry_date).format('YYYY-MM-DD')}</Text>
                              <Tag color={certStatus.color} icon={certStatus.icon}>
                                {certStatus.text}
                              </Tag>
                            </Space>
                          </Descriptions.Item>
                          <Descriptions.Item label="资质工艺" span={2}>
                            <Space wrap>
                              {(welderData.qualified_processes || []).map(process => (
                                <Tag key={process} color="blue">
                                  {process}
                                </Tag>
                              ))}
                            </Space>
                          </Descriptions.Item>
                          <Descriptions.Item label="状态">
                            <Tag color={welderData.is_active ? 'success' : 'default'}>
                              {welderData.is_active ? '在职' : '离职'}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="入职日期">
                            {dayjs(welderData.created_at).format('YYYY-MM-DD')}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>
                  )
                },
                {
                  key: 'work',
                  label: '工作经历',
                  children: (
                    <Table
                      dataSource={workHistory}
                      columns={workHistoryColumns}
                      rowKey="id"
                      pagination={false}
                    />
                  )
                },
                {
                  key: 'training',
                  label: '培训记录',
                  children: (
                    <Table
                      dataSource={trainingRecords}
                      columns={trainingColumns}
                      rowKey="id"
                      pagination={false}
                    />
                  )
                },
                {
                  key: 'assessment',
                  label: '考核记录',
                  children: (
                    <Table
                      dataSource={assessmentRecords}
                      columns={assessmentColumns}
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
          <Card title="证书状态">
            <div className="text-center p-4">
              <div className="mb-4">
                <Avatar size={64} icon={<SafetyCertificateOutlined />} className="mb-3" />
                <Title level={4}>{welderData.certification_level}</Title>
                <Tag color={getCertificationLevelName(welderData.certification_level || '').color}>
                  {getCertificationLevelName(welderData.certification_level || '').text}
                </Tag>
              </div>
              <Divider />
              <div className="mb-4">
                <Text>证书编号: {welderData.certification_number}</Text>
              </div>
              <div className="mb-4">
                <Text>有效期至: {dayjs(welderData.expiry_date).format('YYYY-MM-DD')}</Text>
              </div>
              <div>
                <Tag color={certStatus.color} icon={certStatus.icon}>
                  {certStatus.text}
                </Tag>
              </div>
            </div>
          </Card>

          <Card title="资质工艺" className="mt-6">
            <div className="p-4">
              <Space wrap>
                {welderData.qualified_processes.map(process => (
                  <Tag key={process} color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {process}
                  </Tag>
                ))}
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
                编辑焊工
              </Button>
              <Button
                icon={<PlusOutlined />}
                block
              >
                添加培训记录
              </Button>
              <Button
                icon={<PlusOutlined />}
                block
              >
                添加考核记录
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
                删除焊工
              </Button>
            </Space>
          </Card>

          {certStatus.color === 'warning' && (
            <Alert
              message="证书即将过期"
              description={`焊工证书将于 ${dayjs(welderData.expiry_date).format('YYYY-MM-DD')} 过期，请及时安排续证培训`}
              type="warning"
              showIcon
              className="mt-6"
            />
          )}

          {certStatus.color === 'error' && (
            <Alert
              message="证书已过期"
              description={`焊工证书已于 ${dayjs(welderData.expiry_date).format('YYYY-MM-DD')} 过期，请立即安排续证培训`}
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

export default WeldersDetail