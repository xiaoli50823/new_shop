/**
 * 签到路由
 */
const express = require('express');
const { User, sequelize } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

const CHECK_IN_REWARDS = {
  1: 10,
  2: 15,
  3: 20,
  4: 25,
  5: 30,
  6: 40,
  7: 50
};

router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = user.last_check_in
      ? (typeof user.last_check_in === 'string' ? user.last_check_in : user.last_check_in.toISOString().split('T')[0])
      : null;

    const isCheckedIn = lastCheckIn === today;

    let canCheckIn = true;
    if (lastCheckIn) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (lastCheckIn !== yesterdayStr && lastCheckIn !== today) {
        user.check_in_days = 0;
      }
    }

    res.json({
      code: 200,
      data: {
        isCheckedIn,
        checkInDays: user.check_in_days,
        todayReward: isCheckedIn ? 0 : (CHECK_IN_REWARDS[Math.min(user.check_in_days + 1, 7)] || 10),
        totalPoints: user.points
      },
      message: 'success'
    });
  } catch (err) {
    console.error('获取签到状态失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.post('/check-in', auth, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(req.user.id);
    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = user.last_check_in
      ? (typeof user.last_check_in === 'string' ? user.last_check_in : user.last_check_in.toISOString().split('T')[0])
      : null;

    if (lastCheckIn === today) {
      return res.status(400).json({ code: 400, message: '今日已签到' });
    }

    let newCheckInDays = user.check_in_days;
    if (lastCheckIn) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (lastCheckIn === yesterdayStr) {
        newCheckInDays += 1;
      } else if (lastCheckIn !== today) {
        newCheckInDays = 1;
      }
    } else {
      newCheckInDays = 1;
    }

    if (newCheckInDays > 7) newCheckInDays = 7;

    const reward = CHECK_IN_REWARDS[newCheckInDays] || 10;

    await user.increment('points', { by: reward, transaction: t });
    await user.update({
      check_in_days: newCheckInDays,
      last_check_in: new Date()
    }, { transaction: t });

    await t.commit();

    res.json({
      code: 200,
      data: {
        reward,
        checkInDays: newCheckInDays,
        totalPoints: user.points + reward,
        isContinuous: newCheckInDays > 1
      },
      message: '签到成功'
    });
  } catch (err) {
    await t.rollback();
    console.error('签到失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.get('/records', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    const records = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const lastCheckIn = user.last_check_in
        ? (typeof user.last_check_in === 'string' ? user.last_check_in : user.last_check_in.toISOString().split('T')[0])
        : null;
      const isCheckedIn = lastCheckIn === dateStr || (i > user.check_in_days && dateStr <= (lastCheckIn || ''));

      records.push({
        date: dateStr,
        isCheckedIn: isCheckedIn,
        day: i + 1
      });
    }

    res.json({
      code: 200,
      data: {
        currentStreak: user.check_in_days,
        records: records.reverse()
      },
      message: 'success'
    });
  } catch (err) {
    console.error('获取签到记录失败:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
