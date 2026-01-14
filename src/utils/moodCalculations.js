// 心情日记统计计算工具
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { MOOD_TYPES } from './moodConstants.js';

dayjs.extend(isBetween);

/**
 * 根据时间范围筛选日记
 * @param {Array} entries - 日记数组
 * @param {string} range - 时间范围 'week'|'month'|'last30days'|'last90days'|'all'|'custom'
 * @param {Object} customRange - 自定义范围 { start: string, end: string }
 * @returns {Array} 筛选后的日记数组
 */
export const filterEntriesByTimeRange = (entries, range, customRange = null) => {
  if (range === 'all') {
    return entries;
  }
  
  const now = dayjs();
  let startDate;
  let endDate = now;
  
  switch (range) {
    case 'week':
      startDate = now.startOf('week');
      endDate = now.endOf('week');
      break;
    case 'month':
      startDate = now.startOf('month');
      endDate = now.endOf('month');
      break;
    case 'last30days':
      startDate = now.subtract(30, 'day');
      break;
    case 'last90days':
      startDate = now.subtract(90, 'day');
      break;
    case 'custom':
      if (customRange && customRange.start && customRange.end) {
        startDate = dayjs(customRange.start);
        endDate = dayjs(customRange.end);
      } else {
        return entries;
      }
      break;
    default:
      return entries;
  }
  
  return entries.filter(entry => {
    const entryDate = dayjs(entry.date);
    return entryDate.isBetween(startDate, endDate, null, '[]');
  });
};

/**
 * 计算心情分布数据
 * @param {Array} entries - 日记数组
 * @returns {Object} 心情分布数据
 */
export const calculateMoodDistribution = (entries) => {
  const distribution = MOOD_TYPES.map(mood => ({
    name: mood.name,
    value: mood.value,
    icon: mood.icon,
    color: mood.color,
    count: 0,
    percentage: 0
  }));
  
  if (entries.length === 0) {
    return distribution;
  }
  
  // 统计各心情出现次数
  entries.forEach(entry => {
    const moodValue = entry.mood.value;
    const item = distribution.find(d => d.value === moodValue);
    if (item) {
      item.count++;
    }
  });
  
  // 计算百分比
  distribution.forEach(item => {
    item.percentage = ((item.count / entries.length) * 100).toFixed(1);
  });
  
  return distribution;
};

/**
 * 计算心情趋势数据（按日期）
 * @param {Array} entries - 日记数组
 * @param {number} days - 天数
 * @returns {Array} 趋势数据 [{ date, moodValue, count }]
 */
export const calculateMoodTrend = (entries, days = 30) => {
  const trend = [];
  const now = dayjs();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = now.subtract(i, 'day').format('YYYY-MM-DD');
    const dayEntries = entries.filter(entry => {
      return dayjs(entry.date).format('YYYY-MM-DD') === date;
    });
    
    if (dayEntries.length > 0) {
      // 计算当天的平均心情值
      const avgMood = dayEntries.reduce((sum, entry) => sum + entry.mood.value, 0) / dayEntries.length;
      trend.push({
        date,
        moodValue: Number(avgMood.toFixed(2)),
        count: dayEntries.length
      });
    } else {
      trend.push({
        date,
        moodValue: null,
        count: 0
      });
    }
  }
  
  return trend;
};

/**
 * 计算标签使用频次
 * @param {Array} entries - 日记数组
 * @returns {Array} 标签频次数据 [{ name, count }]
 */
export const calculateTagFrequency = (entries) => {
  const tagMap = new Map();
  
  entries.forEach(entry => {
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    }
  });
  
  const tagFrequency = Array.from(tagMap.entries()).map(([name, count]) => ({
    name,
    count
  }));
  
  // 按使用次数降序排序
  tagFrequency.sort((a, b) => b.count - a.count);
  
  return tagFrequency;
};

/**
 * 计算连续记录天数
 * @param {Array} entries - 日记数组
 * @returns {number} 连续记录天数
 */
