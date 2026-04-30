const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

class Review extends Model {}

Review.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productType: {
    type: DataTypes.ENUM('blindBox', 'product'),
    defaultValue: 'blindBox'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.TEXT
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  replies: {
    type: DataTypes.TEXT
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Review',
  tableName: 'reviews'
});

module.exports = Review;