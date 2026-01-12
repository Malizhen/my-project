import { TODO_STORAGE_KEYS, DEFAULT_TODO_CATEGORIES } from './todoConstants';

/**
 * 待办事项LocalStorage操作封装类
 */
class TodoStorageManager {
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
      this.saveCategories(DEFAULT_TODO_CATEGORIES);
    }

    // 初始化任务数据
    const tasks = this.getTasks();
    if (!tasks) {
      localStorage.setItem(TODO_STORAGE_KEYS.TASKS, JSON.stringify([]));
    }
  }

  /**
   * 获取所有待办任务
   */
  getTasks() {
    try {
      const data = localStorage.getItem(TODO_STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('读取待办任务失败:', error);
      return [];
    }
  }

  /**
   * 保存所有待办任务
   */
  saveTasks(tasks) {
    try {
      localStorage.setItem(TODO_STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('保存待办任务失败:', error);
      if (error.name === 'QuotaExceededError') {
        throw new Error('存储空间已满，请删除一些旧任务');
      }
      throw new Error('保存失败，请重试');
    }
  }

  /**
   * 添加新待办任务
   */
  addTask(task) {
    const tasks = this.getTasks();
    const newTask = {
      ...task,
      id: this.generateId(),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  /**
   * 更新指定待办任务
   */
  updateTask(id, updates) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('任务不存在');
    }
    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveTasks(tasks);
    return tasks[index];
  }

  /**
   * 删除指定待办任务
   */
  deleteTask(id) {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    if (filteredTasks.length === tasks.length) {
      throw new Error('任务不存在');
    }
    this.saveTasks(filteredTasks);
    return true;
  }

  /**
   * 切换任务完成状态
   */
  toggleTaskComplete(id) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('任务不存在');
    }
    const task = tasks[index];
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    task.updatedAt = new Date().toISOString();
    this.saveTasks(tasks);
    return task;
  }

  /**
   * 获取所有分类
   */
  getCategories() {
    try {
      const data = localStorage.getItem(TODO_STORAGE_KEYS.CATEGORIES);
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
      localStorage.setItem(TODO_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
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
    
    // 检查是否有重名
    const exists = categories.some(c => c.name === category.name);
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
        (c, i) => i !== index && c.name === updates.name
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
      tasks: this.getTasks(),
      categories: this.getCategories(),
      exportTime: new Date().toISOString()
    };
  }

  /**
   * 从JSON导入数据
   */
  importData(data) {
    try {
      if (!data.tasks || !data.categories) {
        throw new Error('数据格式不正确');
      }
      
      // 验证数据格式
      if (!Array.isArray(data.tasks) || !Array.isArray(data.categories)) {
        throw new Error('数据格式不正确');
      }

      this.saveTasks(data.tasks);
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
    localStorage.removeItem(TODO_STORAGE_KEYS.TASKS);
    localStorage.removeItem(TODO_STORAGE_KEYS.CATEGORIES);
    this.init();
  }
}

// 导出单例
export default new TodoStorageManager();
