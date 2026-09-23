# -*- coding: utf-8 -*-
"""订单接口自动化 + SQL 数据校验。"""
import pytest

from asserts import assert_http, assert_code
from db import fetch_one


@pytest.mark.api
def test_my_orders_list(user_client):
    resp = user_client.get("/api/orders/my")
    body = assert_code(resp, 200)
    assert "list" in body["data"]
    assert "total" in body["data"]


@pytest.mark.api
def test_admin_order_list_requires_admin(user_client):
    # 普通用户访问管理端订单列表应被拒绝（角色权限）
    resp = user_client.get("/api/orders")
    assert_http(resp, 403)
    assert resp.json()["code"] == 403


@pytest.mark.api
def test_create_order_and_sql_verify(user_client, db_conn):
    payload = {
        "type": "purchase",
        "total": 9.9,
        "items": [{"name": "接口自动化测试商品", "price": 9.9, "quantity": 1}],
        "shipping_address": "福建省福州市测试地址",
        "shipping_contact": "测试用户",
        "shipping_phone": "13800000000",
    }
    resp = user_client.post("/api/orders", json=payload)
    assert_http(resp, 201)
    order = assert_code(resp, 200)["data"]

    # SQL 数据校验：订单确实写入数据库
    row = fetch_one(db_conn, "SELECT * FROM orders WHERE order_no = %s", (order["order_no"],))
    assert row is not None, "数据库中未找到刚创建的订单"
    assert row["type"] == "purchase"
    assert row["status"] == "pending"
    assert float(row["total"]) == pytest.approx(9.9)

    # 取消订单，避免污染数据（pending -> cancelled）
    cancel = user_client.delete(f"/api/orders/{order['id']}")
    assert_code(cancel, 200)