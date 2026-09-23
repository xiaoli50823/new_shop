'use strict';

const documents = require('../knowledge/mall.json');
const { BlindBox, HotProduct } = require('../models');
const { getOrLoad } = require('../utils/cache');

function terms(text) {
  const normalized = text.toLowerCase();
  const result = new Set(normalized.match(/[a-z0-9_-]{2,}/g) || []);
  for (const segment of normalized.match(/[\u4e00-\u9fff]+/g) || []) {
    for (let i = 0; i < segment.length - 1; i++) result.add(segment.slice(i, i + 2));
  }
  return [...result];
}

function rank(items, query, limit) {
  const keywords = terms(query);
  return items.map(item => {
    const title = item.title.toLowerCase();
    const haystack = `${title} ${item.keywords || ''} ${item.content}`.toLowerCase();
    const score = keywords.reduce((n, word) => n + (title.includes(word) ? 4 : haystack.includes(word) ? 1 : 0), 0);
    return { item, score };
  }).filter(row => row.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map(row => row.item);
}

async function catalog() {
  const [boxes, products] = await Promise.all([
    getOrLoad('blind-boxes', 'ai:catalog:v1', 30, () => BlindBox.findAll({
      where: { status: 'active' }, attributes: ['id', 'name', 'description', 'price', 'type'],
      order: [['total_draws', 'DESC']], limit: 80, raw: true
    })),
    getOrLoad('hot-products', 'ai:catalog:v1', 30, () => HotProduct.findAll({
      where: { status: 'active' }, attributes: ['id', 'name', 'description', 'price', 'stock'],
      order: [['sales', 'DESC']], limit: 80, raw: true
    }))
  ]);
  return [
    ...boxes.map(p => ({ id: `box-${p.id}`, title: p.name, path: `/blind-box/${p.id}`,
      content: `在售盲盒，单次标价 ${p.price} 盲盒币。${String(p.description || '').slice(0, 400)}` })),
    ...products.map(p => ({ id: `product-${p.id}`, title: p.name, path: '/hot',
      content: `在售周边，标价 ${p.price} 盲盒币，库存快照 ${p.stock}。${String(p.description || '').slice(0, 400)}` }))
  ];
}

async function retrieveKnowledge(question, history = []) {
  const previous = history.filter(m => m.role === 'user').slice(-2).map(m => m.content).join(' ');
  const query = `${question} ${previous}`;
  const rules = rank(documents, query, 4);
  if (!rules.length) rules.push(documents[0]);
  let productSources = [];
  let catalogAvailable = true;
  try {
    const products = await catalog();
    productSources = rank(products, query, 4);
    if (!productSources.length && /推荐|商品|盲盒|周边/.test(question)) productSources = products.slice(0, 3);
  } catch (_) { catalogAvailable = false; }
  return { sources: [...rules, ...productSources], catalogAvailable };
}

module.exports = { retrieveKnowledge, rank };
