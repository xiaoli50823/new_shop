/**
 * WebSocket服务 - 实现实时数据同步
 */
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
const userSockets = new Map();
const adminSockets = new Set();

/**
 * 初始化WebSocket服务
 * @param {Object} server - HTTP服务器实例
 */
function initWebSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ 用户 ${socket.userId} 已连接 (${socket.userRole})`);

    if (socket.userRole === 'admin') {
      adminSockets.add(socket.id);
      socket.join('admin-room');
      console.log(`👨‍💼 管理员 ${socket.userId} 加入管理房间`);
    } else {
      if (!userSockets.has(socket.userId)) {
        userSockets.set(socket.userId, new Set());
      }
      userSockets.get(socket.userId).add(socket.id);
      socket.join(`user-${socket.userId}`);
      console.log(`👤 用户 ${socket.userId} 加入用户房间`);
    }

    socket.on('disconnect', () => {
      console.log(`❌ 用户 ${socket.userId} 已断开连接`);
      
      if (socket.userRole === 'admin') {
        adminSockets.delete(socket.id);
      } else {
        const userSocketSet = userSockets.get(socket.userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            userSockets.delete(socket.userId);
          }
        }
      }
    });

    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  console.log('🔌 WebSocket服务已启动');
  return io;
}

/**
 * 获取IO实例
 */
function getIO() {
  return io;
}

/**
 * 向特定用户推送消息
 * @param {number} userId - 用户ID
 * @param {string} event - 事件名称
 * @param {Object} data - 数据
 */
function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
    console.log(`📤 向用户 ${userId} 推送事件: ${event}`);
  }
}

/**
 * 向所有管理员推送消息
 * @param {string} event - 事件名称
 * @param {Object} data - 数据
 */
function emitToAdmin(event, data) {
  if (io) {
    io.to('admin-room').emit(event, data);
    console.log(`📤 向管理员推送事件: ${event}`);
  }
}

/**
 * 向所有连接的客户端广播消息
 * @param {string} event - 事件名称
 * @param {Object} data - 数据
 */
function broadcast(event, data) {
  if (io) {
    io.emit(event, data);
    console.log(`📢 广播事件: ${event}`);
  }
}

/**
 * 用户数据更新通知
 * @param {number} userId - 用户ID
 * @param {Object} userData - 更新的用户数据
 */
function notifyUserUpdate(userId, userData) {
  emitToUser(userId, 'user-data-updated', userData);
  emitToAdmin('user-data-changed', { userId, userData, timestamp: new Date() });
}

/**
 * 积分变化通知
 * @param {number} userId - 用户ID
 * @param {number} points - 新的积分
 * @param {string} reason - 变化原因
 */
function notifyPointsChange(userId, points, reason) {
  emitToUser(userId, 'points-changed', { points, reason, timestamp: new Date() });
  emitToAdmin('user-points-changed', { userId, points, reason, timestamp: new Date() });
}

/**
 * 盲盒币变化通知
 * @param {number} userId - 用户ID
 * @param {number} coin - 新的盲盒币余额
 * @param {string} reason - 变化原因
 */
function notifyCoinChange(userId, coin, reason) {
  emitToUser(userId, 'coin-changed', { coin, reason, timestamp: new Date() });
  emitToAdmin('user-coin-changed', { userId, coin, reason, timestamp: new Date() });
}

/**
 * 签到成功通知
 * @param {number} userId - 用户ID
 * @param {Object} checkInData - 签到数据
 */
function notifyCheckIn(userId, checkInData) {
  emitToUser(userId, 'check-in-success', checkInData);
  emitToAdmin('user-check-in', { userId, ...checkInData, timestamp: new Date() });
}

/**
 * 兑换成功通知
 * @param {number} userId - 用户ID
 * @param {Object} exchangeData - 兑换数据
 */
function notifyExchange(userId, exchangeData) {
  emitToUser(userId, 'exchange-success', exchangeData);
  emitToAdmin('user-exchange', { userId, ...exchangeData, timestamp: new Date() });
}

module.exports = {
  initWebSocket,
  getIO,
  emitToUser,
  emitToAdmin,
  broadcast,
  notifyUserUpdate,
  notifyPointsChange,
  notifyCoinChange,
  notifyCheckIn,
  notifyExchange
};
