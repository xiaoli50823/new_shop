'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const express = require('express');
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://127.0.0.1:6379';
process.env.REDIS_KEY_PREFIX = 'blindbox-test:' + randomUUID() + ':';
process.env.REDIS_CACHE_ENABLED = 'true';
const { getRedisClient, closeRedis } = require('../config/redis');
const { getOrLoad, invalidateCache, clearCache, cacheResponse, KEY_PREFIX } = require('../utils/cache');
let client;
let server;
let base;
let loads = 0;

before(async () => {
  client = await getRedisClient();
  const app = express();
  app.get('/items', cacheResponse('blind-boxes', 30), (req, res) => res.json({ code: 200, data: ++loads }));
  app.get('/failure', cacheResponse('blind-boxes'), (req, res) => res.status(500).json({ code: 500 }));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});

after(async () => {
  if (client?.isReady) {
    let cursor = '0';
    do {
      const scan = await client.scan(cursor, { MATCH: KEY_PREFIX + '*', COUNT: 100 });
      cursor = scan.cursor;
      if (scan.keys.length) await client.del(scan.keys);
    } while (cursor !== '0');
  }
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await closeRedis();
});

test('Redis response cache: miss, normalized query hit, mutation invalidation', async t => {
  if (!client) return t.skip('Start Redis or set TEST_REDIS_URL to run integration tests');
  const first = await fetch(base + '/items?a=1&b=2');
  const initial = await first.json();
  assert.equal(first.headers.get('x-cache'), 'MISS');
  await client.ping();
  const second = await fetch(base + '/items?b=2&a=1');
  assert.equal(second.headers.get('x-cache'), 'HIT');
  assert.deepEqual(await second.json(), initial);
  await invalidateCache('blind-boxes');
  const third = await fetch(base + '/items?a=1&b=2');
  assert.equal(third.headers.get('x-cache'), 'MISS');
  assert.equal((await third.json()).data, initial.data + 1);
});

test('errors are never cached', async t => {
  if (!client) return t.skip('Redis unavailable');
  for (let i = 0; i < 2; i++) {
    const response = await fetch(base + '/failure');
    await response.json();
    assert.equal(response.status, 500);
    assert.equal(response.headers.get('x-cache'), 'MISS');
  }
});

test('late reads cannot repopulate a newer cache version', async t => {
  if (!client) return t.skip('Redis unavailable');
  let release;
  let started;
  const entered = new Promise(resolve => { started = resolve; });
  const late = getOrLoad('categories', 'race', 30, async () => {
    started();
    return new Promise(resolve => { release = resolve; });
  });
  await entered;
  await invalidateCache('categories');
  assert.equal(await getOrLoad('categories', 'race', 30, async () => 'new'), 'new');
  release('old');
  assert.equal(await late, 'old');
  assert.equal(await getOrLoad('categories', 'race', 30, async () => 'unexpected'), 'new');
});

test('concurrent knowledge loads are coalesced and stored with expiry', async t => {
  if (!client) return t.skip('Redis unavailable');
  let count = 0;
  const results = await Promise.all(Array.from({ length: 8 }, () => getOrLoad('points', 'same', 30, async () => {
    count++;
    await new Promise(resolve => setTimeout(resolve, 40));
    return { name: 'gift' };
  })));
  assert.equal(count, 1);
  assert.ok(results.every(r => r.name === 'gift'));
  const scan = await client.scan('0', { MATCH: KEY_PREFIX + 'cache:data:points:*', COUNT: 1000 });
  assert.ok(scan.keys.length);
  for (const key of scan.keys) assert.ok(await client.ttl(key) > 0);
});

test('manual invalidation preserves AI limits and unrelated keys', async t => {
  if (!client) return t.skip('Redis unavailable');
  const rateKey = KEY_PREFIX + 'ai:limit:test';
  await client.set(rateKey, '4', { EX: 60 });
  await getOrLoad('hot-products', 'clear', 30, async () => 'before');
  assert.equal(await clearCache(), true);
  assert.equal(await client.get(rateKey), '4');
  assert.equal(await getOrLoad('hot-products', 'clear', 30, async () => 'after'), 'after');
});

test('unreachable Redis falls back promptly without hanging requests', async () => {
  const script = "const c=require('./utils/cache'); const r=require('./config/redis'); c.getOrLoad('points','offline',30,async()=>42).then(v=>{if(v!==42)process.exitCode=1;}).finally(()=>r.closeRedis())";
  const started = Date.now();
  await promisify(execFile)(process.execPath, ['-e', script], {
    cwd: require('node:path').join(__dirname, '..'),
    env: { ...process.env, REDIS_URL: 'redis://127.0.0.1:1', REDIS_TIMEOUT_MS: '100' }, timeout: 4000
  });
  assert.ok(Date.now() - started < 4000);
});
