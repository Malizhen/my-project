/**
 * 统计分析服务
 */
const redisService = require('./redis.service');
const logger = require('../utils/logger');

const STATS_KEY_PREFIX = 'stats:';
const REALTIME_KEY = 'realtime:requests';

/**
 * 记录请求统计
 * @param {string} clientId - 客户端ID
 * @param {string} endpoint - 端点
 * @param {boolean} blocked - 是否被限流
 */
async function recordRequest(clientId, endpoint, blocked = false) {
  const redis = redisService.getClient();
  const now = Date.now();
  const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const hourKey = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  const minuteKey = Math.floor(now / 60000); // 分钟级别key

  try {
    const pipeline = redis.pipeline();
    
    // 每日统计
    const dailyKey = `${STATS_KEY_PREFIX}daily:${dateKey}`;
    pipeline.hincrby(dailyKey, 'total', 1);
    pipeline.hincrby(dailyKey, `endpoint:${endpoint}`, 1);
    if (blocked) {
      pipeline.hincrby(dailyKey, 'blocked', 1);
    }
    pipeline.expire(dailyKey, 90 * 24 * 60 * 60); // 90天过期
    
    // 客户端统计
    const clientKey = `${STATS_KEY_PREFIX}client:${dateKey}:${clientId}`;
    pipeline.hincrby(clientKey, 'total', 1);
    pipeline.hincrby(clientKey, `endpoint:${endpoint}`, 1);
    if (blocked) {
      pipeline.hincrby(clientKey, 'blocked', 1);
    }
    pipeline.expire(clientKey, 90 * 24 * 60 * 60);
    
    // 实时统计(按分钟)
    const realtimeMinuteKey = `${STATS_KEY_PREFIX}minute:${minuteKey}`;
    pipeline.incr(realtimeMinuteKey);
    pipeline.expire(realtimeMinuteKey, 3600); // 1小时过期
    
    // 小时统计
    const hourlyKey = `${STATS_KEY_PREFIX}hourly:${hourKey}`;
    pipeline.hincrby(hourlyKey, 'total', 1);
    if (blocked) {
      pipeline.hincrby(hourlyKey, 'blocked', 1);
    }
    pipeline.expire(hourlyKey, 7 * 24 * 60 * 60); // 7天过期
    
    await pipeline.exec();
    
  } catch (error) {
    logger.error('记录请求统计失败', { error: error.message });
  }
}

/**
 * 获取概览数据
 * @returns {Promise<Object>}
 */
async function getOverview() {
  const redis = redisService.getClient();
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `${STATS_KEY_PREFIX}daily:${today}`;

  try {
    const data = await redis.hgetall(dailyKey);
    
    // 获取活跃客户端数
    const clientKeys = await redis.keys(`${STATS_KEY_PREFIX}client:${today}:*`);
    
    // 获取违规数
    const violationKeys = await redis.keys('violation:*');
    let totalViolations = 0;
    for (const key of violationKeys) {
      const total = await redis.hget(key, 'total');
      totalViolations += parseInt(total || '0', 10);
    }

    return {
      totalRequests: parseInt(data?.total || '0', 10),
      blockedRequests: parseInt(data?.blocked || '0', 10),
      activeClients: clientKeys.length,
      totalViolations,
      date: today
    };
  } catch (error) {
    logger.error('获取概览数据失败', { error: error.message });
    return {
      totalRequests: 0,
      blockedRequests: 0,
      activeClients: 0,
      totalViolations: 0,
      date: today
    };
  }
}

/**
 * 获取请求最多的客户端
 * @param {Object} options - 选项
 * @returns {Promise<Array>}
 */
async function getTopClients(options = {}) {
  const { limit = 10, timeRange = '24h' } = options;
  const redis = redisService.getClient();

  try {
    // 根据时间范围确定要查询的日期
    const dates = [];
    const now = new Date();
    
    if (timeRange === '1h') {
      dates.push(now.toISOString().split('T')[0]);
    } else if (timeRange === '24h') {
      dates.push(now.toISOString().split('T')[0]);
    } else if (timeRange === '7d') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
    } else if (timeRange === '30d') {
      for (let i = 0; i < 30; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
    }

    // 聚合客户端数据
    const clientStats = {};
    
    for (const date of dates) {
      const keys = await redis.keys(`${STATS_KEY_PREFIX}client:${date}:*`);
      
      for (const key of keys) {
        const clientId = key.split(':').slice(3).join(':');
        const data = await redis.hgetall(key);
        
        if (!clientStats[clientId]) {
          clientStats[clientId] = {
            clientId,
            totalRequests: 0,
            blockedRequests: 0
          };
        }
        
        clientStats[clientId].totalRequests += parseInt(data?.total || '0', 10);
        clientStats[clientId].blockedRequests += parseInt(data?.blocked || '0', 10);
      }
    }

    // 排序并返回前N个
    const sorted = Object.values(clientStats)
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, limit);

    return sorted;
  } catch (error) {
    logger.error('获取热门客户端失败', { error: error.message });
    return [];
  }
}

/**
 * 获取实时流量数据
 * @returns {Promise<Object>}
 */
async function getRealtimeData() {
  const redis = redisService.getClient();
  const now = Date.now();

  try {
    // 获取最近60分钟的数据点
    const dataPoints = [];
    
    for (let i = 59; i >= 0; i--) {
      const minuteKey = Math.floor((now - i * 60000) / 60000);
      const key = `${STATS_KEY_PREFIX}minute:${minuteKey}`;
      const count = await redis.get(key);
      
      dataPoints.push({
        time: new Date(minuteKey * 60000).toISOString(),
        requests: parseInt(count || '0', 10)
      });
    }

    // 计算统计数据
    const lastMinute = dataPoints[dataPoints.length - 1].requests;
    const last5Minutes = dataPoints.slice(-5).reduce((sum, p) => sum + p.requests, 0);
    const lastHour = dataPoints.reduce((sum, p) => sum + p.requests, 0);

    return {
      dataPoints,
      summary: {
        lastMinute,
        last5Minutes,
        lastHour
      }
    };
  } catch (error) {
    logger.error('获取实时数据失败', { error: error.message });
    return {
      dataPoints: [],
      summary: { lastMinute: 0, last5Minutes: 0, lastHour: 0 }
    };
  }
}

/**
 * 获取端点统计
 * @returns {Promise<Array>}
 */
async function getEndpointStats() {
  const redis = redisService.getClient();
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `${STATS_KEY_PREFIX}daily:${today}`;

  try {
    const data = await redis.hgetall(dailyKey);
    const endpoints = [];

    for (const [field, value] of Object.entries(data)) {
      if (field.startsWith('endpoint:')) {
        endpoints.push({
          endpoint: field.replace('endpoint:', ''),
          requests: parseInt(value, 10)
        });
      }
    }

    return endpoints.sort((a, b) => b.requests - a.requests);
  } catch (error) {
    logger.error('获取端点统计失败', { error: error.message });
    return [];
  }
}

module.exports = {
  recordRequest,
  getOverview,
  getTopClients,
  getRealtimeData,
  getEndpointStats
};
