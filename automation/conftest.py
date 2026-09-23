# -*- coding: utf-8 -*-
"""全局测试夹具：客户端、鉴权 Token、数据库连接。"""
import pytest

import config
from api_client import ApiClient
import db as dbmod


@pytest.fixture(scope="session")
def base_url():
    return config.BASE_URL


@pytest.fixture(scope="session")
def _raw_client(base_url):
    return ApiClient(base_url)


def _login(client, email, password):
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        body = resp.json()
        if body.get("code") == 200:
            return body["data"]["token"]
    return None


@pytest.fixture(scope="session")
def user_token(_raw_client):
    token = _login(_raw_client, config.USER_EMAIL, config.USER_PASSWORD)
    if not token:
        pytest.skip("普通用户登录失败，请先运行 server/seeders/seed.js 初始化数据")
    return token


@pytest.fixture(scope="session")
def admin_token(_raw_client):
    token = _login(_raw_client, config.ADMIN_EMAIL, config.ADMIN_PASSWORD)
    if not token:
        pytest.skip("管理员登录失败，请先运行 server/seeders/seed.js 初始化数据")
    return token


@pytest.fixture()
def client(base_url):
    return ApiClient(base_url)


@pytest.fixture()
def user_client(client, user_token):
    client.set_token(user_token)
    return client


@pytest.fixture()
def admin_client(client, admin_token):
    client.set_token(admin_token)
    return client


@pytest.fixture(scope="session")
def db_conn():
    try:
        conn = dbmod.connect(
            config.DB_HOST, config.DB_PORT, config.DB_USER, config.DB_PASSWORD, config.DB_NAME
        )
    except Exception as exc:  # noqa: BLE001
        pytest.skip(f"数据库不可用，跳过 SQL 校验：{exc}")
    yield conn
    conn.close()