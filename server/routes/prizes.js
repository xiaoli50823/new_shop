/**
 * 奖品管理路由
 */
const express = require('express');
const router = express.Router();
const { Prize, BlindBox } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// 获取奖品列表
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, rarity, blind_box_id, keyword } = req.query;
    const where = {};
    if (rarity) where.rarity = rarity;
    if (blind_box_id) where.blind_box_id = blind_box_id;
    if (keyword) where.name = { [require('sequelize').Op.like]: `%${keyword}%` };

    const { count, rows } = await Prize.findAndCountAll({
      where,
      include: [{ model: BlindBox, as: 'blindBox', attributes: ['id', 'name'] }],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['id', 'DESC']]
    });

    res.json({ code: 200, data: { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) }, message: 'success' });
  } catch (err) {
    console.error('获取奖品列表失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 获取单个奖品
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const prize = await Prize.findByPk(req.params.id, { include: [{ model: BlindBox, as: 'blindBox' }] });
    if (!prize) return res.status(404).json({ code: 404, message: '奖品不存在' });
    res.json({ code: 200, data: prize, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 创建奖品
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const prize = await Prize.create(req.body);
    res.status(201).json({ code: 200, data: prize, message: '创建成功' });
  } catch (err) {
    res.status(400).json({ code: 400, message: err.message });
  }
});

// 更新奖品
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const prize = await Prize.findByPk(req.params.id);
    if (!prize) return res.status(404).json({ code: 404, message: '奖品不存在' });
    await prize.update(req.body);
    res.json({ code: 200, data: prize, message: '更新成功' });
  } catch (err) {
    res.status(400).json({ code: 400, message: err.message });
  }
});

// 删除奖品
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const prize = await Prize.findByPk(req.params.id);
    if (!prize) return res.status(404).json({ code: 404, message: '奖品不存在' });
    await prize.destroy();
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
