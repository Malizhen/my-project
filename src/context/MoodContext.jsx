// 心情日记全局状态管理
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getJournalEntries,
  saveJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  batchDeleteJournalEntries,
  getJournalEntryById,
  getTags,
  addTag,
  updateTag,
  deleteTag,
  exportData,
  importData,
  getTodayEntries,
  getWeekEntries
} from '../utils/moodStorage.js';
import { message } from 'antd';

const MoodContext = createContext(null);

export const useMoodContext = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMoodContext must be used within MoodProvider');
  }
  return context;
};

export const MoodProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: null,
    moods: [],
    tags: [],
    keyword: ''
  });

  // 初始化数据
  useEffect(() => {
    loadEntries();
    loadTags();
  }, []);

  // 加载日记列表
  const loadEntries = () => {
    setLoading(true);
    try {
      const data = getJournalEntries();
      setEntries(data);
    } catch (error) {
      message.error('加载日记失败');
      console.error('加载日记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载标签列表
  const loadTags = () => {
    try {
      const data = getTags();
      setTags(data);
    } catch (error) {
      message.error('加载标签失败');
      console.error('加载标签失败:', error);
    }
  };

  // 创建日记
  const createEntry = async (entryData) => {
    try {
      const success = saveJournalEntry(entryData);
      if (success) {
        loadEntries();
        loadTags(); // 更新标签使用次数
        message.success('日记保存成功');
        return true;
      } else {
        message.error('日记保存失败');
        return false;
      }
    } catch (error) {
      message.error('日记保存失败');
      console.error('日记保存失败:', error);
      return false;
    }
  };

  // 更新日记
  const updateEntry = async (id, updates) => {
    try {
      const success = updateJournalEntry(id, updates);
      if (success) {
        loadEntries();
        loadTags(); // 更新标签使用次数
        message.success('日记更新成功');
        return true;
      } else {
        message.error('日记更新失败');
        return false;
      }
    } catch (error) {
      message.error('日记更新失败');
      console.error('日记更新失败:', error);
      return false;
    }
  };

  // 删除日记
  const removeEntry = async (id) => {
    try {
      const success = deleteJournalEntry(id);
      if (success) {
        loadEntries();
        loadTags(); // 更新标签使用次数
        message.success('日记删除成功');
        return true;
      } else {
        message.error('日记删除失败');
        return false;
      }
    } catch (error) {
      message.error('日记删除失败');
      console.error('日记删除失败:', error);
      return false;
    }
  };

  // 批量删除日记
  const batchRemoveEntries = async (ids) => {
    try {
      const success = batchDeleteJournalEntries(ids);
      if (success) {
        loadEntries();
        loadTags(); // 更新标签使用次数
        message.success(`成功删除${ids.length}条日记`);
        return true;
      } else {
        message.error('批量删除失败');
        return false;
      }
    } catch (error) {
      message.error('批量删除失败');
      console.error('批量删除失败:', error);
      return false;
    }
  };

  // 获取单条日记
  const getEntryById = (id) => {
    return getJournalEntryById(id);
  };

  // 创建标签
  const createTag = async (tagName) => {
    try {
      const newTag = addTag(tagName);
      if (newTag) {
        loadTags();
        message.success('标签创建成功');
        return newTag;
      } else {
        message.error('标签已存在或创建失败');
        return null;
      }
    } catch (error) {
      message.error('标签创建失败');
      console.error('标签创建失败:', error);
      return null;
    }
  };

  // 更新标签
  const modifyTag = async (id, newName) => {
    try {
      const success = updateTag(id, newName);
      if (success) {
        loadTags();
        message.success('标签更新成功');
        return true;
      } else {
        message.error('标签更新失败或名称已存在');
        return false;
      }
    } catch (error) {
      message.error('标签更新失败');
      console.error('标签更新失败:', error);
      return false;
    }
  };

  // 删除标签
  const removeTag = async (id) => {
    try {
      const success = deleteTag(id);
      if (success) {
        loadTags();
        message.success('标签删除成功');
        return true;
      } else {
        message.error('标签删除失败');
        return false;
      }
    } catch (error) {
      message.error('标签删除失败');
      console.error('标签删除失败:', error);
      return false;
    }
  };

  // 导出数据
  const handleExportData = () => {
    try {
      const data = exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mood-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('数据导出成功');
    } catch (error) {
      message.error('数据导出失败');
      console.error('数据导出失败:', error);
    }
  };

  // 导入数据
  const handleImportData = (file, strategy = 'merge') => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const success = importData(data, strategy);
          if (success) {
            loadEntries();
            loadTags();
            message.success('数据导入成功');
            resolve(true);
          } else {
            message.error('数据导入失败');
            reject(false);
          }
        } catch (error) {
          message.error('数据格式不正确');
          console.error('数据导入失败:', error);
          reject(false);
        }
      };
      reader.onerror = () => {
        message.error('文件读取失败');
        reject(false);
      };
      reader.readAsText(file);
    });
  };

  // 获取今日日记
  const getTodayJournals = () => {
    return getTodayEntries();
  };

  // 获取本周日记
  const getWeekJournals = () => {
    return getWeekEntries();
  };

  // 更新筛选条件
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 重置筛选条件
  const resetFilters = () => {
    setFilters({
      dateRange: null,
      moods: [],
      tags: [],
      keyword: ''
    });
  };

  const value = {
    // 状态
    entries,
    tags,
    loading,
    filters,
    
    // 日记操作
    createEntry,
    updateEntry,
    removeEntry,
    batchRemoveEntries,
    getEntryById,
    loadEntries,
    getTodayJournals,
    getWeekJournals,
    
    // 标签操作
    createTag,
    modifyTag,
    removeTag,
    loadTags,
    
    // 数据导入导出
    handleExportData,
    handleImportData,
    
    // 筛选
    updateFilters,
    resetFilters
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

export default MoodContext;
