/**
 * 积分商品模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointsProduct = sequelize.define('PointsProduct', {
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
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  points_required: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '所需积分'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '库存数量'
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'gift',
    comment: '商品分类: gift-礼品, coupon-优惠券, voucher-代金券'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  exchange_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '每人限兑次数'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '兑换开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '兑换结束时间'
  }
}, {
  tableName: 'points_products'
});

module.exports = PointsProduct;
