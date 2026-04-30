const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

class Order extends Model {}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('purchase', 'shipment'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipping', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  items: {
    type: DataTypes.TEXT
  },
  shippingInfo: {
    type: DataTypes.TEXT
  },
  paymentInfo: {
    type: DataTypes.TEXT
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders',
  hooks: {
    beforeSave: (order) => {
      order.updatedAt = new Date();
    }
  }
});

module.exports = Order;