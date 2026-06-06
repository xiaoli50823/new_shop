# 盲盒星球 - 盲盒商城信息管理系统

## 项目简介

盲盒星球是一个基于 Vue 3 + Node.js + MySQL 构建的现代化盲盒商城系统，包含面向普通用户的客户端（C端）和面向管理人员的管理端（B端）。

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue | 3.5.13 |
| 前端语言 | TypeScript | 5.6.2 |
| UI组件库 | Element Plus | 2.8.4 |
| 状态管理 | Pinia | 2.3.0 |
| 路由管理 | Vue Router | 4.4.5 |
| 构建工具 | Vite | 6.4.2 |
| 后端框架 | Express | 4.19.2 |
| 数据库 | MySQL | 5.7+ |
| ORM框架 | Sequelize | 6.37.0 |
| 认证方式 | JWT | 9.0.2 |
| 实时通信 | Socket.io | 4.8.3 |

##  项目结构

```
new_shop/
├── client/                    # 前端项目（C端 + B端）
│   ├── src/
│   │   ├── components/        # 可复用组件
│   │   │   ├── BlindBoxCard.vue
│   │   │   └── BottomTabBar.vue
│   │   ├── router/            # 路由配置
│   │   │   └── index.ts
│   │   ├── services/          # API 请求封装
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   ├── stores/            # Pinia 状态管理
│   │   │   └── user.ts
│   │   ├── utils/             # 工具函数
│   │   │   └── format.ts
│   │   ├── views/             # C端页面
│   │   │   ├── Home.vue       # 首页
│   │   │   ├── Discover.vue   # 发现页
│   │   │   ├── BlindBoxDetail.vue  # 盲盒详情（含开盒动画）
│   │   │   ├── BoxCabinet.vue # 盒柜
│   │   │   ├── Personal.vue   # 个人中心
│   │   │   ├── Search.vue     # 搜索
│   │   │   ├── OrderDetail.vue # 订单详情
│   │   │   ├── Address.vue    # 收货地址
│   │   │   ├── Recharge.vue   # 充值
│   │   │   ├── CheckIn.vue    # 签到
│   │   │   ├── Coupons.vue    # 优惠券
│   │   │   ├── MyOrders.vue   # 我的订单
│   │   │   ├── PointsMall.vue # 积分商城
│   │   │   ├── HotProducts.vue # 热门周边
│   │   │   ├── NewProducts.vue # 新品
│   │   │   ├── InfiniteBlindBox.vue # 无限盲盒
│   │   │   └── auth/
│   │   │       ├── Login.vue   # 登录
│   │   │       └── Register.vue # 注册
│   │   ├── views/admin/        # B端页面
│   │   │   ├── Admin.vue      # 管理端布局
│   │   │   ├── Dashboard.vue  # 数据大盘
│   │   │   ├── BlindBoxManage.vue # 盲盒管理
│   │   │   ├── CategoryManage.vue # 分类管理
│   │   │   ├── OrderManage.vue # 订单管理
│   │   │   ├── UserManage.vue # 用户管理
│   │   │   ├── PrizeManage.vue # 奖品管理
│   │   │   ├── RevenueReport.vue # 营收报表
│   │   │   └── SystemSettings.vue # 系统设置
│   │   ├── App.vue            # 根组件
│   │   ├── main.ts            # 入口文件
│   │   └── style.css          # 全局样式
│   ├── public/                # 静态资源
│   │   └── placeholder.svg    # 占位符图片
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                    # 后端项目
│   ├── config/               # 配置文件
│   │   ├── database.js       # Sequelize 连接配置
│   │   └── initDB.js
│   ├── models/               # Sequelize 数据模型
│   │   ├── index.js          # 关联关系注册
│   │   ├── User.js           # 用户
│   │   ├── BlindBox.js       # 盲盒
│   │   ├── Prize.js          # 奖品
│   │   ├── Order.js          # 订单
│   │   ├── OrderItem.js      # 订单项
│   │   ├── UserCabinet.js    # 用户盒柜
│   │   ├── Coupon.js         # 优惠券
│   │   ├── DrawRecord.js     # 抽盒记录
│   │   ├── Category.js       # 分类
│   │   ├── PointsProduct.js  # 积分商品
│   │   ├── PointsExchange.js # 积分兑换记录
│   │   └── HotProduct.js     # 热门周边商品
│   ├── routes/               # API 路由
│   │   ├── auth.js           # 认证（注册/登录）
│   │   ├── users.js          # 用户管理
│   │   ├── blindBoxes.js     # 盲盒管理 + 抽盒
│   │   ├── orders.js         # 订单管理
│   │   ├── points.js         # 积分商城
│   │   ├── categories.js     # 分类管理
│   │   ├── checkIn.js        # 签到
│   │   ├── dashboard.js      # 管理端数据大盘
│   │   └── ...               # 其他路由
│   ├── middleware/           # 中间件
│   │   ├── auth.js           # JWT 认证中间件
│   │   ├── validate.js       # 参数校验
│   │   ├── logger.js         # 请求日志
│   │   └── antiBrush.js      # 防刷限流
│   ├── utils/
│   │   ├── drawAlgorithm.js  # 抽盒算法（独立概率模型）
│   │   └── websocket.js      # WebSocket 实时通信
│   ├── seeders/              # 数据初始化
│   │   ├── seed.js           # 初始化测试数据
│   │   └── drop.js           # 清空数据
│   ├── index.js              # 入口文件
│   └── package.json
└── README.md                 # 项目说明文档
```

