const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }
    
    // 创建新用户
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // 生成token
    const token = jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '7d' });
    
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // 生成token
    const token = jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '7d' });
    
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 每日签到
router.post('/:id/check-in', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查是否已经签到
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
    if (lastCheckIn) {
      lastCheckIn.setHours(0, 0, 0, 0);
      if (today.getTime() === lastCheckIn.getTime()) {
        return res.status(400).json({ message: '今日已签到' });
      }
    }
    
    // 更新签到信息
    user.checkInDays += 1;
    user.points += 10;
    user.lastCheckIn = new Date();
    
    await user.save();
    
    res.json({ message: '签到成功', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 回收商品
router.post('/:id/recycle', async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 模拟回收逻辑，实际项目中应该从盒柜中移除商品
    const recycleValue = 50 * 0.8; // 假设原价50元，回收价80%
    user.blindBoxCoin += recycleValue;
    
    await user.save();
    
    res.json({ message: '回收成功', blindBoxCoin: user.blindBoxCoin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取用户列表（管理员）
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 封禁用户（管理员）
router.put('/:id/ban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'banned' }, { new: true });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '用户封禁成功', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 解封用户（管理员）
router.put('/:id/unban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '用户解封成功', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;