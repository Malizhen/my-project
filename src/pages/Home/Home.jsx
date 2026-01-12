import React from 'react';
import { Card, Row, Col, Button, Statistic, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusCircleOutlined, RiseOutlined, FallOutlined, DollarOutlined } from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import { calculateCurrentMonthStats } from '../../utils/calculations';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { records } = useApp();

  const stats = calculateCurrentMonthStats(records);
  const currentMonth = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>欢迎使用记账本</h1>
        <p className="month-title">{currentMonth}</p>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="本月收入"
              value={stats.income}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
              suffix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="本月支出"
              value={stats.expense}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
              suffix={<FallOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="本月结余"
              value={stats.balance}
              prefix="¥"
              valueStyle={{ 
                color: parseFloat(stats.balance) >= 0 ? '#3f8600' : '#cf1322' 
              }}
              suffix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="quick-action-card">
        <h2>快速操作</h2>
        <div className="action-buttons">
          <Button
            type="primary"
            size="large"
            icon={<PlusCircleOutlined />}
            onClick={() => navigate('/add')}
          >
            添加记录
          </Button>
          <Button
            size="large"
            onClick={() => navigate('/records')}
          >
            查看所有记录
          </Button>
          <Button
            size="large"
            onClick={() => navigate('/statistics')}
          >
            查看统计
          </Button>
        </div>
      </Card>

      {records.length === 0 && (
        <Card className="empty-card">
          <Empty
            description="还没有任何记录，点击上方按钮开始记账吧！"
          />
        </Card>
      )}

      {records.length > 0 && (
        <Card className="summary-card">
          <h3>统计信息</h3>
          <p>本月共有 <strong>{stats.count}</strong> 条记录</p>
          <p>累计记录数: <strong>{records.length}</strong> 条</p>
        </Card>
      )}
    </div>
  );
};

export default Home;
