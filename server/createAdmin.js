/**
 * 创建管理员账号
 * 运行方式: node createAdmin.js
 */
const { User } = require('./models');

async function createAdmin() {
  try {
    console.log('🔄 开始创建管理员账号...');

    const adminData = {
      username: 'admin',
      email: 'admin@blindbox.com',
      password: 'admin123',
      phone: '13800138000',
      role: 'admin',
      vip_level: 10,
      points: 100000,
      blind_box_coin: 10000,
      status: 'active'
    };

    const [admin, created] = await User.findOrCreate({
      where: { email: adminData.email },
      defaults: adminData
    });

    if (created) {
      console.log('✅ 管理员账号创建成功！');
      console.log('📧 邮箱: admin@blindbox.com');
      console.log('🔑 密码: admin123');
      console.log('👤 用户名: admin');
    } else {
      console.log('ℹ️  管理员账号已存在');
      console.log('📧 邮箱: admin@blindbox.com');
      console.log('🔑 密码: admin123 (如果需要重置密码，请手动修改数据库)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 创建管理员账号失败:', error);
    process.exit(1);
  }
}

createAdmin();
