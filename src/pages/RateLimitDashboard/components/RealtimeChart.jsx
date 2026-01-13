/**
 * 实时流量图表组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { Spin, Statistic, Row, Col } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = 'http://localhost:3001/api/dashboard';

function RealtimeChart() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState({ lastMinute: 0, last5Minutes: 0, lastHour: 0 });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/realtime`);
      const result = await res.json();
      if (result.success) {
        const { dataPoints, summary: summaryData } = result.data;
        setSummary(summaryData);
        
        // 构建图表数据
        const labels = dataPoints.map(p => {
          const date = new Date(p.time);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        });
        
        const values = dataPoints.map(p => p.requests);
        
        setChartData({
          labels,
          datasets: [
            {
              label: '请求数/分钟',
              data: values,
              borderColor: '#1890ff',
              backgroundColor: 'rgba(24, 144, 255, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 4
            }
          ]
        });
      }
    } catch (error) {
      console.error('获取实时数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 每5秒刷新
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 12,
          font: {
            size: 10
          }
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic 
            title="最近1分钟" 
            value={summary.lastMinute} 
            suffix="次"
            valueStyle={{ fontSize: 18 }}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="最近5分钟" 
            value={summary.last5Minutes} 
            suffix="次"
            valueStyle={{ fontSize: 18 }}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="最近1小时" 
            value={summary.lastHour} 
            suffix="次"
            valueStyle={{ fontSize: 18 }}
          />
        </Col>
      </Row>
      
      <div className="chart-container">
        {chartData && <Line data={chartData} options={chartOptions} />}
      </div>
    </div>
  );
}

export default RealtimeChart;
