import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTodo } from '../../context/TodoContext';
import TodoForm from '../../components/TodoForm/TodoForm';
import './AddTodo.css';

const AddTodo = () => {
  const navigate = useNavigate();
  const { categories, addTask } = useTodo();

  const handleSubmit = async (values) => {
    const result = await addTask(values);
    if (result.success) {
      navigate('/todos');
    }
    return result;
  };

  const handleCancel = () => {
    navigate('/todos');
  };

  return (
    <div className="add-todo-page">
      <div className="page-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleCancel}
          type="text"
        >
          返回
        </Button>
        <h1>添加待办任务</h1>
      </div>

      <div className="form-container">
        <TodoForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AddTodo;
