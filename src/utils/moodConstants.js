// 心情日记应用常量定义

// 5级心情预设类型
export const MOOD_TYPES = [
  {
    name: '非常开心',
    value: 5,
    icon: '😄',
    color: '#FFD700'
  },
  {
    name: '开心',
    value: 4,
    icon: '🙂',
    color: '#90EE90'
  },
  {
    name: '平静',
    value: 3,
    icon: '😐',
    color: '#87CEEB'
  },
  {
    name: '难过',
    value: 2,
    icon: '😔',
    color: '#B0B0B0'
  },
  {
    name: '很难过',
    value: 1,
    icon: '😢',
    color: '#696969'
  }
];

// 根据心情值获取心情对象
export const getMoodByValue = (value) => {
  return MOOD_TYPES.find(mood => mood.value === value) || MOOD_TYPES[2];
};

// 根据心情名称获取心情对象
export const getMoodByName = (name) => {
  return MOOD_TYPES.find(mood => mood.name === name) || MOOD_TYPES[2];
};

// 预设标签
export const DEFAULT_TAGS = [
  '工作',
  '学习',
  '家庭',
  '朋友',
  '运动',
  '娱乐',
  '旅行',
  '健康'
];

// LocalStorage 存储键名
export const STORAGE_KEYS = {
  JOURNAL_ENTRIES: 'mood_journal_entries',
  JOURNAL_TAGS: 'mood_journal_tags',
  JOURNAL_SETTINGS: 'mood_journal_settings'
};

// 时间范围选项
export const TIME_RANGE_OPTIONS = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '最近30天', value: 'last30days' },
  { label: '最近90天', value: 'last90days' },
  { label: '全部时间', value: 'all' },
  { label: '自定义范围', value: 'custom' }
];

// 分页配置
export const PAGINATION_CONFIG = {
  PAGE_SIZE: 20,
  DEFAULT_PAGE: 1
};

// 表单规则常量
export const FORM_RULES = {
  MAX_TITLE_LENGTH: 50,
  MAX_CONTENT_LENGTH: 5000,
  MIN_TAG_LENGTH: 2,
  MAX_TAG_LENGTH: 10,
  MAX_TAGS_COUNT: 5
};

// 主题色配置
export const THEME_COLORS = {
  PRIMARY: '#5B9BD5',
  SECONDARY: '#F4A460',
  BACKGROUND: '#F5F5F5',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666'
};
