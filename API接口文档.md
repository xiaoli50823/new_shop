# 盲盒星球 · 后端 API 接口文档

> 项目：盲盒商城信息管理系统（new_shop）
> 技术栈：Node.js + Express + Sequelize + MySQL
> 版本：v2.0.0

---

## 一、通用说明

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| Base URL | `http://localhost:8080/api` |
| 数据格式 | JSON（`application/json`） |
| 认证方式 | JWT Bearer Token |
| 请求限流 | 120 次 / 分钟 |

### 1.2 统一响应格式

所有接口返回统一的 JSON 结构：

```json
{
  "code": 200,
  "data": { },
  "message": "success"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 业务状态码，`200` 成功，`400` 参数错误，`401` 未认证，`403` 无权限，`404` 不存在，`500` 服务器错误 |
| data | object/array | 业务数据 |
| message | string | 提示信息 |

### 1.3 认证方式

需要登录的接口，在请求头携带 Token：

```
Authorization: Bearer <token>
```

> Token 通过「登录 / 注册」接口获取，有效期 7 天。

### 1.4 角色权限

| 角色 | 说明 |
|------|------|
| user | 普通用户 |
| admin | 管理员（接口中标明「管理员」的接口需 admin 角色） |

---

## 二、接口列表

### 2.1 认证模块 `/api/auth`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/auth/register` | 否 | 用户注册 |
| POST | `/api/auth/login` | 否 | 用户登录 |
| GET | `/api/auth/me` | 是 | 获取当前登录用户信息 |

**POST `/api/auth/register`** 注册

请求体：
```json
{ "username": "星球探索家", "email": "user@blindbox.com", "password": "user123", "phone": "13800000000" }
```

**POST `/api/auth/login`** 登录

请求体：
```json
{ "email": "admin@blindbox.com", "password": "admin123" }
```

响应 `data` 包含 `user`（用户信息）与 `token`。

---

### 2.2 用户模块 `/api/users`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/users/profile` | 是 | 获取当前用户资料 |
| GET | `/api/users` | 管理员 | 用户列表（分页/筛选） |
| GET | `/api/users/:id` | 否 | 获取用户详情 |
| PUT | `/api/users/:id` | 是 | 更新用户信息（本人或管理员） |
| POST | `/api/users/:id/check-in` | 是 | 每日签到 |
| POST | `/api/users/:id/recycle` | 是 | 回收盒柜商品 |
| PUT | `/api/users/:id/ban` | 管理员 | 封禁用户 |
| PUT | `/api/users/:id/unban` | 管理员 | 解封用户 |
| GET | `/api/users/:id/cabinet` | 是 | 获取用户盒柜 |
| POST | `/api/users/:id/cabinet/ship` | 是 | 盒柜商品发货 |
| GET | `/api/users/:id/orders` | 是 | 获取用户订单 |
| GET | `/api/users/:id/coupons` | 是 | 获取用户优惠券 |
| GET | `/api/users/:id/draw-records` | 是 | 获取用户抽盒记录 |
| PUT | `/api/users/batch` | 管理员 | 批量操作 |
| PUT | `/api/users/batch-coin` | 管理员 | 批量赠送盲盒币 |
| PUT | `/api/users/batch-sms` | 管理员 | 批量发短信（模拟） |

> 列表接口通用分页参数：`page`（页码，默认 1）、`pageSize`（每页条数，默认 20）。

---

### 2.3 盲盒模块 `/api/blind-boxes`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/blind-boxes/hot` | 否 | 热门盲盒 |
| GET | `/api/blind-boxes/infinite` | 否 | 无限盲盒 |
| GET | `/api/blind-boxes/new` | 否 | 新品盲盒 |
| GET | `/api/blind-boxes/category/:category` | 否 | 分类盲盒 |
| GET | `/api/blind-boxes` | 否 | 盲盒列表（分页/筛选/搜索） |
| GET | `/api/blind-boxes/:id` | 否 | 盲盒详情（含奖池） |
| POST | `/api/blind-boxes` | 管理员 | 创建盲盒 |
| PUT | `/api/blind-boxes/:id` | 管理员 | 更新盲盒 |
| DELETE | `/api/blind-boxes/:id` | 管理员 | 删除盲盒（软删除） |
| POST | `/api/blind-boxes/:id/draw` | 是 | 抽盒 |

**POST `/api/blind-boxes/:id/draw`** 抽盒

请求体：
```json
{ "drawType": "single" }
```

| 参数 | 取值 | 说明 |
|------|------|------|
| drawType | `single` / `five` / `ten` | 单抽 / 五连抽 / 十连抽 |
| count | `1` / `5` / `10` | 兼容字段，与 drawType 二选一 |

> 五连抽 9 折、十连抽 8.5 折；五连保底 1 个稀有及以上，十连保底 2 个稀有及以上。

---

### 2.4 订单模块 `/api/orders`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/orders` | 管理员 | 订单列表（筛选） |
| GET | `/api/orders/my` | 是 | 我的订单 |
| GET | `/api/orders/:id` | 是 | 订单详情 |
| POST | `/api/orders` | 是 | 创建订单 |
| PUT | `/api/orders/:id/status` | 是 | 更新订单状态 |
| PUT | `/api/orders/:id/ship` | 是 | 发货（填物流信息） |
| DELETE | `/api/orders/:id` | 是 | 取消订单 |

> 订单状态机：`pending → paid → shipping → completed`，可 `cancelled`。

---

### 2.5 商品模块 `/api/products`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/products/recommend` | 否 | 推荐周边商品（内存数据） |
| GET | `/api/products/:id` | 否 | 商品详情 |

---

