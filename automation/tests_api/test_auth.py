# -*- coding: utf-8 -*-
"""认证接口自动化：登录（YAML 参数化）、注册、获取当前用户。"""
import pytest

import config
from asserts import assert_http, assert_code, assert_success
from data_loader import load_cases

LOGIN_CASES = load_cases("login")


@pytest.mark.api
@pytest.mark.parametrize("case", LOGIN_CASES, ids=[c["name"] for c in LOGIN_CASES])
def test_login(client, case):
    resp = client.post("/api/auth/login", json={"email": case["email"], "password": case["password"]})
    assert_http(resp, case["expect_http"])
    body = resp.json()
    assert body["code"] == case["expect_code"]
    if case["expect_code"] == 200:
        assert body["data"]["token"], "登录成功但未返回 token"
        assert body["data"]["user"]["email"] == case["email"]


@pytest.mark.api
def test_register_duplicate_email(client):
    resp = client.post("/api/auth/register", json={
        "username": "自动化测试用户", "email": config.USER_EMAIL, "password": "123456"
    })
    assert_http(resp, 400)
    assert resp.json()["code"] == 400


@pytest.mark.api
def test_me_requires_token(client):
    resp = client.get("/api/auth/me")
    assert_http(resp, 401)


@pytest.mark.api
def test_me_with_token(user_client):
    resp = user_client.get("/api/auth/me")
    body = assert_success(resp)
    assert body["data"]["email"] == config.USER_EMAIL