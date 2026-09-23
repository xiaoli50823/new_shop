# -*- coding: utf-8 -*-
"""读取 YAML 测试数据并做环境变量替换，实现 YAML 参数化。"""
import os

import yaml

import config

_ENV_MAP = {
    "USER_EMAIL": config.USER_EMAIL,
    "USER_PASSWORD": config.USER_PASSWORD,
    "ADMIN_EMAIL": config.ADMIN_EMAIL,
    "ADMIN_PASSWORD": config.ADMIN_PASSWORD,
}

_CASES_PATH = os.path.join(os.path.dirname(__file__), "data", "cases.yaml")


def _resolve(value):
    if isinstance(value, str) and value.startswith("$"):
        return _ENV_MAP.get(value[1:], value)
    return value


def load_cases(section):
    with open(_CASES_PATH, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    cases = data.get(section, [])
    return [{k: _resolve(v) for k, v in c.items()} for c in cases]