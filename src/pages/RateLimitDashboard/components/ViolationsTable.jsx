/**
 * 违规记录表格组件
 */
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, message, Popconfirm, Descriptions, Timeline } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const API_BASE = 'http://localhost:3001/api/dashboard';

function ViolationsTable() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], total: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/violations?page=${page}&pageSize=${pageSize}`);
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
  }, [page, pageSize]);

  const fetchDetail = async (clientId) => {
    setDetailLoading(true);
    setDetailVisible(true);
    try {
      const res = await fetch(`${API_BASE}/violations/${encodeURIComponent(clientId)}`);
      const result = await res.json();
      if (result.success) {
        setDetailData(result.data);
      }
    } catch (error) {
      message.error('获取详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClear = async (clientId) => {
    try {
      const res = await fetch(`${API_BASE}/violations/${encodeURIComponent(clientId)}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        message.success('清除成功');
        fetchData();
      } else {
        message.error(result.error || '清除失败');
      }
    } catch (error) {
      message.error('清除失败');
    }
  };

  const getSeverityTag = (total) => {
    if (total >= 20) {
      return <Tag color="red" className="severity-tag">严重</Tag>;
    } else if (total >= 10) {
      return <Tag color="orange" className="severity-tag">中度</Tag>;
    } else if (total >= 5) {
      return <Tag color="gold" className="severity-tag">轻度</Tag>;
    }
    return <Tag color="green" className="severity-tag">正常</Tag>;
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
      title: '违规次数',
      dataIndex: 'total',
      key: 'total',
      sorter: (a, b) => a.total - b.total,
      defaultSortOrder: 'descend'
    },
    {
      title: '严重程度',
      dataIndex: 'total',
      key: 'severity',
      render: (total) => getSeverityTag(total)
    },
    {
      title: '违规端点',
      dataIndex: 'endpoints',
      key: 'endpoints',
      render: (endpoints) => (
        <span>
          {endpoints?.slice(0, 3).map((ep, i) => (
            <Tag key={i} style={{ marginBottom: 4 }}>{ep}</Tag>
          ))}
          {endpoints?.length > 3 && <Tag>+{endpoints.length - 3}</Tag>}
        </span>
      )
    },
    {
      title: '首次违规',
      dataIndex: 'firstTime',
      key: 'firstTime',
      render: (time) => time ? new Date(time).toLocaleString('zh-CN') : '-'
    },
    {
      title: '最近违规',
      dataIndex: 'lastTime',
      key: 'lastTime',
      render: (time) => time ? new Date(time).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => fetchDetail(record.clientId)}
          >
            详情
          </Button>
          <Popconfirm
            title="确定清除此客户端的违规记录？"
            onConfirm={() => handleClear(record.clientId)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              清除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="violations-table">
      <Table
        columns={columns}
        dataSource={data.items}
        loading={loading}
        rowKey="clientId"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          }
        }}
      />

      <Modal
        title="违规详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : detailData ? (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="客户端ID">{detailData.clientId}</Descriptions.Item>
              <Descriptions.Item label="类型">{detailData.clientType === 'ip' ? 'IP' : '用户'}</Descriptions.Item>
              <Descriptions.Item label="总违规次数">{detailData.total}</Descriptions.Item>
              <Descriptions.Item label="最近IP">{detailData.lastIp || '-'}</Descriptions.Item>
              <Descriptions.Item label="首次违规">{detailData.firstTime ? new Date(detailData.firstTime).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
              <Descriptions.Item label="最近违规">{detailData.lastTime ? new Date(detailData.lastTime).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
            </Descriptions>
            
            <h4 style={{ marginTop: 16 }}>违规历史（最近10条）</h4>
            <Timeline
              items={detailData.history?.slice(0, 10).map((item, index) => ({
                key: index,
                color: 'red',
                children: (
                  <div>
                    <div><strong>{item.endpoint}</strong> ({item.method})</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      限制: {item.limit} | 实际: {item.actualRequests} | 
                      时间: {new Date(item.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </div>
                )
              }))}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default ViolationsTable;
