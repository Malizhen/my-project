import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTodo } from '../../context/TodoContext';
import CategoryManager from '../../components/CategoryManager/CategoryManager';
import './TodoCategories.css';

const TodoCategories = () => {
  const navigate = useNavigate();
  const { categories, addCategory, updateCategory, deleteCategory } = useTodo();

  const handleBack = () => {
    navigate('/todos');
  };

  return (
    <div className="todo-categories-page">
      <div className="page-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          type="text"
        >
          返回
        </Button>
        <h1>分类管理</h1>
      </div>

      <CategoryManager
        categories={categories}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />
    </div>
  );
};

export default TodoCategories;
