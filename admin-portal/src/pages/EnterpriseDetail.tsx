import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'antd';

const EnterpriseDetail: React.FC = () => {
  const { enterpriseId } = useParams<{ enterpriseId: string }>();

  return (
    <div>
      <div className="admin-header">
        <h1 className="page-title">企业详情</h1>
      </div>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
          企业详情页面开发中... (企业ID: {enterpriseId})
        </div>
      </Card>
    </div>
  );
};

export default EnterpriseDetail;