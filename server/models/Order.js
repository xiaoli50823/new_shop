/**
 * 订单模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_no: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  type: {
    type: DataTypes.ENUM('purchase', 'shipment', 'draw'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipping', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  shipping_address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  shipping_contact: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  shipping_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  express_company: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'orders'
});

module.exports = Order;
