/**
 * 盲盒数据初始化脚本
 * 运行方式: node initBlindBoxes.js
 */
const { sequelize, BlindBox, Prize } = require('./models');

const blindBoxesData = [
  // ============ 动漫系列 ============
  {
    name: '火影忍者系列盲盒',
    category: 'anime',
    price: 49,
    originalPrice: 59,
    stock: 5000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=naruto%20uzumaki%20blind%20box%20figure%20anime%20collectible&image_size=square',
    description: '火影忍者系列盲盒，忍者们来啦！',
    status: 'active',
    tag: 'hot',
    tag_text: '热门',
    total_draws: 3200,
    prizes: [
      { name: '漩涡鸣人', weight: 15, image: '' },
      { name: '宇智波佐助', weight: 15, image: '' },
      { name: '春野樱', weight: 12, image: '' },
      { name: '旗木卡卡西', weight: 12, image: '' },
      { name: '我爱罗', weight: 10, image: '' },
      { name: '纲手', weight: 8, image: '' },
      { name: '自来也', weight: 8, image: '' },
      { name: '大蛇丸', weight: 8, image: '' },
      { name: '波风水门', weight: 6, image: '' },
      { name: '尾兽玉', weight: 6, image: '' }
    ]
  },
  {
    name: '海贼王系列盲盒',
    category: 'anime',
    price: 69,
    originalPrice: 79,
    stock: 4500,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=one%20piece%20luffy%20blind%20box%20anime%20figure&image_size=square',
    description: '海贼王系列盲盒，草帽团来啦！',
    status: 'active',
    tag: 'new',
    tag_text: '上新',
    total_draws: 1800,
    prizes: [
      { name: '路飞', weight: 15, image: '' },
      { name: '索隆', weight: 12, image: '' },
      { name: '娜美', weight: 12, image: '' },
      { name: '乌索普', weight: 10, image: '' },
      { name: '山治', weight: 10, image: '' },
      { name: '乔巴', weight: 10, image: '' },
      { name: '罗宾', weight: 8, image: '' },
      { name: '弗兰奇', weight: 8, image: '' },
      { name: '布鲁克', weight: 8, image: '' },
      { name: '甚平', weight: 7, image: '' }
    ]
  },
  {
    name: '鬼灭之刃系列盲盒',
    category: 'anime',
    price: 39,
    originalPrice: 49,
    stock: 6000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=demon%20slayer%20tanjiro%20blind%20box%20anime%20figure&image_size=square',
    description: '鬼灭之刃系列盲盒，炭治郎和他的伙伴们！',
    status: 'active',
    tag: 'discount',
    tag_text: '折扣',
    total_draws: 1200,
    prizes: [
      { name: '灶门炭治郎', weight: 15, image: '' },
      { name: '灶门祢豆子', weight: 15, image: '' },
      { name: '我妻善逸', weight: 12, image: '' },
      { name: '嘴平伊之助', weight: 12, image: '' },
      { name: '蝴蝶忍', weight: 10, image: '' },
      { name: '炼狱杏寿郎', weight: 10, image: '' },
      { name: '富冈义勇', weight: 8, image: '' },
      { name: '甘露寺蜜璃', weight: 6, image: '' },
      { name: '宇髓天元', weight: 6, image: '' },
      { name: '悲鸣屿行冥', weight: 6, image: '' }
    ]
  },
  {
    name: '咒术回战盲盒',
    category: 'anime',
    price: 59,
    originalPrice: 69,
    stock: 4000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=jujutsu%20kaisen%20gojo%20blind%20box%20anime%20figure&image_size=square',
    description: '咒术回战系列盲盒，咒术师们登场！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 980,
    prizes: [
      { name: '五条悟', weight: 12, image: '' },
      { name: '虎杖悠仁', weight: 12, image: '' },
      { name: '伏黑惠', weight: 10, image: '' },
      { name: '钉崎野蔷薇', weight: 10, image: '' },
      { name: '七海建人', weight: 8, image: '' },
      { name: '禅院真希', weight: 8, image: '' },
      { name: '狗卷棘', weight: 8, image: '' },
      { name: '熊猫', weight: 8, image: '' },
      { name: '宿傩', weight: 6, image: '' },
      { name: '乙骨忧太', weight: 6, image: '' },
      { name: '夏油杰', weight: 6, image: '' },
      { name: '天内理子', weight: 6, image: '' }
    ]
  },

  // ============ 游戏系列 ============
  {
    name: '赛博朋克2077盲盒',
    category: 'game',
    price: 59,
    originalPrice: 79,
    stock: 3000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cyberpunk%202077%20v%20jacket%20blind%20box%20figure&image_size=square',
    description: '赛博朋克2077联名盲盒，夜之城等你来！',
    status: 'active',
    tag: 'hot',
    tag_text: '热门',
    total_draws: 2300,
    prizes: [
      { name: 'V（强尼服装）', weight: 15, image: '' },
      { name: 'V（流浪者服装）', weight: 12, image: '' },
      { name: 'V（街头小子服装）', weight: 12, image: '' },
      { name: '银手强尼', weight: 15, image: '' },
      { name: '朱迪', weight: 10, image: '' },
      { name: '帕南', weight: 10, image: '' },
      { name: '瑞弗', weight: 8, image: '' },
      { name: '罗格', weight: 8, image: '' },
      { name: '亚当重锤', weight: 5, image: '' },
      { name: '德拉曼', weight: 5, image: '' }
    ]
  },
  {
    name: '原神系列盲盒',
    category: 'game',
    price: 79,
    originalPrice: 89,
    stock: 5500,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=genshin%20impact%20character%20blind%20box%20figure%20kazuha&image_size=square',
    description: '原神系列盲盒，原石等你来抽！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 1560,
    prizes: [
      { name: '钟离', weight: 6, image: '' },
      { name: '温迪', weight: 6, image: '' },
      { name: '雷电将军', weight: 6, image: '' },
      { name: '枫原万叶', weight: 8, image: '' },
      { name: '甘雨', weight: 8, image: '' },
      { name: '胡桃', weight: 8, image: '' },
      { name: '宵宫', weight: 8, image: '' },
      { name: '珊瑚宫心海', weight: 8, image: '' },
      { name: '荒泷一斗', weight: 8, image: '' },
      { name: '纳西妲', weight: 6, image: '' },
      { name: '流浪者', weight: 8, image: '' },
      { name: '那维莱特', weight: 8, image: '' }
    ]
  },
  {
    name: '塞尔达传说盲盒',
    category: 'game',
    price: 89,
    originalPrice: 99,
    stock: 2500,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=zelda%20link%20legend%20of%20zelda%20blind%20box%20figure&image_size=square',
    description: '塞尔达传说系列，林克来啦！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 890,
    prizes: [
      { name: '林克（经典）', weight: 15, image: '' },
      { name: '林克（大师剑）', weight: 12, image: '' },
      { name: '林克（英杰服）', weight: 12, image: '' },
      { name: '塞尔达公主', weight: 15, image: '' },
      { name: '米法', weight: 10, image: '' },
      { name: '力巴尔', weight: 8, image: '' },
      { name: '达尔克尔', weight: 8, image: '' },
      { name: '乌尔波扎', weight: 8, image: '' },
      { name: '科罗克', weight: 6, image: '' },
      { name: '巴布尔', weight: 6, image: '' }
    ]
  },

  // ============ 潮玩手办 ============
  {
    name: 'Molly潮流盲盒',
    category: 'figure',
    price: 69,
    originalPrice: 79,
    stock: 8000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=molly%20pop%20mart%20blind%20box%20cute%20character&image_size=square',
    description: 'Molly潮流盲盒，经典IP回归！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 2100,
    prizes: [
      { name: 'Molly-地球女儿', weight: 8, image: '' },
      { name: 'Molly-独角兽', weight: 8, image: '' },
      { name: 'Molly-小王子', weight: 8, image: '' },
      { name: 'Molly-职业系列', weight: 10, image: '' },
      { name: 'Molly-节日限定', weight: 10, image: '' },
      { name: 'Molly-星座系列', weight: 10, image: '' },
      { name: 'Molly-幻想系列', weight: 10, image: '' },
      { name: 'Molly-隐藏款', weight: 6, image: '' },
      { name: 'Molly-特别款', weight: 15, image: '' },
      { name: 'Molly-普通款', weight: 15, image: '' }
    ]
  },
  {
    name: 'Dimoo盲盒',
    category: 'figure',
    price: 59,
    originalPrice: 69,
    stock: 7000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=dimoo%20pop%20mart%20blind%20box%20cute%20character&image_size=square',
    description: 'Dimoo盲盒，梦境世界等你探索！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 1340,
    prizes: [
      { name: 'Dimoo-森林居士', weight: 10, image: '' },
      { name: 'Dimoo-小吃货', weight: 10, image: '' },
      { name: 'Dimoo-宇航员', weight: 10, image: '' },
      { name: 'Dimoo-驯鹿师', weight: 10, image: '' },
      { name: 'Dimoo-渔夫', weight: 10, image: '' },
      { name: 'Dimoo-隐藏款', weight: 6, image: '' },
      { name: 'Dimoo-特别款', weight: 14, image: '' },
      { name: 'Dimoo-普通款', weight: 15, image: '' },
      { name: 'Dimoo-节日款', weight: 10, image: '' },
      { name: 'Dimoo-限定款', weight: 5, image: '' }
    ]
  },
  {
    name: 'Skullpanda盲盒',
    category: 'figure',
    price: 69,
    originalPrice: 79,
    stock: 5000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=skullpanda%20pop%20mart%20blind%20box%20dark%20cute&image_size=square',
    description: 'Skullpanda盲盒，暗黑系潮玩！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 920,
    prizes: [
      { name: 'Skullpanda-暗黑系列', weight: 12, image: '' },
      { name: 'Skullpanda-天使系列', weight: 12, image: '' },
      { name: 'Skullpanda-恶魔系列', weight: 12, image: '' },
      { name: 'Skullpanda-日常系列', weight: 14, image: '' },
      { name: 'Skullpanda-节日系列', weight: 10, image: '' },
      { name: 'Skullpanda-隐藏款', weight: 6, image: '' },
      { name: 'Skullpanda-特别款', weight: 14, image: '' },
      { name: 'Skullpanda-普通款', weight: 20, image: '' }
    ]
  },

  // ============ 影视IP ============
  {
    name: '迪士尼100周年盲盒',
    category: 'movie',
    price: 79,
    originalPrice: 99,
    stock: 3000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=disney%20100th%20anniversary%20mickey%20minnie%20blind%20box&image_size=square',
    description: '迪士尼100周年限定盲盒！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 956,
    prizes: [
      { name: '米奇', weight: 10, image: '' },
      { name: '米妮', weight: 10, image: '' },
      { name: '唐老鸭', weight: 10, image: '' },
      { name: '黛西', weight: 10, image: '' },
      { name: '高飞', weight: 8, image: '' },
      { name: '布鲁托', weight: 8, image: '' },
      { name: '奇奇蒂蒂', weight: 10, image: '' },
      { name: '史迪奇', weight: 10, image: '' },
      { name: '朱迪尼克', weight: 8, image: '' },
      { name: '100周年纪念款', weight: 6, image: '' }
    ]
  },
  {
    name: '宝可梦系列盲盒',
    category: 'movie',
    price: 49,
    originalPrice: 59,
    stock: 10000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=pokemon%20pikachu%20blind%20box%20cute%20pocket%20monsters&image_size=square',
    description: '宝可梦系列盲盒，皮卡丘等你来！',
    status: 'active',
    tag: 'hot',
    tag_text: '热门',
    total_draws: 4100,
    prizes: [
      { name: '皮卡丘', weight: 15, image: '' },
      { name: '伊布', weight: 10, image: '' },
      { name: '杰尼龟', weight: 8, image: '' },
      { name: '小火龙', weight: 8, image: '' },
      { name: '妙蛙种子', weight: 8, image: '' },
      { name: '胖丁', weight: 8, image: '' },
      { name: '可达鸭', weight: 8, image: '' },
      { name: '卡比兽', weight: 6, image: '' },
      { name: '梦幻', weight: 4, image: '' },
      { name: '超梦', weight: 4, image: '' },
      { name: '烈焰马', weight: 6, image: '' },
      { name: '水箭龟', weight: 5, image: '' },
      { name: '喷火龙', weight: 5, image: '' },
      { name: '化石翼龙', weight: 5, image: '' }
    ]
  },

  // ============ 设计师款 ============
  {
    name: 'Kasing Chung盲盒',
    category: 'designer',
    price: 89,
    originalPrice: 99,
    stock: 2000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=kasing%20chung%20designer%20blind%20box%20art%20toy&image_size=square',
    description: 'Kasing Chung设计师限量盲盒！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 680,
    prizes: [
      { name: 'Kasing-日落系列', weight: 15, image: '' },
      { name: 'Kasing-星空系列', weight: 15, image: '' },
      { name: 'Kasing-海洋系列', weight: 15, image: '' },
      { name: 'Kasing-森林系列', weight: 15, image: '' },
      { name: 'Kasing-隐藏款', weight: 10, image: '' },
      { name: 'Kasing-艺术家合作款', weight: 15, image: '' },
      { name: 'Kasing-限定款', weight: 15, image: '' }
    ]
  },
  {
    name: 'Lang盲盒',
    category: 'designer',
    price: 99,
    originalPrice: 119,
    stock: 1500,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=lang%20designer%20blind%20box%20art%20toy%20bear&image_size=square',
    description: 'Lang设计师艺术盲盒！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 520,
    prizes: [
      { name: 'Lang-艺术家系列', weight: 20, image: '' },
      { name: 'Lang-联名系列', weight: 20, image: '' },
      { name: 'Lang-节日系列', weight: 15, image: '' },
      { name: 'Lang-隐藏款', weight: 10, image: '' },
      { name: 'Lang-特别款', weight: 20, image: '' },
      { name: 'Lang-限定款', weight: 15, image: '' }
    ]
  },

  // ============ 节日潮玩 ============
  {
    name: '春节限定盲盒',
    category: 'holiday',
    price: 59,
    originalPrice: 69,
    stock: 8000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20new%20year%20blind%20box%20spring%20festival%20red&image_size=square',
    description: '春节限定盲盒，喜庆来袭！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 1870,
    prizes: [
      { name: '福袋鼠', weight: 15, image: '' },
      { name: '财神到', weight: 15, image: '' },
      { name: '招财猫', weight: 12, image: '' },
      { name: '年年有余', weight: 12, image: '' },
      { name: '团圆饭', weight: 10, image: '' },
      { name: '放鞭炮', weight: 10, image: '' },
      { name: '贴春联', weight: 10, image: '' },
      { name: '压岁钱', weight: 8, image: '' },
      { name: '隐藏款-龙', weight: 4, image: '' },
      { name: '隐藏款-凤', weight: 4, image: '' }
    ]
  },
  {
    name: '圣诞节盲盒',
    category: 'holiday',
    price: 49,
    originalPrice: 59,
    stock: 6000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=christmas%20blind%20box%20santa%20snowman%20holiday&image_size=square',
    description: '圣诞节限定盲盒，圣诞惊喜！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 1240,
    prizes: [
      { name: '圣诞老人', weight: 15, image: '' },
      { name: '驯鹿', weight: 12, image: '' },
      { name: '雪人', weight: 12, image: '' },
      { name: '圣诞树', weight: 10, image: '' },
      { name: '圣诞袜', weight: 10, image: '' },
      { name: '姜饼人', weight: 10, image: '' },
      { name: '圣诞礼物', weight: 10, image: '' },
      { name: '隐藏款-圣诞惊喜', weight: 6, image: '' },
      { name: '限定款-冰雪女王', weight: 15, image: '' }
    ]
  },
  {
    name: '万圣节盲盒',
    category: 'holiday',
    price: 49,
    originalPrice: 59,
    stock: 5000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=halloween%20blind%20box%20pumpkin%20ghost%20spooky&image_size=square',
    description: '万圣节限定盲盒，Trick or Treat！',
    status: 'active',
    tag: null,
    tag_text: null,
    total_draws: 980,
    prizes: [
      { name: '南瓜杰克', weight: 15, image: '' },
      { name: '吸血鬼', weight: 12, image: '' },
      { name: '女巫', weight: 12, image: '' },
      { name: '幽灵', weight: 10, image: '' },
      { name: '骷髅', weight: 10, image: '' },
      { name: '狼人', weight: 10, image: '' },
      { name: '蝙蝠', weight: 10, image: '' },
      { name: '黑猫', weight: 10, image: '' },
      { name: '隐藏款-恶魔', weight: 6, image: '' },
      { name: '限定款-血腥玛丽', weight: 5, image: '' }
    ]
  }
];

