const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

class BlindBox extends Model {}

BlindBox.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('lottery', 'infinite', 'hash'),
    defaultValue: 'infinite'
  },
  image: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  saleTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  prizes: {
    type: DataTypes.TEXT
  },
  guarantee: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxHidden: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalDraws: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 999
  },
  initialStock: {
    type: DataTypes.INTEGER,
    defaultValue: 999
  },
  stockPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  tag: {
    type: DataTypes.STRING
  },
  tagText: {
    type: DataTypes.STRING
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
  modelName: 'BlindBox',
  tableName: 'blind_boxes',
  hooks: {
    beforeSave: (blindBox) => {
      blindBox.updatedAt = new Date();
    }
  }
});

module.exports = BlindBox;