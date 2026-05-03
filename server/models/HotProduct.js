/**
 * 热门周边商品模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HotProduct = sequelize.define('HotProduct', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '商品名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品描述'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '盲盒币价格'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '原价'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '商品图片'
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品图片列表(JSON)'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '分类: display-展示柜, accessory-配件, collectible-收藏品, other-其他'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: '库存'
  },
  sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '销量'
  },
  tag: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '标签: hot-热门, new-新品, discount-折扣'
  },
  tag_text: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '标签文字'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '状态'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  }
}, {
  tableName: 'hot_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HotProduct;
