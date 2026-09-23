#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
接口冒烟脚本（只读，不产生业务数据）

检查项：
  1. 角色权限：普通用户访问管理端接口应返回 403，管理员可正常访问
  2. 缓存响应：公开商品接口返回 X-Cache 响应头
  3. 问答参数校验：未登录 / 空问题 / 非法模式 应分别返回 401 / 400 / 400

用法（在 automation 目录下）：
  python -m smoke.smoke_interface
"""
import sys

import requests

import config

BASE = config.BASE_URL
PASS = 0
FAIL = 0


def check(name, condition, detail=""):
    global PASS, FAIL
    print(f"[{'PASS' if condition else 'FAIL'}] {name}" + (f"  ({detail})" if detail else ""))
    if condition:
        PASS += 1
    else:
        FAIL += 1


def post(path, token=None, body=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return requests.post(BASE + path, json=body or {}, headers=headers, timeout=10)


def get(path, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return requests.get(BASE + path, headers=headers, timeout=10)


def login(email, password):
    resp = post("/api/auth/login", body={"email": email, "password": password})
    if resp.status_code == 200 and resp.json().get("code") == 200:
        return resp.json()["data"]["token"]
    return None


def main():
    user_token = login(config.USER_EMAIL, config.USER_PASSWORD)
    admin_token = login(config.ADMIN_EMAIL, config.ADMIN_PASSWORD)
    check("登录普通用户", user_token is not None)
    check("登录管理员", admin_token is not None)

    # 1. 角色权限
    check("普通用户访问缓存状态返回 403", get("/api/cache/status", user_token).status_code == 403)
    check("普通用户访问后台订单列表返回 403", get("/api/orders", user_token).status_code == 403)
    admin_status = get("/api/cache/status", admin_token)
    check(
        "管理员访问缓存状态返回 200",
        admin_status.status_code == 200 and admin_status.json().get("code") == 200,
    )

    # 2. 缓存响应头
    cached = requests.get(BASE + "/api/blind-boxes", timeout=10)
    x_cache = cached.headers.get("X-Cache", "")
    check("公开商品接口返回 X-Cache 响应头", x_cache in ("HIT", "MISS", "BYPASS"), f"X-Cache={x_cache}")

    # 3. 问答参数校验
    check("未登录提问返回 401", post("/api/ai/chat", body={"mode": "mall", "message": "你好"}).status_code == 401)
    empty = post("/api/ai/chat", user_token, body={"mode": "mall", "message": "   "})
    check("空问题返回 400", empty.status_code == 400, f"status={empty.status_code}")
    invalid_mode = post("/api/ai/chat", user_token, body={"mode": "xxx", "message": "你好"})
    check("非法模式返回 400", invalid_mode.status_code == 400, f"status={invalid_mode.status_code}")

    print(f"\n冒烟结果：{PASS} 通过，{FAIL} 失败")
    sys.exit(0 if FAIL == 0 else 1)


if __name__ == "__main__":
    main()