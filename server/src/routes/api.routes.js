/**
 * 示例业务API路由
 */
const express = require('express');
const router = express.Router();

// 示例搜索接口
router.get('/search', (req, res) => {
  const { q } = req.query;
  res.json({
    success: true,
    data: {
      query: q,
      results: [
        { id: 1, title: '搜索结果1' },
        { id: 2, title: '搜索结果2' }
      ]
    }
  });
});

// 示例导出接口
router.post('/export', (req, res) => {
  res.json({
    success: true,
    data: {
      exportId: Date.now(),
      status: 'processing'
    }
  });
});

// 示例上传接口
router.post('/upload', (req, res) => {
  res.json({
    success: true,
    data: {
      uploadId: Date.now(),
      status: 'success'
    }
  });
});

// 示例数据接口
router.get('/data', (req, res) => {
  res.json({
    success: true,
    data: {
      items: [1, 2, 3, 4, 5]
    }
  });
});

module.exports = router;
