import { VALIDATION_RULES, PRIORITY } from './todoConstants';

/**
 * 验证待办任务标题
 */
export const validateTaskTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { valid: false, message: '任务标题不能为空' };
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return { valid: false, message: '任务标题不能为空或纯空格' };
  }

  if (trimmedTitle.length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
    return { 
      valid: false, 
      message: `任务标题长度不能超过${VALIDATION_RULES.TITLE_MAX_LENGTH}字符` 
    };
  }

  return { valid: true, message: '' };
};

/**
 * 验证待办任务描述
 */
export const validateTaskDescription = (description) => {
  if (!description) {
    return { valid: true, message: '' }; // 描述是可选的
  }

  if (typeof description !== 'string') {
    return { valid: false, message: '描述格式不正确' };
  }

  if (description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    return { 
      valid: false, 
      message: `描述长度不能超过${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}字符` 
    };
  }

  return { valid: true, message: '' };
};

/**
 * 验证分类ID
 */
export const validateCategoryId = (categoryId, categories) => {
  if (!categoryId) {
    return { valid: false, message: '请选择分类' };
  }

  if (categories && categories.length > 0) {
    const exists = categories.some(c => c.id === categoryId);
    if (!exists) {
      return { valid: false, message: '选择的分类不存在' };
    }
  }

  return { valid: true, message: '' };
};

/**
 * 验证优先级
 */
export const validatePriority = (priority) => {
  if (!priority) {
    return { valid: false, message: '请选择优先级' };
  }

  const validPriorities = Object.values(PRIORITY);
  if (!validPriorities.includes(priority)) {
    return { valid: false, message: '优先级值不正确' };
  }

  return { valid: true, message: '' };
};

/**
 * 验证待办任务完整数据
 */
export const validateTask = (task, categories) => {
  const errors = {};

  // 验证标题
  const titleResult = validateTaskTitle(task.title);
  if (!titleResult.valid) {
    errors.title = titleResult.message;
  }

  // 验证描述
  const descriptionResult = validateTaskDescription(task.description);
  if (!descriptionResult.valid) {
    errors.description = descriptionResult.message;
  }

  // 验证分类
  const categoryResult = validateCategoryId(task.categoryId, categories);
  if (!categoryResult.valid) {
    errors.categoryId = categoryResult.message;
  }

  // 验证优先级
  const priorityResult = validatePriority(task.priority);
  if (!priorityResult.valid) {
    errors.priority = priorityResult.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 验证分类名称
 */
export const validateCategoryName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: '分类名称不能为空' };
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return { valid: false, message: '分类名称不能为空或纯空格' };
  }

  if (trimmedName.length > VALIDATION_RULES.CATEGORY_NAME_MAX_LENGTH) {
    return { 
      valid: false, 
      message: `分类名称长度不能超过${VALIDATION_RULES.CATEGORY_NAME_MAX_LENGTH}字符` 
    };
  }

  return { valid: true, message: '' };
};

/**
 * 验证分类数据
 */
export const validateCategory = (category) => {
  const errors = {};

  // 验证名称
  const nameResult = validateCategoryName(category.name);
  if (!nameResult.valid) {
    errors.name = nameResult.message;
  }

  // 验证颜色格式(可选)
  if (category.color && !/^#[0-9A-Fa-f]{6}$/.test(category.color)) {
    errors.color = '颜色格式不正确，应为十六进制格式(如 #1890ff)';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
