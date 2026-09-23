# -*- coding: utf-8 -*-
"""集中配置：所有可调参数通过环境变量覆盖，未设置时使用仓库默认值。"""
import os


def _env(key, default):
    return os.environ.get(key, default)


BASE_URL = _env("AUTOMATION_BASE_URL", "http://localhost:8080").rstrip("/")
FRONTEND_URL = _env("AUTOMATION_FRONTEND_URL", "http://localhost:3000").rstrip("/")

# 测试账号（与 server/seeders/seed.js 初始化数据一致）
USER_EMAIL = _env("AUTOMATION_USER_EMAIL", "user@blindbox.com")
USER_PASSWORD = _env("AUTOMATION_USER_PASSWORD", "user123")
ADMIN_EMAIL = _env("AUTOMATION_ADMIN_EMAIL", "admin@blindbox.com")
ADMIN_PASSWORD = _env("AUTOMATION_ADMIN_PASSWORD", "admin123")

# 数据库（用于 SQL 数据校验）
DB_HOST = _env("AUTOMATION_DB_HOST", "localhost")
DB_PORT = int(_env("AUTOMATION_DB_PORT", "3306"))
DB_NAME = _env("AUTOMATION_DB_NAME", "blind_box_mall")
DB_USER = _env("AUTOMATION_DB_USER", "root")
DB_PASSWORD = _env("AUTOMATION_DB_PASSWORD", "")