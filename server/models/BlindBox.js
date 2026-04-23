const mongoose = require('mongoose');

const blindBoxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['lottery', 'infinite', 'hash'],
    default: 'infinite'
  },
  image: {
    type: String
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  saleTime: {
    type: Date,
    default: Date.now
  },
  prizes: [
    {
      id: {
        type: Number
      },
      name: {
        type: String,
        required: true
      },
      image: {
        type: String
      },
      rarity: {
        type: String,
        enum: ['common', 'rare', 'hidden'],
        default: 'common'
      },
      probability: {
        type: Number,
        required: true
      },
      stock: {
        type: Number,
        default: 0
      }
    }
  ],
  guarantee: {
    type: Number,
    default: 0
  },
  maxHidden: {
    type: Number,
    default: 0
  },
  totalDraws: {
    type: Number,
    default: 0
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

// 保存前更新updatedAt
blindBoxSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const BlindBox = mongoose.model('BlindBox', blindBoxSchema);

module.exports = BlindBox;