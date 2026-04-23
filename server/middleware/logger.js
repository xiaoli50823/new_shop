/**
 * 请求日志中间件
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const method = req.method;
  const url = req.url;
  
  // 监听响应结束事件
  res.on('finish', () => {
    const end = Date.now();
    const duration = end - start;
    const status = res.statusCode;
    
    // 输出日志
    console.log(`[${new Date().toISOString()}] ${method} ${url} ${status} ${duration}ms`);
  });
  
  next();
};

module.exports = logger;