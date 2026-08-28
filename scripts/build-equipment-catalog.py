#!/usr/bin/env python3
"""從 guide.starcg.net 裝備圖鑑抓取資料，輸出 equipment.json"""
import json
import re
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "equipment.json"

CATEGORIES = [
    {"slug": "sword", "slot": "weapon", "calcSlot": "weapon", "label": "劍", "hash": "BIXT0ZtI"},
    {"slug": "axe", "slot": "weapon", "calcSlot": "weapon", "label": "斧", "hash": "BBVvAE8P"},
    {"slug": "spear", "slot": "weapon", "calcSlot": "weapon", "label": "槍", "hash": "FqFwG8e9"},
    {"slug": "bow", "slot": "weapon", "calcSlot": "weapon", "label": "弓", "hash": "DNNDnMqy"},
    {"slug": "staff", "slot": "weapon", "calcSlot": "weapon", "label": "杖", "hash": "3JEtVTV8"},
    {"slug": "dagger", "slot": "weapon", "calcSlot": "weapon", "label": "小刀", "hash": "CcyC14O6"},
    {"slug": "boomerang", "slot": "weapon", "calcSlot": "weapon", "label": "回力鏢", "hash": "DTqsnTNQ"},
    {"slug": "helmet", "slot": "armor", "calcSlot": "hat", "label": "頭盔", "hash": "nJ5MC6hh"},
    {"slug": "hat", "slot": "armor", "calcSlot": "hat", "label": "帽子", "hash": "DRh5zdqM"},
    {"slug": "headwear", "slot": "armor", "calcSlot": "hat", "label": "頭戴", "hash": "XWdbhxSP"},
    {"slug": "armor", "slot": "armor", "calcSlot": "body", "label": "鎧甲", "hash": "DSxtAy29"},
    {"slug": "clothes", "slot": "armor", "calcSlot": "body", "label": "衣服", "hash": "P5S210ON"},
    {"slug": "robe", "slot": "armor", "calcSlot": "body", "label": "長袍", "hash": "DieuYXqp"},
    {"slug": "boots", "slot": "armor", "calcSlot": "shoes", "label": "靴子", "hash": "DrQDHeCq"},
    {"slug": "shoes", "slot": "armor", "calcSlot": "shoes", "label": "鞋子", "hash": "vOVWsCPc"},
    {"slug": "shield", "slot": "armor", "calcSlot": "shield", "label": "盾牌", "hash": "De6WYGe8"},
    {"slug": "ring", "slot": "accessory", "calcSlot": "acc", "label": "戒指", "hash": "Cie_VO4F"},
    {"slug": "necklace", "slot": "accessory", "calcSlot": "acc", "label": "項鍊", "hash": "Cw0FtUd1"},
    {"slug": "earring", "slot": "accessory", "calcSlot": "acc", "label": "耳環", "hash": "I1tjr7Py"},
    {"slug": "bracelet", "slot": "accessory", "calcSlot": "acc", "label": "手環", "hash": "BWXjZxmr"},
    {"slug": "amulet", "slot": "accessory", "calcSlot": "acc", "label": "護身符", "hash": "21aQvbaf"},
    {"slug": "instrument", "slot": "accessory", "calcSlot": "acc", "label": "樂器", "hash": "DnY3p-90"},
    {"slug": "super-artifact", "slot": "special", "calcSlot": "weapon", "label": "超神器", "hash": "CR8uLzm0"},
    {"slug": "fudan", "slot": "special", "calcSlot": "body", "label": "弗旦", "hash": "0aFHp8Th"},
    {"slug": "water-dragon", "slot": "special", "calcSlot": "body", "label": "水龍", "hash": "D5uLadWK"},
    {"slug": "forest", "slot": "special", "calcSlot": "weapon", "label": "樹海", "hash": "ByZf3krv"},
]

