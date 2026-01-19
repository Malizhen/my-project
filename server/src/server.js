/**
 * 服务器启动文件
 */
require('dotenv').config();

const app = require('./app');
const config = require('./config');
const redisService = require('./services/redis.service');
const logger = require('./utils/logger');

const PORT = config.server.port;

async function startServer() {
  try {
    // 检查Redis连接
    const redisHealthy = await redisService.healthCheck();
    if (!redisHealthy) {
      logger.warn('Redis连接失败，限流功能可能受影响');
    }

    // 启动HTTP服务器
    app.listen(PORT, () => {
      logger.info(`服务器启动成功`, {
        port: PORT,
        env: config.server.env,
        redis: redisHealthy ? 'connected' : 'disconnected'
      });
      
      console.log(`
=====================================
  限流服务已启动
  
  端口: ${PORT}
  环境: ${config.server.env}
  Redis: ${redisHealthy ? '已连接' : '未连接'}
  
  API地址: http://localhost:${PORT}/api
  仪表板API: http://localhost:${PORT}/api/dashboard
  健康检查: http://localhost:${PORT}/health
=====================================
      `);
    });
  } catch (error) {
    logger.error('服务器启动失败', { error: error.message });
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  logger.info('收到SIGTERM信号，正在关闭服务器...');
  await redisService.closeConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('收到SIGINT信号，正在关闭服务器...');
  await redisService.closeConnection();
  process.exit(0);
});

startServer();
