/**
 * 营收报表路由
 */
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Order, DrawRecord, User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// 获取营收概览
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { range = 'today', startDate, endDate } = req.query;
    let start, end = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      switch (range) {
        case 'today':
          start = new Date(); start.setHours(0, 0, 0, 0); break;
        case 'week':
          start = new Date(); start.setDate(start.getDate() - 7); start.setHours(0, 0, 0, 0); break;
        case 'month':
          start = new Date(); start.setMonth(start.getMonth() - 1); start.setHours(0, 0, 0, 0); break;
        default:
          start = new Date(); start.setHours(0, 0, 0, 0);
      }
    }

    // 总营收
    const revenueResult = await Order.sum('total', {
      where: { status: { [Op.in]: ['paid', 'shipping', 'completed'] }, created_at: { [Op.between]: [start, end] } }
    }) || 0;

    // 订单数
    const orderCount = await Order.count({
      where: { created_at: { [Op.between]: [start, end] } }
    });

    // 抽盒次数
    const drawCount = await DrawRecord.count({
      where: { created_at: { [Op.between]: [start, end] } }
    });

    // 新增用户
    const newUserCount = await User.count({
      where: { created_at: { [Op.between]: [start, end] } }
    });

    // 每日明细（最近7天）
    const dailyDetails = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayRevenue = await Order.sum('total', {
        where: { status: { [Op.in]: ['paid', 'shipping', 'completed'] }, created_at: { [Op.between]: [d, nextD] } }
      }) || 0;

      const dayOrders = await Order.count({
        where: { created_at: { [Op.between]: [d, nextD] } }
      });

      const dayDraws = await DrawRecord.count({
        where: { created_at: { [Op.between]: [d, nextD] } }
      });

      dailyDetails.push({
        date: d.toISOString().split('T')[0],
        revenue: dayRevenue,
        orders: dayOrders,
        draws: dayDraws
      });
    }

    res.json({
      code: 200,
      data: {
        totalRevenue: revenueResult,
        orderCount,
        drawCount,
        newUserCount,
        grossProfit: revenueResult * 0.4,
        grossMargin: 40,
        dailyDetails
      },
      message: 'success'
    });
  } catch (err) {
    console.error('获取营收数据失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
