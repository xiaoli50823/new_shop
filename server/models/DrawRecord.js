/**
 * 抽盒记录模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DrawRecord = sequelize.define('DrawRecord', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  blind_box_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'blind_boxes', key: 'id' }
  },
  prize_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'prizes', key: 'id' }
  },
  prize_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  prize_rarity: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  draw_type: {
    type: DataTypes.ENUM('single', 'five', 'ten'),
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'draw_records',
  // 使用 created_at 而非默认的 createdAt
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = DrawRecord;
