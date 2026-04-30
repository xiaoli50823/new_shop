/**
 * 管理端数据大盘路由
 */
const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { Order, DrawRecord, User, BlindBox, Prize, UserCabinet, sequelize } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * 获取今日日期字符串 YYYY-MM-DD
 */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * GET /api/dashboard/overview
 * 核心指标：今日GMV、抽盒次数、新增用户、活跃用户
 */
router.get('/overview', auth, adminOnly, async (req, res) => {
  try {
    const today = todayStr();

    // 今日 GMV（已完成或已支付的订单总金额）
    const gmvResult = await Order.findOne({
      attributes: [[fn('SUM', col('total')), 'gmv']],
      where: {
        status: { [Op.in]: ['paid', 'shipping', 'completed'] },
        created_at: { [Op.gte]: today }
      },
      raw: true
    });

    // 今日抽盒次数
    const drawCount = await DrawRecord.count({
      where: {
        created_at: { [Op.gte]: today }
      }
    });

    // 今日新增用户
    const newUsers = await User.count({
      where: {
        created_at: { [Op.gte]: today }
      }
    });

    // 总用户数
    const totalUsers = await User.count();

    // 总订单数
    const totalOrders = await Order.count();

    res.json({
      code: 200,
      data: {
        today_gmv: parseFloat(gmvResult?.gmv || 0),
        today_draws: drawCount,
        today_new_users: newUsers,
        total_users: totalUsers,
        total_orders: totalOrders
      },
      message: 'success'
    });
  } catch (err) {
    console.error('获取大盘数据失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * GET /api/dashboard/sales-trend
 * 销售趋势（最近7天/30天）
 */
router.get('/sales-trend', auth, adminOnly, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

    // 按天分组统计订单金额
    const orders = await Order.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('SUM', col('total')), 'amount'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        status: { [Op.in]: ['paid', 'shipping', 'completed'] },
        created_at: { [Op.gte]: startDate }
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    // 按天分组统计抽盒次数
    const draws = await DrawRecord.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: { created_at: { [Op.gte]: startDate } },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    res.json({
      code: 200,
      data: { orders, draws },
      message: 'success'
    });
  } catch (err) {
    console.error('获取销售趋势失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * GET /api/dashboard/funnel
 * 转化漏斗数据
 */
router.get('/funnel', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const usersWithDraw = await DrawRecord.count({
      distinct: true,
      col: 'user_id'
    });
    const usersWithOrder = await Order.count({
      distinct: true,
      col: 'user_id',
      where: { status: { [Op.ne]: 'cancelled' } }
    });
    const usersWithShip = await UserCabinet.count({
      distinct: true,
      col: 'user_id',
      where: { status: 'shipped' }
    });

    res.json({
      code: 200,
      data: {
        visit: totalUsers,
        draw: usersWithDraw,
        order: usersWithOrder,
        ship: usersWithShip
      },
      message: 'success'
    });
  } catch (err) {
    console.error('获取漏斗数据失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * GET /api/dashboard/prize-monitor
 * 奖池监控数据
 */
router.get('/prize-monitor', auth, adminOnly, async (req, res) => {
  try {
    const blindBoxes = await BlindBox.findAll({
      where: { status: 'active' },
      include: [{
        model: Prize,
        as: 'prizes',
        attributes: ['id', 'name', 'rarity', 'probability', 'stock']
      }],
      attributes: ['id', 'name', 'total_draws', 'stock']
    });

    const data = blindBoxes.map(box => {
      const prizes = box.prizes || [];
      const totalStock = prizes.reduce((s, p) => s + p.stock, 0);
      const hiddenPrizes = prizes.filter(p => p.rarity === 'hidden');
      const hiddenStock = hiddenPrizes.reduce((s, p) => s + p.stock, 0);

      return {
        id: box.id,
        name: box.name,
        total_draws: box.total_draws,
        total_stock: totalStock,
        hidden_stock: hiddenStock,
        prizes: prizes
      };
    });

    res.json({ code: 200, data, message: 'success' });
  } catch (err) {
    console.error('获取奖池监控失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;

/**
 * GET /api/dashboard/recent-orders
 * 最近订单
 */
router.get('/recent-orders', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
      order: [['id', 'DESC']],
      limit: 5
    });
    res.json({ code: 200, data: orders, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

/**
 * GET /api/dashboard/hot-users
 * 活跃用户
 */
router.get('/hot-users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'vip_level', 'points', 'blind_box_coin'],
      order: [['points', 'DESC']],
      limit: 5
    });
    res.json({ code: 200, data: users, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});
