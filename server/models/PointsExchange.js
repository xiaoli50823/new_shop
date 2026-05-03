/**
 * 积分兑换记录模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointsExchange = sequelize.define('PointsExchange', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'points_products',
      key: 'id'
    }
  },
  points_used: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending',
    comment: 'pending-待处理, completed-已完成, cancelled-已取消'
  },
  recipient_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '收货人姓名'
  },
  recipient_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '收货人电话'
  },
  recipient_address: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '收货地址'
  },
  remark: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'points_exchanges',
  timestamps: true
});

module.exports = PointsExchange;
