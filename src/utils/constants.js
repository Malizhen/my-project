// 数据类型定义

/**
 * 记录类型枚举
 */
export const RecordType = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

/**
 * 默认支出分类
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'exp-1', name: '餐饮', type: RecordType.EXPENSE, isDefault: true },
  { id: 'exp-2', name: '交通', type: RecordType.EXPENSE, isDefault: true },
  { id: 'exp-3', name: '购物', type: RecordType.EXPENSE, isDefault: true },
  { id: 'exp-4', name: '娱乐', type: RecordType.EXPENSE, isDefault: true },
  { id: 'exp-5', name: '医疗', type: RecordType.EXPENSE, isDefault: true },
  { id: 'exp-6', name: '教育', type: RecordType.EXPENSE, isDefault: true },
  { id: 'exp-7', name: '住房', type: RecordType.EXPENSE, isDefault: true },
  { id: 'exp-8', name: '通讯', type: RecordType.EXPENSE, isDefault: true },
  { id: 'exp-9', name: '其他', type: RecordType.EXPENSE, isDefault: true }
];

/**
 * 默认收入分类
 */
export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'inc-1', name: '工资', type: RecordType.INCOME, isDefault: true },
  { id: 'inc-2', name: '奖金', type: RecordType.INCOME, isDefault: true },
  { id: 'inc-3', name: '投资收益', type: RecordType.INCOME, isDefault: true },
  { id: 'inc-4', name: '兼职收入', type: RecordType.INCOME, isDefault: true },
  { id: 'inc-5', name: '其他', type: RecordType.INCOME, isDefault: true }
];

/**
 * 所有默认分类
 */
export const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES
];

/**
 * LocalStorage键名
 */
export const STORAGE_KEYS = {
  RECORDS: 'expense_records',
  CATEGORIES: 'expense_categories'
};
