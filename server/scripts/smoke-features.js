// Read-only database smoke check. --ai additionally makes two real, billable
// DeepSeek requests. Cache invalidation affects only this app's cached values.
'use strict';
require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../index');
const { User, sequelize } = require('../models');
const { getRedisClient, closeRedis } = require('../config/redis');
let server;

async function run() {
  await sequelize.authenticate();
  const admin = await User.findOne({ where: { role: 'admin', status: 'active' }, attributes: ['id', 'role'] });
  const user = await User.findOne({ where: { role: 'user', status: 'active' }, attributes: ['id', 'role'] });
  assert.ok(admin && user, 'Smoke check needs existing active admin and user accounts');
  const tokenFor = account => jwt.sign({ id: account.id, role: account.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '5m' });
  const adminToken = tokenFor(admin);
  const userToken = tokenFor(user);
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  async function request(path, options = {}, token) {
    const response = await fetch(base + '/api' + path, { ...options, headers: {
      'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {})
    } });
    return { status: response.status, cache: response.headers.get('x-cache'), body: await response.json() };
  }
  assert.equal((await request('/cache/status')).status, 401);
  assert.equal((await request('/cache/status', {}, userToken)).status, 403);
  const cacheStatus = await request('/cache/status', {}, adminToken);
  assert.equal(cacheStatus.status, 200);
  assert.equal(cacheStatus.body.data.connected, true);
  assert.equal((await request('/cache', { method: 'DELETE' }, adminToken)).status, 200);
  const client = await getRedisClient();
  for (const path of ['/blind-boxes?pageSize=2', '/categories', '/hot-products?pageSize=2', '/points?pageSize=2']) {
    const first = await request(path);
    assert.equal(first.status, 200, path);
    assert.equal(first.cache, 'MISS', path);
    await client.ping();
    const second = await request(path);
    assert.equal(second.cache, 'HIT', path);
    assert.deepEqual(second.body, first.body);
  }
  assert.equal((await request('/ai/chat', { method: 'POST', body: '{}' })).status, 401);
  assert.equal((await request('/ai/chat', { method: 'POST', body: JSON.stringify({ message: '' }) }, userToken)).status, 400);
  console.log('PASS: live MySQL + Redis, four cache namespaces, admin/user permissions, chat validation');

  if (process.argv.includes('--ai')) {
    for (const input of [
      { mode: 'general', message: '我刚才提到的编程语言是什么？只回复语言名。', history: [
        { role: 'user', content: '我正在学习 JavaScript。' }, { role: 'assistant', content: '好的，可以一起学习。' }
      ] },
      { mode: 'mall', message: '推荐一个资料中实际在售的盲盒，说明标价和资料编号；再简要说明积分怎么获得。', history: [] }
    ]) {
      const result = await request('/ai/chat', { method: 'POST', body: JSON.stringify(input) }, userToken);
      assert.equal(result.status, 200, result.body.message);
      assert.ok(result.body.data.answer);
      if (input.mode === 'mall') {
        assert.ok(result.body.data.sources.length > 0);
        assert.equal(result.body.data.catalogAvailable, true);
      } else {
        assert.match(result.body.data.answer, /JavaScript/i);
        assert.equal(result.body.data.sources.length, 0);
      }
      console.log(JSON.stringify({ mode: input.mode, sources: result.body.data.sources.length, answer: result.body.data.answer.slice(0, 350) }));
    }
  }
}

run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  await closeRedis();
  await sequelize.close();
  // The existing global request limiter owns a repeating timer.
  process.exit(process.exitCode || 0);
});
