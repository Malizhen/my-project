/**
 * 路由聚合
 */
const express = require('express');
const router = express.Router();

const apiRoutes = require('./api.routes');
const dashboardRoutes = require('./dashboard.routes');

// 业务API
router.use('/api', apiRoutes);

// 仪表板API
router.use('/api/dashboard', dashboardRoutes);

module.exports = router;
