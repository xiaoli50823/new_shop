const express = require('express');
const cors = require('cors');

// 导入中间件
const logger = require('./middleware/logger');
const { antiBrush } = require('./middleware/antiBrush');

// 导入路由
const blindBoxRoutes = require('./routes/blindBox');
const orderRoutes = require('./routes/order');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(antiBrush()); // 全局防刷

// 路由
app.use('/api/blind-box', blindBoxRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 启动服务器
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});