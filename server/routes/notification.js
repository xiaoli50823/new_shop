const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

let notifications = [
  {
    _id: '1',
    title: '抽盒成功',
    content: '恭喜您抽中了隐藏款路飞手办！',
    type: 'success',
    read: false,
    createdAt: '2026-04-17 10:30:00',
    userId: '1'
  },
  {
    _id: '2',
    title: '发货通知',
    content: '您的娜美手办已发货，请注意查收！',
    type: 'info',
    read: false,
    createdAt: '2026-04-16 10:00:00',
    userId: '1'
  },
  {
    _id: '3',
    title: '回收成功',
    content: '您的乔巴手办回收成功，获得了40盲盒币！',
    type: 'success',
    read: true,
    createdAt: '2026-04-15 18:45:00',
    userId: '1'
  },
  {
    _id: '4',
    title: '签到奖励',
    content: '恭喜您完成每日签到，获得10积分！',
    type: 'info',
    read: false,
    createdAt: '2026-04-15 08:00:00',
    userId: '1'
  },
  {
    _id: '5',
    title: '系统通知',
    content: '盲盒商城系统已更新，新增了哈希盲盒功能！',
    type: 'system',
    read: false,
    createdAt: '2026-04-14 12:00:00',
    userId: '1'
  }
];

router.get('/', authenticate, (req, res) => {
  try {
    const userNotifications = notifications.filter(n => n.userId === req.user.id);
    res.json(userNotifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/read', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = notifications.find(n => n._id === id && n.userId === req.user.id);
    if (!notification) {
      return res.status(404).json({ message: '通知不存在或无权限操作' });
    }
    
    notification.read = true;
    res.json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/read-all', authenticate, (req, res) => {
  try {
    let updatedCount = 0;
    notifications.forEach(notification => {
      if (notification.userId === req.user.id && !notification.read) {
        notification.read = true;
        updatedCount++;
      }
    });
    
    res.json({ message: '全部标记已读成功', updatedCount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    const initialLength = notifications.length;
    notifications = notifications.filter(n => !(n._id === id && n.userId === req.user.id));
    
    if (notifications.length === initialLength) {
      return res.status(404).json({ message: '通知不存在或无权限操作' });
    }
    
    res.json({ message: '通知删除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/', authenticate, (req, res) => {
  try {
    const initialLength = notifications.length;
    notifications = notifications.filter(n => n.userId !== req.user.id);
    const deletedCount = initialLength - notifications.length;
    
    res.json({ message: '所有通知删除成功', deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { title, content, type, userId = '1' } = req.body;
    
    const notification = {
      _id: String(notifications.length + 1),
      title,
      content,
      type: type || 'info',
      read: false,
      createdAt: new Date().toLocaleString(),
      userId
    };
    
    notifications.push(notification);
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;