'use strict';

const { createClient } = require('redis');

function positiveInt(value, fallback, max = 60000) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

const RETRY_MS = positiveInt(process.env.REDIS_RETRY_INTERVAL_MS, 15000);
const TIMEOUT_MS = positiveInt(process.env.REDIS_TIMEOUT_MS, 500, 5000);
let client = null;
let connecting = null;
let lastFailureAt = 0;
let lastError = null;
let connectedAt = null;

function isRedisEnabled() {
  return process.env.REDIS_CACHE_ENABLED !== 'false';
}

async function getRedisClient() {
  if (!isRedisEnabled()) return null;
  if (client?.isReady) return client;
  if (connecting) return connecting;
  if (lastFailureAt && Date.now() - lastFailureAt < RETRY_MS) return null;

  connecting = (async () => {
    let candidate;
    try {
      candidate = createClient({
        url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
        socket: { connectTimeout: TIMEOUT_MS, reconnectStrategy: false },
        disableOfflineQueue: true,
        commandsQueueMaxLength: 200,
        commandOptions: { timeout: TIMEOUT_MS }
      });
      candidate.on('error', () => {
        lastError = 'Redis 暂不可用';
        lastFailureAt = Date.now();
      });
      candidate.on('end', () => { connectedAt = null; });
      await candidate.connect();
      client = candidate;
      connectedAt = new Date().toISOString();
      lastError = null;
      lastFailureAt = 0;
      return client;
    } catch (_) {
      lastFailureAt = Date.now();
      lastError = 'Redis 连接失败，请检查地址、端口及认证配置';
      if (candidate?.isOpen) candidate.destroy();
      client = null;
      return null;
    }
  })();
  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

async function getRedisStatus() {
  const connectedClient = await getRedisClient();
  let connected = false;
  try {
    connected = Boolean(connectedClient && await connectedClient.ping() === 'PONG');
  } catch (_) {
    lastError = 'Redis 响应超时或连接中断';
  }
  // The connection URL may contain a password; never return it.
  return { enabled: isRedisEnabled(), connected, connectedAt, lastError, retryIntervalMs: RETRY_MS };
}

async function closeRedis() {
  if (connecting) await connecting;
  if (client?.isOpen) client.destroy();
  client = null;
  connectedAt = null;
}

module.exports = { getRedisClient, getRedisStatus, isRedisEnabled, closeRedis, positiveInt };
