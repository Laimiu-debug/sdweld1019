import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, Typography, Button, Space, Tag, Descriptions } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const WPSDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <div className="page-header">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/wps')}
          >
            返回列表
          </Button>
          <Title level={2}>WPS详情</Title>
        </Space>
      </div>

      <Card>
        <Descriptions title="基本信息" bordered column={2}>
          <Descriptions.Item label="WPS编号">WPS-2024-001</Descriptions.Item>
          <Descriptions.Item label="标题">碳钢管道对接焊工艺</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color="success">已批准</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="版本">1.0</Descriptions.Item>
          <Descriptions.Item label="标准">AWS D1.1</Descriptions.Item>
          <Descriptions.Item label="优先级">普通</Descriptions.Item>
        </Descriptions>

        <Space className="mt-4">
          <Button type="primary" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button icon={<DownloadOutlined />}>
            下载PDF
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default WPSDetail