##  快速开始

### 1. 环境要求
- Node.js >= 18.x
- MySQL >= 5.7

### 2. 数据库准备
```sql
CREATE DATABASE blind_box_mall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置环境变量
复制 `server/.env.example` 为 `server/.env`：
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=blind_box_mall
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your_secret_key_here
PORT=8080
```

### 4. 安装依赖
```bash
# 后端
cd server && npm install

# 前端
cd client && npm install
```

### 5. 初始化数据
```bash
cd server && node seeders/seed.js
```

### 6. 启动项目
```bash
# 后端开发服务器（端口 8080）
cd server && npm run dev

# 前端开发服务器（端口 3000）
cd client && npm run dev
```

### 7. 访问地址
- 客户端：http://localhost:3000
- 管理端：http://localhost:3000/admin

### 8. 测试账号
| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@blindbox.com | admin123 |
| 普通用户 | user@blindbox.com | user123 |

##  功能清单

### 客户端（C端）
| 模块 | 功能 | 状态 |
|------|------|------|
| 首页 | 轮播图、分类导航、热门盲盒展示、中奖播报 
| 发现页 | 分类筛选、排序、商品瀑布流 
| 盲盒详情 | 奖池展示、单抽/五连/十连、开盒动画 
| 盒柜 | 奖品管理、发货申请、回收功能 
| 个人中心 | 用户资产、订单管理、优惠券、签到 
| 积分商城 | 商品兑换、优惠券兑换 
| 搜索 | 关键词搜索、历史记录、热门搜索 
| 订单管理 | 订单列表、订单详情 
| 收货地址 | 地址增删改查、默认地址设置 
| 充值 | 盲盒币充值 
| 登录注册 | JWT认证、密码加密 

### 管理端（B端）
| 模块 | 功能 | 状态 |
|------|------|------|
| 数据大盘 | 核心指标、转化漏斗、销售趋势、奖池监控 |
| 盲盒管理 | 盲盒CRUD、奖池配置、上下架管理 
| 分类管理 | 分类CRUD、排序 | 
| 奖品管理 | 奖品CRUD、关联盲盒、库存管理 
| 订单管理 | 订单列表、详情、发货、取消 |  
| 用户管理 | 用户列表、权限管理、批量操作 | 
| 营收报表 | 营收趋势、数据明细 | 

##  核心算法

### 抽盒算法（独立概率模型）

**算法特点：**
- **独立概率**：每个奖品独立按自身概率判定
- **支持抽空**：允许抽不到任何奖品的情况
- **库存控制**：库存为0的奖品无法被抽中
- **保底机制**：五连抽必出稀有及以上，十连抽双保底
- **并发安全**：数据库事务 + 行锁 (`SELECT ... FOR UPDATE`)

**保底规则：**
| 抽盒类型 | 保底机制 |
|----------|----------|
| 单抽 | 无保底 |
| 五连抽 | 至少1个稀有及以上 |
| 十连抽 | 至少2个稀有及以上 |

### 订单状态机
```
pending → paid → shipping → completed
   ↓
cancelled
```

##  安全措施

- 密码 bcrypt 加密存储
- JWT Token 认证
- 请求限流防刷（120次/分钟）
- 角色权限控制（user/admin）
- 参数校验（express-validator）
- SQL注入防护（Sequelize ORM）
- 数据库事务保证数据一致性

##  API 接口

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |

### 盲盒接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/blind-boxes | 获取盲盒列表 |
| GET | /api/blind-boxes/:id | 获取盲盒详情 |
| POST | /api/blind-boxes/:id/draw | 抽盒 |

### 积分接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/points | 获取积分商品列表 |
| POST | /api/points/exchange | 积分兑换 |

##  更新日志

### v2.0.0 (2026-06-06)
新增积分商城功能
新增优惠券页面
新增我的订单页面
新增签到功能
实现开盒动画效果
实现独立概率抽盒算法
实现五连抽/十连抽保底机制
修复图片显示问题
修复分类筛选bug
修复抽盒服务器错误
修复订单页面空白问题

### v1.0.0 (2026-05-03)
- 初始版本发布
- 基础盲盒商城功能

##  许可证

MIT License

---

**项目地址**：https://github.com/xiaoli50823/new_shop