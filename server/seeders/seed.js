/**
 * 数据种子 - 初始化测试数据
 * 运行: node seeders/seed.js
 */
require('dotenv').config();
const { sequelize, User, BlindBox, Prize, Order, OrderItem, UserCabinet, Coupon, DrawRecord, HotProduct, PointsProduct, Category } = require('../models');

async function seed() {
  try {
    console.log('🔄 开始初始化数据...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库表结构同步完成');

    const adminExists = await User.findOne({ where: { email: 'admin@blindbox.com' } });
    const userExists = await User.findOne({ where: { email: 'user@blindbox.com' } });

    // ============ 用户 ============

    const admin = adminExists || await User.create({
      username: 'admin',
      email: 'admin@blindbox.com',
      password: 'admin123',
      phone: '13800000001',
      role: 'admin',
      vipLevel: 5,
      points: 1000,
      blindBoxCoin: 500
    });

    const user = userExists || await User.create({
      username: 'testuser',
      email: 'user@blindbox.com',
      password: 'user123',
      phone: '13800000002',
      role: 'user',
      vipLevel: 1,
      points: 100,
      blindBoxCoin: 200
    });

    // ============ 盲盒分类 ============
    const categoriesData = [
      { name: '动漫', value: 'anime', icon: '', description: '动漫IP手办盲盒', sort_order: 100 },
      { name: '游戏', value: 'game', icon: '', description: '游戏周边盲盒', sort_order: 90 },
      { name: '潮玩', value: 'figure', icon: '', description: '设计师潮玩手办', sort_order: 80 },
      { name: '影视', value: 'movie', icon: '', description: '影视IP周边', sort_order: 70 },
      { name: '美妆', value: 'beauty', icon: '', description: '美妆护肤惊喜盒', sort_order: 60 },
      { name: '数码', value: '3c', icon: '', description: '3C数码配件', sort_order: 50 }
    ];

    for (const catData of categoriesData) {
      const exists = await Category.findOne({ where: { value: catData.value } });
      if (!exists) {
        await Category.create({ ...catData, status: 'active' });
      }
    }

    const categoryMap = {};
    const allCategories = await Category.findAll();
    allCategories.forEach(c => { categoryMap[c.value] = c.id; });

    console.log('✅ 用户数据创建完成 (admin/admin123, user/user123)');

    // ============ 盲盒 + 奖品 ============
    const blindBoxesData = [
      {
        name: '赛博边际 · 义体迷行',
        price: 69.00,
        type: 'lottery',
        image: 'https://www.img2link.com/images/2026/05/04/61ab0675ad269e970a6e9b9c1d5fda01.png',
        description: '赛博朋克主题盲盒，义体改造人系列，限量发售',
        status: 'active',
        stock: 100,
        guarantee: 8,
        maxHidden: 2,
        category_id: categoryMap['anime'] || null,
        category: 'anime',
        tag: 'hot',
        tagText: '热门',
        prizes: [
          { name: '义体改造人-普通款', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'common', probability: 40.00, stock: 40 },
          { name: '义体改造人-普通款B', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', rarity: 'common', probability: 30.00, stock: 30 },
          { name: '义体改造人-稀有款', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop', rarity: 'rare', probability: 18.00, stock: 18 },
          { name: '义体改造人-隐藏款', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'hidden', probability: 12.00, stock: 12 }
        ]
      },
      {
        name: '海贼王一番赏',
        price: 39.00,
        type: 'lottery',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
        description: '海贼王正版授权一番赏，路飞、索隆、娜美等经典角色',
        status: 'active',
        stock: 128,
        guarantee: 10,
        maxHidden: 3,
        category_id: categoryMap['anime'] || null,
        category: 'anime',
        tag: 'limited',
        tagText: '限量',
        prizes: [
          { name: '路飞-普通款', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'common', probability: 40.00, stock: 50 },
          { name: '索隆-普通款', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', rarity: 'common', probability: 30.00, stock: 40 },
          { name: '娜美-稀有款', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop', rarity: 'rare', probability: 15.00, stock: 20 },
          { name: '艾斯-稀有款', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'rare', probability: 10.00, stock: 12 },
          { name: '罗杰-隐藏款', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', rarity: 'hidden', probability: 5.00, stock: 6 }
        ]
      },
      {
        name: '鬼灭之刃盲盒',
        price: 49.00,
        type: 'lottery',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
        description: '鬼灭之刃人气角色手办，炭治郎、禰豆子等',
        status: 'active',
        stock: 88,
        guarantee: 8,
        maxHidden: 2,
        category_id: categoryMap['anime'] || null,
        category: 'anime',
        tag: 'hot',
        tagText: '热门',
        prizes: [
          { name: '炭治郎-普通款', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop', rarity: 'common', probability: 35.00, stock: 35 },
          { name: '禰豆子-普通款', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'common', probability: 30.00, stock: 30 },
          { name: '善逸-稀有款', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', rarity: 'rare', probability: 20.00, stock: 15 },
          { name: '煉獄-隐藏款', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop', rarity: 'hidden', probability: 15.00, stock: 8 }
        ]
      },
      {
        name: '龙珠经典手办',
        price: 45.00,
        type: 'lottery',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        description: '龙珠经典角色，超赛悟空、贝吉塔等',
        status: 'active',
        stock: 156,
        category_id: categoryMap['anime'] || null,
        category: 'anime',
        tag: 'new',
        tagText: '新品',
        prizes: [
          { name: '悟空-普通款', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', rarity: 'common', probability: 40.00, stock: 60 },
          { name: '贝吉塔-普通款', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop', rarity: 'common', probability: 30.00, stock: 45 },
          { name: '比克-稀有款', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'rare', probability: 20.00, stock: 30 },
          { name: '超蓝悟空-隐藏款', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', rarity: 'hidden', probability: 10.00, stock: 15 }
        ]
      },
      {
        name: '潮玩手办盲盒',
        price: 29.00,
        type: 'infinite',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
        description: '设计师联名潮玩手办，随机款式',
        status: 'active',
        stock: 500,
        category_id: categoryMap['figure'] || null,
        category: 'figure',
        tag: 'hot',
        tagText: '热门',
        prizes: [
          { name: '基础款A', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'common', probability: 50.00, stock: 200 },
          { name: '基础款B', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', rarity: 'common', probability: 30.00, stock: 150 },
          { name: '限定款', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop', rarity: 'rare', probability: 15.00, stock: 100 },
          { name: '隐藏款', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'hidden', probability: 5.00, stock: 50 }
        ]
      },
      {
        name: '美妆惊喜盲盒',
        price: 59.00,
        type: 'infinite',
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop',
        description: '大牌美妆小样+正装惊喜，每盒价值超过100元',
        status: 'active',
        stock: 300,
        category_id: categoryMap['beauty'] || null,
        category: 'beauty',
        tag: 'new',
        tagText: '新品',
        prizes: [
          { name: '口红小样', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop', rarity: 'common', probability: 40.00, stock: 120 },
          { name: '面膜套装', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', rarity: 'common', probability: 30.00, stock: 90 },
          { name: '精华液正装', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'rare', probability: 20.00, stock: 60 },
          { name: '大牌套装', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop', rarity: 'hidden', probability: 10.00, stock: 30 }
        ]
      },
      {
        name: '数字艺术盲盒',
        price: 199.00,
        type: 'hash',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        description: '链上确权数字藏品，限量发行',
        status: 'active',
        stock: 50,
        category_id: categoryMap['3c'] || null,
        category: '3c',
        tag: 'limited',
        tagText: '限量',
        prizes: [
          { name: '普通NFT', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop', rarity: 'common', probability: 50.00, stock: 20 },
          { name: '稀有NFT', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', rarity: 'rare', probability: 30.00, stock: 15 },
          { name: '传奇NFT', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', rarity: 'hidden', probability: 20.00, stock: 10 }
        ]
      }
    ];

    for (const boxData of blindBoxesData) {
      const existing = await BlindBox.findOne({ where: { name: boxData.name } });
      if (existing) {
        console.log(`⏭️  盲盒 "${boxData.name}" 已存在，跳过`);
        continue;
      }
      const { prizes, ...blindBoxFields } = boxData;
      const blindBox = await BlindBox.create(blindBoxFields);
      for (const prizeData of prizes) {
        await Prize.create({ ...prizeData, blind_box_id: blindBox.id });
      }
    }

    console.log('✅ 盲盒和奖品数据创建完成');

    // ============ 示例订单 ============
    const orderExists = await Order.findOne({ where: { order_no: 'ORD202604300001ABC' } });
    if (!orderExists) {
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
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
        price: 39.00,
        quantity: 1
      });
    }

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

    // ============ 热门周边商品 ============
    const hotProductsData = [
      {
        name: '海贼王限定展示柜',
        description: '亚克力透明展示柜，适合摆放海贼王系列手办，带LED灯效',
        price: 88,
        original_price: 128,
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        category: 'display',
        stock: 50,
        tag: 'hot',
        tag_text: '热门',
        sort_order: 100
      },
      {
        name: '盲盒收纳盒（大号）',
        description: '可收纳12个盲盒，透明翻盖设计，防尘防潮',
        price: 45,
        original_price: 68,
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
        category: 'display',
        stock: 100,
        tag: 'discount',
        tag_text: '折扣',
        sort_order: 90
      },
      {
        name: '动漫钥匙扣套装',
        description: '精美金属钥匙扣，含多个经典角色',
        price: 35,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
        category: 'accessory',
        stock: 200,
        tag: 'hot',
        tag_text: '热门',
        sort_order: 85
      },
      {
        name: '限量款收藏海报',
        description: '设计师亲笔签名限量海报，带收藏证书',
        price: 199,
        original_price: 299,
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        category: 'collectible',
        stock: 20,
        tag: 'new',
        tag_text: '新品',
        sort_order: 95
      },
      {
        name: '手办清洁套装',
        description: '专业手办清洁工具，含软毛刷、清洁液、擦拭布',
        price: 28,
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
        category: 'accessory',
        stock: 150,
        sort_order: 70
      },
      {
        name: '主题鼠标垫',
        description: '超大号游戏鼠标垫，精美图案，防滑底面',
        price: 56,
        original_price: 79,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
        category: 'accessory',
        stock: 80,
        tag: 'discount',
        tag_text: '折扣',
        sort_order: 75
      },
      {
        name: '收藏卡套装',
        description: '精美印刷收藏卡，用于盲盒交换活动',
        price: 15,
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        category: 'other',
        stock: 300,
        sort_order: 60
      },
      {
        name: '限定款收藏证书',
        description: '用于记录盲盒收藏信息，含收藏编号',
        price: 42,
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
        category: 'collectible',
        stock: 60,
        tag: 'new',
        tag_text: '新品',
        sort_order: 80
      }
    ];

    for (const productData of hotProductsData) {
      await HotProduct.create(productData);
    }

    console.log('✅ 热门周边数据创建完成');

    // ============ 积分商品 ============
    const pointsProductsData = [
      {
        name: '限量款收纳盒',
        description: '精美设计的收纳盒，可容纳多个标准盲盒，透明亚克力材质',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        points_required: 500,
        stock: 50,
        category: 'gift',
        exchange_limit: 2
      },
      {
        name: '10元无门槛优惠券',
        description: '全场通用，无门槛使用，有效期30天',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
        points_required: 100,
        stock: 200,
        category: 'coupon',
        exchange_limit: 5
      },
      {
        name: '20元代金券',
        description: '满100元可用，有效期30天',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
        points_required: 150,
        stock: 150,
        category: 'voucher',
        exchange_limit: 3
      },
      {
        name: '限定款钥匙扣',
        description: '盲盒星球限定款钥匙扣，精美礼盒包装',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        points_required: 300,
        stock: 100,
        category: 'gift',
        exchange_limit: 2
      },
      {
        name: '50元代金券',
        description: '满200元可用，有效期30天',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
        points_required: 350,
        stock: 80,
        category: 'voucher',
        exchange_limit: 2
      },
      {
        name: '限定T恤',
        description: '100%纯棉材质，舒适透气，多尺码可选',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
        points_required: 800,
        stock: 30,
        category: 'gift',
        exchange_limit: 1
      },
      {
        name: '精美展示台',
        description: 'LED灯效展示台，适合展示各类手办盲盒',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        points_required: 600,
        stock: 40,
        category: 'gift',
        exchange_limit: 1
      },
      {
        name: '100元代金券',
        description: '满500元可用，有效期30天',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
        points_required: 600,
        stock: 50,
        category: 'voucher',
        exchange_limit: 1
      }
    ];

    for (const productData of pointsProductsData) {
      await PointsProduct.create(productData);
    }

    console.log('✅ 积分商品数据创建完成');

    console.log('\n🎉 数据初始化完成！');
    console.log('  管理员账号: admin@blindbox.com / admin123');
    console.log('  普通用户: user@blindbox.com / user123');

    process.exit(0);
  } catch (err) {
    console.error('❌ 数据初始化失败:', err);
    process.exit(1);
  }
}

seed();
