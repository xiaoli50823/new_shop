/**
 * 初始化热门周边商品数据
 */
const { sequelize, HotProduct } = require('./models');

async function initHotProducts() {
  try {
    console.log('🔄 开始初始化热门周边商品数据...');

    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    await HotProduct.sync({ force: false });
    console.log('✅ 热门周边商品表同步完成');

    const hotProductsData = [
      {
        name: '亚克力展示柜（三层）',
        description: '高品质亚克力材质，三层设计，完美展示您的盲盒收藏',
        price: 199,
        original_price: 259,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=acrylic%20display%20case%20three%20tiers%20for%20blind%20box%20figures&image_size=square',
        category: 'display',
        stock: 500,
        sales: 320,
        tag: 'hot',
        tag_text: '热门',
        status: 'active',
        sort_order: 100
      },
      {
        name: 'LED旋转展示台',
        description: '带LED灯光的旋转展示台，让您的盲盒更加炫酷',
        price: 299,
        original_price: 399,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=LED%20rotating%20display%20stand%20for%20collectible%20figures&image_size=square',
        category: 'display',
        stock: 300,
        sales: 185,
        tag: 'hot',
        tag_text: '热门',
        status: 'active',
        sort_order: 95
      },
      {
        name: '透明防尘展示盒（大号）',
        description: '透明防尘设计，保护您的珍贵盲盒',
        price: 89,
        original_price: 119,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=clear%20dustproof%20display%20box%20for%20figures&image_size=square',
        category: 'display',
        stock: 1000,
        sales: 520,
        tag: 'discount',
        tag_text: '折扣',
        status: 'active',
        sort_order: 90
      },
      {
        name: '盲盒专属钥匙扣',
        description: '精美钥匙扣，可以挂载您喜爱的小盲盒',
        price: 29,
        original_price: null,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20keychain%20for%20blind%20box%20figures&image_size=square',
        category: 'accessory',
        stock: 2000,
        sales: 890,
        tag: 'hot',
        tag_text: '热门',
        status: 'active',
        sort_order: 85
      },
      {
        name: '盲盒收藏册（50页）',
        description: '专业收藏册，可以放置盲盒卡片和贴纸',
        price: 49,
        original_price: 69,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=collectible%20album%20book%20for%20cards%20and%20stickers&image_size=square',
        category: 'accessory',
        stock: 800,
        sales: 410,
        tag: 'new',
        tag_text: '新品',
        status: 'active',
        sort_order: 80
      },
      {
        name: '盲盒清洁套装',
        description: '专业清洁工具，保持您的盲盒光亮如新',
        price: 39,
        original_price: null,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cleaning%20kit%20for%20collectible%20figures&image_size=square',
        category: 'accessory',
        stock: 1500,
        sales: 280,
        tag: null,
        tag_text: null,
        status: 'active',
        sort_order: 75
      },
      {
        name: '限量版收藏证书套装',
        description: '专业收藏证书，记录您的盲盒收藏历程',
        price: 99,
        original_price: null,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=collectible%20certificate%20set%20for%20blind%20box&image_size=square',
        category: 'collectible',
        stock: 200,
        sales: 150,
        tag: 'new',
        tag_text: '新品',
        status: 'active',
        sort_order: 70
      },
      {
        name: '盲盒主题帆布袋',
        description: '时尚帆布袋，印有精美盲盒图案',
        price: 59,
        original_price: 79,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20canvas%20bag%20with%20blind%20box%20design&image_size=square',
        category: 'other',
        stock: 600,
        sales: 340,
        tag: 'discount',
        tag_text: '折扣',
        status: 'active',
        sort_order: 65
      },
      {
        name: '盲盒主题马克杯',
        description: '精美陶瓷马克杯，盲盒爱好者必备',
        price: 45,
        original_price: null,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20ceramic%20mug%20with%20blind%20box%20design&image_size=square',
        category: 'other',
        stock: 900,
        sales: 420,
        tag: null,
        tag_text: null,
        status: 'active',
        sort_order: 60
      },
      {
        name: '盲盒收纳盒（大容量）',
        description: '大容量收纳盒，可存放50+盲盒',
        price: 129,
        original_price: 169,
        image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=large%20storage%20box%20for%20blind%20box%20collection&image_size=square',
        category: 'accessory',
        stock: 400,
        sales: 260,
        tag: 'hot',
        tag_text: '热门',
        status: 'active',
        sort_order: 55
      }
    ];

    for (const productData of hotProductsData) {
      const [product, created] = await HotProduct.findOrCreate({
        where: { name: productData.name },
        defaults: productData
      });

      if (created) {
        console.log(`✅ 创建商品: ${productData.name}`);
      } else {
        console.log(`ℹ️  商品已存在: ${productData.name}`);
      }
    }

    console.log('✅ 热门周边商品数据初始化完成！');
    console.log(`📊 共处理 ${hotProductsData.length} 个商品`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化热门周边商品数据失败:', error);
    process.exit(1);
  }
}

initHotProducts();
