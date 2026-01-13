import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Empty, Modal, message, Space } from 'antd';
import { PlusOutlined, SettingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTodo } from '../../context/TodoContext';
import TodoStatistics from '../../components/TodoStatistics/TodoStatistics';
import TodoFilter from '../../components/TodoFilter/TodoFilter';
import TodoItem from '../../components/TodoItem/TodoItem';
import './TodoList.css';

const TodoList = () => {
  const navigate = useNavigate();
  const {
    filteredTasks,
    categories,
    filter,
    sortBy,
    statistics,
    setFilter,
    setSortBy,
    toggleComplete,
    deleteTask
  } = useTodo();

  const handleAddTask = () => {
    navigate('/todos/add');
  };

  const handleEditTask = (taskId) => {
    navigate(`/todos/edit/${taskId}`);
  };

  const handleDeleteTask = (taskId) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个任务吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        const result = await deleteTask(taskId);
        if (result.success) {
          message.success('任务已删除');
        } else {
          message.error(result.error || '删除失败');
        }
      }
    });
  };

  const handleToggleComplete = async (taskId) => {
    const result = await toggleComplete(taskId);
    if (!result.success) {
      message.error(result.error || '操作失败');
    }
  };

  const handleManageCategories = () => {
    navigate('/todos/categories');
  };

  // 获取任务的分类对象
  const getCategoryForTask = (task) => {
    return categories.find(c => c.id === task.categoryId);
  };

  return (
    <div className="todo-list-page">
      <div className="page-header">
        <div className="header-left">
          <h1>待办事项</h1>
        </div>
        <div className="header-actions">
          <Space>
            <Button 
              icon={<SettingOutlined />}
              onClick={handleManageCategories}
            >
              分类管理
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddTask}
            >
              添加任务
            </Button>
          </Space>
        </div>
      </div>

      <TodoStatistics statistics={statistics} />

      <TodoFilter
        filter={filter}
        sortBy={sortBy}
        categories={categories}
        onFilterChange={setFilter}
        onSortChange={setSortBy}
      />

      <div className="todo-list-container">
        {filteredTasks.length === 0 ? (
          <Empty
            description={
              filter.status !== 'all' || filter.categoryId || filter.priority !== 'all'
                ? '暂无符合条件的任务'
                : '还没有任务，快来添加第一个吧！'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {filter.status === 'all' && !filter.categoryId && filter.priority === 'all' && (
              <Button type="primary" onClick={handleAddTask}>
                立即添加
              </Button>
            )}
          </Empty>
        ) : (
          <div className="todo-list">
            {filteredTasks.map(task => (
              <TodoItem
                key={task.id}
                task={task}
                category={getCategoryForTask(task)}
                onToggle={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
