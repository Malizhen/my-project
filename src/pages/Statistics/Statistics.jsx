import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Empty } from 'antd';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';
import { calculateCategoryStats, calculateMonthlyStats } from '../../utils/calculations';
import { RecordType } from '../../utils/constants';
import './Statistics.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const { MonthPicker } = DatePicker;

const Statistics = () => {
  const { records } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const monthStats = useMemo(() => {
    return calculateMonthlyStats(
      records,
      selectedMonth.year(),
      selectedMonth.month()
    );
  }, [records, selectedMonth]);

  const expenseStats = useMemo(() => {
    const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD');
    const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD');
    return calculateCategoryStats(records, RecordType.EXPENSE, startDate, endDate);
  }, [records, selectedMonth]);

  const incomeStats = useMemo(() => {
    const startDate = selectedMonth.startOf('month').format('YYYY-MM-DD');
    const endDate = selectedMonth.endOf('month').format('YYYY-MM-DD');
    return calculateCategoryStats(records, RecordType.INCOME, startDate, endDate);
  }, [records, selectedMonth]);

  const createChartData = (stats) => {
    if (!stats.stats || stats.stats.length === 0) {
      return null;
    }

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];

    return {
      labels: stats.stats.map(s => s.category),
      datasets: [
        {
          data: stats.stats.map(s => parseFloat(s.amount)),
          backgroundColor: colors.slice(0, stats.stats.length),
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
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
            const dataset = context.dataset.data;
            const total = dataset.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ¥${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const expenseChartData = createChartData(expenseStats);
  const incomeChartData = createChartData(incomeStats);

  return (
    <div className="statistics-page">
      <Card className="month-selector-card">
        <div className="month-selector">
          <span>选择月份:</span>
          <MonthPicker
            value={selectedMonth}
            onChange={(date) => setSelectedMonth(date || dayjs())}
            allowClear={false}
          />
        </div>
      </Card>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="本月收入"
              value={monthStats.income}
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
              value={monthStats.expense}
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
              value={monthStats.balance}
              prefix="¥"
              valueStyle={{
                color: parseFloat(monthStats.balance) >= 0 ? '#3f8600' : '#cf1322'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="支出分类占比" className="chart-card">
            {expenseChartData ? (
              <div className="chart-container">
                <Pie data={expenseChartData} options={chartOptions} />
              </div>
            ) : (
              <Empty description="暂无支出数据" />
            )}
            {expenseStats.stats.length > 0 && (
              <div className="stats-list">
                <h4>支出详情</h4>
                {expenseStats.stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <span>{stat.category}</span>
                    <span>
                      ¥{stat.amount} ({stat.percentage}%)
                    </span>
                  </div>
                ))}
                <div className="stat-total">
                  <strong>总计</strong>
                  <strong>¥{expenseStats.total}</strong>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="收入分类占比" className="chart-card">
            {incomeChartData ? (
              <div className="chart-container">
                <Pie data={incomeChartData} options={chartOptions} />
              </div>
            ) : (
              <Empty description="暂无收入数据" />
            )}
            {incomeStats.stats.length > 0 && (
              <div className="stats-list">
                <h4>收入详情</h4>
                {incomeStats.stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <span>{stat.category}</span>
                    <span>
                      ¥{stat.amount} ({stat.percentage}%)
                    </span>
                  </div>
                ))}
                <div className="stat-total">
                  <strong>总计</strong>
                  <strong>¥{incomeStats.total}</strong>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
