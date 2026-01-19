/**
 * 限流中间件
 * 核心限流逻辑，包含白名单检查、滑动窗口限流、违规记录
 */
const config = require('../config').rateLimit;
const slidingWindow = require('../services/slidingWindow.service');
const violationService = require('../services/violation.service');
const analyticsService = require('../services/analytics.service');
const redisService = require('../services/redis.service');
const { isIpWhitelisted } = require('../utils/ipUtils');
const logger = require('../utils/logger');

/**
 * 获取端点的限流配置
 * @param {string} path - 请求路径
 * @param {string} method - 请求方法
 * @param {string} clientType - 客户端类型
 * @returns {Object} 限流配置
 */
function getEndpointConfig(path, method, clientType) {
  // 1. 检查是否有端点级别配置
  const endpointConfig = config.endpoints.find(ep => {
    const pathMatch = path === ep.path || path.startsWith(ep.path + '/');
    const methodMatch = !ep.method || ep.method.toUpperCase() === method.toUpperCase();
    return pathMatch && methodMatch;
  });

  if (endpointConfig) {
    return {
      windowMs: endpointConfig.windowMs,
      maxRequests: endpointConfig.maxRequests,
      message: endpointConfig.message || config.messages.default
    };
  }

  // 2. 根据客户端类型返回配置
  if (clientType === 'authenticated' && config.authenticated) {
    return {
      windowMs: config.authenticated.windowMs,
      maxRequests: config.authenticated.maxRequests,
      message: config.messages.default
    };
  }

  if (clientType === 'anonymous' && config.anonymous) {
    return {
      windowMs: config.anonymous.windowMs,
      maxRequests: config.anonymous.maxRequests,
      message: config.messages.default
    };
  }

  // 3. 返回默认配置
  return {
    windowMs: config.default.windowMs,
    maxRequests: config.default.maxRequests,
    message: config.messages.default
  };
}

/**
 * 检查是否在白名单中
 * @param {Object} clientInfo - 客户端信息
 * @returns {boolean}
 */
function isWhitelisted(clientInfo) {
  const { ip, userId } = clientInfo;

  // 检查IP白名单
  if (isIpWhitelisted(ip, config.whitelist.ips)) {
    return true;
  }

  // 检查用户ID白名单
  if (userId && config.whitelist.userIds.includes(userId)) {
    return true;
  }

  return false;
}

/**
 * 检查是否在动态白名单中(Redis存储)
 * @param {Object} clientInfo - 客户端信息
 * @returns {Promise<boolean>}
 */
async function isDynamicWhitelisted(clientInfo) {
  const redis = redisService.getClient();
  const { ip, userId } = clientInfo;

  try {
    // 检查IP白名单
    const ipWhitelisted = await redis.sismember('whitelist:ips', ip);
    if (ipWhitelisted) return true;

    // 检查用户白名单
    if (userId) {
      const userWhitelisted = await redis.sismember('whitelist:users', userId);
      if (userWhitelisted) return true;
    }

    return false;
  } catch (error) {
    logger.error('检查动态白名单失败', { error: error.message });
    return false;
  }
}

/**
 * 生成端点标识
 * @param {string} path - 请求路径
 * @param {string} method - 请求方法
 * @returns {string}
 */
function generateEndpointKey(path, method) {
  // 标准化路径，移除查询参数和尾部斜杠
  let normalizedPath = path.split('?')[0].replace(/\/+$/, '');
  if (!normalizedPath) normalizedPath = '/';
  return `${method.toUpperCase()}:${normalizedPath}`;
}

/**
 * 限流中间件
 */
async function rateLimitMiddleware(req, res, next) {
  // 确保clientInfo已设置
  if (!req.clientInfo) {
    logger.warn('clientInfo未设置，跳过限流');
    return next();
  }

  const { clientId, clientType, ip, userId, userAgent } = req.clientInfo;
  const endpoint = generateEndpointKey(req.path, req.method);

  // 1. 检查静态白名单
  if (isWhitelisted(req.clientInfo)) {
    logger.debug('白名单跳过限流', { clientId });
    // 仍然记录统计
    analyticsService.recordRequest(clientId, endpoint, false);
    return next();
  }

  // 2. 检查动态白名单
  const dynamicWhitelisted = await isDynamicWhitelisted(req.clientInfo);
  if (dynamicWhitelisted) {
    logger.debug('动态白名单跳过限流', { clientId });
    analyticsService.recordRequest(clientId, endpoint, false);
    return next();
  }

  // 3. 获取限流配置
  const limitConfig = getEndpointConfig(req.path, req.method, clientType);
  const { windowMs, maxRequests, message } = limitConfig;

  // 4. 执行滑动窗口检查
  const result = await slidingWindow.checkAndRecord(
    clientId,
    endpoint,
    windowMs,
    maxRequests
  );

  // 5. 设置限流响应头
  res.set('X-RateLimit-Limit', maxRequests);
  res.set('X-RateLimit-Remaining', result.remaining);
  res.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

  // 6. 记录请求统计
  analyticsService.recordRequest(clientId, endpoint, !result.allowed);

  // 7. 如果被限流
  if (!result.allowed) {
    res.set('Retry-After', result.retryAfter);

    // 记录违规
    await violationService.recordViolation({
      clientId,
      clientType,
      endpoint,
      method: req.method,
      limit: maxRequests,
      actualRequests: result.totalRequests,
      ip,
      userId,
      userAgent
    });

    // 返回429错误
    const errorMessage = message.replace('{retryAfter}', result.retryAfter);
    
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: errorMessage,
        retryAfter: result.retryAfter,
        limit: maxRequests,
        windowMs
      }
    });
  }

  next();
}

module.exports = rateLimitMiddleware;
