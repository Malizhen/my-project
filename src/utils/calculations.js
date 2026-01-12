/**
 * 数据计算和统计工具
 */

/**
 * 计算月度统计
 */
export const calculateMonthlyStats = (records, year, month) => {
  const monthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === year && recordDate.getMonth() === month;
  });

  const income = monthRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const expense = monthRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const balance = income - expense;

  return {
    income: income.toFixed(2),
    expense: expense.toFixed(2),
    balance: balance.toFixed(2),
    count: monthRecords.length
  };
};

/**
 * 计算当月统计
 */
export const calculateCurrentMonthStats = (records) => {
  const now = new Date();
  return calculateMonthlyStats(records, now.getFullYear(), now.getMonth());
};

/**
 * 按分类统计
 */
export const calculateCategoryStats = (records, type, startDate, endDate) => {
  let filteredRecords = records.filter(r => r.type === type);

  // 日期筛选
  if (startDate || endDate) {
    filteredRecords = filteredRecords.filter(record => {
      const recordDate = new Date(record.date);
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date('2099-12-31');
      return recordDate >= start && recordDate <= end;
    });
  }

  // 按分类分组统计
  const categoryMap = {};
  filteredRecords.forEach(record => {
    if (!categoryMap[record.category]) {
      categoryMap[record.category] = 0;
    }
    categoryMap[record.category] += parseFloat(record.amount);
  });

  // 计算总额
  const total = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0);

  // 转换为数组并计算占比
  const stats = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount: amount.toFixed(2),
    percentage: total > 0 ? ((amount / total) * 100).toFixed(2) : 0
  }));

  // 按金额降序排序
  stats.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

  return {
    stats,
    total: total.toFixed(2)
  };
};

/**
 * 筛选记录
 */
export const filterRecords = (records, filters) => {
  let result = [...records];

  // 按类型筛选
  if (filters.type) {
    result = result.filter(r => r.type === filters.type);
  }

  // 按分类筛选
  if (filters.category) {
    result = result.filter(r => r.category === filters.category);
  }

  // 按日期范围筛选
  if (filters.startDate || filters.endDate) {
    result = result.filter(record => {
      const recordDate = new Date(record.date);
      const start = filters.startDate ? new Date(filters.startDate) : new Date('1970-01-01');
      const end = filters.endDate ? new Date(filters.endDate) : new Date('2099-12-31');
      return recordDate >= start && recordDate <= end;
    });
  }

  // 按关键词搜索（在备注中）
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    result = result.filter(r => 
      r.note && r.note.toLowerCase().includes(keyword)
    );
  }

  return result;
};

/**
 * 按时间倒序排序
 */
export const sortRecordsByDate = (records, ascending = false) => {
  return [...records].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};
