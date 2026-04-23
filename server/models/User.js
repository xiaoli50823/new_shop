const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  avatar: {
    type: String
  },
  vipLevel: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 0
  },
  blindBoxCoin: {
    type: Number,
    default: 0
  },
  coupons: [
    {
      id: {
        type: Number
      },
      type: {
        type: String
      },
      value: {
        type: Number
      },
      expireAt: {
        type: Date
      }
    }
  ],
  tools: {
    perspectiveCard: {
      type: Number,
      default: 0
    },
    hintCard: {
      type: Number,
      default: 0
    }
  },
  checkInDays: {
    type: Number,
    default: 0
  },
  lastCheckIn: {
    type: Date
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 密码加密
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 验证密码
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// 保存前更新updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;