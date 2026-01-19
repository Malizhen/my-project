/**
 * IP工具类
 */

/**
 * 从请求中提取客户端IP
 * @param {Object} req - Express请求对象
 * @returns {string} IP地址
 */
function getClientIp(req) {
  // 优先从 X-Forwarded-For 获取(代理场景)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For 可能包含多个IP，取第一个
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  // 其次从 X-Real-IP 获取
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }

  // 最后使用 req.ip
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

/**
 * 标准化IP地址
 * @param {string} ip - IP地址
 * @returns {string} 标准化后的IP
 */
function normalizeIp(ip) {
  if (!ip) return 'unknown';
  
  // 移除 IPv6 前缀 (::ffff:)
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  
  return ip;
}

/**
 * 检查IP是否在白名单中
 * @param {string} ip - IP地址
 * @param {string[]} whitelist - 白名单数组
 * @returns {boolean}
 */
function isIpWhitelisted(ip, whitelist) {
  const normalizedIp = normalizeIp(ip);
  return whitelist.some(whitelistedIp => {
    const normalizedWhitelisted = normalizeIp(whitelistedIp);
    return normalizedIp === normalizedWhitelisted;
  });
}

module.exports = {
  getClientIp,
  normalizeIp,
  isIpWhitelisted
};
