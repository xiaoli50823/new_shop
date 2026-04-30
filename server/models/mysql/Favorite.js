const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

class Favorite extends Model {}

Favorite.init({
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
  productType: {
    type: DataTypes.ENUM('blindBox', 'product'),
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Favorite',
  tableName: 'favorites',
  uniqueKeys: {
    unique_favorite: {
      fields: ['userId', 'productId', 'productType']
    }
  }
});

module.exports = Favorite;