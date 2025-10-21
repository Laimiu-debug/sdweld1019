import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

const PPQREdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/ppqr')}
        >
          返回列表
        </Button>
        <Title level={2}>编辑pPQR</Title>
      </div>

      <Card>
        <p>pPQR编辑页面 - ID: {id}</p>
      </Card>
    </div>
  )
}

export default PPQREdit