/**
 * 用户路由
 */
const express = require('express');
const { Op } = require('sequelize');
const { User, UserCabinet, Order, Coupon, DrawRecord, BlindBox, Prize, OrderItem, Address } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { idParamRules, paginationRules } = require('../middleware/validate');
const { notifyUserUpdate, notifyPointsChange, notifyCoinChange, notifyCheckIn } = require('../utils/websocket');

const router = express.Router();

/**
 * 获取当前用户信息（profile）
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({
      code: 200,
      data: {
        user_info: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          vip_level: user.vip_level,
          points: user.points,
          blind_box_coin: user.blind_box_coin,
          check_in_days: user.check_in_days,
          last_check_in: user.last_check_in,
          role: user.role,
          status: user.status
        }
      },
      message: 'success'
    });
  } catch (err) {
    console.error('获取用户信息失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取用户列表（管理员）
 */
router.get('/', auth, adminOnly, paginationRules, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const { keyword, vipLevel, status, role, startDate, endDate } = req.query;

    const where = {};

    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (vipLevel) where.vip_level = parseInt(vipLevel);
    if (status) where.status = status;
    if (role) where.role = role;

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['id', 'DESC']]
    });
    res.json({
      code: 200,
      data: { list: rows.map(u => u.toJSON()), total: count, page, pageSize },
      message: 'success'
    });
  } catch (err) {
    console.error('获取用户列表失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取用户详情
 */
router.get('/:id', idParamRules, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({ code: 200, data: user.toJSON(), message: 'success' });
  } catch (err) {
    console.error('获取用户详情失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 更新用户信息
 */
router.put('/:id', auth, idParamRules, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权修改其他用户信息' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const oldPoints = user.points;
    const oldCoin = user.blind_box_coin;

    const allowed = ['username', 'phone', 'avatar'];
    if (req.user.role === 'admin') {
      allowed.push('vip_level', 'points', 'blind_box_coin', 'role', 'status');
    }

    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    await user.update(updates);

    const userData = user.toJSON();

    if (updates.points !== undefined && updates.points !== oldPoints) {
      notifyPointsChange(user.id, user.points, '管理员修改');
    }

    if (updates.blind_box_coin !== undefined && updates.blind_box_coin !== oldCoin) {
      notifyCoinChange(user.id, user.blind_box_coin, '管理员修改');
    }

    notifyUserUpdate(user.id, userData);

    res.json({ code: 200, data: userData, message: '更新成功' });
  } catch (err) {
    console.error('更新用户信息失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 每日签到
 */
router.post('/:id/check-in', auth, idParamRules, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ code: 403, message: '只能给自己签到' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (user.last_check_in && user.last_check_in === today) {
      return res.status(400).json({ code: 400, message: '今日已签到' });
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const isConsecutive = user.last_check_in === yesterday;
    const newCheckInDays = isConsecutive ? user.check_in_days + 1 : 1;

    let bonusPoints = 10;
    if (newCheckInDays >= 7) bonusPoints += 20;
    else if (newCheckInDays >= 3) bonusPoints += 10;

    await user.update({
      check_in_days: newCheckInDays,
      points: user.points + bonusPoints,
      last_check_in: today
    });

    const checkInData = {
      check_in_days: newCheckInDays,
      points_earned: bonusPoints,
      total_points: user.points
    };

    notifyCheckIn(user.id, checkInData);
    notifyPointsChange(user.id, user.points, '签到奖励');

    res.json({
      code: 200,
      data: checkInData,
      message: '签到成功'
    });
  } catch (err) {
    console.error('签到失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 回收商品（从盒柜回收，增加盲盒币）
 */
router.post('/:id/recycle', auth, idParamRules, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ code: 403, message: '无权操作' });
    }

    const { cabinetId } = req.body;
    if (!cabinetId) {
      return res.status(400).json({ code: 400, message: '缺少盒柜商品ID' });
    }

    const cabinetItem = await UserCabinet.findOne({
      where: { id: cabinetId, user_id: req.params.id, status: 'pending' }
    });
    if (!cabinetItem) {
      return res.status(404).json({ code: 404, message: '盒柜商品不存在或不可回收' });
    }

    const blindBox = await BlindBox.findByPk(cabinetItem.blind_box_id);
    const recycleValue = blindBox ? (parseFloat(blindBox.price) * 0.6).toFixed(2) : 0;

    await cabinetItem.update({ status: 'recycled', recycle_value: recycleValue });

    const user = await User.findByPk(req.params.id);
    await user.update({
      blind_box_coin: parseFloat(user.blind_box_coin) + parseFloat(recycleValue)
    });

    notifyCoinChange(user.id, user.blind_box_coin, '回收商品');

    res.json({
      code: 200,
      data: { recycle_value: recycleValue, total_coin: user.blind_box_coin },
      message: '回收成功'
    });
  } catch (err) {
    console.error('回收失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 封禁用户（管理员）
 */
router.put('/:id/ban', auth, adminOnly, idParamRules, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    await user.update({ status: 'banned' });
    res.json({ code: 200, data: user.toJSON(), message: '封禁成功' });
  } catch (err) {
    console.error('封禁用户失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 解封用户（管理员）
 */
router.put('/:id/unban', auth, adminOnly, idParamRules, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    await user.update({ status: 'active' });
    res.json({ code: 200, data: user.toJSON(), message: '解封成功' });
  } catch (err) {
    console.error('解封用户失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取用户盒柜
 */
router.get('/:id/cabinet', auth, idParamRules, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权查看' });
    }

    const { status } = req.query;
    const where = { user_id: req.params.id };
    if (status) {
      where.status = status;
    }

    const items = await UserCabinet.findAll({
      where,
      include: [
        { model: BlindBox, as: 'blindBox', attributes: ['id', 'name'] },
        { model: Prize, as: 'prize', attributes: ['id', 'name', 'rarity'] }
      ],
      order: [['id', 'DESC']]
    });

    res.json({ code: 200, data: items, message: 'success' });
  } catch (err) {
    console.error('获取盒柜失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 盒柜商品发货
 */
router.post('/:id/cabinet/ship', auth, idParamRules, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ code: 403, message: '无权操作' });
    }

    const { itemIds, addressId } = req.body;
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ code: 400, message: '请选择要发货的商品' });
    }
    if (!addressId) {
      return res.status(400).json({ code: 400, message: '请选择收货地址' });
    }

    const addr = await Address.findOne({ where: { id: addressId, user_id: req.user.id } });
    if (!addr) {
      return res.status(404).json({ code: 404, message: '收货地址不存在' });
    }

    const address = `${addr.province}${addr.city}${addr.district}${addr.detail}`;

    // 查找所有待发货的盒柜商品
    const items = await UserCabinet.findAll({
      where: { id: itemIds, user_id: req.params.id, status: 'pending' }
    });

    if (items.length === 0) {
      return res.status(404).json({ code: 404, message: '没有可发货的商品' });
    }

    // 生成订单号
    const orderNo = 'SHIP' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();

    // 创建发货订单
    const total = items.reduce((sum, item) => {
      return sum + (item.recycle_value ? parseFloat(item.recycle_value) : 0);
    }, 0);

    const order = await Order.create({
      order_no: orderNo,
      user_id: req.params.id,
      type: 'shipment',
      status: 'pending',
      total,
      shipping_address: address,
      shipping_contact: addr.name || '',
      shipping_phone: addr.phone || ''
    });

    // 更新盒柜商品状态
    const now = new Date();
    await Promise.all(items.map(item =>
      item.update({ status: 'shipped', ship_time: now })
    ));

    res.json({
      code: 200,
      data: { order, shipped_count: items.length },
      message: '发货订单创建成功'
    });
  } catch (err) {
    console.error('发货失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取用户订单
 */
router.get('/:id/orders', auth, idParamRules, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权查看' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const { rows, count } = await Order.findAndCountAll({
      where: { user_id: req.params.id },
      include: [{ model: OrderItem, as: 'items' }],
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
    console.error('获取订单失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取用户优惠券
 */
router.get('/:id/coupons', auth, idParamRules, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权查看' });
    }

    const coupons = await Coupon.findAll({
      where: { user_id: req.params.id },
      order: [['id', 'DESC']]
    });

    res.json({ code: 200, data: coupons, message: 'success' });
  } catch (err) {
    console.error('获取优惠券失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取用户抽盒记录
 */
router.get('/:id/draw-records', auth, idParamRules, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权查看' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const { rows, count } = await DrawRecord.findAndCountAll({
      where: { user_id: req.params.id },
      include: [
        { model: BlindBox, as: 'blindBox', attributes: ['id', 'name', 'image'] }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      data: { list: rows, total: count, page, pageSize },
      message: 'success'
    });
  } catch (err) {
    console.error('获取抽盒记录失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;

// 批量操作（管理员）
router.put('/batch', auth, adminOnly, async (req, res) => {
  try {
    const { ids, status, blind_box_coin, reason } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: '请选择用户' });
    }

    if (status) {
      await User.update({ status }, { where: { id: { [require('sequelize').Op.in]: ids } } });
      res.json({ code: 200, message: `批量更新${ids.length}个用户状态成功` });
    } else if (blind_box_coin) {
      for (const id of ids) {
        const user = await User.findByPk(id);
        if (user) {
          user.blind_box_coin = parseFloat(user.blind_box_coin) + parseFloat(blind_box_coin);
          await user.save();
        }
      }
      res.json({ code: 200, message: `已为${ids.length}个用户赠送${blind_box_coin}盲盒币` });
    } else {
      res.json({ code: 200, message: '批量操作完成（模拟）' });
    }
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 批量赠送盲盒币
router.put('/batch-coin', auth, adminOnly, async (req, res) => {
  try {
    const { ids, amount, reason } = req.body;
    if (!ids || !Array.isArray(ids) || !amount) {
      return res.status(400).json({ code: 400, message: '参数不完整' });
    }
    const Op = require('sequelize').Op;
    for (const id of ids) {
      const user = await User.findByPk(id);
      if (user) {
        user.blind_box_coin = parseFloat(user.blind_box_coin) + parseFloat(amount);
        await user.save();
      }
    }
    res.json({ code: 200, message: `已为${ids.length}个用户赠送${amount}盲盒币` });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
})

// 批量发短信（模拟）
router.put('/batch-sms', auth, adminOnly, async (req, res) => {
  try {
    const { ids, content } = req.body;
    res.json({ code: 200, message: `已为${ids?.length || 0}个用户发送短信（模拟）` });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
})
