/**
 * 热门周边路由
 */
const express = require('express');
const { Op } = require('sequelize');
const { HotProduct, Cart, User, Order, OrderItem, sequelize } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { paginationRules } = require('../middleware/validate');
const { notifyCoinChange } = require('../utils/websocket');

const router = express.Router();

/**
 * 获取热门周边列表
 */
router.get('/', paginationRules, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const { category, status, search } = req.query;

    const where = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (status) {
      where.status = status;
    } else {
      where.status = 'active';
    }
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { rows, count } = await HotProduct.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['sort_order', 'DESC'], ['sales', 'DESC'], ['id', 'DESC']]
    });

    res.json({
      code: 200,
      data: { list: rows, total: count, page, pageSize },
      message: 'success'
    });
  } catch (err) {
    console.error('获取热门周边列表失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取热门周边详情
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await HotProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    res.json({ code: 200, data: product, message: 'success' });
  } catch (err) {
    console.error('获取热门周边详情失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 创建热门周边（管理员）
 */
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const product = await HotProduct.create(req.body);
    res.status(201).json({ code: 200, data: product, message: '创建成功' });
  } catch (err) {
    console.error('创建热门周边失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 更新热门周边（管理员）
 */
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const product = await HotProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    await product.update(req.body);
    res.json({ code: 200, data: product, message: '更新成功' });
  } catch (err) {
    console.error('更新热门周边失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 删除热门周边（管理员）
 */
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const product = await HotProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    await product.destroy();
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('删除热门周边失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 购买热门周边（使用盲盒币）
 */
router.post('/:id/buy', auth, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { quantity = 1 } = req.body;
    const userId = req.user.id;
    const productId = req.params.id;

    const product = await HotProduct.findByPk(productId, { transaction: t, lock: true });
    if (!product || product.status !== 'active') {
      await t.rollback();
      return res.status(404).json({ code: 404, message: '商品不存在或已下架' });
    }

    if (product.stock < quantity) {
      await t.rollback();
      return res.status(400).json({ code: 400, message: '库存不足' });
    }

    const user = await User.findByPk(userId, { transaction: t, lock: true });
    const totalCost = parseFloat(product.price) * quantity;

    if (parseFloat(user.blind_box_coin) < totalCost) {
      await t.rollback();
      return res.status(400).json({ code: 400, message: '盲盒币余额不足' });
    }

    await user.update({
      blind_box_coin: parseFloat(user.blind_box_coin) - totalCost
    }, { transaction: t });

    await product.decrement('stock', { by: quantity, transaction: t });
    await product.increment('sales', { by: quantity, transaction: t });

    const order = await Order.create({
      user_id: userId,
      total_amount: totalCost,
      status: 'completed',
      payment_method: 'blind_box_coin'
    }, { transaction: t });

    await OrderItem.create({
      order_id: order.id,
      hot_product_id: product.id,
      quantity,
      price: product.price
    }, { transaction: t });

    await t.commit();

    notifyCoinChange(userId, user.blind_box_coin, '购买热门周边');

    res.json({
      code: 200,
      data: { orderId: order.id },
      message: '购买成功'
    });
  } catch (err) {
    await t.rollback();
    console.error('购买热门周边失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
