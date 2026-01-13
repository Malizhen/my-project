module.exports = {
  // 全局默认配置
  default: {
    windowMs: 60000,      // 1分钟窗口
    maxRequests: 100      // 最多100次请求
  },

  // 已登录用户配置
  authenticated: {
    windowMs: 60000,
    maxRequests: 200
  },

  // 未登录用户(按IP)配置
  anonymous: {
    windowMs: 60000,
    maxRequests: 50
  },

  // 端点级别配置 - 不同接口不同限制
  endpoints: [
    {
      path: '/api/search',
      method: 'GET',
      windowMs: 60000,
      maxRequests: 20,
      message: '搜索请求过于频繁'
    },
    {
      path: '/api/export',
      method: 'POST',
      windowMs: 300000,    // 5分钟
      maxRequests: 5,
      message: '导出操作请稍后再试'
    },
    {
      path: '/api/upload',
      method: 'POST',
      windowMs: 60000,
      maxRequests: 10,
      message: '上传请求过于频繁'
    }
  ],

  // 白名单配置
  whitelist: {
    ips: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
    userIds: []
  },

  // 违规处理策略
  violation: {
    // 轻度违规阈值
    lightThreshold: 5,
    // 中度违规阈值
    mediumThreshold: 10,
    // 重度违规阈值 - 触发临时封禁
    severeThreshold: 20,
    // 临时封禁时长(毫秒)
    blockDurationMs: 900000  // 15分钟
  },

  // 响应消息模板
  messages: {
    default: '请求过于频繁，请在 {retryAfter} 秒后重试',
    blocked: '您已被临时限制访问，请在 {retryAfter} 秒后重试'
  }
};
