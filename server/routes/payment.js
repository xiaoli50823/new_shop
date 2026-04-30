const express = require('express');
const router = express.Router();

// 内存存储模拟支付订单
let payments = [];
let nextId = 1;

// 创建支付订单
router.post('/create-order', (req, res) => {
  try {
    const { productId, amount, paymentMethod } = req.body;
    
    const payment = {
      _id: String(nextId++),
      productId,
      amount,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    payments.push(payment);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 处理支付
router.post('/pay/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentInfo } = req.body;
    
    const payment = payments.find(p => p._id === orderId);
    if (!payment) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: '订单状态不正确' });
    }
    
    // 模拟支付处理
    payment.status = 'completed';
    payment.paymentInfo = paymentInfo;
    payment.updatedAt = new Date().toISOString();
    
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 查询支付状态
router.get('/status/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = payments.find(p => p._id === orderId);
    if (!payment) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    res.json({ status: payment.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 申请退款
router.post('/refund/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const payment = payments.find(p => p._id === orderId);
    if (!payment) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: '订单状态不正确' });
    }
    
    // 模拟退款处理
    payment.status = 'refunded';
    payment.refundReason = reason;
    payment.updatedAt = new Date().toISOString();
    
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 获取支付订单列表
router.get('/', (req, res) => {
  try {
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取单个支付订单
router.get('/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = payments.find(p => p._id === orderId);
    if (!payment) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;