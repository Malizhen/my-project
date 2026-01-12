// 心情日记数据存储操作
import { STORAGE_KEYS, DEFAULT_TAGS } from './moodConstants.js';
import dayjs from 'dayjs';

// ========== 日记记录相关 ==========

/**
 * 获取所有日记记录
 * @returns {Array} 日记记录数组
 */
export const getJournalEntries = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('获取日记记录失败:', error);
    return [];
  }
};

/**
 * 保存日记记录
 * @param {Object} entry - 日记记录对象
 * @returns {boolean} 保存是否成功
 */
export const saveJournalEntry = (entry) => {
  try {
    const entries = getJournalEntries();
    const newEntry = {
      ...entry,
      id: entry.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    entries.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
    
    // 更新标签使用次数
    if (newEntry.tags && newEntry.tags.length > 0) {
      updateTagsCount(newEntry.tags);
    }
    
    return true;
  } catch (error) {
    console.error('保存日记记录失败:', error);
    return false;
  }
};

/**
 * 更新日记记录
 * @param {string} id - 日记ID
 * @param {Object} updates - 更新的字段
 * @returns {boolean} 更新是否成功
 */
export const updateJournalEntry = (id, updates) => {
  try {
    const entries = getJournalEntries();
    const index = entries.findIndex(entry => entry.id === id);
    
    if (index === -1) {
      return false;
    }
    
    const oldEntry = entries[index];
    const updatedEntry = {
      ...oldEntry,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    entries[index] = updatedEntry;
    localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
    
    // 更新标签使用次数
    if (updates.tags) {
      recalculateAllTagsCounts();
    }
    
    return true;
  } catch (error) {
    console.error('更新日记记录失败:', error);
    return false;
  }
};

/**
 * 删除日记记录
 * @param {string} id - 日记ID
 * @returns {boolean} 删除是否成功
 */
export const deleteJournalEntry = (id) => {
  try {
    const entries = getJournalEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(filteredEntries));
    
    // 重新计算标签使用次数
    recalculateAllTagsCounts();
    
    return true;
  } catch (error) {
    console.error('删除日记记录失败:', error);
    return false;
  }
};

/**
 * 批量删除日记记录
 * @param {Array<string>} ids - 日记ID数组
 * @returns {boolean} 删除是否成功
 */
export const batchDeleteJournalEntries = (ids) => {
  try {
    const entries = getJournalEntries();
    const filteredEntries = entries.filter(entry => !ids.includes(entry.id));
    localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(filteredEntries));
    
    // 重新计算标签使用次数
    recalculateAllTagsCounts();
    
    return true;
  } catch (error) {
    console.error('批量删除日记记录失败:', error);
    return false;
  }
};

/**
 * 根据ID获取单条日记
 * @param {string} id - 日记ID
 * @returns {Object|null} 日记记录对象
 */
export const getJournalEntryById = (id) => {
  const entries = getJournalEntries();
  return entries.find(entry => entry.id === id) || null;
};

// ========== 标签相关 ==========

/**
 * 获取所有标签
 * @returns {Array} 标签数组
 */
export const getTags = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.JOURNAL_TAGS);
    if (data) {
      return JSON.parse(data);
    } else {
      // 初始化默认标签
      const defaultTags = DEFAULT_TAGS.map(name => ({
        id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        count: 0,
        createdAt: new Date().toISOString()
      }));
      localStorage.setItem(STORAGE_KEYS.JOURNAL_TAGS, JSON.stringify(defaultTags));
      return defaultTags;
    }
  } catch (error) {
    console.error('获取标签列表失败:', error);
    return [];
  }
};

/**
 * 添加新标签
 * @param {string} name - 标签名称
 * @returns {Object|null} 新创建的标签对象
 */
export const addTag = (name) => {
  try {
    const tags = getTags();
    
    // 检查标签是否已存在
    if (tags.some(tag => tag.name === name)) {
      return null;
    }
    
    const newTag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      count: 0,
      createdAt: new Date().toISOString()
    };
    
    tags.push(newTag);
    localStorage.setItem(STORAGE_KEYS.JOURNAL_TAGS, JSON.stringify(tags));
    
    return newTag;
  } catch (error) {
    console.error('添加标签失败:', error);
    return null;
  }
};

/**
 * 更新标签名称
 * @param {string} id - 标签ID
 * @param {string} newName - 新标签名称
 * @returns {boolean} 更新是否成功
 */
export const updateTag = (id, newName) => {
  try {
    const tags = getTags();
    const index = tags.findIndex(tag => tag.id === id);
    
    if (index === -1) {
      return false;
    }
    
    // 检查新名称是否与其他标签重复
    if (tags.some(tag => tag.id !== id && tag.name === newName)) {
      return false;
    }
    
    tags[index].name = newName;
    localStorage.setItem(STORAGE_KEYS.JOURNAL_TAGS, JSON.stringify(tags));
    
    return true;
  } catch (error) {
    console.error('更新标签失败:', error);
    return false;
  }
};

