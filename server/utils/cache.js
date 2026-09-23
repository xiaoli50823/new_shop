'use strict';

const { createHash, randomUUID } = require('node:crypto');
const { getRedisClient, getRedisStatus, isRedisEnabled, positiveInt } = require('../config/redis');

const KEY_PREFIX = /^[\w:-]{1,80}$/.test(process.env.REDIS_KEY_PREFIX || '')
  ? process.env.REDIS_KEY_PREFIX : 'blindbox:';
const DEFAULT_TTL_SECONDS = positiveInt(process.env.REDIS_DEFAULT_TTL, 60, 3600);
const NAMESPACES = ['blind-boxes', 'categories', 'hot-products', 'points'];
const stats = { hits: 0, misses: 0, bypasses: 0, errors: 0, invalidations: 0 };
const pendingLoads = new Map();

function versionKey(namespace) {
  if (!NAMESPACES.includes(namespace)) throw new Error('Unknown cache namespace');
  return KEY_PREFIX + 'cache:version:' + namespace;
}

function buildCacheKey(namespace, identity, version) {
  return KEY_PREFIX + 'cache:data:' + namespace + ':' + version + ':' +
    createHash('sha256').update(identity).digest('hex');
}

async function readCache(namespace, identity) {
  try {
    const client = await getRedisClient();
    if (!client) { stats.bypasses++; return { status: 'BYPASS' }; }
    const key = versionKey(namespace);
    let version = await client.get(key);
    if (!version) {
      await client.set(key, randomUUID(), { NX: true });
      version = await client.get(key);
      if (!version) throw new Error('Cache version unavailable');
    }
    const dataKey = buildCacheKey(namespace, identity, version);
    const value = await client.get(dataKey);
    if (value !== null) {
      const data = JSON.parse(value);
      stats.hits++;
      return { status: 'HIT', data };
    }
    stats.misses++;
    return { status: 'MISS', client, dataKey };
  } catch (_) {
    stats.errors++;
    stats.bypasses++;
    return { status: 'BYPASS' };
  }
}

async function writeCache(ticket, data, ttlSeconds) {
  if (ticket.status !== 'MISS') return;
  try {
    const serialized = JSON.stringify(data);
    if (Buffer.byteLength(serialized) > 1024 * 1024) return;
    const ttl = positiveInt(ttlSeconds, DEFAULT_TTL_SECONDS, 3600);
    const jitteredTtl = Math.max(1, Math.floor(ttl * (0.9 + Math.random() * 0.1)));
    // Mutation changes the namespace version. An in-flight old read can only
    // populate the old version, whose values expire by TTL.
    await ticket.client.set(ticket.dataKey, serialized, { EX: jitteredTtl });
  } catch (_) { stats.errors++; }
}

async function invalidateCache(...namespaces) {
  try {
    const client = await getRedisClient();
    if (!client) return false;
    for (const namespace of new Set(namespaces)) {
      await client.set(versionKey(namespace), randomUUID());
      stats.invalidations++;
    }
    return true;
  } catch (_) {
    stats.errors++;
    return false;
  }
}

async function clearCache() {
  // Only expire application response caches, never AI rate limits or other apps.
  return invalidateCache(...NAMESPACES);
}

function cacheResponse(namespace, ttlSeconds = DEFAULT_TTL_SECONDS) {
  return async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (req.method !== 'GET' || !isRedisEnabled() || req.originalUrl.length > 1500) {
      res.set('X-Cache', 'BYPASS');
      return next();
    }
    const url = new URL(req.originalUrl, 'http://cache.local');
    url.searchParams.sort();
    const ticket = await readCache(namespace, 'GET:' + url.pathname + url.search);
    res.set('X-Cache', ticket.status);
    if (ticket.status === 'HIT') return res.json(ticket.data);
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200 && body?.code === 200) {
        void writeCache(ticket, body, ttlSeconds);
      }
      return originalJson(body);
    };
    next();
  };
}

async function getOrLoad(namespace, identity, ttlSeconds, loader) {
  const ticket = await readCache(namespace, identity);
  if (ticket.status === 'HIT') return ticket.data;
  const pendingKey = ticket.dataKey || namespace + ':' + identity;
  if (pendingLoads.has(pendingKey)) return pendingLoads.get(pendingKey);
  const promise = (async () => {
    const data = await loader();
    await writeCache(ticket, data, ttlSeconds);
    return data;
  })();
  pendingLoads.set(pendingKey, promise);
  try { return await promise; } finally { pendingLoads.delete(pendingKey); }
}

async function getCacheStats() {
  const status = await getRedisStatus();
  const total = stats.hits + stats.misses;
  return {
    ...status, keyPrefix: KEY_PREFIX, defaultTtlSeconds: DEFAULT_TTL_SECONDS,
    namespaces: NAMESPACES, stats: { ...stats },
    hitRate: total ? Math.round(stats.hits / total * 1000) / 10 : 0,
    statsScope: '当前 Node.js 进程，自启动起累计'
  };
}

module.exports = { cacheResponse, clearCache, getCacheStats, invalidateCache, getOrLoad, KEY_PREFIX, buildCacheKey };
