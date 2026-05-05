const express = require('express');
const { query, body } = require('express-validator');
const { Op } = require('sequelize');
const Category = require('../models/Category');
const BlindBox = require('../models/BlindBox');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// 公开接口：获取所有分类（客户端用）
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 'active' },
      order: [['sort_order', 'DESC'], ['id', 'ASC']]
    });
    res.json({
      code: 200,
      data: categories.map(c => ({
        id: c.id,
        name: c.name,
        value: c.value,
        icon: c.icon || null,
        description: c.description || null
      }))
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 管理端：获取分类列表（分页+筛选）
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const { keyword, status } = req.query;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { value: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (status) where.status = status;

    const { rows, count } = await Category.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['sort_order', 'DESC'], ['id', 'ASC']]
    });

    res.json({
      code: 200,
      data: {
        list: rows,
        page,
        pageSize,
        total: count
      },
      message: 'success'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// 管理端：创建分类
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, value, icon, description, sortOrder } = req.body;
    if (!name || !value) {
      return res.status(400).json({ code: 400, message: '名称和标识不能为空' });
    }

    const exists = await Category.findOne({ where: { value } });
    if (exists) {
      return res.status(400).json({ code: 400, message: '标识已存在' });
    }

    const category = await Category.create({
      name,
      value,
      icon: icon || null,
      description: description || null,
      sort_order: sortOrder || 0,
      status: 'active'
    });

    res.status(201).json({ code: 200, data: category, message: '创建成功' });
  } catch (err) {
    res.status(400).json({ code: 400, message: err.message });
  }
});

// 管理端：更新分类
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ code: 404, message: '分类不存在' });

    const updateData = { ...req.body };
    if (updateData.value && updateData.value !== category.value) {
      const exists = await Category.findOne({ where: { value: updateData.value } });
      if (exists) return res.status(400).json({ code: 400, message: '标识已存在' });
    }

    await category.update(updateData);
    res.json({ code: 200, data: category, message: '更新成功' });
  } catch (err) {
    res.status(400).json({ code: 400, message: err.message });
  }
});

// 管理端：删除分类
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ code: 404, message: '分类不存在' });

    const count = await BlindBox.count({ where: { category_id: category.id } });
    if (count > 0) {
      return res.status(400).json({ code: 400, message: `该分类下有 ${count} 个盲盒，请先移除后再删除` });
    }

    await category.destroy();
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
