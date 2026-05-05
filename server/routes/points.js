/**
 * 积分商品路由
 */
const express = require('express');
const { Op } = require('sequelize');
const { PointsProduct, PointsExchange, User, sequelize } = require('../models');
const { auth } = require('../middleware/auth');
const { notifyPointsChange, notifyExchange } = require('../utils/websocket');

const router = express.Router();

/**
 * 获取积分商品列表
 */
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, pageSize = 20 } = req.query;

    const where = { status: 'active' };
    if (category) where.category = category;

    const now = new Date();
    where[Op.and] = [
      {
        [Op.or]: [
          { start_time: null },
          { start_time: { [Op.lte]: now } }
        ]
      },
      {
        [Op.or]: [
          { end_time: null },
          { end_time: { [Op.gte]: now } }
        ]
      }
    ];

    const { rows, count } = await PointsProduct.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['id', 'DESC']]
    });

    res.json({
      code: 200,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: 'success'
    });
  } catch (err) {
    console.error('获取积分商品列表失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取积分商品详情
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await PointsProduct.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    res.json({
      code: 200,
      data: product,
      message: 'success'
    });
  } catch (err) {
    console.error('获取积分商品详情失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 兑换积分商品
 */
router.post('/exchange', auth, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { productId, quantity = 1, recipientName, recipientPhone, recipientAddress } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ code: 400, message: '请选择商品' });
    }

    const product = await PointsProduct.findByPk(productId);

    if (!product || product.status !== 'active') {
      return res.status(404).json({ code: 404, message: '商品不存在或已下架' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ code: 400, message: '库存不足' });
    }

    const user = await User.findByPk(userId);

    const totalPoints = product.points_required * quantity;
    if (user.points < totalPoints) {
      return res.status(400).json({ code: 400, message: '积分不足' });
    }

    const exchangeCount = await PointsExchange.count({
      where: { user_id: userId, product_id: productId, status: { [Op.ne]: 'cancelled' } }
    });

    if (exchangeCount + quantity > product.exchange_limit) {
      return res.status(400).json({ code: 400, message: `该商品每人限兑${product.exchange_limit}次` });
    }

    await user.decrement('points', { by: totalPoints, transaction: t });

    await product.decrement('stock', { by: quantity, transaction: t });

    const exchange = await PointsExchange.create({
      user_id: userId,
      product_id: productId,
      points_used: totalPoints,
      quantity,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      recipient_address: recipientAddress,
      status: 'pending'
    }, { transaction: t });

    await t.commit();

    const updatedUser = await User.findByPk(userId);
    notifyPointsChange(userId, updatedUser.points, '积分兑换');
    notifyExchange(userId, {
      exchangeId: exchange.id,
      productName: product.name,
      pointsUsed: totalPoints,
      quantity
    });

    res.json({
      code: 200,
      data: { exchangeId: exchange.id },
      message: '兑换成功'
    });
  } catch (err) {
    await t.rollback();
    console.error('兑换积分商品失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取用户兑换记录
 */
router.get('/my/exchanges', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status } = req.query;

    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const { rows, count } = await PointsExchange.findAndCountAll({
      where,
      include: [{
        model: PointsProduct,
        as: 'product',
        attributes: ['id', 'name', 'image', 'points_required', 'category']
      }],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      code: 200,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: 'success'
    });
  } catch (err) {
    console.error('获取兑换记录失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
