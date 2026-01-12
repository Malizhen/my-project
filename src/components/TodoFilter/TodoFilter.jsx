import React from 'react';
import { Tabs, Select, Space } from 'antd';
import { TASK_STATUS, SORT_OPTIONS, PRIORITY_OPTIONS } from '../../utils/todoConstants';
import './TodoFilter.css';

const { Option } = Select;

const TodoFilter = ({ filter, sortBy, categories, onFilterChange, onSortChange }) => {
  const statusItems = [
    { key: TASK_STATUS.ALL, label: '全部' },
    { key: TASK_STATUS.ACTIVE, label: '进行中' },
    { key: TASK_STATUS.COMPLETED, label: '已完成' }
  ];

  const handleStatusChange = (activeKey) => {
    onFilterChange({ ...filter, status: activeKey });
  };

  const handleCategoryChange = (value) => {
    onFilterChange({ ...filter, categoryId: value });
  };

  const handlePriorityChange = (value) => {
    onFilterChange({ ...filter, priority: value });
  };

  const handleSortChange = (value) => {
    onSortChange(value);
  };

  return (
    <div className="todo-filter">
      <div className="filter-status">
        <Tabs
          activeKey={filter.status}
          items={statusItems}
          onChange={handleStatusChange}
        />
      </div>

      <div className="filter-options">
        <Space size="middle" wrap>
          <div className="filter-item">
            <label>分类:</label>
            <Select
              value={filter.categoryId || undefined}
              placeholder="全部分类"
              style={{ width: 150 }}
              onChange={handleCategoryChange}
              allowClear
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  <span style={{ color: cat.color }}>●</span> {cat.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-item">
            <label>优先级:</label>
            <Select
              value={filter.priority}
              style={{ width: 120 }}
              onChange={handlePriorityChange}
            >
              <Option value="all">全部</Option>
              {PRIORITY_OPTIONS.map(p => (
                <Option key={p.value} value={p.value}>
                  <span style={{ color: p.color }}>●</span> {p.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-item">
            <label>排序:</label>
            <Select
              value={sortBy}
              style={{ width: 140 }}
              onChange={handleSortChange}
            >
              {SORT_OPTIONS.map(s => (
                <Option key={s.value} value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default TodoFilter;
