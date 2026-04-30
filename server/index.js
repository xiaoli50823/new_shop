/**
 * 盲盒商城后端 - 入口文件
 * MySQL + Sequelize
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// 导入 Sequelize 实例和所有模型（触发关联注册）
const { sequelize } = require('./models');

// 导入中间件
const logger = require('./middleware/logger');
const { antiBrush } = require('./middleware/antiBrush');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const blindBoxRoutes = require('./routes/blindBoxes');
const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');
const prizeRoutes = require('./routes/prizes');
const revenueRoutes = require('./routes/revenue');
const settingsRoutes = require('./routes/settings');

// 创建 Express 应用
const app = express();

// ============ 中间件 ============
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(antiBrush({ maxRequests: 120, windowMs: 60000 }));

// ============ 路由 ============
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blind-boxes', blindBoxRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/prizes', prizeRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/settings', settingsRoutes);

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ code: 200, data: { status: 'ok', db: 'connected' }, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, data: { status: 'error', db: 'disconnected' }, message: err.message });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: `接口不存在: ${req.method} ${req.path}` });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// ============ 启动 ============
const PORT = process.env.PORT || 8080;

async function start() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 同步模型到数据库（开发环境使用 alter，生产环境建议用 migration）
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库表同步完成');

    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`📦 API 基础路径: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ 启动失败:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
