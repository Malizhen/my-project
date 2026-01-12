import React from 'react';
import { Card, Empty } from 'antd';

const Categories = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <Card title="标签管理">
        <Empty description="标签管理功能开发中..." />
      </Card>
    </div>
  );
};

export default Categories;
