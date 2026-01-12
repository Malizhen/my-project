import React from 'react';
import { Checkbox, Tag, Button, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PRIORITY_OPTIONS } from '../../utils/todoConstants';
import './TodoItem.css';

const TodoItem = ({ task, category, onToggle, onEdit, onDelete }) => {
  // 获取优先级配置
  const getPriorityConfig = (priority) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
  };

  const priorityConfig = getPriorityConfig(task.priority);

  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleEdit = () => {
    onEdit(task.id);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  return (
    <div className={`todo-item ${task.completed ? 'completed' : ''}`}>
      <div className="todo-item-main">
        <Checkbox 
          checked={task.completed} 
          onChange={handleToggle}
          className="todo-checkbox"
        />
        
        <div className="todo-content">
          <div className="todo-header">
            <div 
              className="priority-indicator" 
              style={{ backgroundColor: priorityConfig.color }}
              title={`优先级: ${priorityConfig.label}`}
            />
            <h3 className={`todo-title ${task.completed ? 'completed-text' : ''}`}>
              {task.title}
            </h3>
          </div>
          
          {task.description && (
            <p className="todo-description">{task.description}</p>
          )}
          
          <div className="todo-meta">
            <Tag color={category?.color || '#8c8c8c'}>
              {category?.name || '未分类'}
            </Tag>
            <span className="todo-time">
              <ClockCircleOutlined />
              <span>{dayjs(task.createdAt).format('YYYY-MM-DD HH:mm')}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="todo-actions">
        <Space>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={handleDelete}
            />
          </Tooltip>
        </Space>
      </div>
    </div>
  );
};

export default TodoItem;
