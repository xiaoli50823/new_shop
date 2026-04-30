/**
 * 模型索引 - 建立所有关联关系并统一导出
 */
const sequelize = require('../config/database');
const User = require('./User');
const BlindBox = require('./BlindBox');
const Prize = require('./Prize');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const UserCabinet = require('./UserCabinet');
const Coupon = require('./Coupon');
const DrawRecord = require('./DrawRecord');

// ============ 关联关系 ============

// 盲盒 <-> 奖品 (一对多)
BlindBox.hasMany(Prize, { foreignKey: 'blind_box_id', as: 'prizes' });
Prize.belongsTo(BlindBox, { foreignKey: 'blind_box_id', as: 'blindBox' });

// 用户 <-> 订单 (一对多)
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 订单 <-> 订单项 (一对多)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// 盲盒 -> 订单项 (一对多)
BlindBox.hasMany(OrderItem, { foreignKey: 'blind_box_id', as: 'orderItems' });
OrderItem.belongsTo(BlindBox, { foreignKey: 'blind_box_id', as: 'blindBox' });

// 奖品 -> 订单项 (一对多)
Prize.hasMany(OrderItem, { foreignKey: 'prize_id', as: 'orderItems' });
OrderItem.belongsTo(Prize, { foreignKey: 'prize_id', as: 'prize' });

// 用户 <-> 盒柜 (一对多)
User.hasMany(UserCabinet, { foreignKey: 'user_id', as: 'cabinetItems' });
UserCabinet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 奖品 -> 盒柜 (一对多)
Prize.hasMany(UserCabinet, { foreignKey: 'prize_id', as: 'cabinetItems' });
UserCabinet.belongsTo(Prize, { foreignKey: 'prize_id', as: 'prize' });

// 盲盒 -> 盒柜 (一对多)
BlindBox.hasMany(UserCabinet, { foreignKey: 'blind_box_id', as: 'cabinetItems' });
UserCabinet.belongsTo(BlindBox, { foreignKey: 'blind_box_id', as: 'blindBox' });

// 用户 <-> 优惠券 (一对多)
User.hasMany(Coupon, { foreignKey: 'user_id', as: 'coupons' });
Coupon.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 用户 <-> 抽盒记录 (一对多)
User.hasMany(DrawRecord, { foreignKey: 'user_id', as: 'drawRecords' });
DrawRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 盲盒 -> 抽盒记录 (一对多)
BlindBox.hasMany(DrawRecord, { foreignKey: 'blind_box_id', as: 'drawRecords' });
DrawRecord.belongsTo(BlindBox, { foreignKey: 'blind_box_id', as: 'blindBox' });

// 奖品 -> 抽盒记录 (一对多)
Prize.hasMany(DrawRecord, { foreignKey: 'prize_id', as: 'drawRecords' });
DrawRecord.belongsTo(Prize, { foreignKey: 'prize_id', as: 'prize' });

module.exports = {
  sequelize,
  User,
  BlindBox,
  Prize,
  Order,
  OrderItem,
  UserCabinet,
  Coupon,
  DrawRecord
};
