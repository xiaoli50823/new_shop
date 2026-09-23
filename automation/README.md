# 盲盒星球 · 自动化测试工程（Python）

本目录是基于 **Pytest + Requests + Playwright** 的接口与 UI 自动化测试工程，围绕盲盒商城核心业务，用于**版本回归与冒烟**。与仓库内 `server/test`（Node 原生测试）互补。

## 覆盖范围

| 维度 | 技术 | 说明 |
| --- | --- | --- |
| 接口自动化 | Pytest + Requests | 封装鉴权 Fixture、YAML 参数化、公共断言，覆盖登录/购物车/订单等接口 |
| 数据校验 | PyMySQL | 结合 SQL 校验接口响应与数据库落库数据一致性 |
| UI 自动化 | Playwright | 回归核心 UI 流程（登录跳转、路由守卫、首页加载） |
| 缓存专项 | Requests | 覆盖缓存响应头、命中、并发加载、角色权限 |
| 接口冒烟 | 独立脚本 | 只读检查角色权限、缓存响应、问答参数校验 |

> 更深层的 Redis「写后失效 / 故障回源」场景由后端 `server/test/cache.test.js` 覆盖；本工程侧重从接口与 UI 视角做端到端回归。

## 目录结构

```
automation/
├── README.md                  # 本说明
├── requirements.txt           # Python 依赖
├── pytest.ini                 # pytest 配置（标记、默认收集目录）
├── config.py                  # 集中配置（可用环境变量覆盖）
├── api_client.py              # requests 封装（Bearer 鉴权）
├── asserts.py                 # 公共断言
├── db.py                      # PyMySQL 连接/查询辅助
├── data_loader.py             # YAML 参数化加载
├── conftest.py                # 全局夹具（token、客户端、数据库连接）
├── data/cases.yaml            # 参数化测试数据
├── tests_api/                 # 接口自动化测试
│   ├── test_auth.py           # 登录/注册/鉴权
│   ├── test_cart.py           # 购物车 CRUD
│   ├── test_orders.py         # 订单 + SQL 校验
│   └── test_redis_cache.py    # Redis 缓存专项
├── tests_ui/                  # UI 自动化测试（Playwright）
│   ├── conftest.py
│   └── test_core_flow.py
└── smoke/
    └── smoke_interface.py     # 接口冒烟脚本（可独立运行）
```

## 环境准备

### 1. 安装依赖

```bash
cd automation
pip install -r requirements.txt

# 安装 Playwright 浏览器（仅 UI 测试需要）
python -m playwright install chromium
```

### 2. 启动被测系统

```bash
# 后端（端口 8080）
cd server && npm run dev

# 前端（端口 3000，仅 UI 测试需要）
cd client && npm run dev
```

> 需要数据库已完成初始化（`node seeders/seed.js`），含测试账号。可选启动 Redis 以覆盖缓存命中用例（未启动时会自动跳过）。

### 3. 配置（可选）

默认配置即可运行，如需调整通过环境变量覆盖：

```bash
# PowerShell
$env:AUTOMATION_BASE_URL = "http://localhost:8080"
$env:AUTOMATION_DB_USER = "root"
$env:AUTOMATION_DB_PASSWORD = "your_password"
```

支持的变量见 `config.py`（`AUTOMATION_BASE_URL`、`AUTOMATION_FRONTEND_URL`、`AUTOMATION_USER_EMAIL/PASSWORD`、`AUTOMATION_ADMIN_EMAIL/PASSWORD`、`AUTOMATION_DB_*`）。

## 运行测试

```bash
cd automation

# 仅接口自动化（默认）
pytest

# 仅缓存专项
pytest -m redis

# UI 自动化（需前端已启动 + 已安装浏览器）
pytest tests_ui

# 全部（接口 + UI）
pytest tests_api tests_ui

# 接口冒烟脚本（不依赖 pytest）
python -m smoke.smoke_interface
```

`pytest.ini` 中已注册标记：`api`、`ui`、`redis`、`smoke`，可按需使用 `-m` 过滤。

## 测试数据与副作用说明

- 登录/鉴权用例：只读，无副作用。
- 购物车用例：加购后查询并删除，结束后自清理。
- 订单用例：创建订单后立即取消（`pending -> cancelled`），尽可能减少数据污染。
- 冒烟脚本：完全只读，不创建订单、不扣款、不修改数据库。
- SQL 校验仅在数据库可连接时执行，否则自动跳过。