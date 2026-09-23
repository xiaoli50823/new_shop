'use strict';

const { getRedisClient, positiveInt } = require('../config/redis');
const { KEY_PREFIX } = require('../utils/cache');
const activeUsers = new Set();
const windows = new Map();
const WINDOW_MS = 60000;
const INCREMENT = "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end; return n";

async function consume(key, limit) {
  const now = Date.now();
  // Maintain a local shadow count, so an outage cannot reset this process's quota.
  for (const [k, value] of windows) if (value.expires <= now) windows.delete(k);
  const entry = windows.get(key) || { count: 0, expires: now + WINDOW_MS };
  entry.count++;
  windows.set(key, entry);
  if (entry.count > limit) return false;
  try {
    const client = await getRedisClient();
    if (client) {
      const count = await client.eval(INCREMENT, { keys: [KEY_PREFIX + 'ai:limit:' + key], arguments: [String(WINDOW_MS)] });
      return Number(count) <= limit;
    }
  } catch (_) { /* A bounded local limit remains active during Redis outages. */ }
  return true;
}

async function aiLimit(req, res, next) {
  const id = String(req.user.id);
  const concurrency = positiveInt(process.env.AI_MAX_CONCURRENT, 4, 20);
  if (activeUsers.has(id) || activeUsers.size >= concurrency) {
    res.set('Retry-After', '5');
    return res.status(429).json({ code: 429, message: '已有问题正在回答，请稍后再试' });
  }
  activeUsers.add(id);
  let released = false;
  req.releaseAiSlot = () => { if (!released) { activeUsers.delete(id); released = true; } };
  res.once('finish', req.releaseAiSlot);
  try {
    const allowed = await consume('user:' + id, positiveInt(process.env.AI_RATE_LIMIT, 10, 60)) &&
      await consume('global', positiveInt(process.env.AI_GLOBAL_RATE_LIMIT, 60, 600));
    if (!allowed) {
      req.releaseAiSlot();
      res.set('Retry-After', '60');
      return res.status(429).json({ code: 429, message: '提问次数较多，请一分钟后再试' });
    }
    next();
  } catch (error) { req.releaseAiSlot(); next(error); }
}

module.exports = { aiLimit, consume };
