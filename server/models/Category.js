/**
 * 盲盒分类模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true }
  },
  value: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true }
  },
  icon: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '分类图标URL'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序权重，越大越靠前'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'categories',
  timestamps: true
});

module.exports = Category;
