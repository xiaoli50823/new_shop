/**
 * 系统设置路由
 */
const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');

// 内存存储设置（生产环境应存数据库）
let settings = {
  basic: { siteName: '盲盒星球', description: '潮玩盲盒抽盒平台', contact: '400-888-8888', serviceUrl: '' },
  payment: { wechat: true, alipay: true, applePay: false, rechargeAmounts: [50, 100, 200, 500, 1000] },
  sms: { provider: 'aliyun', apiKey: '', apiSecret: '', template: '' }
};

let operationLogs = [];

// 获取所有设置
router.get('/', auth, adminOnly, (req, res) => {
  res.json({ code: 200, data: settings, message: 'success' });
});

// 更新基本设置
router.put('/basic', auth, adminOnly, (req, res) => {
  settings.basic = { ...settings.basic, ...req.body };
  addLog(req.user, '更新基本设置');
  res.json({ code: 200, data: settings.basic, message: '更新成功' });
});

// 更新支付设置
router.put('/payment', auth, adminOnly, (req, res) => {
  settings.payment = { ...settings.payment, ...req.body };
  addLog(req.user, '更新支付设置');
  res.json({ code: 200, data: settings.payment, message: '更新成功' });
});

// 更新短信设置
router.put('/sms', auth, adminOnly, (req, res) => {
  settings.sms = { ...settings.sms, ...req.body };
  addLog(req.user, '更新短信设置');
  res.json({ code: 200, data: settings.sms, message: '更新成功' });
});

// 测试短信
router.post('/sms/test', auth, adminOnly, (req, res) => {
  addLog(req.user, '测试短信发送');
  res.json({ code: 200, message: '测试短信已发送（模拟）' });
});

// 获取操作日志
router.get('/logs', auth, adminOnly, (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const end = start + parseInt(pageSize);
  res.json({
    code: 200,
    data: { list: operationLogs.slice(start, end), total: operationLogs.length },
    message: 'success'
  });
});

function addLog(user, action) {
  operationLogs.unshift({
    id: operationLogs.length + 1,
    operator: user?.username || 'admin',
    action,
    detail: '',
    ip: '127.0.0.1',
    time: new Date().toISOString()
  });
  if (operationLogs.length > 500) operationLogs = operationLogs.slice(0, 500);
}

module.exports = router;
