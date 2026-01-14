/**
 * 数据验证工具
 */

/**
 * 验证收支记录
 */
export const validateRecord = (record) => {
  const errors = {};

  // 验证类型
  if (!record.type || !['income', 'expense'].includes(record.type)) {
    errors.type = '请选择记录类型';
  }

  // 验证金额
  if (!record.amount) {
    errors.amount = '请输入金额';
  } else if (isNaN(record.amount) || parseFloat(record.amount) <= 0) {
    errors.amount = '金额必须大于0';
  } else if (!/^\d+(\.\d{1,2})?$/.test(record.amount.toString())) {
    errors.amount = '金额最多保留两位小数';
  }

  // 验证分类
  if (!record.category) {
    errors.category = '请选择分类';
  }

  // 验证日期
  if (!record.date) {
    errors.date = '请选择日期';
  } else {
    const recordDate = new Date(record.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (recordDate > today) {
      errors.date = '日期不能晚于今天';
    }
  }

  // 验证备注
  if (record.note && record.note.length > 200) {
    errors.note = '备注不能超过200个字符';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 验证分类
 */
export const validateCategory = (category, existingCategories = []) => {
  const errors = {};

  // 验证名称
  if (!category.name || category.name.trim() === '') {
    errors.name = '请输入分类名称';
  } else if (category.name.length > 20) {
    errors.name = '分类名称不能超过20个字符';
  }

  // 验证类型
  if (!category.type || !['income', 'expense'].includes(category.type)) {
    errors.type = '请选择分类类型';
  }

  // 检查重名
  if (category.name) {
    const exists = existingCategories.some(
      c => c.type === category.type && 
           c.name === category.name && 
           c.id !== category.id
    );
    if (exists) {
      errors.name = '该分类名称已存在';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 格式化金额
 */
export const formatAmount = (amount) => {
  return parseFloat(amount).toFixed(2);
};

/**
 * 格式化日期
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 获取今天的日期字符串
 */
export const getToday = () => {
  return formatDate(new Date());
};

/**
 * 获取当月第一天
 */
export const getMonthStart = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(1);
  return formatDate(d);
};

/**
 * 获取当月最后一天
 */
export const getMonthEnd = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return formatDate(d);
};
