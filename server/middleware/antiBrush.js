// 防刷中间件 - 仅使用内存存储

/**
 * 通用防刷中间件
 * @param {Object} options
 * @param {number} options.maxRequests - 时间窗口内最大请求次数
 * @param {number} options.windowMs - 时间窗口（毫秒）
 * @param {string} options.message - 错误消息
 */
const antiBrush = (options = {}) => {
  const {
    maxRequests = 60,
    windowMs = 60000,
    message = '请求过于频繁，请稍后再试'
  } = options;

  const memoryStore = new Map();

  // 定期清理过期记录，防止内存泄漏
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
      if (now - entry.timestamp > windowMs) {
        memoryStore.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate_limit:${ip}`;
    const now = Date.now();
    const entry = memoryStore.get(key);

    if (entry) {
      if (now - entry.timestamp < windowMs) {
        if (entry.count >= maxRequests) {
          return res.status(429).json({ code: 429, message });
        }
        entry.count++;
      } else {
        memoryStore.set(key, { count: 1, timestamp: now });
      }
    } else {
      memoryStore.set(key, { count: 1, timestamp: now });
    }
    next();
  };
};

/**
 * 抽盒防刷中间件 - 同一用户同一盲盒 1 秒只能抽一次
 */
const drawAntiBrush = () => {
  const memoryStore = new Map();

  return (req, res, next) => {
    const userId = req.user ? req.user.id : req.body.userId;
    const blindBoxId = req.params.id;

    if (!userId) {
      return res.status(400).json({ code: 400, message: '缺少用户ID' });
    }

    const key = `draw_limit:${userId}:${blindBoxId}`;
    const now = Date.now();
    const lastDraw = memoryStore.get(key);

    if (lastDraw && now - lastDraw < 1000) {
      return res.status(429).json({ code: 429, message: '抽盒过于频繁，请稍后再试' });
    }
    memoryStore.set(key, now);
    next();
  };
};

/**
 * 抢购防刷中间件 - 同一 IP 5 秒内最多 2 次
 */
const rushPurchaseAntiBrush = () => {
  const memoryStore = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rush_limit:${ip}`;
    const now = Date.now();
    const entry = memoryStore.get(key);

    if (entry) {
      if (now - entry.timestamp < 5000) {
        if (entry.count >= 2) {
          return res.status(429).json({ code: 429, message: '抢购过于频繁，请稍后再试' });
        }
        entry.count++;
      } else {
        memoryStore.set(key, { count: 1, timestamp: now });
      }
    } else {
      memoryStore.set(key, { count: 1, timestamp: now });
    }
    next();
  };
};

module.exports = { antiBrush, drawAntiBrush, rushPurchaseAntiBrush };
