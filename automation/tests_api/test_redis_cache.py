# -*- coding: utf-8 -*-
"""Redis 缓存专项：响应头、命中、并发加载、角色权限。"""
from concurrent.futures import ThreadPoolExecutor

import pytest
import requests

from asserts import assert_http, assert_code


def _redis_connected(admin_client):
    try:
        resp = admin_client.get("/api/cache/status")
        if resp.status_code == 200:
            return resp.json().get("data", {}).get("connected") is True
    except Exception:  # noqa: BLE001
        return False
    return False


@pytest.mark.api
@pytest.mark.redis
def test_cached_endpoint_returns_x_cache_header(client):
    resp = client.get("/api/blind-boxes")
    assert_http(resp, 200)
    assert "X-Cache" in resp.headers


@pytest.mark.api
@pytest.mark.redis
def test_repeated_query_hits_cache(client, admin_client):
    if not _redis_connected(admin_client):
        pytest.skip("Redis 未连接，跳过缓存命中断言")
    client.get("/api/blind-boxes")  # 首次访问：未命中则回源 MySQL 并写入缓存
    second = client.get("/api/blind-boxes")  # 再次访问应命中
    assert second.headers.get("X-Cache") == "HIT"


@pytest.mark.api
@pytest.mark.redis
def test_concurrent_requests_all_succeed(client):
    urls = ["/api/blind-boxes", "/api/hot-products", "/api/categories", "/api/points"]
    base = client.base_url

    def hit(url):
        return requests.get(base + url, timeout=10).status_code

    with ThreadPoolExecutor(max_workers=4) as pool:
        statuses = list(pool.map(hit, urls * 3))
    assert all(code == 200 for code in statuses)


@pytest.mark.api
def test_cache_status_and_invalidate_require_admin(user_client, admin_client):
    # 普通用户无权查看/刷新缓存
    assert_http(user_client.get("/api/cache/status"), 403)
    assert_http(user_client.delete("/api/cache"), 403)

    # 管理员可查看状态
    status = admin_client.get("/api/cache/status")
    body = assert_code(status, 200)
    assert "connected" in body["data"]