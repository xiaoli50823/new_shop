'use strict';

const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const { clearCache, getCacheStats } = require('../utils/cache');

const router = express.Router();

router.get('/status', auth, adminOnly, async (req, res) => {
  try {
    const data = await getCacheStats();
    res.json({ code: 200, data, message: 'success' });
  } catch (error) {
    console.error('获取缓存状态失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.delete('/', auth, adminOnly, async (req, res) => {
  try {
    const invalidated = await clearCache();
    if (!invalidated) return res.status(503).json({ code: 503, message: 'Redis 未连接，无法刷新缓存' });
    res.json({ code: 200, data: { invalidated }, message: '缓存已失效，下次访问将读取最新数据' });
  } catch (error) {
    console.error('清空缓存失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
