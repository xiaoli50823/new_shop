// 防刷中间件

/**
 * 防刷中间件
 * @param {Object} options - 配置选项
 * @param {number} options.maxRequests - 最大请求次数
 * @param {number} options.windowMs - 时间窗口（毫秒）
 * @param {string} options.message - 错误消息
 */
const antiBrush = (options = {}) => {
  const {
    maxRequests = 10,
    windowMs = 60000,
    message = '请求过于频繁，请稍后再试'
  } = options;

  // 内存存储，用于Redis不可用时的 fallback
  const memoryStore = new Map();

  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate_limit:${ip}`;

    try {
      // 尝试使用Redis
      let redisClient;
      try {
        redisClient = require('../index').redisClient;
      } catch (err) {
        // Redis客户端不可用，使用内存存储
        const now = Date.now();
        const entry = memoryStore.get(key);
        
        if (entry) {
          const { count, timestamp } = entry;
          if (now - timestamp < windowMs) {
            if (count >= maxRequests) {
              return res.status(429).json({ message });
            }
            memoryStore.set(key, { count: count + 1, timestamp });
          } else {
            memoryStore.set(key, { count: 1, timestamp: now });
          }
        } else {
          memoryStore.set(key, { count: 1, timestamp: now });
        }
        return next();
      }

      if (redisClient) {
        // 获取当前计数
        const current = await redisClient.get(key);
        
        if (current) {
          const count = parseInt(current);
          if (count >= maxRequests) {
            return res.status(429).json({ message });
          }
          // 增加计数
          await redisClient.incr(key);
        } else {
          // 设置初始计数和过期时间
          await redisClient.set(key, 1, { EX: windowMs / 1000 });
        }
      }
      
      next();
    } catch (err) {
      console.error('防刷中间件错误:', err);
      // 出错时继续执行
      next();
    }
  };
};

/**
 * 抽盒防刷中间件
 */
const drawAntiBrush = () => {
  // 内存存储，用于Redis不可用时的 fallback
  const memoryStore = new Map();

  return async (req, res, next) => {
    const { userId } = req.body;
    const blindBoxId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ message: '缺少用户ID' });
    }

    const key = `draw_limit:${userId}:${blindBoxId}`;
    
    try {
      // 尝试使用Redis
      let redisClient;
      try {
        redisClient = require('../index').redisClient;
      } catch (err) {
        // Redis客户端不可用，使用内存存储
        const now = Date.now();
        const lastDraw = memoryStore.get(key);
        
        if (lastDraw) {
          const diff = now - lastDraw;
          if (diff < 1000) {
            return res.status(429).json({ message: '抽盒过于频繁，请稍后再试' });
          }
        }
        memoryStore.set(key, now);
        return next();
      }

      if (redisClient) {
        // 获取最后抽盒时间
        const lastDraw = await redisClient.get(key);
        
        if (lastDraw) {
          const now = Date.now();
          const diff = now - parseInt(lastDraw);
          
          // 1秒内只能抽一次
          if (diff < 1000) {
            return res.status(429).json({ message: '抽盒过于频繁，请稍后再试' });
          }
        }
        
        // 更新最后抽盒时间
        await redisClient.set(key, Date.now(), { EX: 60 });
      }
      
      next();
    } catch (err) {
      console.error('抽盒防刷中间件错误:', err);
      // 出错时继续执行
      next();
    }
  };
};

/**
 * 抢购防刷中间件
 */
const rushPurchaseAntiBrush = () => {
  // 内存存储，用于Redis不可用时的 fallback
  const memoryStore = new Map();

  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rush_limit:${ip}`;
    
    try {
      // 尝试使用Redis
      let redisClient;
      try {
        redisClient = require('../index').redisClient;
      } catch (err) {
        // Redis客户端不可用，使用内存存储
        const now = Date.now();
        const entry = memoryStore.get(key);
        
        if (entry) {
          const { count, timestamp } = entry;
          if (now - timestamp < 5000) {
            if (count >= 2) {
              return res.status(429).json({ message: '抢购过于频繁，请稍后再试' });
            }
            memoryStore.set(key, { count: count + 1, timestamp });
          } else {
            memoryStore.set(key, { count: 1, timestamp: now });
          }
        } else {
          memoryStore.set(key, { count: 1, timestamp: now });
        }
        return next();
      }

      if (redisClient) {
        // 获取当前计数
        const current = await redisClient.get(key);
        
        if (current) {
          const count = parseInt(current);
          // 5秒内最多2次请求
          if (count >= 2) {
            return res.status(429).json({ message: '抢购过于频繁，请稍后再试' });
          }
          // 增加计数
          await redisClient.incr(key);
        } else {
          // 设置初始计数和过期时间
          await redisClient.set(key, 1, { EX: 5 });
        }
      }
      
      next();
    } catch (err) {
      console.error('抢购防刷中间件错误:', err);
      // 出错时继续执行
      next();
    }
  };
};

module.exports = {
  antiBrush,
  drawAntiBrush,
  rushPurchaseAntiBrush
};