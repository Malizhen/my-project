/**
 * 白名单管理组件
 */
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Radio, message, Popconfirm, Tag, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const API_BASE = 'http://localhost:3001/api/dashboard';

function WhitelistManager() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/whitelist`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      message.error('获取白名单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (values) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const result = await res.json();
      if (result.success) {
        message.success('添加成功');
        setModalVisible(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(result.error || '添加失败');
      }
    } catch (error) {
      message.error('添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/whitelist/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        message.success('移除成功');
        fetchData();
      } else {
        message.error(result.error || '移除失败');
      }
    } catch (error) {
      message.error('移除失败');
    }
  };

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'user' ? 'blue' : 'green'}>
          {type === 'user' ? '用户' : 'IP'}
        </Tag>
      )
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value'
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定移除此白名单项？"
          onConfirm={() => handleRemove(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>
            移除
          </Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <Card className="whitelist-table">
      <div className="table-header">
        <h3>白名单列表</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          添加白名单
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="添加白名单"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          initialValues={{ type: 'ip' }}
        >
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Radio.Group>
              <Radio value="ip">IP地址</Radio>
              <Radio value="user">用户ID</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="value"
            label="值"
            rules={[
              { required: true, message: '请输入值' },
              { max: 100, message: '最多100个字符' }
            ]}
          >
            <Input placeholder="请输入IP地址或用户ID" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              添加
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default WhitelistManager;
