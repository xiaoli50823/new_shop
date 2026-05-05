/**
 * 盲盒模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlindBox = sequelize.define('BlindBox', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('lottery', 'infinite', 'hash'),
    defaultValue: 'infinite'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cover_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  sale_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '分类: anime-动漫, game-游戏, figure-潮玩, movie-影视, designer-设计师, holiday-节日'
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联分类ID'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '原价'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  guarantee: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '保底机制 - 抽多少次必出稀有'
  },
  max_hidden: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '防爆雷 - 最多出几个隐藏款'
  },
  total_draws: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tag: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tag_text: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'blind_boxes'
});

module.exports = BlindBox;
