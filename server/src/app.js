/**
 * Express应用入口
 */
const express = require('express');
const cors = require('cors');

const clientIdMiddleware = require('./middlewares/clientId.middleware');
const rateLimitMiddleware = require('./middlewares/rateLimit.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// 基础中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 信任代理(用于获取真实IP)
app.set('trust proxy', true);

// 健康检查端点(不受限流)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 客户端识别中间件
app.use(clientIdMiddleware);

// 限流中间件(仪表板API不限流)
app.use((req, res, next) => {
  // 仪表板API跳过限流
  if (req.path.startsWith('/api/dashboard')) {
    return next();
  }
  return rateLimitMiddleware(req, res, next);
});

// 路由
app.use(routes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: '接口不存在'
    }
  });
});

// 错误处理
app.use(errorHandler);

module.exports = app;