export const calculateConsecutiveDays = (entries) => {
  if (entries.length === 0) {
    return 0;
  }
  
  // 按日期排序（倒序）
  const sortedEntries = [...entries].sort((a, b) => 
    dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  );
  
  // 获取所有记录的日期（去重）
  const uniqueDates = [...new Set(sortedEntries.map(entry => 
    dayjs(entry.date).format('YYYY-MM-DD')
  ))].sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());
  
  if (uniqueDates.length === 0) {
    return 0;
  }
  
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  
  // 如果最近一条记录不是今天或昨天，说明已中断
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }
  
  let consecutiveDays = 1;
  let currentDate = dayjs(uniqueDates[0]);
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = dayjs(uniqueDates[i]);
    const diff = currentDate.diff(prevDate, 'day');
    
    if (diff === 1) {
      consecutiveDays++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  
  return consecutiveDays;
};

/**
 * 计算最常出现的心情
 * @param {Array} entries - 日记数组
 * @returns {Object|null} 最常出现的心情对象
 */
export const calculateMostFrequentMood = (entries) => {
  if (entries.length === 0) {
    return null;
  }
  
  const distribution = calculateMoodDistribution(entries);
  const sorted = distribution.sort((a, b) => b.count - a.count);
  
  return sorted[0].count > 0 ? sorted[0] : null;
};

/**
 * 计算平均心情值
 * @param {Array} entries - 日记数组
 * @returns {number} 平均心情值
 */
export const calculateAverageMood = (entries) => {
  if (entries.length === 0) {
    return 0;
  }
  
  const sum = entries.reduce((acc, entry) => acc + entry.mood.value, 0);
  return Number((sum / entries.length).toFixed(2));
};

/**
 * 计算统计卡片数据
 * @param {Array} entries - 日记数组
 * @param {string} timeRange - 时间范围
 * @returns {Object} 统计卡片数据
 */
export const calculateStatisticsCards = (entries, timeRange = 'all') => {
  const filteredEntries = timeRange === 'all' 
    ? entries 
    : filterEntriesByTimeRange(entries, timeRange);
  
  return {
    totalCount: entries.length,
    filteredCount: filteredEntries.length,
    consecutiveDays: calculateConsecutiveDays(entries),
    mostFrequentMood: calculateMostFrequentMood(filteredEntries),
    averageMood: calculateAverageMood(filteredEntries)
  };
};

/**
 * 筛选日记记录
 * @param {Array} entries - 日记数组
 * @param {Object} filters - 筛选条件
 * @returns {Array} 筛选后的日记数组
 */
export const filterJournalEntries = (entries, filters) => {
  let filtered = [...entries];
  
  // 日期范围筛选
  if (filters.dateRange) {
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = dayjs(filters.dateRange.start);
      const endDate = dayjs(filters.dateRange.end);
      filtered = filtered.filter(entry => {
        const entryDate = dayjs(entry.date);
        return entryDate.isBetween(startDate, endDate, null, '[]');
      });
    }
  }
  
  // 心情类型筛选
  if (filters.moods && filters.moods.length > 0) {
    filtered = filtered.filter(entry => 
      filters.moods.includes(entry.mood.value)
    );
  }
  
  // 标签筛选
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(entry => {
      if (!entry.tags || entry.tags.length === 0) {
        return false;
      }
      return filters.tags.some(tag => entry.tags.includes(tag));
    });
  }
  
  // 关键词搜索
  if (filters.keyword && filters.keyword.trim() !== '') {
    const keyword = filters.keyword.toLowerCase();
    filtered = filtered.filter(entry => {
      const titleMatch = entry.title && entry.title.toLowerCase().includes(keyword);
      const contentMatch = entry.content && entry.content.toLowerCase().includes(keyword);
      return titleMatch || contentMatch;
    });
  }
  
  // 按时间排序（倒序）
  filtered.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  
  return filtered;
};

/**
 * 获取本周每天的心情
 * @param {Array} entries - 日记数组
 * @returns {Array} 本周心情数据
 */
export const getWeekMoodData = (entries) => {
  const weekData = [];
  const startOfWeek = dayjs().startOf('week');
  
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add(i, 'day');
    const dateStr = date.format('YYYY-MM-DD');
    const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][i];
    
    const dayEntries = entries.filter(entry => 
      dayjs(entry.date).format('YYYY-MM-DD') === dateStr
    );
    
    weekData.push({
      date: dateStr,
      dayName,
      isToday: dateStr === dayjs().format('YYYY-MM-DD'),
      entries: dayEntries,
      averageMood: dayEntries.length > 0 ? calculateAverageMood(dayEntries) : null
    });
  }
  
  return weekData;
};
