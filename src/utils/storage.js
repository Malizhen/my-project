import { STORAGE_KEYS, DEFAULT_CATEGORIES } from './constants';

/**
 * LocalStorage操作封装类
 */
class StorageManager {
  /**
   * 检查浏览器是否支持LocalStorage
   */
  isSupported() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 初始化默认数据
   */
  init() {
    if (!this.isSupported()) {
      throw new Error('浏览器不支持LocalStorage');
    }

    // 初始化分类数据
    const categories = this.getCategories();
    if (!categories || categories.length === 0) {
      this.saveCategories(DEFAULT_CATEGORIES);
    }

    // 初始化记录数据
    const records = this.getRecords();
    if (!records) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
    }
  }

  /**
   * 获取所有记录
   */
  getRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('读取记录失败:', error);
      return [];
    }
  }

  /**
   * 保存所有记录
   */
  saveRecords(records) {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
      return true;
    } catch (error) {
      console.error('保存记录失败:', error);
      if (error.name === 'QuotaExceededError') {
        throw new Error('存储空间已满，请删除一些旧记录');
      }
      throw new Error('保存失败，请重试');
    }
  }

  /**
   * 添加新记录
   */
  addRecord(record) {
    const records = this.getRecords();
    const newRecord = {
      ...record,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    records.push(newRecord);
    this.saveRecords(records);
    return newRecord;
  }

  /**
   * 更新指定记录
   */
  updateRecord(id, updates) {
    const records = this.getRecords();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('记录不存在');
    }
    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveRecords(records);
    return records[index];
  }

  /**
   * 删除指定记录
   */
  deleteRecord(id) {
    const records = this.getRecords();
    const filteredRecords = records.filter(r => r.id !== id);
    if (filteredRecords.length === records.length) {
      throw new Error('记录不存在');
    }
    this.saveRecords(filteredRecords);
    return true;
  }

  /**
   * 获取所有分类
   */
  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('读取分类失败:', error);
      return [];
    }
  }

  /**
   * 保存所有分类
   */
  saveCategories(categories) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error('保存分类失败:', error);
      throw new Error('保存分类失败');
    }
  }

  /**
   * 添加新分类
   */
  addCategory(category) {
    const categories = this.getCategories();
    
    // 检查同类型下是否有重名
    const exists = categories.some(
      c => c.type === category.type && c.name === category.name
    );
    if (exists) {
      throw new Error('分类名称已存在');
    }

    const newCategory = {
      ...category,
      id: this.generateId(),
      isDefault: false,
      createdAt: new Date().toISOString()
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  /**
   * 更新分类
   */
  updateCategory(id, updates) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('分类不存在');
    }
    
    // 预设分类不能修改
    if (categories[index].isDefault) {
      throw new Error('预设分类不能修改');
    }

    // 检查重名
    if (updates.name) {
      const exists = categories.some(
        (c, i) => i !== index && c.type === categories[index].type && c.name === updates.name
      );
      if (exists) {
        throw new Error('分类名称已存在');
      }
    }

    categories[index] = { ...categories[index], ...updates };
    this.saveCategories(categories);
    return categories[index];
  }

  /**
   * 删除分类
   */
  deleteCategory(id) {
    const categories = this.getCategories();
    const category = categories.find(c => c.id === id);
    
    if (!category) {
      throw new Error('分类不存在');
    }
    
    if (category.isDefault) {
      throw new Error('预设分类不能删除');
    }

    const filteredCategories = categories.filter(c => c.id !== id);
    this.saveCategories(filteredCategories);
    return true;
  }

  /**
   * 导出数据为JSON
   */
  exportData() {
    return {
      records: this.getRecords(),
      categories: this.getCategories(),
      exportTime: new Date().toISOString()
    };
  }

  /**
   * 从JSON导入数据
   */
  importData(data) {
    try {
      if (!data.records || !data.categories) {
        throw new Error('数据格式不正确');
      }
      
      // 验证数据格式
      if (!Array.isArray(data.records) || !Array.isArray(data.categories)) {
        throw new Error('数据格式不正确');
      }

      this.saveRecords(data.records);
      this.saveCategories(data.categories);
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      throw error;
    }
  }

  /**
   * 生成唯一ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清空所有数据
   */
  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    this.init();
  }
}

// 导出单例
export default new StorageManager();
