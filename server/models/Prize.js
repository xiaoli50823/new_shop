/**
 * 奖品模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prize = sequelize.define('Prize', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  blind_box_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'blind_boxes', key: 'id' }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  rarity: {
    type: DataTypes.ENUM('common', 'rare', 'hidden'),
    defaultValue: 'common'
  },
  probability: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: '概率百分比，如 50.00 表示 50%'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'prizes'
});

module.exports = Prize;
