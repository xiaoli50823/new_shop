# -*- coding: utf-8 -*-
"""数据库连接与查询辅助（用于 SQL 数据校验）。"""
try:
    import pymysql
    HAS_PYMYSQL = True
except ImportError:  # pragma: no cover
    HAS_PYMYSQL = False
    pymysql = None


def connect(host, port, user, password, database):
    if not HAS_PYMYSQL:
        raise RuntimeError("缺少 PyMySQL，请先执行：pip install -r requirements.txt")
    return pymysql.connect(
        host=host, port=port, user=user, password=password,
        database=database, charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor,
    )


def fetch_one(conn, sql, params=None):
    with conn.cursor() as cur:
        cur.execute(sql, params or ())
        return cur.fetchone()


def fetch_all(conn, sql, params=None):
    with conn.cursor() as cur:
        cur.execute(sql, params or ())
        return cur.fetchall()