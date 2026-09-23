'use strict';

const express = require('express');
const { auth } = require('../middleware/auth');
const { aiLimit } = require('../middleware/aiLimit');
const { getAiStatus, validateChat, completeChat } = require('../services/ai');
const { retrieveKnowledge } = require('../services/knowledge');
const router = express.Router();

router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.get('/status', (req, res) => res.json({ code: 200, data: getAiStatus(), message: 'success' }));

router.post('/chat', auth, (req, res, next) => {
  try {
    req.chatInput = validateChat(req.body);
    const status = getAiStatus();
    if (!status.enabled || !status.configured) return res.status(503).json({ code: 503, message: '智能问答暂未开通，请联系管理员配置 DeepSeek' });
    next();
  } catch (error) { res.status(error.status || 400).json({ code: error.status || 400, message: error.message }); }
}, aiLimit, async (req, res) => {
  const controller = new AbortController();
  const abort = () => { if (!res.writableEnded) controller.abort(); };
  res.once('close', abort);
  try {
    if (res.destroyed) return;
    const input = req.chatInput;
    const knowledge = input.mode === 'mall' ? await retrieveKnowledge(input.message, input.history) : null;
    if (controller.signal.aborted) return;
    const result = await completeChat(input, knowledge, { signal: controller.signal });
    if (!controller.signal.aborted) res.json({ code: 200, data: {
      ...result, mode: input.mode, catalogAvailable: knowledge?.catalogAvailable ?? null,
      sources: (knowledge?.sources || []).map((s, i) => ({ number: i + 1, title: s.title, path: s.path, excerpt: s.content }))
    }, message: 'success' });
  } catch (error) {
    if (!controller.signal.aborted) res.status(error.status || 500).json({ code: error.status || 500,
      message: error.status ? error.message : '问答服务暂时不可用，请稍后重试' });
  } finally {
    res.off('close', abort);
    req.releaseAiSlot();
  }
});

module.exports = router;
