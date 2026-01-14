import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Radio, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';
import { RecordType } from '../../utils/constants';
import { validateRecord } from '../../utils/validation';
import { getToday } from '../../utils/validation';
import './AddRecord.css';

const { TextArea } = Input;

const AddRecord = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { categories, addRecord } = useApp();
  const [recordType, setRecordType] = useState(RecordType.EXPENSE);
  const [loading, setLoading] = useState(false);

  // 根据类型筛选分类
  const filteredCategories = categories.filter(c => c.type === recordType);

  const handleTypeChange = (e) => {
    setRecordType(e.target.value);
    form.setFieldValue('category', undefined);
  };

  const handleSubmit = async (values) => {
    const record = {
      type: recordType,
      amount: parseFloat(values.amount),
      category: values.category,
      date: values.date.format('YYYY-MM-DD'),
      note: values.note || ''
    };

    const validation = validateRecord(record);
    if (!validation.isValid) {
      Object.values(validation.errors).forEach(error => {
        message.error(error);
      });
      return;
    }

    setLoading(true);
    try {
      await addRecord(record);
      message.success('添加成功');
      form.resetFields();
      form.setFieldValue('date', dayjs());
      setRecordType(RecordType.EXPENSE);
    } catch (error) {
      message.error(error.message || '添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    form.setFieldValue('date', dayjs());
    setRecordType(RecordType.EXPENSE);
  };

  return (
    <div className="add-record-page">
      <Card title="添加收支记录" className="add-record-card">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            date: dayjs()
          }}
          onFinish={handleSubmit}
          className="add-record-form"
        >
          <Form.Item
            label="记录类型"
            name="type"
            rules={[{ required: true, message: '请选择记录类型' }]}
          >
            <Radio.Group value={recordType} onChange={handleTypeChange}>
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
                message: '请输入有效金额，最多保留两位小数'
              }
            ]}
          >
            <Input
              prefix="¥"
              placeholder="请输入金额"
              size="large"
              type="number"
              step="0.01"
              min="0"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              placeholder="请选择分类"
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {filteredCategories.map(cat => (
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
              size="large"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            label="备注"
            name="note"
          >
            <TextArea
              rows={4}
              placeholder="请输入备注（可选，最多200字）"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <div className="form-buttons">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                提交
              </Button>
              <Button size="large" onClick={handleReset}>
                重置
              </Button>
              <Button size="large" onClick={() => navigate('/')}>
                返回首页
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddRecord;
