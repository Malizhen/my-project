import React from 'react';
import { Row, Col, Card, Statistic, Progress } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import './TodoStatistics.css';

const TodoStatistics = ({ statistics }) => {
  const { total, active, completed, completionRate } = statistics;

  return (
    <div className="todo-statistics">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="总任务数"
              value={total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="未完成"
              value={active}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="已完成"
              value={completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card completion-card">
            <div className="completion-rate">
              <div className="rate-label">完成率</div>
              <Progress
                type="circle"
                percent={completionRate}
                size={80}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TodoStatistics;
