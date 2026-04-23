const express = require('express');
const router = express.Router();
const { drawAntiBrush } = require('../middleware/antiBrush');
const { batchDraw } = require('../utils/drawAlgorithm');

// 内存存储
let blindBoxes = [
  {
    _id: '1',
    name: '海贼王一番赏',
    price: 39,
    type: 'lottery',
    image: 'https://img.freepik.com/free-photo/anime-action-figures-collection_23-2149307011.jpg',
    status: 'active',
    stock: 128,
    stockPercentage: 60,
    tag: 'limited',
    tagText: '限量'
  },
  {
    _id: '2',
    name: '鬼灭之刃一番赏',
    price: 49,
    type: 'lottery',
    image: 'https://img.freepik.com/free-photo/anime-character-figures_23-2149307007.jpg',
    status: 'active',
    stock: 88,
    stockPercentage: 45,
    tag: 'hot',
    tagText: '热门'
  },
  {
    _id: '3',
    name: '龙珠一番赏',
    price: 45,
    type: 'lottery',
    image: 'https://img.freepik.com/free-photo/dragon-ball-action-figures_23-2149307005.jpg',
    status: 'active',
    stock: 156,
    stockPercentage: 70,
    tag: 'new',
    tagText: '上新'
  },
  {
    _id: '4',
    name: '火影忍者一番赏',
    price: 42,
    type: 'lottery',
    image: 'https://img.freepik.com/free-photo/naruto-action-figures_23-2149307003.jpg',
    status: 'active',
    stock: 45,
    stockPercentage: 30,
    tag: 'warning',
    tagText: '告急'
  },
  {
    _id: '5',
    name: '潮玩手办盲盒',
    price: 29,
    type: 'infinite',
    image: 'https://img.freepik.com/free-photo/trendy-toy-collection_23-2149307012.jpg',
    status: 'active',
    tag: 'hot',
    tagText: '热门'
  },
  {
    _id: '6',
    name: '美妆盲盒',
    price: 59,
    type: 'infinite',
    image: 'https://img.freepik.com/free-photo/beauty-products-collection_23-2148897904.jpg',
    status: 'active',
    tag: 'new',
    tagText: '上新'
  },
  {
    _id: '7',
    name: '3C数码盲盒',
    price: 99,
    type: 'infinite',
    image: 'https://img.freepik.com/free-photo/electronic-gadgets-collection_23-2149307010.jpg',
    status: 'active',
    tag: 'hot',
    tagText: '热门'
  },
  {
    _id: '8',
    name: '文具盲盒',
    price: 19,
    type: 'infinite',
    image: 'https://img.freepik.com/free-photo/stationery-items-collection_23-2149307008.jpg',
    status: 'active',
    tag: 'discount',
    tagText: '折扣'
  },
  {
    _id: '9',
    name: '零食盲盒',
    price: 39,
    type: 'infinite',
    image: 'https://img.freepik.com/free-photo/snack-collection-assortment_23-2149307006.jpg',
    status: 'active',
    tag: 'new',
    tagText: '上新'
  },
  {
    _id: '10',
    name: '宠物用品盲盒',
    price: 49,
    type: 'infinite',
    image: 'https://img.freepik.com/free-photo/pet-supplies-collection_23-2149307004.jpg',
    status: 'active',
    tag: 'hot',
    tagText: '热门'
  },
  {
    _id: '11',
    name: '区块链数字盲盒',
    price: 199,
    type: 'hash',
    image: 'https://img.freepik.com/free-photo/cryptocurrency-concept-with-bitcoin_23-2149307002.jpg',
    status: 'active',
    tag: 'limited',
    tagText: '限量'
  },
  {
    _id: '12',
    name: 'NFT艺术盲盒',
    price: 299,
    type: 'hash',
    image: 'https://img.freepik.com/free-photo/digital-art-nft-concept_23-2149307000.jpg',
    status: 'active',
    tag: 'new',
    tagText: '上新'
  },
  {
    _id: '13',
    name: '元宇宙盲盒',
    price: 399,
    type: 'hash',
    image: 'https://img.freepik.com/free-photo/metaverse-virtual-reality-concept_23-2149306998.jpg',
    status: 'active',
    tag: 'limited',
    tagText: '限量'
  },
  {
    _id: '14',
    name: '数字艺术盲盒',
    price: 159,
    type: 'hash',
    image: 'https://img.freepik.com/free-photo/digital-creative-artwork_23-2149306996.jpg',
    status: 'active',
    tag: 'new',
    tagText: '上新'
  }
];

let nextId = 15;

// 获取盲盒列表
router.get('/', (req, res) => {
  try {
    const activeBoxes = blindBoxes.filter(box => box.status === 'active');
    res.json(activeBoxes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取盲盒详情
router.get('/:id', (req, res) => {
  try {
    const blindBox = blindBoxes.find(box => box._id === req.params.id);
    if (!blindBox) {
      return res.status(404).json({ message: '盲盒不存在' });
    }
    res.json(blindBox);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建盲盒
router.post('/', (req, res) => {
  try {
    const blindBox = {
      _id: String(nextId++),
      ...req.body,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    blindBoxes.push(blindBox);
    res.status(201).json(blindBox);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 更新盲盒
router.put('/:id', (req, res) => {
  try {
    const index = blindBoxes.findIndex(box => box._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: '盲盒不存在' });
    }
    blindBoxes[index] = { ...blindBoxes[index], ...req.body };
    res.json(blindBoxes[index]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除盲盒
router.delete('/:id', (req, res) => {
  try {
    const index = blindBoxes.findIndex(box => box._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: '盲盒不存在' });
    }
    blindBoxes.splice(index, 1);
    res.json({ message: '盲盒删除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 抽盒功能
router.post('/:id/draw', drawAntiBrush(), (req, res) => {
  try {
    const { userId, count = 1, type = 'single', isTrueRandom = false } = req.body;
    const blindBox = blindBoxes.find(box => box._id === req.params.id);
    
    if (!blindBox) {
      return res.status(404).json({ message: '盲盒不存在' });
    }
    
    if (blindBox.status !== 'active') {
      return res.status(400).json({ message: '盲盒已下架' });
    }
    
    // 模拟抽盒结果
    const results = [
      { name: '普通款', rarity: 'common' },
      { name: '稀有款', rarity: 'rare' },
      { name: '隐藏款', rarity: 'secret' }
    ];
    
    // 更新盲盒总抽盒次数
    blindBox.totalDraws = (blindBox.totalDraws || 0) + count;
    
    res.json({ results: [results[Math.floor(Math.random() * results.length)]] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;