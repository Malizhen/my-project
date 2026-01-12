import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Radio, Button, Space, message } from 'antd';
import { PRIORITY_OPTIONS, PRIORITY } from '../../utils/todoConstants';
import { validateTask } from '../../utils/todoValidation';
import './TodoForm.css';

const { TextArea } = Input;
const { Option } = Select;

const TodoForm = ({ initialValues, categories, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 使用自定义验证
      const validation = validateTask(values, categories);
      if (!validation.valid) {
        Object.keys(validation.errors).forEach(field => {
          message.error(validation.errors[field]);
        });
        return;
      }

      setSubmitting(true);
      const result = await onSubmit(values);
      
      if (result && result.success) {
        message.success(initialValues ? '任务更新成功' : '任务添加成功');
        form.resetFields();
      } else {
        message.error(result?.error || '操作失败');
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <div className="todo-form">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: PRIORITY.MEDIUM,
          ...initialValues
        }}
      >
        <Form.Item
          label="任务标题"
          name="title"
          rules={[
            { required: true, message: '请输入任务标题' },
            { max: 100, message: '标题长度不能超过100字符' },
            { whitespace: true, message: '标题不能为空格' }
          ]}
        >
          <Input 
            placeholder="请输入任务标题" 
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="任务描述"
          name="description"
          rules={[
            { max: 500, message: '描述长度不能超过500字符' }
          ]}
        >
          <TextArea
            placeholder="请输入任务详细描述（可选）"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="分类"
          name="categoryId"
          rules={[{ required: true, message: '请选择分类' }]}
        >
          <Select placeholder="请选择分类">
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>
                <span style={{ color: cat.color }}>●</span> {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="优先级"
          name="priority"
          rules={[{ required: true, message: '请选择优先级' }]}
        >
          <Radio.Group>
            {PRIORITY_OPTIONS.map(p => (
              <Radio.Button key={p.value} value={p.value}>
                <span style={{ color: p.color }}>●</span> {p.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={submitting || loading}
            >
              {initialValues ? '更新任务' : '添加任务'}
            </Button>
            <Button onClick={handleCancel}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TodoForm;
