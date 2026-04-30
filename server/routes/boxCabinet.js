const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

let pendingProducts = [
  {
    id: '1',
    name: '路飞手办',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=monkey%20d%20luffy%20figure&image_size=square',
    rarity: 'hidden',
    drawTime: '2026-04-17 10:30:00',
    userId: '1'
  },
  {
    id: '2',
    name: '索隆手办',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=roronoa%20zoro%20figure&image_size=square',
    rarity: 'rare',
    drawTime: '2026-04-17 09:15:00',
    userId: '1'
  },
  {
    id: '3',
    name: '乔巴手办',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chopper%20figure&image_size=square',
    rarity: 'common',
    drawTime: '2026-04-16 18:45:00',
    userId: '1'
  }
];

let shippedProducts = [
  {
    id: '4',
    name: '娜美手办',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nami%20figure&image_size=square',
    rarity: 'rare',
    drawTime: '2026-04-15 14:20:00',
    shipTime: '2026-04-16 10:00:00',
    trackingNumber: 'SF1234567890',
    userId: '1'
  }
];

router.get('/pending', authenticate, (req, res) => {
  try {
    const userPendingProducts = pendingProducts.filter(p => p.userId === req.user.id);
    res.json(userPendingProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/shipped', authenticate, (req, res) => {
  try {
    const userShippedProducts = shippedProducts.filter(p => p.userId === req.user.id);
    res.json(userShippedProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/recycle/:productId', authenticate, (req, res) => {
  try {
    const { productId } = req.params;
    
    const productIndex = pendingProducts.findIndex(p => p.id === productId && p.userId === req.user.id);
    if (productIndex === -1) {
      return res.status(404).json({ message: '商品不存在或无权限操作' });
    }
    
    const product = pendingProducts[productIndex];
    pendingProducts.splice(productIndex, 1);
    
    const blindBoxCoin = 50 * 0.8;
    
    res.json({ message: '回收成功', blindBoxCoin });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/batch-recycle', authenticate, (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: '请选择要回收的商品' });
    }
    
    let recycledCount = 0;
    pendingProducts = pendingProducts.filter(p => {
      if (productIds.includes(p.id) && p.userId === req.user.id) {
        recycledCount++;
        return false;
      }
      return true;
    });
    
    const blindBoxCoin = recycledCount * 50 * 0.8;
    
    res.json({ message: '批量回收成功', recycledCount, blindBoxCoin });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/batch-ship', authenticate, (req, res) => {
  try {
    const { productIds, shippingInfo } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: '请选择要发货的商品' });
    }
    
    if (!shippingInfo || !shippingInfo.address || !shippingInfo.contact || !shippingInfo.phone) {
      return res.status(400).json({ message: '请填写完整的收货信息' });
    }
    
    let shippedCount = 0;
    const shippedItems = [];
    
    pendingProducts = pendingProducts.filter(p => {
      if (productIds.includes(p.id) && p.userId === req.user.id) {
        const shippedItem = {
          ...p,
          shipTime: new Date().toLocaleString(),
          trackingNumber: `SF${Math.floor(Math.random() * 10000000000)}`,
          shippingInfo
        };
        shippedItems.push(shippedItem);
        shippedCount++;
        return false;
      }
      return true;
    });
    
    shippedProducts.push(...shippedItems);
    
    res.json({ message: '批量发货成功', shippedCount, shippedItems });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;