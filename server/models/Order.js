const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'shipment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipping', 'completed', 'cancelled'],
    default: 'pending'
  },
  total: {
    type: Number,
    required: true
  },
  items: [
    {
      blindBoxId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlindBox'
      },
      productId: {
        type: Number
      },
      name: {
        type: String,
        required: true
      },
      image: {
        type: String
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  shippingInfo: {
    address: {
      type: String
    },
    contact: {
      type: String
    },
    phone: {
      type: String
    },
    trackingNumber: {
      type: String
    }
  },
  paymentInfo: {
    method: {
      type: String
    },
    transactionId: {
      type: String
    }
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
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;