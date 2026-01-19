/**
 * 滑动窗口限流算法服务
 * 使用Redis Sorted Set实现
 */
const { v4: uuidv4 } = require('uuid');
const redisService = require('./redis.service');
const logger = require('../utils/logger');

/**
 * 生成限流key
 * @param {string} clientId - 客户端ID
 * @param {string} endpoint - 端点标识
 * @returns {string}
 */
function generateKey(clientId, endpoint) {
  return `ratelimit:${clientId}:${endpoint}`;
}

/**
 * 检查并记录请求(滑动窗口算法核心)
 * @param {string} clientId - 客户端ID (user:xxx 或 ip:xxx)
 * @param {string} endpoint - 端点标识
 * @param {number} windowMs - 窗口大小(毫秒)
 * @param {number} maxRequests - 最大请求数
 * @returns {Promise<Object>} { allowed, remaining, retryAfter, totalRequests }
 */
async function checkAndRecord(clientId, endpoint, windowMs, maxRequests) {
  const redis = redisService.getClient();
  const key = generateKey(clientId, endpoint);
  const now = Date.now();
  const windowStart = now - windowMs;
  const requestId = uuidv4();

  try {
    // 使用 Redis Pipeline 批量执行命令，提高性能
    const pipeline = redis.pipeline();
    
    // 1. 移除窗口外的过期数据
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // 2. 获取当前窗口内的请求数
    pipeline.zcard(key);
    
    // 3. 获取最早的请求时间戳(用于计算retryAfter)
    pipeline.zrange(key, 0, 0, 'WITHSCORES');
    
    const results = await pipeline.exec();
    
    // 解析结果
    const currentCount = results[1][1];
    const oldestEntry = results[2][1];
    
    // 4. 判断是否超限
    if (currentCount >= maxRequests) {
      // 计算需要等待的时间
      let retryAfter = windowMs / 1000; // 默认等待整个窗口
      
      if (oldestEntry && oldestEntry.length >= 2) {
        const oldestTimestamp = parseInt(oldestEntry[1], 10);
        const waitTime = (oldestTimestamp + windowMs) - now;
        retryAfter = Math.ceil(Math.max(waitTime, 1000) / 1000);
      }
      
      logger.debug('请求被限流', {
        clientId,
        endpoint,
        currentCount,
        maxRequests,
        retryAfter
      });
      
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
        totalRequests: currentCount,
        resetTime: now + (retryAfter * 1000)
      };
    }
    
    // 5. 允许请求，记录本次请求
    await redis.zadd(key, now, requestId);
    
    // 6. 设置key过期时间(窗口大小 + 1秒的缓冲)
    await redis.pexpire(key, windowMs + 1000);
    
    const remaining = maxRequests - currentCount - 1;
    
    logger.debug('请求通过', {
      clientId,
      endpoint,
      remaining,
      maxRequests
    });
    
    return {
      allowed: true,
      remaining: Math.max(0, remaining),
      retryAfter: 0,
      totalRequests: currentCount + 1,
      resetTime: now + windowMs
    };
    
  } catch (error) {
    logger.error('滑动窗口检查失败', { error: error.message, clientId, endpoint });
    // 发生错误时默认放行，避免因Redis问题阻塞所有请求
    return {
      allowed: true,
      remaining: maxRequests,
      retryAfter: 0,
      totalRequests: 0,
      resetTime: now + windowMs
    };
  }
}

/**
 * 获取客户端当前的请求统计
 * @param {string} clientId - 客户端ID
 * @param {string} endpoint - 端点标识
 * @param {number} windowMs - 窗口大小
 * @returns {Promise<number>} 当前窗口内的请求数
 */
async function getCurrentCount(clientId, endpoint, windowMs) {
  const redis = redisService.getClient();
  const key = generateKey(clientId, endpoint);
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // 先清理过期数据，再统计
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);
    return count;
  } catch (error) {
    logger.error('获取请求计数失败', { error: error.message });
    return 0;
  }
}

/**
 * 重置客户端的限流计数
 * @param {string} clientId - 客户端ID
 * @param {string} endpoint - 端点标识(可选，不传则重置所有端点)
 */
async function resetCount(clientId, endpoint = null) {
  const redis = redisService.getClient();
  
  try {
    if (endpoint) {
      const key = generateKey(clientId, endpoint);
      await redis.del(key);
    } else {
      // 重置该客户端的所有端点
      const pattern = `ratelimit:${clientId}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
    logger.info('限流计数已重置', { clientId, endpoint });
  } catch (error) {
    logger.error('重置限流计数失败', { error: error.message });
  }
}

module.exports = {
  checkAndRecord,
  getCurrentCount,
  resetCount,
  generateKey
};
