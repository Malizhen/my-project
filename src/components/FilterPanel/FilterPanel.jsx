import React, { useState } from 'react';
import { Card, DatePicker, Select, Input, Button, Space, Checkbox } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMoodContext } from '../../context/MoodContext';
import { MOOD_TYPES } from '../../utils/moodConstants';
import dayjs from 'dayjs';
import './FilterPanel.css';

const { RangePicker } = DatePicker;

const FilterPanel = ({ onFilterChange, onReset }) => {
  const { tags, filters, updateFilters, resetFilters } = useMoodContext();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleDateRangeChange = (dates) => {
    const newFilters = {
      ...localFilters,
      dateRange: dates ? {
        start: dates[0].toISOString(),
        end: dates[1].toISOString()
      } : null
    };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const handleMoodsChange = (checkedValues) => {
    const newFilters = {
      ...localFilters,
      moods: checkedValues
    };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const handleTagsChange = (selectedTags) => {
    const newFilters = {
      ...localFilters,
      tags: selectedTags
    };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const handleKeywordChange = (e) => {
    const newFilters = {
      ...localFilters,
      keyword: e.target.value
    };
    setLocalFilters(newFilters);
  };

  const handleSearch = () => {
    updateFilters(localFilters);
    onFilterChange && onFilterChange(localFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      dateRange: null,
      moods: [],
      tags: [],
      keyword: ''
    };
    setLocalFilters(emptyFilters);
    resetFilters();
    onReset && onReset();
  };

  return (
    <Card className="filter-panel" title="筛选条件">
      <div className="filter-section">
        <div className="filter-label">日期范围</div>
        <RangePicker
          style={{ width: '100%' }}
          value={localFilters.dateRange ? [
            dayjs(localFilters.dateRange.start),
            dayjs(localFilters.dateRange.end)
          ] : null}
          onChange={handleDateRangeChange}
          placeholder={['开始日期', '结束日期']}
        />
      </div>

      <div className="filter-section">
        <div className="filter-label">心情类型</div>
        <Checkbox.Group
          value={localFilters.moods}
          onChange={handleMoodsChange}
          style={{ width: '100%' }}
        >
          <div className="mood-checkboxes">
            {MOOD_TYPES.map(mood => (
              <Checkbox key={mood.value} value={mood.value}>
                <span className="mood-checkbox-label">
                  <span className="mood-icon">{mood.icon}</span>
                  <span>{mood.name}</span>
                </span>
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </div>

      <div className="filter-section">
        <div className="filter-label">标签</div>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="选择标签"
          value={localFilters.tags}
          onChange={handleTagsChange}
          options={tags.map(tag => ({
            label: `${tag.name} (${tag.count})`,
            value: tag.name
          }))}
          maxTagCount={3}
        />
      </div>

      <div className="filter-section">
        <div className="filter-label">关键词搜索</div>
        <Input
          placeholder="搜索标题或内容"
          value={localFilters.keyword}
          onChange={handleKeywordChange}
          onPressEnter={handleSearch}
          prefix={<SearchOutlined />}
        />
      </div>

      <div className="filter-actions">
        <Space>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default FilterPanel;
