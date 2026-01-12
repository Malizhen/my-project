import React from 'react';
import { Card, Button, Empty, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMoodContext } from '../../context/MoodContext';
import JournalCard from '../../components/JournalCard/JournalCard';
import './Home.css';

const MoodHome = () => {
  const navigate = useNavigate();
  const { entries, removeEntry } = useMoodContext();

  // 获取最近5条日记
  const recentEntries = entries.slice(0, 5);

  const handleAddJournal = () => {
    navigate('/add');
  };

  return (
    <div className="mood-home-page">
      <Card className="welcome-card">
        <h1>📔 心情日记</h1>
        <p>记录每一天的心情，追踪情绪变化，更好地了解自己</p>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAddJournal}
        >
          记录今天的心情
        </Button>
      </Card>

      <Card title="最近日记" extra={<Button type="link" onClick={() => navigate('/journals')}>查看全部</Button>}>
        {recentEntries.length === 0 ? (
          <Empty description="还没有日记记录">
            <Button type="primary" onClick={handleAddJournal}>
              开始记录
            </Button>
          </Empty>
        ) : (
          <div className="recent-journals">
            {recentEntries.map(entry => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onDelete={removeEntry}
                showActions={false}
              />
            ))}
          </div>
        )}
      </Card>

      <Row gutter={16} className="info-cards">
        <Col xs={24} sm={12} md={8}>
          <Card className="info-card">
            <h3>总记录数</h3>
            <div className="info-value">{entries.length}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="info-card" onClick={() => navigate('/journals')}>
            <h3>日记列表</h3>
            <div className="info-text">查看所有日记</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="info-card" onClick={() => navigate('/statistics')}>
            <h3>心情统计</h3>
            <div className="info-text">查看心情趋势</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MoodHome;
