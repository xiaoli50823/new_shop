/**
 * 盲盒路由
 */
const express = require('express');
const { Op } = require('sequelize');
const { BlindBox, Prize, User, UserCabinet, DrawRecord, Order, sequelize } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { createBlindBoxRules, drawRules, paginationRules, idParamRules } = require('../middleware/validate');
const { drawAntiBrush } = require('../middleware/antiBrush');
const { batchDraw } = require('../utils/drawAlgorithm');

const router = express.Router();

/**
 * 获取热门盲盒
 * GET /api/blind-boxes/hot
 */
router.get('/hot', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const hotBoxes = await BlindBox.findAll({
      where: { status: 'active' },
      include: [{
        model: Prize,
        as: 'prizes',
        attributes: ['id', 'name', 'rarity']
      }],
      order: [['total_draws', 'DESC']],
      limit
    });

    const result = hotBoxes.map(box => ({
      id: box.id,
      name: box.name,
      price: parseFloat(box.price),
      originalPrice: box.original_price ? parseFloat(box.original_price) : null,
      image: box.image,
      coverImage: box.cover_image || box.image || null,
      tag: box.tag || null,
      tagText: box.tag_text || null,
      sales: box.total_draws,
      category: box.category,
      description: box.description
    }));

    res.json({
      code: 200,
      data: result,
      message: 'success'
    });
  } catch (err) {
    console.error('获取热门盲盒失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取无限盲盒
 * GET /api/blind-boxes/infinite
 */
router.get('/infinite', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { category } = req.query;
    
    const where = { status: 'active', type: 'infinite' };
    if (category && category !== 'all') {
      where.category = category;
    }

    const boxes = await BlindBox.findAll({
      where,
      include: [{
        model: Prize,
        as: 'prizes',
        attributes: ['id', 'name', 'rarity']
      }],
      order: [['total_draws', 'DESC']],
      limit
    });

    const result = boxes.map(box => ({
      id: box.id,
      name: box.name,
      price: parseFloat(box.price),
      originalPrice: box.original_price ? parseFloat(box.original_price) : null,
      image: box.image,
      coverImage: box.cover_image || box.image || null,
      tag: box.tag || null,
      tagText: box.tag_text || null,
      sales: box.total_draws,
      category: box.category,
      description: box.description,
      stock: box.stock
    }));

    res.json({
      code: 200,
      data: result,
      message: 'success'
    });
  } catch (err) {
    console.error('获取无限盲盒失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取新品盲盒
 * GET /api/blind-boxes/new
 */
router.get('/new', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { category } = req.query;
    
    const where = { status: 'active', tag: 'new' };
    if (category && category !== 'all') {
      where.category = category;
    }

    const boxes = await BlindBox.findAll({
      where,
      include: [{
        model: Prize,
        as: 'prizes',
        attributes: ['id', 'name', 'rarity']
      }],
      order: [['created_at', 'DESC']],
      limit
    });

    const result = boxes.map(box => ({
      id: box.id,
      name: box.name,
      price: parseFloat(box.price),
      originalPrice: box.original_price ? parseFloat(box.original_price) : null,
      image: box.image,
      coverImage: box.cover_image || box.image || null,
      tag: box.tag || null,
      tagText: box.tag_text || null,
      sales: box.total_draws,
      category: box.category,
      description: box.description,
      stock: box.stock,
      type: box.type
    }));

    res.json({
      code: 200,
      data: result,
      message: 'success'
    });
  } catch (err) {
    console.error('获取新品盲盒失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取分类盲盒
 * GET /api/blind-boxes/category/:category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 12;
    
    const where = { status: 'active' };
    if (category && category !== 'all') {
      where.category = category;
    }

    const boxes = await BlindBox.findAll({
      where,
      include: [{
        model: Prize,
        as: 'prizes',
        attributes: ['id', 'name', 'rarity']
      }],
      order: [['id', 'DESC']],
      limit
    });

    const result = boxes.map(box => ({
      id: box.id,
      name: box.name,
      price: parseFloat(box.price),
      originalPrice: box.original_price ? parseFloat(box.original_price) : null,
      image: box.image,
      coverImage: box.cover_image || box.image || null,
      tag: box.tag || null,
      tagText: box.tag_text || null,
      sales: box.total_draws,
      category: box.category,
      description: box.description,
      stock: box.stock
    }));

    res.json({
      code: 200,
      data: result,
      message: 'success'
    });
  } catch (err) {
    console.error('获取分类盲盒失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取盲盒列表（支持分页、筛选类型、搜索）
 */
router.get('/', paginationRules, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const { type, status, keyword, category, tag } = req.query;

    const where = {};
    if (type) where.type = type;
    if (status) {
      where.status = status;
    } else {
      where.status = 'active';
    }
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (tag) {
      where.tag = tag;
    }

    const { rows, count } = await BlindBox.findAndCountAll({
      where,
      include: [{ model: Prize, as: 'prizes' }],
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
    console.error('获取盲盒列表失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取盲盒详情（含奖品列表）
 */
router.get('/:id', idParamRules, async (req, res) => {
  try {
    const blindBox = await BlindBox.findByPk(req.params.id, {
      include: [{ model: Prize, as: 'prizes', order: [['rarity', 'ASC']] }]
    });
    if (!blindBox) {
      return res.status(404).json({ code: 404, message: '盲盒不存在' });
    }
    res.json({ code: 200, data: blindBox, message: 'success' });
  } catch (err) {
    console.error('获取盲盒详情失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 创建盲盒（管理员）
 */
router.post('/', auth, adminOnly, createBlindBoxRules, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { prizes, coverUrl, saleTime, ...otherData } = req.body;
    const boxData = { ...otherData };
    if (coverUrl !== undefined) boxData.cover_image = coverUrl;
    if (saleTime !== undefined) boxData.sale_time = saleTime;
    const blindBox = await BlindBox.create(boxData, { transaction: t });

    // 创建关联奖品
    if (prizes && Array.isArray(prizes) && prizes.length > 0) {
      const prizeData = prizes.map(p => ({
        ...p,
        blind_box_id: blindBox.id
      }));
      await Prize.bulkCreate(prizeData, { transaction: t });
    }

    await t.commit();

    // 返回含奖品的完整数据
    const result = await BlindBox.findByPk(blindBox.id, {
      include: [{ model: Prize, as: 'prizes' }]
    });

    res.status(201).json({ code: 200, data: result, message: '创建成功' });
  } catch (err) {
    await t.rollback();
    console.error('创建盲盒失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 更新盲盒（管理员）
 */
router.put('/:id', auth, adminOnly, idParamRules, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const blindBox = await BlindBox.findByPk(req.params.id);
    if (!blindBox) {
      await t.rollback();
      return res.status(404).json({ code: 404, message: '盲盒不存在' });
    }

    const { prizes, coverUrl, saleTime, ...otherData } = req.body;
    const boxData = { ...otherData };
    if (coverUrl !== undefined) boxData.cover_image = coverUrl;
    if (saleTime !== undefined) boxData.sale_time = saleTime;
    await blindBox.update(boxData, { transaction: t });

    // 如果传了奖品数据，全量替换
    if (prizes && Array.isArray(prizes)) {
      await Prize.destroy({ where: { blind_box_id: blindBox.id }, transaction: t });
      if (prizes.length > 0) {
        const prizeData = prizes.map(p => ({
          ...p,
          blind_box_id: blindBox.id
        }));
        await Prize.bulkCreate(prizeData, { transaction: t });
      }
    }

    await t.commit();

    const result = await BlindBox.findByPk(blindBox.id, {
      include: [{ model: Prize, as: 'prizes' }]
    });

    res.json({ code: 200, data: result, message: '更新成功' });
  } catch (err) {
    await t.rollback();
    console.error('更新盲盒失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 删除盲盒（管理员）- 软删除，状态改为 inactive
 */
router.delete('/:id', auth, adminOnly, idParamRules, async (req, res) => {
  try {
    const blindBox = await BlindBox.findByPk(req.params.id);
    if (!blindBox) {
      return res.status(404).json({ code: 404, message: '盲盒不存在' });
    }
    await blindBox.update({ status: 'inactive' });
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('删除盲盒失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 抽盒（需要认证）
 * POST /api/blind-boxes/:id/draw
 * body: { drawType: 'single' | 'five' | 'ten' }
 */
router.post('/:id/draw', auth, drawAntiBrush(), drawRules, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { drawType = 'single' } = req.body;
    const blindBoxId = parseInt(req.params.id);
    const userId = req.user.id;

    // 查询盲盒和奖品
    const blindBox = await BlindBox.findByPk(blindBoxId, {
      include: [{ model: Prize, as: 'prizes' }],
      transaction: t,
      lock: true
    });

    if (!blindBox) {
      await t.rollback();
      return res.status(404).json({ code: 404, message: '盲盒不存在' });
    }
    if (blindBox.status !== 'active') {
      await t.rollback();
      return res.status(400).json({ code: 400, message: '盲盒已下架' });
    }

    const prizes = blindBox.prizes;
    if (!prizes || prizes.length === 0) {
      await t.rollback();
      return res.status(400).json({ code: 400, message: '该盲盒暂无奖品' });
    }

    // 计算抽盒次数和费用
    const drawCountMap = { single: 1, five: 5, ten: 10 };
    const count = drawCountMap[drawType] || 1;
    const totalCost = parseFloat(blindBox.price) * count;

    // 检查用户余额（盲盒币）
    const user = await User.findByPk(userId, { transaction: t, lock: true });
    if (parseFloat(user.blind_box_coin) < totalCost) {
      await t.rollback();
      return res.status(400).json({ code: 400, message: '盲盒币余额不足' });
    }

    // 扣除盲盒币
    await user.update({
      blind_box_coin: parseFloat(user.blind_box_coin) - totalCost
    }, { transaction: t });

    // 生成订单号
    const orderNo = 'BB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const order = await Order.create({
      order_no: orderNo,
      user_id: userId,
      type: 'draw',
      status: 'paid',
      total: totalCost
    }, { transaction: t });

    // 转换奖品数据格式给算法使用
    const prizeDataForDraw = prizes.map(p => ({
      id: p.id,
      name: p.name,
      image: p.image,
      rarity: p.rarity,
      probability: parseFloat(p.probability),
      stock: p.stock
    }));

    // 执行抽盒算法
    const drawResults = batchDraw(prizeDataForDraw, count, drawType, blindBox.type === 'hash');

    // 处理每个抽中结果
    const results = [];
    for (const drawnPrize of drawResults) {
      if (!drawnPrize) continue;

      // 找到对应的真实奖品记录
      const prizeRecord = prizes.find(p => p.id === drawnPrize.id);
      if (prizeRecord && prizeRecord.stock > 0) {
        await prizeRecord.decrement('stock', { transaction: t });
      }

      // 添加到用户盒柜
      await UserCabinet.create({
        user_id: userId,
        prize_id: drawnPrize.id,
        blind_box_id: blindBoxId,
        name: drawnPrize.name,
        image: drawnPrize.image,
        rarity: drawnPrize.rarity,
        status: 'pending',
        draw_time: new Date()
      }, { transaction: t });

      // 记录抽盒
      await DrawRecord.create({
        user_id: userId,
        blind_box_id: blindBoxId,
        prize_id: drawnPrize.id,
        prize_name: drawnPrize.name,
        prize_rarity: drawnPrize.rarity,
        draw_type: drawType,
        cost: totalCost / count,
        order_id: order.id
      }, { transaction: t });

      results.push({
        id: drawnPrize.id,
        name: drawnPrize.name,
        image: drawnPrize.image,
        rarity: drawnPrize.rarity
      });
    }

    // 更新盲盒总抽盒次数
    await blindBox.increment('total_draws', { by: count, transaction: t });

    await t.commit();

    res.json({
      code: 200,
      data: {
        results,
        cost: totalCost,
        remaining_coin: parseFloat(user.blind_box_coin) - totalCost,
        draw_type: drawType,
        order_no: orderNo
      },
      message: '抽盒成功'
    });
  } catch (err) {
    await t.rollback();
    console.error('抽盒失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
