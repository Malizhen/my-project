import React, { useState } from 'react';
import { Card, Table, Button, Input, Modal, Form, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMoodContext } from '../../context/MoodContext';
import { validateTagName } from '../../utils/moodValidation';
import './MoodTags.css';

const MoodTags = () => {
  const { tags, createTag, modifyTag, removeTag } = useMoodContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    form.setFieldsValue({ name: tag.name });
    setIsModalVisible(true);
  };

  const handleDelete = async (tagId) => {
    await removeTag(tagId);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const tagName = values.name.trim();

      // 验证标签名称
      const validation = validateTagName(tagName);
      if (!validation.valid) {
        message.error(validation.message);
        return;
      }

      // 检查是否与其他标签重名
      const isDuplicate = tags.some(
        tag => tag.name === tagName && tag.id !== editingTag?.id
      );
      if (isDuplicate) {
        message.error('标签名称已存在');
        return;
      }

      if (editingTag) {
        // 编辑
        await modifyTag(editingTag.id, tagName);
      } else {
        // 新增
        await createTag(tagName);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Tag color="blue">{name}</Tag>
    },
    {
      title: '使用次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => b.count - a.count,
      render: (count) => <span>{count} 次</span>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title={`确定要删除标签 "${record.name}" 吗？`}
            description={record.count > 0 ? `该标签已被 ${record.count} 条日记使用` : undefined}
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="mood-tags-page">
      <Card
        title="标签管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增标签
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 个标签`
          }}
        />
      </Card>

      <Modal
        title={editingTag ? '编辑标签' : '新增标签'}
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
            label="标签名称"
            name="name"
            rules={[
              { required: true, message: '请输入标签名称' },
              { min: 2, message: '标签名称至少2个字' },
              { max: 10, message: '标签名称最多10个字' }
            ]}
          >
            <Input
              placeholder="请输入标签名称（2-10字）"
              maxLength={10}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MoodTags;
