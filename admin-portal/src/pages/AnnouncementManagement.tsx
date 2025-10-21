import React from 'react';
import { Card } from 'antd';

const AnnouncementManagement: React.FC = () => {
  return (
    <div>
      <div className="admin-header">
        <h1 className="page-title">公告管理</h1>
      </div>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
          公告管理功能开发中...
        </div>
      </Card>
    </div>
  );
};

export default AnnouncementManagement;