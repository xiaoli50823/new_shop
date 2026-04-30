/**
 * 订单路由
 */
const express = require('express');
const { Op } = require('sequelize');
const { Order, OrderItem, User, BlindBox, Prize, sequelize } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { createOrderRules, paginationRules, idParamRules } = require('../middleware/validate');

const router = express.Router();

/**
 * 生成唯一订单号
 */
function generateOrderNo() {
  const now = new Date();
  const datePart = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD${datePart}${rand}`;
}

/**
 * 获取订单列表（管理员，支持筛选）
 */
router.get('/', auth, adminOnly, paginationRules, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const { status, type, keyword } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (keyword) {
      where[Op.or] = [
        { order_no: { [Op.like]: `%${keyword}%` } },
        { shipping_contact: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { rows, count } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: OrderItem, as: 'items' }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['id', 'DESC']]
    });

    res.json({
      code: 200,
      data: { list: rows, total: count, page, pageSize },
      message: 'success'
    });
  } catch (err) {
    console.error('获取订单列表失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取订单详情
 */
router.get('/:id', auth, idParamRules, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: OrderItem, as: 'items' }
      ]
    });
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }
    res.json({ code: 200, data: order, message: 'success' });
  } catch (err) {
    console.error('获取订单详情失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 创建订单
 */
router.post('/', auth, createOrderRules, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { type, total, items, shipping_address, shipping_contact, shipping_phone, payment_method } = req.body;

    const orderNo = generateOrderNo();

    const order = await Order.create({
      order_no: orderNo,
      user_id: req.user.id,
      type,
      status: 'pending',
      total,
      shipping_address,
      shipping_contact,
      shipping_phone,
      payment_method
    }, { transaction: t });

    // 创建订单项
    if (items && Array.isArray(items) && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        blind_box_id: item.blind_box_id || null,
        prize_id: item.prize_id || null,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity || 1,
        rarity: item.rarity || null
      }));
      await OrderItem.bulkCreate(orderItems, { transaction: t });
    }

    await t.commit();

    // 返回完整订单
    const result = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    res.status(201).json({ code: 201, data: result, message: '订单创建成功' });
  } catch (err) {
    await t.rollback();
    console.error('创建订单失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 更新订单状态
 */
router.put('/:id/status', auth, idParamRules, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    const { status } = req.body;
    const validTransitions = {
      pending: ['paid', 'cancelled'],
      paid: ['shipping', 'cancelled'],
      shipping: ['completed'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({ code: 400, message: `不能从 ${order.status} 变更为 ${status}` });
    }

    await order.update({ status });
    res.json({ code: 200, data: order, message: '状态更新成功' });
  } catch (err) {
    console.error('更新订单状态失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 发货（填入物流信息）
 */
router.put('/:id/ship', auth, idParamRules, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }
    if (order.status !== 'paid') {
      return res.status(400).json({ code: 400, message: '只有已支付的订单才能发货' });
    }

    const { tracking_number, express_company } = req.body;
    await order.update({
      tracking_number,
      express_company,
      status: 'shipping'
    });

    res.json({ code: 200, data: order, message: '发货成功' });
  } catch (err) {
    console.error('发货失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 取消订单
 */
router.delete('/:id', auth, idParamRules, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    // 只有本人或管理员可以取消
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权操作' });
    }

    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ code: 400, message: '当前状态不可取消' });
    }

    await order.update({ status: 'cancelled' });
    res.json({ code: 200, data: order, message: '订单已取消' });
  } catch (err) {
    console.error('取消订单失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
