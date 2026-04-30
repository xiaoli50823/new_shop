/**
 * 用户盒柜模型 - Sequelize
 * 记录用户抽中但尚未发货/回收的商品
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCabinet = sequelize.define('UserCabinet', {
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
  prize_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'prizes', key: 'id' }
  },
  blind_box_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'blind_boxes', key: 'id' }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  rarity: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'shipped', 'recycled'),
    defaultValue: 'pending'
  },
  draw_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ship_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  recycle_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'user_cabinets'
});

module.exports = UserCabinet;
