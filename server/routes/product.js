const express = require('express');
const router = express.Router();

const products = [
  {
    id: 1,
    name: '盲盒专用展示盒',
    price: 29,
    image: 'https://img.freepik.com/free-photo/empty-transparent-plastic-display-case_23-2149193136.jpg',
    tag: 'hot',
    tagText: '热门'
  },
  {
    id: 2,
    name: '手办清洁套装',
    price: 19,
    image: 'https://img.freepik.com/free-photo/cleaning-brush-set-arrangement_23-2149307013.jpg',
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 3,
    name: '盲盒专用灯',
    price: 39,
    image: 'https://img.freepik.com/free-photo/led-light-strip-on-white-background_23-2149185163.jpg',
    tag: 'discount',
    tagText: '折扣'
  },
  {
    id: 4,
    name: '手办收纳袋',
    price: 15,
    image: 'https://img.freepik.com/free-photo/protective-storage-bags-arrangement_23-2149307009.jpg',
    tag: 'hot',
    tagText: '热门'
  },
  {
    id: 5,
    name: '盲盒展示架',
    price: 49,
    image: 'https://img.freepik.com/free-photo/wooden-display-shelf-empty_23-2149253841.jpg',
    tag: 'new',
    tagText: '上新'
  },
  {
    id: 6,
    name: '手办底座',
    price: 12,
    image: 'https://img.freepik.com/free-photo/white-plastic-display-stands_23-2149185158.jpg',
    tag: 'discount',
    tagText: '折扣'
  }
];

router.get('/recommend', (req, res) => {
  res.json(products);
});

router.get('/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) {
    return res.status(404).json({ message: '商品不存在' });
  }
  res.json(product);
});

module.exports = router;