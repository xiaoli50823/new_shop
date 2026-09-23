# -*- coding: utf-8 -*-
"""UI 测试夹具：Playwright 浏览器与页面。"""
import pytest
from playwright.sync_api import sync_playwright

import config


@pytest.fixture(scope="session")
def frontend_url():
    return config.FRONTEND_URL


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        yield b
        b.close()


@pytest.fixture()
def page(browser):
    context = browser.new_context()
    page = context.new_page()
    yield page
    context.close()