/**
 * 认证路由
 * POST /api/auth/register - 注册
 * POST /api/auth/login    - 登录
 * GET  /api/auth/me       - 获取当前用户信息
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validate');

const router = express.Router();

/**
 * 注册
 */
router.post('/register', registerRules, async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // 检查邮箱是否已存在
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ code: 400, message: '邮箱已被注册' });
    }

    // 检查用户名是否已存在
    const existingName = await User.findOne({ where: { username } });
    if (existingName) {
      return res.status(400).json({ code: 400, message: '用户名已被占用' });
    }

    const user = await User.create({ username, email, password, phone });

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      code: 201,
      data: { user: user.toJSON(), token },
      message: '注册成功'
    });
  } catch (err) {
    console.error('注册失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 登录
 */
router.post('/login', loginRules, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ code: 401, message: '邮箱或密码错误' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ code: 403, message: '账号已被封禁' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: '邮箱或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      data: { user: user.toJSON(), token },
      message: '登录成功'
    });
  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

/**
 * 获取当前用户信息
 */
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      code: 200,
      data: req.user.toJSON(),
      message: 'success'
    });
  } catch (err) {
    console.error('获取用户信息失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
