const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const bcrypt = require('bcryptjs');

class User extends Model {
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password);
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  avatar: {
    type: DataTypes.STRING
  },
  vipLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  blindBoxCoin: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  coupons: {
    type: DataTypes.TEXT
  },
  tools: {
    type: DataTypes.TEXT
  },
  checkInDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastCheckIn: {
    type: DataTypes.DATE
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'banned'),
    defaultValue: 'active'
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
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      user.updatedAt = new Date();
    }
  }
});

module.exports = User;