/**
 * 清空所有表数据（开发用）
 * 运行: node seeders/drop.js
 */
require('dotenv').config();
const { sequelize } = require('../models');

async function drop() {
  try {
    console.log('🔄 开始清空数据库...');
    await sequelize.authenticate();

    // 禁用外键检查，按依赖顺序删除
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'draw_records',
      'user_cabinets',
      'coupons',
      'order_items',
      'orders',
      'prizes',
      'blind_boxes',
      'users'
    ];

    for (const table of tables) {
      await sequelize.query(`TRUNCATE TABLE \`${table}\``);
      console.log(`  ✅ 清空表: ${table}`);
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n🎉 所有表数据已清空！');
    process.exit(0);
  } catch (err) {
    console.error('❌ 清空失败:', err);
    process.exit(1);
  }
}

drop();
