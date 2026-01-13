/**
 * 客户端识别中间件
 * 识别用户(JWT)或IP，生成clientId
 */
const { getClientIp, normalizeIp } = require('../utils/ipUtils');
const logger = require('../utils/logger');

/**
 * 从JWT token中解析用户ID
 * 简化实现，实际项目应使用 jsonwebtoken 库
 * @param {string} token - JWT token
 * @returns {Object|null} 解析结果
 */
function parseJwtToken(token) {
  try {
    // 简化的JWT解析(仅解码payload，不验证签名)
    // 实际生产环境应使用 jwt.verify()
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * 客户端识别中间件
 */
function clientIdMiddleware(req, res, next) {
  // 1. 尝试从Authorization头获取JWT token
  const authHeader = req.headers.authorization;
  let userId = null;
  let clientType = 'anonymous';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = parseJwtToken(token);
    
    if (payload && payload.userId) {
      userId = payload.userId;
      clientType = 'authenticated';
    }
  }

  // 2. 获取客户端IP
  const rawIp = getClientIp(req);
  const ip = normalizeIp(rawIp);

  // 3. 生成clientId
  let clientId;
  if (userId) {
    clientId = `user:${userId}`;
  } else {
    clientId = `ip:${ip}`;
  }

  // 4. 将识别信息挂载到请求对象
  req.clientInfo = {
    clientId,
    clientType,
    userId,
    ip,
    userAgent: req.headers['user-agent'] || 'unknown'
  };

  logger.debug('客户端识别', {
    clientId,
    clientType,
    ip
  });

  next();
}

module.exports = clientIdMiddleware;
