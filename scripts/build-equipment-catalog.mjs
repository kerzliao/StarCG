/**
 * 從 guide.starcg.net 裝備圖鑑 VitePress 頁面抓取資料，輸出 equipment.json
 * 用法：node scripts/build-equipment-catalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'equipment.json');

const CATEGORIES = [
  { slug: 'sword', slot: 'weapon', calcSlot: 'weapon', label: '劍', hash: 'BIXT0ZtI' },
  { slug: 'axe', slot: 'weapon', calcSlot: 'weapon', label: '斧', hash: 'BBVvAE8P' },
  { slug: 'spear', slot: 'weapon', calcSlot: 'weapon', label: '槍', hash: 'FqFwG8e9' },
  { slug: 'bow', slot: 'weapon', calcSlot: 'weapon', label: '弓', hash: 'DNNDnMqy' },
  { slug: 'staff', slot: 'weapon', calcSlot: 'weapon', label: '杖', hash: '3JEtVTV8' },
  { slug: 'dagger', slot: 'weapon', calcSlot: 'weapon', label: '小刀', hash: 'CcyC14O6' },
  { slug: 'boomerang', slot: 'weapon', calcSlot: 'weapon', label: '回力鏢', hash: 'DTqsnTNQ' },
  { slug: 'helmet', slot: 'armor', calcSlot: 'hat', label: '頭盔', hash: 'nJ5MC6hh' },
  { slug: 'hat', slot: 'armor', calcSlot: 'hat', label: '帽子', hash: 'DRh5zdqM' },
  { slug: 'headwear', slot: 'armor', calcSlot: 'hat', label: '頭戴', hash: 'XWdbhxSP' },
  { slug: 'armor', slot: 'armor', calcSlot: 'body', label: '鎧甲', hash: 'DSxtAy29' },
  { slug: 'clothes', slot: 'armor', calcSlot: 'body', label: '衣服', hash: 'P5S210ON' },
  { slug: 'robe', slot: 'armor', calcSlot: 'body', label: '長袍', hash: 'DieuYXqp' },
  { slug: 'boots', slot: 'armor', calcSlot: 'shoes', label: '靴子', hash: 'DrQDHeCq' },
  { slug: 'shoes', slot: 'armor', calcSlot: 'shoes', label: '鞋子', hash: 'vOVWsCPc' },
  { slug: 'shield', slot: 'armor', calcSlot: 'shield', label: '盾牌', hash: 'De6WYGe8' },
  { slug: 'ring', slot: 'accessory', calcSlot: 'acc', label: '戒指', hash: 'Cie_VO4F' },
  { slug: 'necklace', slot: 'accessory', calcSlot: 'acc', label: '項鍊', hash: 'Cw0FtUd1' },
  { slug: 'earring', slot: 'accessory', calcSlot: 'acc', label: '耳環', hash: 'I1tjr7Py' },
  { slug: 'bracelet', slot: 'accessory', calcSlot: 'acc', label: '手環', hash: 'BWXjZxmr' },
  { slug: 'amulet', slot: 'accessory', calcSlot: 'acc', label: '護身符', hash: '21aQvbaf' },
  { slug: 'instrument', slot: 'accessory', calcSlot: 'acc', label: '樂器', hash: 'DnY3p-90' },
  { slug: 'super-artifact', slot: 'special', calcSlot: 'weapon', label: '超神器', hash: 'CR8uLzm0' },
  { slug: 'fudan', slot: 'special', calcSlot: 'body', label: '弗旦', hash: '0aFHp8Th' },
  { slug: 'water-dragon', slot: 'special', calcSlot: 'body', label: '水龍', hash: 'D5uLadWK' },
  { slug: 'forest', slot: 'special', calcSlot: 'weapon', label: '樹海', hash: 'ByZf3krv' },
];

const STAT_LABELS = {
  生命: 'hp', HP: 'hp',
  魔力: 'mp', MP: 'mp',
  攻擊: 'atk', 防禦: 'def', 敏捷: 'agi', 精神: 'spt', 回復: 'rec',
  魅力: 'charm', 魔攻: 'matk', 抗魔: 'amres',
  必殺: 'crit', 反擊: 'counter', 命中: 'hit', 閃躲: 'dodge',
  中毒: 'poison', 昏睡: 'sleep', 石化: 'stone', 酒醉: 'drunk', 混亂: 'chaos', 遺忘: 'forget',
};

const STAT_KEYS = [...new Set(Object.values(STAT_LABELS))];

function decodeHtml(s) {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function parseNumPair(text) {
  const cleaned = text.replace(/\s/g, '');
  const range = cleaned.match(/([+\-]?\d+)~([+\-]?\d+)/);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const single = cleaned.match(/([+\-]?\d+)/);
  if (single) {
    const n = Number(single[1]);
    return { min: n, max: n };
  }
  return null;
}

function parseStatSpan(spanHtml) {
  const plain = decodeHtml(spanHtml.replace(/<[^>]+>/g, '')).trim();
  if (!plain || plain.startsWith('耐久')) return null;
  const label = Object.keys(STAT_LABELS).find(k => plain.startsWith(k));
  if (!label) return null;
  const rest = plain.slice(label.length).trim();
  const nums = parseNumPair(rest);
  if (!nums) return null;
  return { key: STAT_LABELS[label], ...nums };
}

function emptyStats() {
  return Object.fromEntries(STAT_KEYS.map(k => [k, 0]));
}

function parseCategoryJs(text, cat) {
  const htmlMatch = text.match(/D\('([^']*(?:\\'[^']*)*)',4\)\]/);
  if (!htmlMatch) {
    const alt = text.match(/a\[0\]\|\|\(a\[0\]=\[D\("([^"]+)"/);
    if (!alt) return [];
    return parseTableHtml(decodeHtml(alt[1].replace(/\\"/g, '"')), cat);
  }
  return parseTableHtml(decodeHtml(htmlMatch[1].replace(/\\'/g, "'")), cat);
}

function parseTableHtml(html, cat) {
  const items = [];
  const rows = html.split(/<tr[^>]*>/i).slice(1);
  for (const row of rows) {
    const nameMatch = row.match(/<strong[^>]*>([^<]+)<\/strong>/);
    if (!nameMatch) continue;
    const name = decodeHtml(nameMatch[1]).trim();
    if (!name) continue;

    const levelMatch = row.match(/<td class="center"[^>]*>(\d+)\s*級/);
    const level = levelMatch ? Number(levelMatch[1]) : null;

    const stats = emptyStats();
    const ranges = {};
    const statPart = row.split('</td>')[3] || row;
    const spans = statPart.match(/<span class="text-[^"]+"[^>]*>[\s\S]*?<\/span>/gi) || [];
    for (const span of spans) {
      const parsed = parseStatSpan(span);
      if (!parsed) continue;
      stats[parsed.key] = parsed.max;
      if (parsed.min !== parsed.max) ranges[parsed.key] = [parsed.min, parsed.max];
    }

    items.push({
      name,
      category: cat.label,
      categorySlug: cat.slug,
      slotGroup: cat.slot,
      calcSlot: cat.calcSlot,
      level,
      stats,
      ranges: Object.keys(ranges).length ? ranges : undefined,
    });
  }
  return items;
}

async function fetchCategory(cat) {
  const url = `https://guide.starcg.net/assets/equipment_${cat.slug}.md.${cat.hash}.js`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${cat.slug}: HTTP ${res.status}`);
  return res.text();
}

async function main() {
  const all = [];
  const seen = new Set();
  for (const cat of CATEGORIES) {
    try {
      const text = await fetchCategory(cat);
      const items = parseCategoryJs(text, cat);
      for (const item of items) {
        if (seen.has(item.name)) continue;
        seen.add(item.name);
        all.push(item);
      }
      console.log(`✓ ${cat.label}: ${items.length} 件`);
    } catch (err) {
      console.warn(`✗ ${cat.label}: ${err.message}`);
    }
  }
  all.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
  const payload = {
    version: new Date().toISOString().slice(0, 10),
    source: 'https://guide.starcg.net/equipment/',
    count: all.length,
    items: all,
  };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`\n寫入 ${OUT} — 共 ${all.length} 件`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
