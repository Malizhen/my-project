/**
 * 仪表板控制器
 */
const analyticsService = require('../services/analytics.service');
const violationService = require('../services/violation.service');
const redisService = require('../services/redis.service');
const logger = require('../utils/logger');

/**
 * 获取概览数据
 */
async function getOverview(req, res) {
  try {
    const overview = await analyticsService.getOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('获取概览数据失败', { error: error.message });
    res.status(500).json({ success: false, error: '获取数据失败' });
  }
}

/**
 * 获取请求最多的客户端
 */
async function getTopClients(req, res) {
  try {
    const { limit = 10, timeRange = '24h' } = req.query;
    const clients = await analyticsService.getTopClients({
      limit: parseInt(limit, 10),
      timeRange
    });
    res.json({ success: true, data: clients });
  } catch (error) {
    logger.error('获取热门客户端失败', { error: error.message });
    res.status(500).json({ success: false, error: '获取数据失败' });
  }
}

/**
 * 获取违规列表
 */
async function getViolations(req, res) {
  try {
    const { page = 1, pageSize = 20, sortBy = 'total' } = req.query;
    const violations = await violationService.getAllViolations({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      sortBy
    });
    res.json({ success: true, data: violations });
  } catch (error) {
    logger.error('获取违规列表失败', { error: error.message });
    res.status(500).json({ success: false, error: '获取数据失败' });
  }
}

/**
 * 获取违规详情
 */
async function getViolationDetail(req, res) {
  try {
    const { clientId } = req.params;
    const stats = await violationService.getViolationStats(clientId);
    const history = await violationService.getViolationHistory(clientId);
    
    if (!stats) {
      return res.status(404).json({ success: false, error: '未找到违规记录' });
    }
    
    res.json({
      success: true,
      data: { ...stats, history }
    });
  } catch (error) {
    logger.error('获取违规详情失败', { error: error.message });
    res.status(500).json({ success: false, error: '获取数据失败' });
  }
}

/**
 * 获取实时流量数据
 */
async function getRealtimeData(req, res) {
  try {
    const data = await analyticsService.getRealtimeData();
    res.json({ success: true, data });
  } catch (error) {
    logger.error('获取实时数据失败', { error: error.message });
    res.status(500).json({ success: false, error: '获取数据失败' });
  }
}

/**
 * 获取端点统计
 */
async function getEndpointStats(req, res) {
  try {
    const stats = await analyticsService.getEndpointStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('获取端点统计失败', { error: error.message });
    res.status(500).json({ success: false, error: '获取数据失败' });
  }
}

/**
 * 获取白名单
 */
async function getWhitelist(req, res) {
  try {
    const redis = redisService.getClient();
    const ips = await redis.smembers('whitelist:ips');
    const users = await redis.smembers('whitelist:users');
    
    const whitelist = [
      ...ips.map(ip => ({ id: `ip:${ip}`, type: 'ip', value: ip })),
      ...users.map(user => ({ id: `user:${user}`, type: 'user', value: user }))
    ];
    
    res.json({ success: true, data: whitelist });
  } catch (error) {
    logger.error('获取白名单失败', { error: error.message });
    res.status(500).json({ success: false, error: '获取数据失败' });
  }
}

/**
 * 添加白名单
 */
async function addWhitelist(req, res) {
  try {
    const { type, value } = req.body;
    
    if (!type || !value) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }
    
    if (!['ip', 'user'].includes(type)) {
      return res.status(400).json({ success: false, error: '无效的类型' });
    }
    
    const redis = redisService.getClient();
    const key = type === 'ip' ? 'whitelist:ips' : 'whitelist:users';
    await redis.sadd(key, value);
    
    logger.info('添加白名单', { type, value });
    res.json({ success: true, message: '添加成功' });
  } catch (error) {
    logger.error('添加白名单失败', { error: error.message });
    res.status(500).json({ success: false, error: '添加失败' });
  }
}

/**
 * 移除白名单
 */
async function removeWhitelist(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, error: '缺少ID参数' });
    }
    
    const [type, ...valueParts] = id.split(':');
    const value = valueParts.join(':');
    
    if (!['ip', 'user'].includes(type)) {
      return res.status(400).json({ success: false, error: '无效的ID格式' });
    }
    
    const redis = redisService.getClient();
    const key = type === 'ip' ? 'whitelist:ips' : 'whitelist:users';
    await redis.srem(key, value);
    
    logger.info('移除白名单', { type, value });
    res.json({ success: true, message: '移除成功' });
  } catch (error) {
    logger.error('移除白名单失败', { error: error.message });
    res.status(500).json({ success: false, error: '移除失败' });
  }
}

/**
 * 清除违规记录
 */
async function clearViolation(req, res) {
  try {
    const { clientId } = req.params;
    await violationService.clearViolations(clientId);
    res.json({ success: true, message: '清除成功' });
  } catch (error) {
    logger.error('清除违规记录失败', { error: error.message });
    res.status(500).json({ success: false, error: '清除失败' });
  }
}

module.exports = {
  getOverview,
  getTopClients,
  getViolations,
  getViolationDetail,
  getRealtimeData,
  getEndpointStats,
  getWhitelist,
  addWhitelist,
  removeWhitelist,
  clearViolation
};