/**
 * 删除标签
 * @param {string} id - 标签ID
 * @returns {boolean} 删除是否成功
 */
export const deleteTag = (id) => {
  try {
    const tags = getTags();
    const filteredTags = tags.filter(tag => tag.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOURNAL_TAGS, JSON.stringify(filteredTags));
    
    return true;
  } catch (error) {
    console.error('删除标签失败:', error);
    return false;
  }
};

/**
 * 更新标签使用次数
 * @param {Array<string>} tagNames - 标签名称数组
 */
const updateTagsCount = (tagNames) => {
  try {
    const tags = getTags();
    const entries = getJournalEntries();
    
    // 重新计算所有标签的使用次数
    tags.forEach(tag => {
      tag.count = entries.filter(entry => 
        entry.tags && entry.tags.includes(tag.name)
      ).length;
    });
    
    localStorage.setItem(STORAGE_KEYS.JOURNAL_TAGS, JSON.stringify(tags));
  } catch (error) {
    console.error('更新标签使用次数失败:', error);
  }
};

/**
 * 重新计算所有标签的使用次数
 */
const recalculateAllTagsCounts = () => {
  try {
    const tags = getTags();
    const entries = getJournalEntries();
    
    tags.forEach(tag => {
      tag.count = entries.filter(entry => 
        entry.tags && entry.tags.includes(tag.name)
      ).length;
    });
    
    localStorage.setItem(STORAGE_KEYS.JOURNAL_TAGS, JSON.stringify(tags));
  } catch (error) {
    console.error('重新计算标签使用次数失败:', error);
  }
};

// ========== 数据导入导出 ==========

/**
 * 导出所有数据
 * @returns {Object} 包含所有日记和标签的数据对象
 */
export const exportData = () => {
  return {
    entries: getJournalEntries(),
    tags: getTags(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
};

/**
 * 导入数据
 * @param {Object} data - 导入的数据对象
 * @param {string} strategy - 导入策略 'merge'(合并) 或 'replace'(替换)
 * @returns {boolean} 导入是否成功
 */
export const importData = (data, strategy = 'merge') => {
  try {
    if (!data || !data.entries || !data.tags) {
      throw new Error('数据格式不正确');
    }
    
    if (strategy === 'replace') {
      // 替换模式：直接覆盖
      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(data.entries));
      localStorage.setItem(STORAGE_KEYS.JOURNAL_TAGS, JSON.stringify(data.tags));
    } else {
      // 合并模式：避免ID冲突
      const existingEntries = getJournalEntries();
      const existingTags = getTags();
      
      // 合并日记，避免ID冲突
      const existingIds = new Set(existingEntries.map(e => e.id));
      const newEntries = data.entries.map(entry => {
        if (existingIds.has(entry.id)) {
          // 生成新ID
          return {
            ...entry,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
        }
        return entry;
      });
      
      const mergedEntries = [...existingEntries, ...newEntries];
      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(mergedEntries));
      
      // 合并标签，避免名称冲突
      const existingTagNames = new Set(existingTags.map(t => t.name));
      const newTags = data.tags.filter(tag => !existingTagNames.has(tag.name));
      const mergedTags = [...existingTags, ...newTags];
      
      localStorage.setItem(STORAGE_KEYS.JOURNAL_TAGS, JSON.stringify(mergedTags));
      
      // 重新计算标签使用次数
      recalculateAllTagsCounts();
    }
    
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
};

/**
 * 清空所有数据
 * @returns {boolean} 清空是否成功
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.JOURNAL_TAGS);
    localStorage.removeItem(STORAGE_KEYS.JOURNAL_SETTINGS);
    return true;
  } catch (error) {
    console.error('清空数据失败:', error);
    return false;
  }
};

/**
 * 获取今日日记
 * @returns {Array} 今日的日记记录
 */
export const getTodayEntries = () => {
  const entries = getJournalEntries();
  const today = dayjs().format('YYYY-MM-DD');
  return entries.filter(entry => {
    const entryDate = dayjs(entry.date).format('YYYY-MM-DD');
    return entryDate === today;
  });
};

/**
 * 获取本周日记
 * @returns {Array} 本周的日记记录
 */
export const getWeekEntries = () => {
  const entries = getJournalEntries();
  const startOfWeek = dayjs().startOf('week');
  const endOfWeek = dayjs().endOf('week');
  
  return entries.filter(entry => {
    const entryDate = dayjs(entry.date);
    return entryDate.isAfter(startOfWeek) && entryDate.isBefore(endOfWeek);
  });
};
