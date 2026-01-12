import React, { useState, useEffect } from 'react';
import { Button, Empty, Spin, Pagination, Space, Checkbox, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined, ExportOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMoodContext } from '../../context/MoodContext';
import JournalCard from '../../components/JournalCard/JournalCard';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { filterJournalEntries } from '../../utils/moodCalculations';
import { PAGINATION_CONFIG } from '../../utils/moodConstants';
import './JournalList.css';

const { Panel } = Collapse;

const JournalList = () => {
  const navigate = useNavigate();
  const { entries, loading, removeEntry, batchRemoveEntries, filters, handleExportData } = useMoodContext();
  
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [displayEntries, setDisplayEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE);
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    // 应用筛选条件
    const filtered = filterJournalEntries(entries, filters);
    setFilteredEntries(filtered);
    setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
  }, [entries, filters]);

  useEffect(() => {
    // 分页显示
    const startIndex = (currentPage - 1) * PAGINATION_CONFIG.PAGE_SIZE;
    const endIndex = startIndex + PAGINATION_CONFIG.PAGE_SIZE;
    setDisplayEntries(filteredEntries.slice(startIndex, endIndex));
  }, [filteredEntries, currentPage]);

  const handleAddJournal = () => {
    navigate('/add');
  };

  const handleDelete = async (id) => {
    await removeEntry(id);
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    await batchRemoveEntries(selectedIds);
    setSelectedIds([]);
    setBatchMode(false);
  };

  const handleSelectChange = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(displayEntries.map(entry => entry.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedIds([]); // 切换页面时清空选择
  };

  const handleFilterChange = () => {
    // 筛选条件变化时重置页码
    setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
  };

  const handleFilterReset = () => {
    // 重置筛选条件时重置页码
    setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
  };

  return (
    <div className="journal-list-page">
      <div className="journal-list-header">
        <h2>我的日记</h2>
        <Space>
          {batchMode && (
            <>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                disabled={selectedIds.length === 0}
              >
                删除选中 ({selectedIds.length})
              </Button>
              <Button onClick={() => { setBatchMode(false); setSelectedIds([]); }}>
                取消
              </Button>
            </>
          )}
          {!batchMode && (
            <>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowFilter(!showFilter)}
                type={showFilter ? 'primary' : 'default'}
              >
                {showFilter ? '隐藏筛选' : '显示筛选'}
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExportData}
              >
                导出数据
              </Button>
              {filteredEntries.length > 0 && (
                <Button onClick={() => setBatchMode(true)}>
                  批量管理
                </Button>
              )}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddJournal}
              >
                新增日记
              </Button>
            </>
          )}
        </Space>
      </div>

      {showFilter && (
        <FilterPanel
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
        />
      )}

      {batchMode && displayEntries.length > 0 && (
        <div className="batch-select-all">
          <Checkbox
            checked={displayEntries.every(entry => selectedIds.includes(entry.id))}
            indeterminate={
              selectedIds.length > 0 &&
              selectedIds.length < displayEntries.length
            }
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            全选
          </Checkbox>
        </div>
      )}

      <div className="journal-list-content">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="加载中..." />
          </div>
        ) : filteredEntries.length === 0 ? (
          <Empty
            description="暂无日记记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={handleAddJournal}>
              立即记录
            </Button>
          </Empty>
        ) : (
          <>
            <div className="journal-list-items">
              {displayEntries.map(entry => (
                <div key={entry.id} className="journal-list-item-wrapper">
                  {batchMode && (
                    <Checkbox
                      checked={selectedIds.includes(entry.id)}
                      onChange={(e) => handleSelectChange(entry.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="journal-checkbox"
                    />
                  )}
                  <div className={`journal-item-container ${batchMode ? 'batch-mode' : ''}`}>
                    <JournalCard
                      entry={entry}
                      onDelete={handleDelete}
                      showActions={!batchMode}
                    />
                  </div>
                </div>
              ))}
            </div>

            {filteredEntries.length > PAGINATION_CONFIG.PAGE_SIZE && (
              <div className="journal-pagination">
                <Pagination
                  current={currentPage}
                  total={filteredEntries.length}
                  pageSize={PAGINATION_CONFIG.PAGE_SIZE}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total) => `共 ${total} 条日记`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JournalList;
