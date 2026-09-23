# -*- coding: utf-8 -*-
"""UI 自动化：核心流程回归（路由守卫、登录跳转、首页加载）。"""
import pytest

import config


@pytest.mark.ui
def test_auth_guard_redirects_to_login(page, frontend_url):
    # 未登录访问需要鉴权的页面，应被路由守卫重定向到登录页
    page.goto(f"{frontend_url}/personal")
    page.wait_for_url(lambda url: "/login" in url, timeout=10000)


@pytest.mark.ui
def test_login_success_and_redirect(page, frontend_url):
    page.goto(f"{frontend_url}/login")
    page.fill('input[placeholder="请输入邮箱"]', config.USER_EMAIL)
    page.fill('input[placeholder="请输入密码"]', config.USER_PASSWORD)
    page.click("button.login-btn")
    # 登录成功后写入 token 并跳转首页
    page.wait_for_function("() => localStorage.getItem('token') !== null", timeout=10000)
    page.wait_for_url(f"{frontend_url}/", timeout=10000)


@pytest.mark.ui
def test_home_page_loads(page, frontend_url):
    page.goto(f"{frontend_url}/")
    page.wait_for_load_state("networkidle")
    assert "盲盒星球" in page.title()