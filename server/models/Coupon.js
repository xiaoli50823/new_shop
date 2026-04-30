/**
 * 优惠券模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
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
  type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  min_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  expire_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'coupons'
});

module.exports = Coupon;
