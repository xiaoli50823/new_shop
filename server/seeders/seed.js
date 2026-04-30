/**
 * 数据种子 - 初始化测试数据
 * 运行: node seeders/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, BlindBox, Prize, Order, OrderItem, UserCabinet, Coupon, DrawRecord } = require('../models');

async function seed() {
  try {
    console.log('🔄 开始初始化数据...');
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // force: true 会清空表再重建
    console.log('✅ 数据库表重建完成');

    // ============ 用户 ============
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@blindbox.com',
      password: adminPassword,
      phone: '13800000001',
      role: 'admin',
      vip_level: 5,
      points: 1000,
      blind_box_coin: 500
    });

    const user = await User.create({
      username: 'testuser',
      email: 'user@blindbox.com',
      password: userPassword,
      phone: '13800000002',
      role: 'user',
      vip_level: 1,
      points: 100,
      blind_box_coin: 200
    });

    console.log('✅ 用户数据创建完成 (admin/admin123, user/user123)');

    // ============ 盲盒 + 奖品 ============
    const blindBoxesData = [
      {
        name: '海贼王一番赏',
        price: 39.00,
        type: 'lottery',
        image: 'https://img.freepik.com/free-photo/anime-action-figures-collection_23-2149307011.jpg',
        description: '海贼王正版授权一番赏，路飞、索隆、娜美等经典角色',
        status: 'active',
        stock: 128,
        guarantee: 10,
        max_hidden: 3,
        tag: 'limited',
        tag_text: '限量',
        prizes: [
          { name: '路飞-普通款', image: '', rarity: 'common', probability: 40.00, stock: 50 },
          { name: '索隆-普通款', image: '', rarity: 'common', probability: 30.00, stock: 40 },
          { name: '娜美-稀有款', image: '', rarity: 'rare', probability: 15.00, stock: 20 },
          { name: '艾斯-稀有款', image: '', rarity: 'rare', probability: 10.00, stock: 12 },
          { name: '罗杰-隐藏款', image: '', rarity: 'hidden', probability: 5.00, stock: 6 }
        ]
      },
      {
        name: '鬼灭之刃一番赏',
        price: 49.00,
        type: 'lottery',
        image: 'https://img.freepik.com/free-photo/anime-character-figures_23-2149307007.jpg',
        description: '鬼灭之刃人气角色手办，炭治郎、禰豆子等',
        status: 'active',
        stock: 88,
        guarantee: 8,
        max_hidden: 2,
        tag: 'hot',
        tag_text: '热门',
        prizes: [
          { name: '炭治郎-普通款', image: '', rarity: 'common', probability: 35.00, stock: 35 },
          { name: '禰豆子-普通款', image: '', rarity: 'common', probability: 30.00, stock: 30 },
          { name: '善逸-稀有款', image: '', rarity: 'rare', probability: 20.00, stock: 15 },
          { name: '煉獄-隐藏款', image: '', rarity: 'hidden', probability: 15.00, stock: 8 }
        ]
      },
      {
        name: '龙珠一番赏',
        price: 45.00,
        type: 'lottery',
        image: 'https://img.freepik.com/free-photo/dragon-ball-action-figures_23-2149307005.jpg',
        description: '龙珠经典角色，超赛悟空、贝吉塔等',
        status: 'active',
        stock: 156,
        tag: 'new',
        tag_text: '上新',
        prizes: [
          { name: '悟空-普通款', image: '', rarity: 'common', probability: 40.00, stock: 60 },
          { name: '贝吉塔-普通款', image: '', rarity: 'common', probability: 30.00, stock: 45 },
          { name: '比克-稀有款', image: '', rarity: 'rare', probability: 20.00, stock: 30 },
          { name: '超蓝悟空-隐藏款', image: '', rarity: 'hidden', probability: 10.00, stock: 15 }
        ]
      },
      {
        name: '潮玩手办盲盒',
        price: 29.00,
        type: 'infinite',
        image: 'https://img.freepik.com/free-photo/trendy-toy-collection_23-2149307012.jpg',
        description: '设计师联名潮玩手办，随机款式',
        status: 'active',
        stock: 500,
        tag: 'hot',
        tag_text: '热门',
        prizes: [
          { name: '基础款A', image: '', rarity: 'common', probability: 50.00, stock: 200 },
          { name: '基础款B', image: '', rarity: 'common', probability: 30.00, stock: 150 },
          { name: '限定款', image: '', rarity: 'rare', probability: 15.00, stock: 100 },
          { name: '隐藏款', image: '', rarity: 'hidden', probability: 5.00, stock: 50 }
        ]
      },
      {
        name: '美妆盲盒',
        price: 59.00,
        type: 'infinite',
        image: 'https://img.freepik.com/free-photo/beauty-products-collection_23-2148897904.jpg',
        description: '大牌美妆小样+正装惊喜，每盒价值超过100元',
        status: 'active',
        stock: 300,
        tag: 'new',
        tag_text: '上新',
        prizes: [
          { name: '口红小样', image: '', rarity: 'common', probability: 40.00, stock: 120 },
          { name: '面膜套装', image: '', rarity: 'common', probability: 30.00, stock: 90 },
          { name: '精华液正装', image: '', rarity: 'rare', probability: 20.00, stock: 60 },
          { name: '大牌套装', image: '', rarity: 'hidden', probability: 10.00, stock: 30 }
        ]
      },
      {
        name: '区块链数字盲盒',
        price: 199.00,
        type: 'hash',
        image: 'https://img.freepik.com/free-photo/cryptocurrency-concept-with-bitcoin_23-2149307002.jpg',
        description: '链上确权数字藏品，限量发行',
        status: 'active',
        stock: 50,
        tag: 'limited',
        tag_text: '限量',
        prizes: [
          { name: '普通NFT', image: '', rarity: 'common', probability: 50.00, stock: 20 },
          { name: '稀有NFT', image: '', rarity: 'rare', probability: 30.00, stock: 15 },
          { name: '传奇NFT', image: '', rarity: 'hidden', probability: 20.00, stock: 10 }
        ]
      }
    ];

    for (const boxData of blindBoxesData) {
      const { prizes, ...blindBoxFields } = boxData;
      const blindBox = await BlindBox.create(blindBoxFields);
      for (const prizeData of prizes) {
        await Prize.create({ ...prizeData, blind_box_id: blindBox.id });
      }
    }

    console.log('✅ 盲盒和奖品数据创建完成');

    // ============ 示例订单 ============
    const order1 = await Order.create({
      order_no: 'ORD202604300001ABC',
      user_id: user.id,
      type: 'purchase',
      status: 'completed',
      total: 39.00,
      shipping_address: '北京市朝阳区xxx路xxx号',
      shipping_contact: '张三',
      shipping_phone: '13800000002',
      payment_method: 'wechat'
    });

    await OrderItem.create({
      order_id: order1.id,
      blind_box_id: 1,
      name: '海贼王一番赏',
      image: 'https://img.freepik.com/free-photo/anime-action-figures-collection_23-2149307011.jpg',
      price: 39.00,
      quantity: 1
    });

    console.log('✅ 示例订单创建完成');

    // ============ 示例盒柜 ============
    const allPrizes = await Prize.findAll();
    if (allPrizes.length > 0) {
      await UserCabinet.create({
        user_id: user.id,
        prize_id: allPrizes[0].id,
        blind_box_id: allPrizes[0].blind_box_id,
        name: allPrizes[0].name,
        image: allPrizes[0].image,
        rarity: allPrizes[0].rarity,
        status: 'pending',
        draw_time: new Date()
      });

      if (allPrizes.length > 2) {
        await UserCabinet.create({
          user_id: user.id,
          prize_id: allPrizes[2].id,
          blind_box_id: allPrizes[2].blind_box_id,
          name: allPrizes[2].name,
          image: allPrizes[2].image,
          rarity: allPrizes[2].rarity,
          status: 'pending',
          draw_time: new Date()
        });
      }
    }

    console.log('✅ 示例盒柜数据创建完成');

    // ============ 示例优惠券 ============
    await Coupon.bulkCreate([
      {
        user_id: user.id,
        type: '满减',
        value: 10.00,
        min_amount: 50.00,
        expire_at: new Date(Date.now() + 30 * 86400000),
        is_used: false
      },
      {
        user_id: user.id,
        type: '折扣',
        value: 0.90,
        min_amount: 100.00,
        expire_at: new Date(Date.now() + 15 * 86400000),
        is_used: false
      }
    ]);

    console.log('✅ 示例优惠券创建完成');

    // ============ 示例抽盒记录 ============
    if (allPrizes.length > 0) {
      await DrawRecord.bulkCreate([
        {
          user_id: user.id,
          blind_box_id: allPrizes[0].blind_box_id,
          prize_id: allPrizes[0].id,
          prize_name: allPrizes[0].name,
          prize_rarity: allPrizes[0].rarity,
          draw_type: 'single',
          cost: 39.00
        },
        {
          user_id: user.id,
          blind_box_id: allPrizes[2].blind_box_id,
          prize_id: allPrizes[2].id,
          prize_name: allPrizes[2].name,
          prize_rarity: allPrizes[2].rarity,
          draw_type: 'single',
          cost: 49.00
        }
      ]);
    }

    console.log('✅ 示例抽盒记录创建完成');

    console.log('\n🎉 数据初始化完成！');
    console.log('  管理员账号: admin@blindbox.com / admin123');
    console.log('  普通用户:   user@blindbox.com / user123');

    process.exit(0);
  } catch (err) {
    console.error('❌ 数据初始化失败:', err);
    process.exit(1);
  }
}

seed();