async function initBlindBoxes() {
  try {
    console.log('🔄 开始初始化盲盒数据...');

    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 禁用外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 更新表结构 - 添加category和original_price字段
    try {
      await sequelize.query('ALTER TABLE blind_boxes ADD COLUMN category VARCHAR(50)');
    } catch (e) {
      // 忽略列已存在的错误
    }
    try {
      await sequelize.query('ALTER TABLE blind_boxes ADD COLUMN original_price DECIMAL(10,2)');
    } catch (e) {
      // 忽略列已存在的错误
    }
    console.log('✅ 表结构更新完成');
    
    // 清除现有数据
    await Prize.destroy({ where: {}, force: true });
    await BlindBox.destroy({ where: {}, force: true });
    console.log('🗑️ 已清空现有盲盒数据');
    
    // 重新启用外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // 插入新数据
    for (const boxData of blindBoxesData) {
      const { prizes, ...boxInfo } = boxData;
      
      const [blindBox] = await BlindBox.findOrCreate({
        where: { name: boxInfo.name },
        defaults: boxInfo
      });

      if (prizes && prizes.length > 0) {
        const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
        const prizeData = prizes.map(prize => {
          const probability = (prize.weight / totalWeight * 100).toFixed(2);
          let rarity = 'common';
          if (prize.weight <= 5) rarity = 'hidden';
          else if (prize.weight <= 10) rarity = 'rare';
          
          return {
            blind_box_id: blindBox.id,
            name: prize.name,
            probability: probability,
            rarity: rarity,
            image: prize.image || '',
            stock: 0,
            description: `${prize.weight}% 概率`
          };
        });

        await Prize.bulkCreate(prizeData);
      }

      console.log(`✅ 已添加: ${boxInfo.name} (${prizes?.length || 0}个奖品)`);
    }

    // 统计
    const boxCount = await BlindBox.count();
    const prizeCount = await Prize.count();

    console.log('\n🎉 盲盒数据初始化完成！');
    console.log(`📦 盲盒总数: ${boxCount}`);
    console.log(`🎁 奖品总数: ${prizeCount}`);

    // 按分类统计
    const categories = await BlindBox.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category']
    });

    console.log('\n📊 分类统计:');
    categories.forEach(cat => {
      console.log(`  - ${cat.category}: ${cat.dataValues.count}个`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

initBlindBoxes();
