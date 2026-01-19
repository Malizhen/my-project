/**
 * 概览卡片组件
 */
import React from 'react';
import { Row, Col, Card, Statistic, Skeleton } from 'antd';
import { 
  ApiOutlined, 
  StopOutlined, 
  UserOutlined, 
  WarningOutlined 
} from '@ant-design/icons';

function OverviewCards({ data, loading }) {
  if (loading) {
    return (
      <Row gutter={[16, 16]} className="overview-cards">
        {[1, 2, 3, 4].map(i => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card className="overview-card">
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const cards = [
    {
      title: '今日请求数',
      value: data?.totalRequests || 0,
      icon: <ApiOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      title: '被限流请求',
      value: data?.blockedRequests || 0,
      icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
      color: '#ff4d4f'
    },
    {
      title: '活跃客户端',
      value: data?.activeClients || 0,
      icon: <UserOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      title: '累计违规次数',
      value: data?.totalViolations || 0,
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
      color: '#faad14'
    }
  ];

  return (
    <Row gutter={[16, 16]} className="overview-cards">
      {cards.map((card, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card className="overview-card" hoverable>
            <Statistic
              title={
                <span>
                  {card.icon}
                  <span style={{ marginLeft: 8 }}>{card.title}</span>
                </span>
              }
              value={card.value}
              valueStyle={{ color: card.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default OverviewCards;
