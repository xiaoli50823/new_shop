/**
 * 用户模型 - Sequelize
 */
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: { notEmpty: true }
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  vip_level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  blind_box_coin: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  check_in_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_check_in: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'banned'),
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  // 密码加密钩子
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @returns {boolean}
 */
User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

/**
 * 序列化时隐藏密码
 */
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
