import React, { useState, useMemo } from 'react';
import {
  Card, List, Tag, Button, Space, Modal, Form, Input, Select,
  DatePicker, Radio, message, Empty, Row, Col
} from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';
import { RecordType } from '../../utils/constants';
import { filterRecords, sortRecordsByDate } from '../../utils/calculations';
import { validateRecord } from '../../utils/validation';
import './Records.css';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Records = () => {
  const { records, categories, updateRecord, deleteRecord } = useApp();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  
  // 筛选状态
  const [filters, setFilters] = useState({
    type: null,
    category: null,
    dateRange: null,
    keyword: ''
  });

  // 应用筛选
  const filteredAndSortedRecords = useMemo(() => {
    const filterParams = {
      type: filters.type,
      category: filters.category,
      startDate: filters.dateRange?.[0],
      endDate: filters.dateRange?.[1],
      keyword: filters.keyword
    };
    const filtered = filterRecords(records, filterParams);
    return sortRecordsByDate(filtered);
  }, [records, filters]);

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      type: record.type,
      amount: record.amount,
      category: record.category,
      date: dayjs(record.date),
      note: record.note
    });
    setEditModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteRecord(record.id);
          message.success('删除成功');
        } catch (error) {
          message.error(error.message || '删除失败');
        }
      }
    });
  };

  const handleUpdate = async (values) => {
    const updates = {
      type: values.type,
      amount: parseFloat(values.amount),
      category: values.category,
      date: values.date.format('YYYY-MM-DD'),
      note: values.note || ''
    };

    const validation = validateRecord(updates);
    if (!validation.isValid) {
      Object.values(validation.errors).forEach(error => {
        message.error(error);
      });
      return;
    }

    try {
      await updateRecord(editingRecord.id, updates);
      message.success('更新成功');
      setEditModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    } catch (error) {
      message.error(error.message || '更新失败');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: null,
      category: null,
      dateRange: null,
      keyword: ''
    });
  };

  const getTypeColor = (type) => {
    return type === RecordType.INCOME ? 'green' : 'red';
  };

  const getTypeText = (type) => {
    return type === RecordType.INCOME ? '收入' : '支出';
  };

  return (
    <div className="records-page">
      <Card title="筛选条件" className="filter-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="类型"
              allowClear
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              style={{ width: '100%' }}
            >
              <Select.Option value={RecordType.INCOME}>收入</Select.Option>
              <Select.Option value={RecordType.EXPENSE}>支出</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="分类"
              allowClear
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              style={{ width: '100%' }}
            >
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.name}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button onClick={handleResetFilters} style={{ width: '100%' }}>
              重置筛选
            </Button>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Input
              placeholder="在备注中搜索关键词"
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      <Card
        title={`记录列表 (共 ${filteredAndSortedRecords.length} 条)`}
        className="records-card"
      >
        {filteredAndSortedRecords.length === 0 ? (
          <Empty description="暂无记录" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredAndSortedRecords}
            renderItem={(record) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  >
                    编辑
                  </Button>,
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record)}
                  >
                    删除
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={getTypeColor(record.type)}>
                        {getTypeText(record.type)}
                      </Tag>
                      <span className="record-amount">
                        ¥{parseFloat(record.amount).toFixed(2)}
                      </span>
                      <Tag>{record.category}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div>日期: {record.date}</div>
                      {record.note && <div>备注: {record.note}</div>}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="编辑记录"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            label="记录类型"
            name="type"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio.Button value={RecordType.EXPENSE}>支出</Radio.Button>
              <Radio.Button value={RecordType.INCOME}>收入</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="金额"
            name="amount"
            rules={[
              { required: true, message: '请输入金额' },
              {
                pattern: /^\d+(\.\d{1,2})?$/,
                message: '请输入有效金额'
              }
            ]}
          >
            <Input prefix="¥" type="number" step="0.01" min="0" />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.name}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item label="备注" name="note">
            <TextArea rows={4} maxLength={200} showCount />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingRecord(null);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Records;
