# -*- coding: utf-8 -*-
"""requests 封装：统一 base URL、JSON 头与 Bearer 鉴权。"""
import requests


class ApiClient:
    def __init__(self, base_url, timeout=10):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.token = None

    def set_token(self, token):
        self.token = token

    def clear_token(self):
        self.token = None

    def _headers(self):
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def get(self, path, **kwargs):
        return self.session.get(self.base_url + path, headers=self._headers(), timeout=self.timeout, **kwargs)

    def post(self, path, **kwargs):
        return self.session.post(self.base_url + path, headers=self._headers(), timeout=self.timeout, **kwargs)

    def put(self, path, **kwargs):
        return self.session.put(self.base_url + path, headers=self._headers(), timeout=self.timeout, **kwargs)

    def delete(self, path, **kwargs):
        return self.session.delete(self.base_url + path, headers=self._headers(), timeout=self.timeout, **kwargs)