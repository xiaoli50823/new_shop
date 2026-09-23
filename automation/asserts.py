# -*- coding: utf-8 -*-
"""公共断言：统一校验业务 code、HTTP 状态码并返回响应体。"""


def assert_http(resp, status):
    assert resp.status_code == status, f"HTTP 状态码期望 {status}，实际 {resp.status_code}：{resp.text}"
    return resp


def assert_code(resp, code=200):
    body = resp.json()
    assert body.get("code") == code, f"业务 code 期望 {code}，实际 {body.get('code')}：{body}"
    return body


def assert_success(resp):
    return assert_code(resp, 200)