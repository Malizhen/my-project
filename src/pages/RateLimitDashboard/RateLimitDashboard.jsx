/**
 * 限流仪表板主页面
 */
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, message } from 'antd';
import OverviewCards from './components/OverviewCards';
import TopClientsTable from './components/TopClientsTable';
import ViolationsTable from './components/ViolationsTable';
import RealtimeChart from './components/RealtimeChart';
import WhitelistManager from './components/WhitelistManager';
import './RateLimitDashboard.css';

const API_BASE = 'http://localhost:3001/api/dashboard';

function RateLimitDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/overview`);
      const data = await res.json();
      if (data.success) {
        setOverview(data.data);
      }
    } catch (error) {
      message.error('获取概览数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // 每30秒刷新概览数据
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      children: (
        <div className="dashboard-content">
          <OverviewCards data={overview} loading={loading} />
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card title="实时流量" className="dashboard-card">
                <RealtimeChart />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="高频用户 Top 10" className="dashboard-card">
                <TopClientsTable limit={10} />
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'violations',
      label: '违规记录',
      children: <ViolationsTable />
    },
    {
      key: 'whitelist',
      label: '白名单管理',
      children: <WhitelistManager />
    }
  ];

  return (
    <div className="rate-limit-dashboard">
      <div className="dashboard-header">
        <h1>API 限流仪表板</h1>
        <p>监控API访问情况，管理限流规则和白名单</p>
      </div>
      
      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="dashboard-tabs"
      />
    </div>
  );
}

export default RateLimitDashboard;
