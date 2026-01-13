/**
 * 错误处理中间件
 */
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('服务器错误', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // 不要泄露内部错误详情给客户端
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? '服务器内部错误' : err.message;

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message
    }
  });
}

module.exports = errorHandler;
