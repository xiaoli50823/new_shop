/**
 * 订单项模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'orders', key: 'id' }
  },
  blind_box_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'blind_boxes', key: 'id' }
  },
  prize_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'prizes', key: 'id' }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  rarity: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'order_items',
  timestamps: true
});

module.exports = OrderItem;
