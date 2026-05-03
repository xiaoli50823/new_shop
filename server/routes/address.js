const express = require('express');
const { Address } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { user_id: req.user.id },
      order: [['is_default', 'DESC'], ['id', 'DESC']]
    });

    const list = addresses.map(addr => ({
      id: addr.id,
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.is_default
    }));

    res.json({ code: 200, data: { list }, message: 'success' });
  } catch (err) {
    console.error('获取地址列表失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在' });
    }
    res.json({ code: 200, data: address, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body;

    if (!name || !phone || !province || !city || !district || !detail) {
      return res.status(400).json({ code: 400, message: '请填写完整的地址信息' });
    }

    if (isDefault) {
      await Address.update(
        { is_default: false },
        { where: { user_id: req.user.id } }
      );
    }

    const address = await Address.create({
      user_id: req.user.id,
      name,
      phone,
      province,
      city,
      district,
      detail,
      is_default: !!isDefault
    });

    res.status(201).json({
      code: 200,
      data: {
        id: address.id,
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        isDefault: address.is_default
      },
      message: '添加成功'
    });
  } catch (err) {
    console.error('创建地址失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body;
    const address = await Address.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在' });
    }

    if (isDefault) {
      await Address.update(
        { is_default: false },
        { where: { user_id: req.user.id } }
      );
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;
    if (district !== undefined) updateData.district = district;
    if (detail !== undefined) updateData.detail = detail;
    if (isDefault !== undefined) updateData.is_default = isDefault;

    await address.update(updateData);

    res.json({ code: 200, data: address, message: '更新成功' });
  } catch (err) {
    console.error('更新地址失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Address.destroy({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!result) {
      return res.status(404).json({ code: 404, message: '地址不存在' });
    }

    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('删除地址失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id/default', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在' });
    }

    await Address.update(
      { is_default: false },
      { where: { user_id: req.user.id } }
    );

    await address.update({ is_default: true });

    res.json({ code: 200, data: address, message: '已设为默认' });
  } catch (err) {
    console.error('设置默认地址失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
