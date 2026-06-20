#!/usr/bin/env python3
"""下载官方教材封面缩略图并本地化，规避 CDN 防盗链。

读取 data/official-smartedu-junior-english-teachingmaterials.json，
按「版本-册次」下载每本教材封面（PDF 第 1 页缩略图），
压缩后存到 data/covers/，并写出 data/wordbook-covers.json 映射。
"""
import io
import json
import os
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "official-smartedu-junior-english-teachingmaterials.json")
# 补充来源：部分版本（如教科版）不在教材清单里，但封面 OCR 清单 + 电子书清单可拼出封面页 URL。
OCR_SRC = os.path.join(ROOT, "data", "official-smartedu-unmapped-cover-ocr.json")
EBOOKS_SRC = os.path.join(ROOT, "data", "official-smartedu-junior-english-ebooks.json")
OUT_DIR = os.path.join(ROOT, "data", "covers")
MAP_FILE = os.path.join(ROOT, "data", "wordbook-covers.json")

VOLUME = {"上册": "上", "下册": "下", "全一册": "全一册"}
PUBLISHER_ALIAS = {"外研社版": "外研版"}

# 文件名用 ASCII slug，避免中文路径在静态托管/微信环境出问题。
PUB_SLUG = {
    "人教版": "renjiao", "外研版": "waiyan", "译林版": "yilin",
    "北师大版": "beishida", "冀教版": "jijiao", "科普版": "kepu",
    "沪教版": "hujiao", "沪外教版": "huwaijiao", "沪教牛津版": "hujiaoniujin",
    "仁爱版": "renai", "鲁教版": "lujiao", "教科版": "jiaoke",
}
GRADE_SLUG = {
    "六年级上": "g6a", "六年级下": "g6b", "七年级上": "g7a", "七年级下": "g7b",
    "八年级上": "g8a", "八年级下": "g8b", "九年级上": "g9a", "九年级下": "g9b",
    "九年级全一册": "g9full",
}


def save_cover(url, slug):
    """下载封面图、压缩存到 data/covers/，返回站点相对路径。"""
    from PIL import Image

    # 部分 URL 路径含中文/空格，需对非 ASCII 部分做百分号编码。
    parts = urllib.parse.urlsplit(url)
    safe = urllib.parse.urlunsplit((
        parts.scheme, parts.netloc,
        urllib.parse.quote(parts.path, safe="/%"),
        urllib.parse.quote(parts.query, safe="=&%"),
        parts.fragment,
    ))
    # 关键：不带 Referer，CDN 才放行（带站点 referer 会 403）。
    req = urllib.request.Request(safe, headers={"User-Agent": "Mozilla/5.0"})
    raw = urllib.request.urlopen(req, timeout=30).read()
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    w, h = img.size
    if w > 300:
        img = img.resize((300, round(h * 300 / w)), Image.LANCZOS)
    img.save(os.path.join(OUT_DIR, f"{slug}.jpg"), "JPEG", quality=82, optimize=True)
    return f"data/covers/{slug}.jpg"


def main():
    with open(SRC, encoding="utf-8") as f:
        items = json.load(f).get("items", [])

    os.makedirs(OUT_DIR, exist_ok=True)
    cover_map = {}
    ok, fail = 0, 0

    # ① 主来源：官方教材清单的封面缩略图。
    for it in items:
        thumb = it.get("thumbnail")
        if not thumb:
            continue
        publisher = PUBLISHER_ALIAS.get(it.get("publisher"), it.get("publisher"))
        grade = f"{it.get('grade', '')}{VOLUME.get(it.get('volume'), it.get('volume') or '')}"
        key = f"{publisher}-{grade}"
        if key in cover_map:  # 同一本书有新旧多版封面，取第一张成功的即可。
            continue
        slug = f"{PUB_SLUG.get(publisher, publisher)}-{GRADE_SLUG.get(grade, grade)}"
        try:
            cover_map[key] = save_cover(thumb, slug)
            ok += 1
            print(f"OK  {key} -> {cover_map[key]}")
        except Exception as e:  # noqa: BLE001
            fail += 1
            print(f"FAIL {key}: {e}")

    # ② 补充来源：教材清单缺失的版本（如教科版），用 OCR 清单的 asset id 到电子书清单取封面页 URL。
    try:
        ocr = json.load(open(OCR_SRC, encoding="utf-8"))
        first_page = {it["id"]: it.get("first_page") for it in json.load(open(EBOOKS_SRC, encoding="utf-8")).get("items", [])}
        for it in ocr:
            publisher = PUBLISHER_ALIAS.get(it.get("publisher"), it.get("publisher"))
            grade = it.get("grade", "")
            key = f"{publisher}-{grade}"
            url = first_page.get(it.get("id"))
            if key in cover_map or not url:
                continue
            slug = f"{PUB_SLUG.get(publisher, publisher)}-{GRADE_SLUG.get(grade, grade)}"
            try:
                cover_map[key] = save_cover(url, slug)
                ok += 1
                print(f"OK+ {key} -> {cover_map[key]}")
            except Exception as e:  # noqa: BLE001
                fail += 1
                print(f"FAIL {key}: {e}")
    except FileNotFoundError:
        pass

    with open(MAP_FILE, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(cover_map.items())), f, ensure_ascii=False, indent=2)
    print(f"\n下载完成：成功 {ok}，失败 {fail}，映射写入 {MAP_FILE}")


if __name__ == "__main__":
    main()