STAT_LABELS = {
    "生命": "hp", "HP": "hp", "魔力": "mp", "MP": "mp",
    "攻擊": "atk", "防禦": "def", "敏捷": "agi", "精神": "spt", "回復": "rec",
    "魅力": "charm", "魔攻": "matk", "抗魔": "amres",
    "必殺": "crit", "反擊": "counter", "命中": "hit", "閃躲": "dodge",
    "中毒": "poison", "昏睡": "sleep", "石化": "stone", "酒醉": "drunk", "混亂": "chaos", "遺忘": "forget",
}
STAT_KEYS = list(dict.fromkeys(STAT_LABELS.values()))


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "StarCG-RoleCalculator/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_num_pair(text: str):
    cleaned = re.sub(r"\s+", "", text)
    m = re.search(r"([+\-]?\d+)~([+\-]?\d+)", cleaned)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.search(r"([+\-]?\d+)", cleaned)
    if m:
        n = int(m.group(1))
        return n, n
    return None


def parse_stat_span(span_html: str):
    plain = re.sub(r"<[^>]+>", "", span_html).strip()
    if not plain or plain.startswith("耐久"):
        return None
    label = next((k for k in STAT_LABELS if plain.startswith(k)), None)
    if not label:
        return None
    nums = parse_num_pair(plain[len(label):])
    if not nums:
        return None
    mn, mx = nums
    return STAT_LABELS[label], mn, mx


def extract_table_html(text: str) -> str:
    m = re.search(r"D\('(.+?)',4\)\]", text, re.DOTALL)
    if m:
        return m.group(1).replace("\\'", "'")
    m = re.search(r'a\[0\]\|\|\(a\[0\]=\[D\("(.+?)"', text, re.DOTALL)
    if m:
        return m.group(1).replace('\\"', '"')
    return ""


def parse_table(html: str, cat: dict):
    items = []
    for row in re.split(r"<tr[^>]*>", html)[1:]:
        nm = re.search(r"<strong[^>]*>([^<]+)</strong>", row)
        if not nm:
            continue
        name = nm.group(1).strip()
        if not name:
            continue
        lv = re.search(r'<td class="center"[^>]*>(\d+)\s*級', row)
        level = int(lv.group(1)) if lv else None
        stats = {k: 0 for k in STAT_KEYS}
        ranges = {}
        parts = row.split("</td>")
        stat_part = parts[3] if len(parts) > 3 else row
        for span in re.findall(r'<span class="text-[^"]+"[^>]*>.*?</span>', stat_part, re.I | re.S):
            parsed = parse_stat_span(span)
            if not parsed:
                continue
            key, mn, mx = parsed
            stats[key] = mx
            if mn != mx:
                ranges[key] = [mn, mx]
        item = {
            "name": name,
            "category": cat["label"],
            "categorySlug": cat["slug"],
            "slotGroup": cat["slot"],
            "calcSlot": cat["calcSlot"],
            "level": level,
            "stats": stats,
        }
        if ranges:
            item["ranges"] = ranges
        items.append(item)
    return items


def main():
    all_items = []
    seen = set()
    for cat in CATEGORIES:
        url = f"https://guide.starcg.net/assets/equipment_{cat['slug']}.md.{cat['hash']}.js"
        try:
            text = fetch(url)
            html = extract_table_html(text)
            items = parse_table(html, cat)
            for it in items:
                if it["name"] in seen:
                    continue
                seen.add(it["name"])
                all_items.append(it)
            print(f"✓ {cat['label']}: {len(items)} 件")
        except Exception as e:
            print(f"✗ {cat['label']}: {e}")
    all_items.sort(key=lambda x: x["name"])
    payload = {
        "version": __import__("datetime").date.today().isoformat(),
        "source": "https://guide.starcg.net/equipment/",
        "count": len(all_items),
        "items": all_items,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n寫入 {OUT} — 共 {len(all_items)} 件")


if __name__ == "__main__":
    main()
