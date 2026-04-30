/**
 * 参数校验中间件 - 使用 express-validator
 */
const { body, param, query, validationResult } = require('express-validator');

/**
 * 处理校验结果的统一中间件
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      message: errors.array().map(e => e.msg).join('; ')
    });
  }
  next();
};

// ============ 校验规则 ============

const registerRules = [
  body('username').notEmpty().withMessage('用户名不能为空').isLength({ max: 50 }).withMessage('用户名最长50字符'),
  body('email').notEmpty().withMessage('邮箱不能为空').isEmail().withMessage('邮箱格式不正确'),
  body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('phone').optional().isLength({ max: 20 }),
  handleValidationErrors
];

const loginRules = [
  body('email').notEmpty().withMessage('邮箱不能为空').isEmail().withMessage('邮箱格式不正确'),
  body('password').notEmpty().withMessage('密码不能为空'),
  handleValidationErrors
];

const createBlindBoxRules = [
  body('name').notEmpty().withMessage('盲盒名称不能为空'),
  body('price').notEmpty().withMessage('价格不能为空').isFloat({ gt: 0 }).withMessage('价格必须大于0'),
  body('type').optional().isIn(['lottery', 'infinite', 'hash']).withMessage('类型不合法'),
  handleValidationErrors
];

const createOrderRules = [
  body('type').notEmpty().withMessage('订单类型不能为空').isIn(['purchase', 'shipment', 'draw']),
  body('total').notEmpty().withMessage('订单金额不能为空').isFloat({ gt: 0 }),
  handleValidationErrors
];

const drawRules = [
  body('drawType').optional().isIn(['single', 'five', 'ten']).withMessage('抽盒类型不合法'),
  handleValidationErrors
];

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量1-100'),
  handleValidationErrors
];

const idParamRules = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerRules,
  loginRules,
  createBlindBoxRules,
  createOrderRules,
  drawRules,
  paginationRules,
  idParamRules
};
