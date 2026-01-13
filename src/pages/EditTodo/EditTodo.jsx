import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spin, Result } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTodo } from '../../context/TodoContext';
import TodoForm from '../../components/TodoForm/TodoForm';
import './EditTodo.css';

const EditTodo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tasks, categories, updateTask } = useTodo();
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 查找当前任务
    const task = tasks.find(t => t.id === id);
    setCurrentTask(task);
    setLoading(false);
  }, [id, tasks]);

  const handleSubmit = async (values) => {
    const result = await updateTask(id, values);
    if (result.success) {
      navigate('/todos');
    }
    return result;
  };

  const handleCancel = () => {
    navigate('/todos');
  };

  if (loading) {
    return (
      <div className="edit-todo-page">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="edit-todo-page">
        <Result
          status="404"
          title="任务不存在"
          subTitle="抱歉，您要编辑的任务不存在。"
          extra={
            <Button type="primary" onClick={handleCancel}>
              返回列表
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="edit-todo-page">
      <div className="page-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleCancel}
          type="text"
        >
          返回
        </Button>
        <h1>编辑待办任务</h1>
      </div>

      <div className="form-container">
        <TodoForm
          initialValues={currentTask}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditTodo;
