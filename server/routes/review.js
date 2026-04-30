const express = require('express');
const router = express.Router();

// 内存存储模拟评价数据
let reviews = [
  {
    _id: '1',
    productId: '1',
    productType: 'blindBox',
    userId: '1',
    userName: '星球探索家',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar&image_size=square',
    rating: 5,
    content: '非常棒的盲盒！抽中了隐藏款，太开心了！',
    images: [],
    createdAt: '2026-04-17 10:30:00',
    likes: 128,
    replies: [
      {
        _id: 'r1',
        userId: '2',
        userName: '管理员',
        content: '恭喜您抽中隐藏款！',
        createdAt: '2026-04-17 11:00:00'
      }
    ]
  },
  {
    _id: '2',
    productId: '1',
    productType: 'blindBox',
    userId: '2',
    userName: '盲盒爱好者',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%202&image_size=square',
    rating: 4,
    content: '质量不错，发货也很快，下次还会购买！',
    images: [],
    createdAt: '2026-04-16 09:15:00',
    likes: 45,
    replies: []
  },
  {
    _id: '3',
    productId: '2',
    productType: 'blindBox',
    userId: '1',
    userName: '星球探索家',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar&image_size=square',
    rating: 5,
    content: '海贼王系列永远的神！做工精细，非常满意！',
    images: [],
    createdAt: '2026-04-15 14:20:00',
    likes: 256,
    replies: []
  }
];

let nextId = 4;
let nextReplyId = 2;

// 获取商品评价列表
router.get('/product/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const productType = req.query.productType || 'blindBox';
    
    const productReviews = reviews.filter(
      r => r.productId === productId && r.productType === productType
    );
    
    res.json(productReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取用户评价列表
router.get('/user', (req, res) => {
  try {
    const userId = req.query.userId || '1';
    
    const userReviews = reviews.filter(r => r.userId === userId);
    res.json(userReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建评价
router.post('/', (req, res) => {
  try {
    const { productId, productType, userId = '1', userName = '用户', rating, content, images } = req.body;
    
    if (!productId || !productType || !rating || !content) {
      return res.status(400).json({ message: '请填写完整的评价信息' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: '评分必须在1-5之间' });
    }
    
    const review = {
      _id: String(nextId++),
      productId,
      productType,
      userId,
      userName,
      avatar: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar&image_size=square`,
      rating,
      content,
      images: images || [],
      createdAt: new Date().toLocaleString(),
      likes: 0,
      replies: []
    };
    
    reviews.push(review);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 更新评价
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId = '1', rating, content, images } = req.body;
    
    const review = reviews.find(r => r._id === id && r.userId === userId);
    if (!review) {
      return res.status(404).json({ message: '评价不存在或无权限操作' });
    }
    
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: '评分必须在1-5之间' });
      }
      review.rating = rating;
    }
    
    if (content !== undefined) {
      review.content = content;
    }
    
    if (images !== undefined) {
      review.images = images;
    }
    
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除评价
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || '1';
    
    const initialLength = reviews.length;
    reviews = reviews.filter(r => !(r._id === id && r.userId === userId));
    
    if (reviews.length === initialLength) {
      return res.status(404).json({ message: '评价不存在或无权限操作' });
    }
    
    res.json({ message: '评价删除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 回复评价
router.post('/:id/reply', (req, res) => {
  try {
    const { id } = req.params;
    const { userId = '1', userName = '用户', content } = req.body;
    
    const review = reviews.find(r => r._id === id);
    if (!review) {
      return res.status(404).json({ message: '评价不存在' });
    }
    
    if (!content) {
      return res.status(400).json({ message: '请填写回复内容' });
    }
    
    const reply = {
      _id: String(nextReplyId++),
      userId,
      userName,
      content,
      createdAt: new Date().toLocaleString()
    };
    
    review.replies.push(reply);
    res.json(reply);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 点赞评价
router.post('/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    
    const review = reviews.find(r => r._id === id);
    if (!review) {
      return res.status(404).json({ message: '评价不存在' });
    }
    
    review.likes += 1;
    res.json({ likes: review.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;