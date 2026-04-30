/**
 * JWT 认证中间件
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * 必须认证 - 验证 JWT token
 */
const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未提供认证令牌' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ code: 403, message: '账号已被封禁' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '令牌已过期' });
    }
    return res.status(401).json({ code: 401, message: '无效的认证令牌' });
  }
};

/**
 * 可选认证 - 有 token 就解析，没有也放行
 */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findByPk(decoded.id);
      if (user && user.status !== 'banned') {
        req.user = user;
      }
    }
  } catch (_) {
    // 忽略错误，继续执行
  }
  next();
};

/**
 * 管理员权限检查（必须先经过 auth 中间件）
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '需要管理员权限' });
  }
  next();
};

module.exports = { auth, optionalAuth, adminOnly };
