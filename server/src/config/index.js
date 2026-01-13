const redisConfig = require('./redis.config');
const rateLimitConfig = require('./rateLimit.config');

module.exports = {
  redis: redisConfig,
  rateLimit: rateLimitConfig,
  server: {
    port: parseInt(process.env.PORT, 10) || 3001,
    env: process.env.NODE_ENV || 'development'
  }
};
