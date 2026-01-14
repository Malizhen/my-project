import React from 'react';
import { Card, Empty } from 'antd';

const Statistics = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <Card title="心情统计">
        <Empty description="统计功能开发中..." />
      </Card>
    </div>
  );
};

export default Statistics;
