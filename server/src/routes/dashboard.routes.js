/**
 * 仪表板路由
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// 概览
router.get('/overview', dashboardController.getOverview);

// 热门客户端
router.get('/top-clients', dashboardController.getTopClients);

// 违规记录
router.get('/violations', dashboardController.getViolations);
router.get('/violations/:clientId', dashboardController.getViolationDetail);
router.delete('/violations/:clientId', dashboardController.clearViolation);

// 实时数据
router.get('/realtime', dashboardController.getRealtimeData);

// 端点统计
router.get('/endpoints', dashboardController.getEndpointStats);

// 白名单管理
router.get('/whitelist', dashboardController.getWhitelist);
router.post('/whitelist', dashboardController.addWhitelist);
router.delete('/whitelist/:id', dashboardController.removeWhitelist);

module.exports = router;
