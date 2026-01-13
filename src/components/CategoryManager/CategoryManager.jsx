import React, { useState } from 'react';
import { List, Tag, Button, Modal, Form, Input, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { validateCategory } from '../../utils/todoValidation';
import './CategoryManager.css';

const CategoryManager = ({ categories, onAdd, onUpdate, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (category) => {
    if (category.isDefault) {
      message.warning('预设分类不能修改');
      return;
    }
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      color: category.color
    });
    setIsModalVisible(true);
  };

  const handleDelete = (category) => {
    if (category.isDefault) {
      message.warning('预设分类不能删除');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类"${category.name}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const result = await onDelete(category.id);
        if (result.success) {
          message.success('删除成功');
        } else {
          message.error(result.error || '删除失败');
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证分类数据
      const validation = validateCategory(values);
      if (!validation.valid) {
        Object.keys(validation.errors).forEach(field => {
          message.error(validation.errors[field]);
        });
        return;
      }

      let result;
      if (editingCategory) {
        result = await onUpdate(editingCategory.id, values);
      } else {
        result = await onAdd(values);
      }

      if (result.success) {
        message.success(editingCategory ? '更新成功' : '添加成功');
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error(result.error || '操作失败');
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCategory(null);
  };

  return (
    <div className="category-manager">
      <div className="category-header">
        <h3>分类管理</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加分类
        </Button>
      </div>

      <List
        className="category-list"
        dataSource={categories}
        renderItem={(category) => (
          <List.Item
            actions={[
              category.isDefault ? (
                <Button 
                  type="text" 
                  icon={<LockOutlined />} 
                  disabled
                  title="预设分类不可编辑"
                />
              ) : (
                <Button 
                  type="text" 
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(category)}
                />
              ),
              category.isDefault ? (
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                  disabled
                  title="预设分类不可删除"
                />
              ) : (
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(category)}
                />
              )
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Tag color={category.color}>{category.name}</Tag>
                  {category.isDefault && <Tag color="blue">预设</Tag>}
                </Space>
              }
              description={category.icon}
            />
          </List.Item>
        )}
      />

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="分类名称"
            name="name"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 20, message: '分类名称长度不能超过20字符' },
              { whitespace: true, message: '分类名称不能为空格' }
            ]}
          >
            <Input 
              placeholder="请输入分类名称" 
              maxLength={20}
            />
          </Form.Item>

          <Form.Item
            label="分类颜色"
            name="color"
            rules={[
              { pattern: /^#[0-9A-Fa-f]{6}$/, message: '请输入正确的颜色格式(如 #1890ff)' }
            ]}
          >
            <Input 
              placeholder="请输入颜色代码 (如 #1890ff)" 
              maxLength={7}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager;
