const sequelize = require('./database');
const User = require('../models/mysql/User');
const BlindBox = require('../models/mysql/BlindBox');
const Order = require('../models/mysql/Order');
const Address = require('../models/mysql/Address');
const Notification = require('../models/mysql/Notification');
const Favorite = require('../models/mysql/Favorite');
const Review = require('../models/mysql/Review');
const BoxCabinet = require('../models/mysql/BoxCabinet');

const initDB = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('数据库表同步成功');
    
    // 检查是否有初始数据
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('正在初始化数据...');
      
      // 创建管理员用户
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'admin',
        status: 'active'
      });
      
      // 创建测试用户
      await User.create({
        username: '星球探索家',
        email: 'user@example.com',
        password: '123456',
        role: 'user',
        status: 'active',
        points: 12580,
        blindBoxCoin: 688,
        checkInDays: 7
      });
      
      // 创建初始盲盒数据
      const blindBoxData = [
        {
          name: '海贼王一番赏',
          price: 39,
          type: 'lottery',
          image: 'https://img.freepik.com/free-photo/anime-action-figures-collection_23-2149307011.jpg',
          status: 'active',
          stock: 128,
          initialStock: 128,
          stockPercentage: 60,
          tag: 'limited',
          tagText: '限量'
        },
        {
          name: '鬼灭之刃一番赏',
          price: 49,
          type: 'lottery',
          image: 'https://img.freepik.com/free-photo/anime-character-figures_23-2149307007.jpg',
          status: 'active',
          stock: 88,
          initialStock: 88,
          stockPercentage: 45,
          tag: 'hot',
          tagText: '热门'
        },
        {
          name: '龙珠一番赏',
          price: 45,
          type: 'lottery',
          image: 'https://img.freepik.com/free-photo/dragon-ball-action-figures_23-2149307005.jpg',
          status: 'active',
          stock: 156,
          initialStock: 156,
          stockPercentage: 70,
          tag: 'new',
          tagText: '上新'
        },
        {
          name: '火影忍者一番赏',
          price: 42,
          type: 'lottery',
          image: 'https://img.freepik.com/free-photo/naruto-action-figures_23-2149307003.jpg',
          status: 'active',
          stock: 45,
          initialStock: 45,
          stockPercentage: 30,
          tag: 'warning',
          tagText: '告急'
        },
        {
          name: '潮玩手办盲盒',
          price: 29,
          type: 'infinite',
          image: 'https://img.freepik.com/free-photo/trendy-toy-collection_23-2149307012.jpg',
          status: 'active',
          stock: 999,
          initialStock: 999,
          tag: 'hot',
          tagText: '热门'
        },
        {
          name: '美妆盲盒',
          price: 59,
          type: 'infinite',
          image: 'https://img.freepik.com/free-photo/beauty-products-collection_23-2148897904.jpg',
          status: 'active',
          stock: 999,
          initialStock: 999,
          tag: 'new',
          tagText: '上新'
        },
        {
          name: '3C数码盲盒',
          price: 99,
          type: 'infinite',
          image: 'https://img.freepik.com/free-photo/electronic-gadgets-collection_23-2149307010.jpg',
          status: 'active',
          stock: 999,
          initialStock: 999,
          tag: 'hot',
          tagText: '热门'
        },
        {
          name: '文具盲盒',
          price: 19,
          type: 'infinite',
          image: 'https://img.freepik.com/free-photo/stationery-items-collection_23-2149307008.jpg',
          status: 'active',
          stock: 999,
          initialStock: 999,
          tag: 'discount',
          tagText: '折扣'
        }
      ];
      
      await BlindBox.bulkCreate(blindBoxData);
      console.log('初始数据创建完成');
    }
    
    return true;
  } catch (err) {
    console.error('数据库初始化失败:', err.message);
    return false;
  }
};

module.exports = initDB;