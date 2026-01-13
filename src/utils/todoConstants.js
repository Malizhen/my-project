/**
 * 待办事项模块常量定义
 */

// LocalStorage 存储键名
export const TODO_STORAGE_KEYS = {
  TASKS: 'todo_tasks',
  CATEGORIES: 'todo_categories'
};

// 优先级定义
export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// 优先级选项列表
export const PRIORITY_OPTIONS = [
  { value: PRIORITY.HIGH, label: '高', color: '#ff4d4f' },
  { value: PRIORITY.MEDIUM, label: '中', color: '#faad14' },
  { value: PRIORITY.LOW, label: '低', color: '#52c41a' }
];

// 任务状态筛选
export const TASK_STATUS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
};

// 排序方式
export const SORT_BY = {
  CREATE_TIME: 'createTime',
  PRIORITY: 'priority',
  STATUS: 'status'
};

// 排序选项列表
export const SORT_OPTIONS = [
  { value: SORT_BY.CREATE_TIME, label: '按创建时间' },
  { value: SORT_BY.PRIORITY, label: '按优先级' },
  { value: SORT_BY.STATUS, label: '按完成状态' }
];

// 预设分类列表
export const DEFAULT_TODO_CATEGORIES = [
  {
    id: 'cat_work',
    name: '工作',
    icon: 'BriefcaseOutlined',
    color: '#1890ff',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat_life',
    name: '生活',
    icon: 'HomeOutlined',
    color: '#52c41a',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat_study',
    name: '学习',
    icon: 'BookOutlined',
    color: '#722ed1',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat_shopping',
    name: '购物',
    icon: 'ShoppingOutlined',
    color: '#fa8c16',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat_other',
    name: '其他',
    icon: 'AppstoreOutlined',
    color: '#8c8c8c',
    isDefault: true,
    createdAt: new Date().toISOString()
  }
];

// 表单验证规则
export const VALIDATION_RULES = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  CATEGORY_NAME_MAX_LENGTH: 20
};
