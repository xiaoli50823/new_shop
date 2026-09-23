# -*- coding: utf-8 -*-
"""购物车接口自动化：完整 CRUD 流程（加购 -> 查询 -> 删除，测试后自清理）。"""
import pytest

from asserts import assert_http, assert_code


def _first_active_blind_box_id(client):
    resp = client.get("/api/blind-boxes", params={"pageSize": 1})
    body = assert_code(resp, 200)
    items = body["data"].get("list", [])
    if not items:
        pytest.skip("暂无在售盲盒，跳过购物车流程")
    return items[0]["id"]


@pytest.mark.api
def test_cart_add_list_delete(user_client):
    blind_box_id = _first_active_blind_box_id(user_client)

    # 加购
    add = user_client.post("/api/cart", json={"blindBoxId": blind_box_id, "quantity": 1})
    assert_http(add, 200)
    cart_id = add.json()["data"]["cartId"]

    # 查询购物车
    listing = user_client.get("/api/cart")
    body = assert_code(listing, 200)
    assert any(item["id"] == cart_id for item in body["data"]["list"])

    # 删除（自清理）
    removed = user_client.delete(f"/api/cart/{cart_id}")
    assert_code(removed, 200)


@pytest.mark.api
def test_cart_requires_token(client):
    resp = client.get("/api/cart")
    assert_http(resp, 401)