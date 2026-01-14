import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Empty, Statistic } from 'antd';
import { SmileOutlined, FileTextOutlined, TagsOutlined, FireOutlined } from '@ant-design/icons';
import { useMoodContext } from '../../context/MoodContext';
import {
  filterEntriesByTimeRange,
  calculateMoodDistribution,
  calculateMoodTrend,
  calculateTagFrequency,
  calculateStatisticsCards
} from '../../utils/moodCalculations';
import { TIME_RANGE_OPTIONS } from '../../utils/moodConstants';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import './MoodStatistics.css';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MoodStatistics = () => {
  const { entries } = useMoodContext();
  const [timeRange, setTimeRange] = useState('last30days');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const filtered = filterEntriesByTimeRange(entries, timeRange);
    setFilteredEntries(filtered);
    
    if (filtered.length > 0) {
      const statistics = calculateStatisticsCards(entries, timeRange);
      setStats(statistics);
    }
  }, [entries, timeRange]);

  // 心情趋势数据
  const trendData = calculateMoodTrend(filteredEntries, 30);
  const trendChartData = {
    labels: trendData.map(d => d.date.substring(5)), // MM-DD
    datasets: [
      {
        label: '心情值',
        data: trendData.map(d => d.moodValue),
        borderColor: '#5B9BD5',
        backgroundColor: 'rgba(91, 155, 213, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // 心情分布数据
  const distribution = calculateMoodDistribution(filteredEntries);
  const pieChartData = {
    labels: distribution.map(d => d.name),
    datasets: [
      {
        data: distribution.map(d => d.count),
        backgroundColor: distribution.map(d => d.color),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} 次 (${percentage}%)`;
          }
        }
      }
    }
  };

  // 标签频次
  const tagFrequency = calculateTagFrequency(filteredEntries);
  const topTags = tagFrequency.slice(0, 10);

  if (entries.length === 0) {
    return (
      <div className="mood-statistics-page">
        <Card>
          <Empty description="暂无日记数据，快去记录你的心情吧！" />
        </Card>
      </div>
    );
  }

  return (
    <div className="mood-statistics-page">
      <Card 
        title="心情统计" 
        extra={
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
            options={TIME_RANGE_OPTIONS}
          />
        }
      >
        {/* 统计卡片 */}
        <Row gutter={16} className="stats-cards">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="总记录数"
                value={stats?.totalCount || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#5B9BD5' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="连续记录"
                value={stats?.consecutiveDays || 0}
                suffix="天"
                prefix={<FireOutlined />}
                valueStyle={{ color: '#F4A460' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="平均心情"
                value={stats?.averageMood || 0}
                precision={2}
                suffix="分"
                prefix={<SmileOutlined />}
                valueStyle={{ color: '#90EE90' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="most-mood-card">
                <div className="stat-title">最常心情</div>
                {stats?.mostFrequentMood && (
                  <div className="mood-display">
                    <span className="mood-icon">{stats.mostFrequentMood.icon}</span>
                    <span className="mood-name">{stats.mostFrequentMood.name}</span>
                    <span className="mood-count">({stats.mostFrequentMood.count}次)</span>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 心情趋势图 */}
        <Card title="心情趋势" className="chart-card">
          {filteredEntries.length > 0 ? (
            <div className="chart-container">
              <Line data={trendChartData} options={trendChartOptions} />
            </div>
          ) : (
            <Empty description="所选时间范围内暂无数据" />
          )}
        </Card>

        {/* 心情分布和标签统计 */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Card title="心情分布" className="chart-card">
              {filteredEntries.length > 0 ? (
                <div className="chart-container">
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              ) : (
                <Empty description="所选时间范围内暂无数据" />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="热门标签" className="chart-card">
              {topTags.length > 0 ? (
                <div className="tag-list">
                  {topTags.map((tag, index) => (
                    <div key={tag.name} className="tag-item">
                      <span className="tag-rank">#{index + 1}</span>
                      <span className="tag-name">{tag.name}</span>
                      <span className="tag-count">{tag.count} 次</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无标签数据" />
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MoodStatistics;
