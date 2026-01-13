/**
 * Redis服务 - 封装Redis连接和基础操作
 */
const Redis = require('ioredis');
const config = require('../config').redis;
const logger = require('../utils/logger');

let client = null;

/**
 * 获取Redis客户端实例(单例)
 * @returns {Redis} Redis客户端
 */
function getClient() {
  if (client) {
    return client;
  }

  client = new Redis({
    host: config.host,
    port: config.port,
    password: config.password || undefined,
    db: config.db,
    retryStrategy(times) {
      if (times > config.maxRetries) {
        logger.error('Redis连接失败，已超过最大重试次数');
        return null;
      }
      const delay = Math.min(times * config.retryDelayMs, 5000);
      logger.warn(`Redis连接重试中...`, { attempt: times, delay });
      return delay;
    }
  });

  client.on('connect', () => {
    logger.info('Redis连接成功', { host: config.host, port: config.port });
  });

  client.on('error', (err) => {
    logger.error('Redis错误', { error: err.message });
  });

  return client;
}

/**
 * 关闭Redis连接
 */
async function closeConnection() {
  if (client) {
    await client.quit();
    client = null;
    logger.info('Redis连接已关闭');
  }
}

/**
 * 健康检查
 * @returns {Promise<boolean>}
 */
async function healthCheck() {
  try {
    const redis = getClient();
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis健康检查失败', { error: error.message });
    return false;
  }
}

module.exports = {
  getClient,
  closeConnection,
  healthCheck
};
