import React, { useState } from 'react';
import {
  Card, Row, Col, List, Button, Modal, Form, Input,
  Tag, Space, message, Empty
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import { RecordType } from '../../utils/constants';
import { validateCategory } from '../../utils/validation';
import './Categories.css';

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryType, setNewCategoryType] = useState(RecordType.EXPENSE);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const expenseCategories = categories.filter(c => c.type === RecordType.EXPENSE);
  const incomeCategories = categories.filter(c => c.type === RecordType.INCOME);

  const handleAdd = async (values) => {
    const newCategory = {
      name: values.name.trim(),
      type: newCategoryType
    };

    const validation = validateCategory(newCategory, categories);
    if (!validation.isValid) {
      Object.values(validation.errors).forEach(error => {
        message.error(error);
      });
      return;
    }

    try {
      await addCategory(newCategory);
      message.success('添加成功');
      setAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || '添加失败');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    editForm.setFieldsValue({ name: category.name });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    if (editingCategory.isDefault) {
      message.error('预设分类不能修改');
      return;
    }

    const updates = {
      name: values.name.trim()
    };

    const validation = validateCategory(
      { ...editingCategory, ...updates },
      categories
    );
    if (!validation.isValid) {
      Object.values(validation.errors).forEach(error => {
        message.error(error);
      });
      return;
    }

    try {
      await updateCategory(editingCategory.id, updates);
      message.success('更新成功');
      setEditModalVisible(false);
      setEditingCategory(null);
      editForm.resetFields();
    } catch (error) {
      message.error(error.message || '更新失败');
    }
  };

  const handleDelete = (category) => {
    if (category.isDefault) {
      message.error('预设分类不能删除');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类"${category.name}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteCategory(category.id);
          message.success('删除成功');
        } catch (error) {
          message.error(error.message || '删除失败');
        }
      }
    });
  };

  const renderCategoryList = (categoryList, title, color) => (
    <Card
      title={
        <Space>
          <span>{title}</span>
          <Tag color={color}>共 {categoryList.length} 个</Tag>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setNewCategoryType(
              title === '支出分类' ? RecordType.EXPENSE : RecordType.INCOME
            );
            setAddModalVisible(true);
          }}
        >
          添加
        </Button>
      }
      className="category-card"
    >
      {categoryList.length === 0 ? (
        <Empty description="暂无分类" />
      ) : (
        <List
          dataSource={categoryList}
          renderItem={(category) => (
            <List.Item
              actions={
                category.isDefault
                  ? [<Tag color="blue">预设</Tag>]
                  : [
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(category)}
                      >
                        编辑
                      </Button>,
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(category)}
                      >
                        删除
                      </Button>
                    ]
              }
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{category.name}</span>
                    {!category.isDefault && <Tag color="green">自定义</Tag>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  return (
    <div className="categories-page">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          {renderCategoryList(expenseCategories, '支出分类', 'red')}
        </Col>
        <Col xs={24} lg={12}>
          {renderCategoryList(incomeCategories, '收入分类', 'green')}
        </Col>
      </Row>

      <Modal
        title="添加分类"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            label="分类名称"
            name="name"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 20, message: '分类名称不能超过20个字符' }
            ]}
          >
            <Input placeholder="请输入分类名称" maxLength={20} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
              <Button
                onClick={() => {
                  setAddModalVisible(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑分类"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingCategory(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label="分类名称"
            name="name"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 20, message: '分类名称不能超过20个字符' }
            ]}
          >
            <Input placeholder="请输入分类名称" maxLength={20} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setEditingCategory(null);
                  editForm.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
