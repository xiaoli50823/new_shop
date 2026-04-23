const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 获取订单列表
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('userId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取用户订单
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取订单详情
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId');
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建订单
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 更新订单状态
router.put('/:id/status', async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(trackingNumber && { 'shippingInfo.trackingNumber': trackingNumber })
      },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除订单
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    res.json({ message: '订单删除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 导出订单
router.get('/export/excel', async (req, res) => {
  try {
    // 实际项目中这里应该实现导出Excel功能
    res.json({ message: '订单导出成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;