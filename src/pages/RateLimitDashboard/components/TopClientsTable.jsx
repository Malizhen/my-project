/**
 * 高频用户表格组件
 */
import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, Button, message, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';

const API_BASE = 'http://localhost:3001/api/dashboard';

function TopClientsTable({ limit = 10 }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState('24h');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/top-clients?limit=${limit}&timeRange=${timeRange}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange, limit]);

  const handleAddWhitelist = async (clientId) => {
    const [type, value] = clientId.split(':');
    try {
      const res = await fetch(`${API_BASE}/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value })
      });
      const result = await res.json();
      if (result.success) {
        message.success('已添加到白名单');
      } else {
        message.error(result.error || '添加失败');
      }
    } catch (error) {
      message.error('添加失败');
    }
  };

  const columns = [
    {
      title: '客户端',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (clientId) => {
        const [type, value] = clientId.split(':');
        return (
          <span>
            <Tag color={type === 'user' ? 'blue' : 'green'} className="client-type-tag">
              {type === 'user' ? '用户' : 'IP'}
            </Tag>
            <span style={{ marginLeft: 8 }}>{value}</span>
          </span>
        );
      }
    },
    {
      title: '请求数',
      dataIndex: 'totalRequests',
      key: 'totalRequests',
      sorter: (a, b) => a.totalRequests - b.totalRequests,
      defaultSortOrder: 'descend'
    },
    {
      title: '被限流数',
      dataIndex: 'blockedRequests',
      key: 'blockedRequests',
      render: (val) => (
        <span style={{ color: val > 0 ? '#ff4d4f' : '#52c41a' }}>
          {val}
        </span>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div className="action-buttons">
          <Popconfirm
            title="确定添加到白名单？"
            onConfirm={() => handleAddWhitelist(record.clientId)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" icon={<PlusOutlined />}>
              加白
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="clients-table">
      <div className="filter-bar">
        <div className="filter-item">
          <span className="filter-label">时间范围:</span>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
            options={[
              { value: '1h', label: '最近1小时' },
              { value: '24h', label: '最近24小时' },
              { value: '7d', label: '最近7天' },
              { value: '30d', label: '最近30天' }
            ]}
          />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="clientId"
        pagination={false}
        size="small"
      />
    </div>
  );
}

export default TopClientsTable;
