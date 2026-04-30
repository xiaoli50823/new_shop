/**
 * 商品路由（普通商品，非盲盒）
 * 使用内存数据，保持简单
 */
const express = require('express');
const router = express.Router();

// 示例商品数据
const products = [
  {
    id: 1,
    name: '盲盒专用展示盒',
    price: 29,
    image: 'https://img.freepik.com/free-photo/empty-transparent-plastic-display-case_23-2149193136.jpg',
    description: '亚克力材质，防尘防潮，完美展示你的盲盒收藏',
    tag: 'hot',
    tagText: '热门'
  },
  {
    id: 2,
    name: '手办清洁套装',
    price: 19,
    image: 'https://img.freepik.com/free-photo/cleaning-brush-set-arrangement_23-2149307013.jpg',
    description: '专业手办清洁工具，柔软不伤手办表面',
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 3,
    name: '盲盒专用灯',
    price: 39,
    image: 'https://img.freepik.com/free-photo/led-light-strip-on-white-background_23-2149185163.jpg',
    description: 'LED氛围灯，让你的盲盒展示更有格调',
    tag: 'discount',
    tagText: '折扣'
  },
  {
    id: 4,
    name: '手办收纳袋',
    price: 15,
    image: 'https://img.freepik.com/free-photo/protective-storage-bags-arrangement_23-2149307009.jpg',
    description: '加厚珍珠棉内衬，保护手办运输安全',
    tag: 'hot',
    tagText: '热门'
  },
  {
    id: 5,
    name: '盲盒展示架',
    price: 49,
    image: 'https://img.freepik.com/free-photo/wooden-display-shelf-empty_23-2149253841.jpg',
    description: '实木多层展示架，可放 20+ 盲盒',
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 6,
    name: '手办底座',
    price: 12,
    image: 'https://img.freepik.com/free-photo/white-plastic-display-stands_23-2149185158.jpg',
    description: '透明亚克力底座，通用尺寸',
    tag: 'discount',
    tagText: '折扣'
  }
];

/**
 * 获取推荐商品
 */
router.get('/recommend', (req, res) => {
  res.json({ code: 200, data: products, message: 'success' });
});

/**
 * 获取商品详情
 */
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ code: 404, message: '商品不存在' });
  }
  res.json({ code: 200, data: product, message: 'success' });
});

module.exports = router;
