import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 初始化数据
  useEffect(() => {
    try {
      storage.init();
      loadData();
    } catch (error) {
      console.error('初始化失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载数据
  const loadData = () => {
    const loadedRecords = storage.getRecords();
    const loadedCategories = storage.getCategories();
    setRecords(loadedRecords);
    setCategories(loadedCategories);
  };

  // 记录操作
  const addRecord = (record) => {
    try {
      const newRecord = storage.addRecord(record);
      setRecords(prev => [...prev, newRecord]);
      return newRecord;
    } catch (error) {
      throw error;
    }
  };

  const updateRecord = (id, updates) => {
    try {
      const updatedRecord = storage.updateRecord(id, updates);
      setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
      return updatedRecord;
    } catch (error) {
      throw error;
    }
  };

  const deleteRecord = (id) => {
    try {
      storage.deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (error) {
      throw error;
    }
  };

  // 分类操作
  const addCategory = (category) => {
    try {
      const newCategory = storage.addCategory(category);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      throw error;
    }
  };

  const updateCategory = (id, updates) => {
    try {
      const updatedCategory = storage.updateCategory(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      return updatedCategory;
    } catch (error) {
      throw error;
    }
  };

  const deleteCategory = (id) => {
    try {
      storage.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      throw error;
    }
  };

  // 数据导入导出
  const exportData = () => {
    return storage.exportData();
  };

  const importData = (data) => {
    try {
      storage.importData(data);
      loadData();
      return true;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    records,
    categories,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    addCategory,
    updateCategory,
    deleteCategory,
    exportData,
    importData,
    refreshData: loadData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
