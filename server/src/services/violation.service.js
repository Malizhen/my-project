/**
 * 违规记录服务
 */
const redisService = require('./redis.service');
const logger = require('../utils/logger');

const VIOLATION_KEY_PREFIX = 'violation:';
const VIOLATION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30天

/**
 * 记录一次违规
 * @param {Object} violationData 违规数据
 */
async function recordViolation(violationData) {
  const redis = redisService.getClient();
  const { clientId, clientType, endpoint, method, limit, actualRequests, ip, userId, userAgent } = violationData;
  
  const key = `${VIOLATION_KEY_PREFIX}${clientId}`;
  const now = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // 获取现有违规记录
    const existing = await redis.hgetall(key);
    
    let total = parseInt(existing.total || '0', 10) + 1;
    let endpoints = [];
    
    try {
      endpoints = JSON.parse(existing.endpoints || '[]');
    } catch (e) {
      endpoints = [];
    }
    
    // 添加违规端点(去重)
    if (!endpoints.includes(endpoint)) {
      endpoints.push(endpoint);
    }
    
    // 构建违规详情
    const violation = {
      timestamp,
      endpoint,
      method,
      limit,
      actualRequests,
      ip,
      userId,
      userAgent
    };
    
    // 获取历史违规记录(最多保留100条)
    let history = [];
    try {
      history = JSON.parse(existing.history || '[]');
    } catch (e) {
      history = [];
    }
    history.unshift(violation);
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    
    // 更新违规记录
    await redis.hset(key,
      'total', total,
      'clientType', clientType,
      'lastTime', timestamp,
      'firstTime', existing.firstTime || timestamp,
      'endpoints', JSON.stringify(endpoints),
      'history', JSON.stringify(history),
      'lastIp', ip || '',
      'lastUserId', userId || ''
    );
    
    // 设置过期时间
    await redis.expire(key, VIOLATION_TTL_SECONDS);
    
    logger.warn('记录违规行为', {
      clientId,
      clientType,
      endpoint,
      totalViolations: total
    });
    
    return { total, endpoints };
    
  } catch (error) {
    logger.error('记录违规失败', { error: error.message });
    return null;
  }
}

/**
 * 获取客户端的违规统计
 * @param {string} clientId - 客户端ID
 * @returns {Promise<Object|null>}
 */
async function getViolationStats(clientId) {
  const redis = redisService.getClient();
  const key = `${VIOLATION_KEY_PREFIX}${clientId}`;

  try {
    const data = await redis.hgetall(key);
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return {
      clientId,
      clientType: data.clientType,
      total: parseInt(data.total || '0', 10),
      firstTime: data.firstTime,
      lastTime: data.lastTime,
      endpoints: JSON.parse(data.endpoints || '[]'),
      lastIp: data.lastIp,
      lastUserId: data.lastUserId
    };
  } catch (error) {
    logger.error('获取违规统计失败', { error: error.message });
    return null;
  }
}

/**
 * 获取违规详细历史
 * @param {string} clientId - 客户端ID
 * @returns {Promise<Array>}
 */
async function getViolationHistory(clientId) {
  const redis = redisService.getClient();
  const key = `${VIOLATION_KEY_PREFIX}${clientId}`;

  try {
    const data = await redis.hget(key, 'history');
    return JSON.parse(data || '[]');
  } catch (error) {
    logger.error('获取违规历史失败', { error: error.message });
    return [];
  }
}

/**
 * 获取所有违规记录(分页)
 * @param {Object} options - 分页选项
 * @returns {Promise<Object>}
 */
async function getAllViolations(options = {}) {
  const { page = 1, pageSize = 20, sortBy = 'total' } = options;
  const redis = redisService.getClient();

  try {
    // 获取所有违规key
    const keys = await redis.keys(`${VIOLATION_KEY_PREFIX}*`);
    
    if (keys.length === 0) {
      return { items: [], total: 0, page, pageSize };
    }

    // 获取所有违规数据
    const violations = [];
    for (const key of keys) {
      const data = await redis.hgetall(key);
      if (data && Object.keys(data).length > 0) {
        violations.push({
          clientId: key.replace(VIOLATION_KEY_PREFIX, ''),
          clientType: data.clientType,
          total: parseInt(data.total || '0', 10),
          firstTime: data.firstTime,
          lastTime: data.lastTime,
          endpoints: JSON.parse(data.endpoints || '[]'),
          lastIp: data.lastIp,
          lastUserId: data.lastUserId
        });
      }
    }

    // 排序
    violations.sort((a, b) => {
      if (sortBy === 'total') {
        return b.total - a.total;
      } else if (sortBy === 'lastTime') {
        return new Date(b.lastTime) - new Date(a.lastTime);
      }
      return 0;
    });

    // 分页
    const start = (page - 1) * pageSize;
    const items = violations.slice(start, start + pageSize);

    return {
      items,
      total: violations.length,
      page,
      pageSize
    };
  } catch (error) {
    logger.error('获取违规列表失败', { error: error.message });
    return { items: [], total: 0, page, pageSize };
  }
}

/**
 * 清除客户端的违规记录
 * @param {string} clientId - 客户端ID
 */
async function clearViolations(clientId) {
  const redis = redisService.getClient();
  const key = `${VIOLATION_KEY_PREFIX}${clientId}`;

  try {
    await redis.del(key);
    logger.info('违规记录已清除', { clientId });
  } catch (error) {
    logger.error('清除违规记录失败', { error: error.message });
  }
}

module.exports = {
  recordViolation,
  getViolationStats,
  getViolationHistory,
  getAllViolations,
  clearViolations
};
