// 心情日记表单验证规则
import { FORM_RULES } from './moodConstants.js';
import dayjs from 'dayjs';

/**
 * 验证日期
 * @param {string} date - 日期字符串
 * @returns {Object} 验证结果 { valid: boolean, message: string }
 */
export const validateDate = (date) => {
  if (!date) {
    return { valid: false, message: '请选择日期' };
  }
  
  const selectedDate = dayjs(date);
  const now = dayjs();
  
  if (!selectedDate.isValid()) {
    return { valid: false, message: '日期格式不正确' };
  }
  
  if (selectedDate.isAfter(now)) {
    return { valid: false, message: '日期不能晚于当前时间' };
  }
  
  return { valid: true, message: '' };
};

/**
 * 验证心情
 * @param {Object} mood - 心情对象
 * @returns {Object} 验证结果
 */
export const validateMood = (mood) => {
  if (!mood || !mood.name || !mood.value) {
    return { valid: false, message: '请选择心情' };
  }
  
  if (mood.value < 1 || mood.value > 5) {
    return { valid: false, message: '心情值必须在1-5之间' };
  }
  
  return { valid: true, message: '' };
};

/**
 * 验证标题
 * @param {string} title - 标题
 * @returns {Object} 验证结果
 */
export const validateTitle = (title) => {
  // 标题为可选字段
  if (!title || title.trim() === '') {
    return { valid: true, message: '' };
  }
  
  if (title.length > FORM_RULES.MAX_TITLE_LENGTH) {
    return { 
      valid: false, 
      message: `标题长度不能超过${FORM_RULES.MAX_TITLE_LENGTH}字` 
    };
  }
  
  return { valid: true, message: '' };
};

/**
 * 验证内容
 * @param {string} content - 日记内容
 * @returns {Object} 验证结果
 */
export const validateContent = (content) => {
  if (!content || content.trim() === '') {
    return { valid: false, message: '请填写日记内容' };
  }
  
  if (content.length > FORM_RULES.MAX_CONTENT_LENGTH) {
    return { 
      valid: false, 
      message: `日记内容不能超过${FORM_RULES.MAX_CONTENT_LENGTH}字` 
    };
  }
  
  return { valid: true, message: '' };
};

/**
 * 验证标签名称
 * @param {string} tagName - 标签名称
 * @returns {Object} 验证结果
 */
export const validateTagName = (tagName) => {
  if (!tagName || tagName.trim() === '') {
    return { valid: false, message: '标签名称不能为空' };
  }
  
  const trimmedName = tagName.trim();
  
  if (trimmedName.length < FORM_RULES.MIN_TAG_LENGTH) {
    return { 
      valid: false, 
      message: `标签名称至少${FORM_RULES.MIN_TAG_LENGTH}字` 
    };
  }
  
  if (trimmedName.length > FORM_RULES.MAX_TAG_LENGTH) {
    return { 
      valid: false, 
      message: `标签名称不能超过${FORM_RULES.MAX_TAG_LENGTH}字` 
    };
  }
  
  return { valid: true, message: '' };
};

/**
 * 验证标签列表
 * @param {Array<string>} tags - 标签数组
 * @returns {Object} 验证结果
 */
export const validateTags = (tags) => {
  // 标签为可选字段
  if (!tags || tags.length === 0) {
    return { valid: true, message: '' };
  }
  
  if (tags.length > FORM_RULES.MAX_TAGS_COUNT) {
    return { 
      valid: false, 
      message: `最多只能选择${FORM_RULES.MAX_TAGS_COUNT}个标签` 
    };
  }
  
  // 检查每个标签名称
  for (const tag of tags) {
    const result = validateTagName(tag);
    if (!result.valid) {
      return result;
    }
  }
  
  return { valid: true, message: '' };
};

/**
 * 验证完整的日记表单
 * @param {Object} formData - 表单数据
 * @returns {Object} 验证结果 { valid: boolean, errors: Object }
 */
export const validateJournalForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  // 验证日期
  const dateResult = validateDate(formData.date);
  if (!dateResult.valid) {
    errors.date = dateResult.message;
    isValid = false;
  }
  
  // 验证心情
  const moodResult = validateMood(formData.mood);
  if (!moodResult.valid) {
    errors.mood = moodResult.message;
    isValid = false;
  }
  
  // 验证标题
  const titleResult = validateTitle(formData.title);
  if (!titleResult.valid) {
    errors.title = titleResult.message;
    isValid = false;
  }
  
  // 验证内容
  const contentResult = validateContent(formData.content);
  if (!contentResult.valid) {
    errors.content = contentResult.message;
    isValid = false;
  }
  
  // 验证标签
  const tagsResult = validateTags(formData.tags);
  if (!tagsResult.valid) {
    errors.tags = tagsResult.message;
    isValid = false;
  }
  
  return { valid: isValid, errors };
};

/**
 * 验证搜索关键词
 * @param {string} keyword - 搜索关键词
 * @returns {Object} 验证结果
 */
export const validateSearchKeyword = (keyword) => {
  if (!keyword || keyword.trim() === '') {
    return { valid: true, message: '' };
  }
  
  if (keyword.length > 100) {
    return { valid: false, message: '搜索关键词不能超过100字' };
  }
  
  return { valid: true, message: '' };
};

/**
 * 验证日期范围
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Object} 验证结果
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: false, message: '请选择完整的日期范围' };
  }
  
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  if (!start.isValid() || !end.isValid()) {
    return { valid: false, message: '日期格式不正确' };
  }
  
  if (start.isAfter(end)) {
    return { valid: false, message: '开始日期不能晚于结束日期' };
  }
  
  return { valid: true, message: '' };
};
