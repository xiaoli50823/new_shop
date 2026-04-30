# 盲盒星球 - 盲盒商城信息管理系统

## 系统架构

### 技术栈
- **前端（客户端 C端）**：Vue 3 + TypeScript + Element Plus + Pinia + Vue Router
- **前端（管理端 B端）**：Vue 3 + TypeScript + Element Plus + Vue Router
- **后端**：Node.js + Express + MySQL + Sequelize ORM
- **认证**：JWT (JSON Web Token)
- **密码加密**：bcryptjs

### 项目结构
```
new_shop/
├── client/                    # 前端项目（C端 + B端）
│   ├── src/
│   │   ├── components/        # 可复用组件
│   │   │   ├── BlindBoxCard.vue
│   │   │   └── BottomTabBar.vue
│   │   ├── views/             # C端页面
│   │   │   ├── Home.vue       # 首页
│   │   │   ├── Discover.vue   # 发现页
│   │   │   ├── BlindBoxDetail.vue  # 盲盒详情
│   │   │   ├── BoxCabinet.vue # 盒柜
│   │   │   ├── Personal.vue   # 个人中心
│   │   │   ├── Search.vue     # 搜索
│   │   │   ├── OrderDetail.vue # 订单详情
│   │   │   ├── Address.vue    # 收货地址
│   │   │   ├── Recharge.vue   # 充值
│   │   │   ├── auth/
│   │   │   │   ├── Login.vue  # 登录
│   │   │   │   └── Register.vue # 注册
│   │   │   └── admin/         # B端页面
│   │   │       ├── Admin.vue  # 管理端布局
│   │   │       ├── Dashboard.vue # 数据大盘
│   │   │       ├── BlindBoxManage.vue # 盲盒管理
│   │   │       ├── PrizeManage.vue # 奖品管理
│   │   │       ├── OrderManage.vue # 订单管理
│   │   │       ├── UserManage.vue # 用户管理
│   │   │       ├── RevenueReport.vue # 营收报表
│   │   │       └── SystemSettings.vue # 系统设置
│   │   ├── services/api.ts    # API 请求封装
│   │   ├── stores/user.ts     # Pinia 用户状态
│   │   ├── utils/format.ts    # 工具函数
│   │   ├── router.ts          # 路由配置
│   │   ├── App.vue            # 根组件
│   │   └── main.ts            # 入口文件
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                    # 后端项目
│   ├── config/database.js     # Sequelize 连接配置
│   ├── models/                # Sequelize 数据模型
│   │   ├── index.js           # 关联关系注册
│   │   ├── User.js            # 用户
│   │   ├── BlindBox.js        # 盲盒
│   │   ├── Prize.js           # 奖品
│   │   ├── Order.js           # 订单
│   │   ├── OrderItem.js       # 订单项
│   │   ├── UserCabinet.js     # 用户盒柜
│   │   ├── Coupon.js          # 优惠券
│   │   └── DrawRecord.js      # 抽盒记录
│   ├── routes/                # API 路由
│   │   ├── auth.js            # 认证（注册/登录）
│   │   ├── users.js           # 用户管理
│   │   ├── blindBoxes.js      # 盲盒管理 + 抽盒
│   │   ├── orders.js          # 订单管理
│   │   ├── products.js        # 普通商品
│   │   ├── dashboard.js       # 管理端数据大盘
│   │   ├── prizes.js          # 奖品管理
│   │   ├── revenue.js         # 营收报表
│   │   └── settings.js        # 系统设置
│   ├── middleware/            # 中间件
│   │   ├── auth.js            # JWT 认证中间件
│   │   ├── validate.js        # 参数校验
│   │   ├── logger.js          # 请求日志
│   │   └── antiBrush.js       # 防刷限流
│   ├── utils/
│   │   └── drawAlgorithm.js   # 抽盒算法（真随机/伪随机）
│   ├── seeders/
│   │   ├── seed.js            # 数据初始化
│   │   └── drop.js            # 清空数据
│   ├── index.js               # 入口文件
│   ├── .env                   # 环境变量
│   └── package.json
└── README.md
```

## 快速开始

### 1. 环境要求
- Node.js >= 18
- MySQL >= 5.7

### 2. 数据库准备
```sql
CREATE DATABASE blind_box_mall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置环境变量
编辑 `server/.env`：
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=blind_box_mall
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your_secret_key
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
# 后端（端口 8080）
cd server && npm run dev

# 前端（端口 3000）
cd client && npm run dev
```

### 7. 测试账号
- 管理员：`admin@blindbox.com` / `admin123`
- 普通用户：`user@blindbox.com` / `user123`

## 功能清单

### 客户端（C端）
- [x] 首页（轮播、分类导航、商品瀑布流、中奖播报）
- [x] 发现页（分类标签、筛选排序、瀑布流）
- [x] 盲盒详情（奖池展示、单抽/五连/十连、开盒动画）
- [x] 盒柜（待发货/已发货/已回收、批量操作、发货/回收）
- [x] 个人中心（资产、订单、签到、VIP、邀请好友、设置）
- [x] 登录/注册
- [x] 搜索（历史、热门、结果）
- [x] 订单详情
- [x] 收货地址管理
- [x] 充值

### 管理端（B端）
- [x] 数据大盘（核心指标、转化漏斗、销售趋势、奖池监控）
- [x] 盲盒管理（CRUD、奖池配置、上下架）
- [x] 奖品管理（CRUD、关联盲盒）
- [x] 订单管理（筛选、详情、发货、取消）
- [x] 用户管理（筛选、封禁/解封、批量操作、详情）
- [x] 营收报表（趋势图、明细表）
- [x] 系统设置（基本/支付/短信/操作日志）

### 后端 API
- [x] 认证（注册/登录/JWT）
- [x] 用户管理（CRUD/签到/回收/盒柜/订单/优惠券）
- [x] 盲盒管理（CRUD/抽盒算法/事务锁）
- [x] 订单管理（CRUD/发货/状态机校验）
- [x] 数据大盘（GMV/趋势/漏斗/奖池监控/最近订单/活跃用户）
- [x] 奖品管理（CRUD）
- [x] 营收报表
- [x] 系统设置
- [x] 防刷限流中间件
- [x] JWT 认证中间件
- [x] 参数校验中间件

## 核心设计

### 抽盒算法
- **真随机**：每次独立按概率抽取
- **伪随机**：库存控制，有库存才能抽中
- **保底机制**：五连抽必得稀有款
- **并发安全**：使用数据库事务 + 行锁 (`SELECT ... FOR UPDATE`)

### 订单状态机
```
pending → paid → shipping → completed
   ↓
cancelled
```

### 安全措施
- 密码 bcrypt 加密存储
- JWT Token 认证
- 请求限流防刷
- 角色权限控制（user/admin）
- 参数校验

## 许可证
MIT License
