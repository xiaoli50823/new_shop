/**
 * 购物车模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
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
  blind_box_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'blind_boxes',
      key: 'id'
    }
  },
  hot_product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'hot_products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  }
}, {
  tableName: 'carts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'blind_box_id', 'hot_product_id']
    }
  ]
});

module.exports = Cart;
