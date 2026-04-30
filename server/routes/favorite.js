const express = require('express');
const router = express.Router();

// 内存存储模拟收藏数据
let favorites = [
  {
    _id: '1',
    userId: '1',
    productId: '1',
    productType: 'blindBox',
    createdAt: '2026-04-17 10:30:00'
  },
  {
    _id: '2',
    userId: '1',
    productId: '2',
    productType: 'blindBox',
    createdAt: '2026-04-16 09:15:00'
  },
  {
    _id: '3',
    userId: '1',
    productId: '1',
    productType: 'product',
    createdAt: '2026-04-15 14:20:00'
  }
];

let nextId = 4;

// 获取收藏列表
router.get('/', (req, res) => {
  try {
    const userId = req.query.userId || '1';
    const userFavorites = favorites.filter(f => f.userId === userId);
    res.json(userFavorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 添加收藏
router.post('/', (req, res) => {
  try {
    const { productId, productType, userId = '1' } = req.body;
    
    if (!productId || !productType) {
      return res.status(400).json({ message: '请提供商品ID和类型' });
    }
    
    // 检查是否已收藏
    const existingFavorite = favorites.find(
      f => f.userId === userId && f.productId === productId && f.productType === productType
    );
    
    if (existingFavorite) {
      return res.status(400).json({ message: '已收藏该商品' });
    }
    
    const favorite = {
      _id: String(nextId++),
      userId,
      productId,
      productType,
      createdAt: new Date().toLocaleString()
    };
    
    favorites.push(favorite);
    res.status(201).json(favorite);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 移除收藏
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || '1';
    
    const initialLength = favorites.length;
    favorites = favorites.filter(f => !(f._id === id && f.userId === userId));
    
    if (favorites.length === initialLength) {
      return res.status(404).json({ message: '收藏不存在或无权限操作' });
    }
    
    res.json({ message: '收藏移除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 检查是否收藏
router.get('/check/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.query.userId || '1';
    const productType = req.query.productType || 'blindBox';
    
    const isFavorite = favorites.some(
      f => f.userId === userId && f.productId === productId && f.productType === productType
    );
    
    res.json({ isFavorite });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;