### 2.6 数据大盘 `/api/dashboard`（管理员）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dashboard/overview` | 核心指标（今日 GMV、抽盒次数、新增用户等） |
| GET | `/api/dashboard/sales-trend` | 销售趋势（`days` 参数，默认 7 天） |
| GET | `/api/dashboard/funnel` | 转化漏斗 |
| GET | `/api/dashboard/prize-monitor` | 奖池监控 |
| GET | `/api/dashboard/recent-orders` | 最近订单 |
| GET | `/api/dashboard/hot-users` | 活跃用户 |

---

### 2.7 奖品模块 `/api/prizes`（管理员）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/prizes` | 奖品列表（分页/筛选） |
| GET | `/api/prizes/:id` | 奖品详情 |
| POST | `/api/prizes` | 创建奖品 |
| PUT | `/api/prizes/:id` | 更新奖品 |
| DELETE | `/api/prizes/:id` | 删除奖品 |

---

### 2.8 营收报表 `/api/revenue`（管理员）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/revenue` | 营收概览（`range`: today/week/month） |

---

### 2.9 系统设置 `/api/settings`（管理员）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/settings` | 获取所有设置 |
| PUT | `/api/settings/basic` | 更新基本设置 |
| PUT | `/api/settings/payment` | 更新支付设置 |
| PUT | `/api/settings/sms` | 更新短信设置 |
| POST | `/api/settings/sms/test` | 测试短信（模拟） |
| GET | `/api/settings/logs` | 操作日志 |

---

### 2.10 购物车模块 `/api/cart`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/cart` | 是 | 购物车列表 |
| POST | `/api/cart` | 是 | 添加商品 |
| PUT | `/api/cart/:id` | 是 | 更新数量 |
| DELETE | `/api/cart/:id` | 是 | 删除商品 |
| DELETE | `/api/cart` | 是 | 清空购物车 |

---

### 2.11 积分模块 `/api/points`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/points` | 否 | 积分商品列表 |
| GET | `/api/points/:id` | 否 | 积分商品详情 |
| POST | `/api/points/exchange` | 是 | 积分兑换 |
| GET | `/api/points/my/exchanges` | 是 | 我的兑换记录 |

---

### 2.12 签到模块 `/api/check-in`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/check-in/status` | 是 | 签到状态 |
| POST | `/api/check-in/check-in` | 是 | 执行签到 |
| GET | `/api/check-in/records` | 是 | 签到记录（近 30 天） |

> 连续签到奖励：第 1-7 天分别为 10 / 15 / 20 / 25 / 30 / 40 / 50 积分。

---

### 2.13 热门周边模块 `/api/hot-products`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/hot-products` | 否 | 热门周边列表 |
| GET | `/api/hot-products/:id` | 否 | 周边详情 |
| POST | `/api/hot-products` | 管理员 | 创建周边 |
| PUT | `/api/hot-products/:id` | 管理员 | 更新周边 |
| DELETE | `/api/hot-products/:id` | 管理员 | 删除周边 |
| POST | `/api/hot-products/:id/buy` | 是 | 购买周边（盲盒币支付） |

---

### 2.14 收货地址模块 `/api/addresses`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/addresses` | 是 | 地址列表 |
| GET | `/api/addresses/:id` | 是 | 地址详情 |
| POST | `/api/addresses` | 是 | 新增地址 |
| PUT | `/api/addresses/:id` | 是 | 更新地址 |
| DELETE | `/api/addresses/:id` | 是 | 删除地址 |
| PUT | `/api/addresses/:id/default` | 是 | 设为默认地址 |

---

### 2.15 分类模块 `/api/categories`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/categories` | 否 | 获取所有分类 |
| GET | `/api/categories/admin` | 管理员 | 分类列表（分页/筛选） |
| POST | `/api/categories` | 管理员 | 创建分类 |
| PUT | `/api/categories/:id` | 管理员 | 更新分类 |
| DELETE | `/api/categories/:id` | 管理员 | 删除分类 |

---

### 2.16 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 服务健康检查（含数据库连接状态） |

响应示例：
```json
{ "code": 200, "data": { "status": "ok", "db": "connected" }, "message": "success" }
```

---

## 三、测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@blindbox.com | admin123 |
| 普通用户 | user@blindbox.com | user123 |

---

## 四、数据模型（核心表）

| 模型 | 表名 | 说明 |
|------|------|------|
| User | users | 用户 |
| BlindBox | blind_boxes | 盲盒 |
| Prize | prizes | 奖品 |
| Category | categories | 分类 |
| Order | orders | 订单 |
| OrderItem | order_items | 订单项 |
| UserCabinet | user_cabinets | 用户盒柜 |
| DrawRecord | draw_records | 抽盒记录 |
| Coupon | coupons | 优惠券 |
| Cart | carts | 购物车 |
| PointsProduct | points_products | 积分商品 |
| PointsExchange | points_exchanges | 积分兑换记录 |
| HotProduct | hot_products | 热门周边商品 |
| Address | addresses | 收货地址 |

## Redis 缓存与智能问答（新增）

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/cache/status` | 管理员 | 缓存连接状态、命中率及进程内计数 |
| DELETE | `/api/cache` | 管理员 | 使商品缓存失效，不清除限流数据 |
| GET | `/api/ai/status` | 公开 | DeepSeek 配置状态与模型名，不返回密钥 |
| POST | `/api/ai/chat` | 登录用户 | 商城助手或通用问答 |

提问请求：`{ "mode": "mall", "message": "积分怎么获得？", "history": [] }`。
`mode` 支持 `mall`、`general`。`history` 为最多 5 轮完整的 user/assistant 问答。
响应 data 包含 answer、model、mode、sources、truncated、catalogAvailable。

更多配置、错误码、缓存策略和验证方法见 [Redis与智能问答设计](./Redis与智能问答设计.md)。
