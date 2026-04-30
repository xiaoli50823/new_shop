const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

class BoxCabinet extends Model {}

BoxCabinet.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING
  },
  rarity: {
    type: DataTypes.ENUM('common', 'rare', 'hidden'),
    defaultValue: 'common'
  },
  status: {
    type: DataTypes.ENUM('pending', 'shipped', 'recycled'),
    defaultValue: 'pending'
  },
  drawTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  shipTime: {
    type: DataTypes.DATE
  },
  trackingNumber: {
    type: DataTypes.STRING
  },
  shippingInfo: {
    type: DataTypes.TEXT
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'BoxCabinet',
  tableName: 'box_cabinets'
});

module.exports = BoxCabinet;