/**
 * 购物车路由
 */
const express = require('express');
const { Cart, BlindBox, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * 获取购物车列表
 */
router.get('/', auth, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: BlindBox,
        as: 'blindBox',
        where: { status: 'active' },
        required: true
      }],
      order: [['createdAt', 'DESC']]
    });

    const list = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      blindBox: {
        id: item.blindBox.id,
        name: item.blindBox.name,
        price: parseFloat(item.blindBox.price),
        image: item.blindBox.image,
        stock: item.blindBox.stock
      }
    }));

    const totalPrice = list.reduce((sum, item) => sum + item.blindBox.price * item.quantity, 0);

    res.json({
      code: 200,
      data: {
        list,
        totalPrice: totalPrice.toFixed(2),
        totalCount: list.reduce((sum, item) => sum + item.quantity, 0)
      },
      message: 'success'
    });
  } catch (err) {
    console.error('获取购物车失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 添加商品到购物车
 */
router.post('/', auth, async (req, res) => {
  try {
    const { blindBoxId, quantity = 1 } = req.body;

    if (!blindBoxId) {
      return res.status(400).json({ code: 400, message: '请选择盲盒' });
    }

    const blindBox = await BlindBox.findByPk(blindBoxId);
    if (!blindBox) {
      return res.status(404).json({ code: 404, message: '盲盒不存在' });
    }

    if (blindBox.status !== 'active') {
      return res.status(400).json({ code: 400, message: '该盲盒已下架' });
    }

    if (blindBox.stock < quantity) {
      return res.status(400).json({ code: 400, message: '库存不足' });
    }

    let cartItem = await Cart.findOne({
      where: { user_id: req.user.id, blind_box_id: blindBoxId }
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > blindBox.stock) {
        return res.status(400).json({ code: 400, message: '库存不足' });
      }
      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user_id: req.user.id,
        blind_box_id: blindBoxId,
        quantity
      });
    }

    res.json({
      code: 200,
      data: { cartId: cartItem.id },
      message: '添加成功'
    });
  } catch (err) {
    console.error('添加购物车失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 更新购物车商品数量
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    const cartItem = await Cart.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!cartItem) {
      return res.status(404).json({ code: 404, message: '购物车商品不存在' });
    }

    const blindBox = await BlindBox.findByPk(cartItem.blind_box_id);
    if (quantity > blindBox.stock) {
      return res.status(400).json({ code: 400, message: '库存不足' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (err) {
    console.error('更新购物车失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 删除购物车商品
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const cartItem = await Cart.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!cartItem) {
      return res.status(404).json({ code: 404, message: '购物车商品不存在' });
    }

    await cartItem.destroy();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (err) {
    console.error('删除购物车商品失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 清空购物车
 */
router.delete('/', auth, async (req, res) => {
  try {
    await Cart.destroy({
      where: { user_id: req.user.id }
    });

    res.json({
      code: 200,
      message: '清空成功'
    });
  } catch (err) {
    console.error('清空购物车失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
