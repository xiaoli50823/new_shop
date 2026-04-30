const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'blind_box_shop',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false,
    pool: { max: 20, min: 5, acquire: 30000, idle: 10000 },
    define: { timestamps: true, underscored: true, charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
  }
);

module.exports = sequelize;
