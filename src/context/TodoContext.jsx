import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import todoStorage from '../utils/todoStorage';
import { TASK_STATUS, SORT_BY, PRIORITY } from '../utils/todoConstants';

const TodoContext = createContext();

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within TodoProvider');
  }
  return context;
};

export const TodoProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState({
    status: TASK_STATUS.ALL,
    categoryId: '',
    priority: 'all'
  });
  const [sortBy, setSortBy] = useState(SORT_BY.CREATE_TIME);
  const [loading, setLoading] = useState(true);

  // 初始化数据
  useEffect(() => {
    try {
      todoStorage.init();
      loadTasks();
      loadCategories();
    } catch (error) {
      console.error('初始化失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载任务数据
  const loadTasks = useCallback(() => {
    try {
      const loadedTasks = todoStorage.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('加载任务失败:', error);
      setTasks([]);
    }
  }, []);

  // 加载分类数据
  const loadCategories = useCallback(() => {
    try {
      const loadedCategories = todoStorage.getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('加载分类失败:', error);
      setCategories([]);
    }
  }, []);

  // 添加任务
  const addTask = useCallback(async (task) => {
    try {
      const newTask = todoStorage.addTask(task);
      setTasks(prev => [...prev, newTask]);
      return { success: true, task: newTask };
    } catch (error) {
      console.error('添加任务失败:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // 更新任务
  const updateTask = useCallback(async (id, updates) => {
    try {
      const updatedTask = todoStorage.updateTask(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('更新任务失败:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // 删除任务
  const deleteTask = useCallback(async (id) => {
    try {
      todoStorage.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (error) {
      console.error('删除任务失败:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // 切换完成状态
  const toggleComplete = useCallback(async (id) => {
    try {
      const updatedTask = todoStorage.toggleTaskComplete(id);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('切换完成状态失败:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // 添加分类
  const addCategory = useCallback(async (category) => {
    try {
      const newCategory = todoStorage.addCategory(category);
      setCategories(prev => [...prev, newCategory]);
      return { success: true, category: newCategory };
    } catch (error) {
      console.error('添加分类失败:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // 更新分类
  const updateCategory = useCallback(async (id, updates) => {
    try {
      const updatedCategory = todoStorage.updateCategory(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      return { success: true, category: updatedCategory };
    } catch (error) {
      console.error('更新分类失败:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // 删除分类
  const deleteCategory = useCallback(async (id) => {
    try {
      todoStorage.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (error) {
      console.error('删除分类失败:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // 计算筛选后的任务列表
  const filteredTasks = useCallback(() => {
    let result = [...tasks];

    // 按状态筛选
    if (filter.status === TASK_STATUS.ACTIVE) {
      result = result.filter(t => !t.completed);
    } else if (filter.status === TASK_STATUS.COMPLETED) {
      result = result.filter(t => t.completed);
    }

    // 按分类筛选
    if (filter.categoryId) {
      result = result.filter(t => t.categoryId === filter.categoryId);
    }

    // 按优先级筛选
    if (filter.priority && filter.priority !== 'all') {
      result = result.filter(t => t.priority === filter.priority);
    }

    // 排序
    result.sort((a, b) => {
      if (sortBy === SORT_BY.CREATE_TIME) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === SORT_BY.PRIORITY) {
        const priorityOrder = { [PRIORITY.HIGH]: 3, [PRIORITY.MEDIUM]: 2, [PRIORITY.LOW]: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      } else if (sortBy === SORT_BY.STATUS) {
        return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
      }
      return 0;
    });

    return result;
  }, [tasks, filter, sortBy]);

  // 计算统计数据
  const statistics = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, active, completed, completionRate };
  }, [tasks]);

  const value = {
    tasks,
    categories,
    filter,
    sortBy,
    loading,
    filteredTasks: filteredTasks(),
    statistics: statistics(),
    setFilter,
    setSortBy,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    addCategory,
    updateCategory,
    deleteCategory,
    loadTasks,
    loadCategories
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
