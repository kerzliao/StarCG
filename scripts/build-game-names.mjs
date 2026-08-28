/**
 * Extract unique zh game names and emit starcg_game_names.js
 * Invoked by scripts/build-game-names.ps1 (Node path)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertEquipNameToKo, getEquipKo } from './equip-ko-engine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA = path.join(__dirname, 'data');

const PET_DICT = JSON.parse(fs.readFileSync(path.join(DATA, 'game-names-pets.json'), 'utf8'));

// ── Equipment EN (CrossGate classic) ──
const EQUIP_EN = {
  '長劍': 'Long Sword', '闊劍': 'Broad Sword', '突刺劍': 'Estoc', '火舌劍': 'Flame Tongue',
  '面包劍': 'Baguette Sword', '雙手劍': 'Two-Handed Sword', '雙刃長劍': 'Double-Edged Long Sword',
  '鎖刃劍': 'Chain Blade Sword', '格斗劍': 'Fighting Sword', '長鍔劍': 'Long Guard Sword',
  '黑作太刀': 'Kurozukuri Katana', '豬牙劍': 'Boar Tusk Sword', '雙刃闊劍': 'Double-Edged Broad Sword',
  '巨劍': 'Great Sword', '長軍刀': 'Long Saber', '護身短劍': 'Guardian Dagger', '細柄短劍': 'Slender Dagger',
  '長軍刀+': 'Long Saber+', '村正': 'Muramasa', '細刃重劍': 'Fine Blade Heavy Sword', '剛硬巨劍': 'Rigid Great Sword',
  '青龍刀': 'Green Dragon Blade', '曲刀': 'Curved Blade', '彎勾劍': 'Hook Sword', '剛毅': 'Fortitude',
  '手斧': 'Hand Axe', '勇氣之斧': 'Axe of Courage', '寬手斧': 'Wide Hand Axe', '戰斗手斧': 'Battle Hand Axe',
  '格斗手斧': 'Fighting Hand Axe', '鋼斧': 'Steel Axe', '長戰斧': 'Long Battle Axe', '雙刃斧': 'Double-Edged Axe',
  '鈎爪斧': 'Hook Claw Axe', '闊刃斧': 'Broad Axe', '鑽保雷格之斧': 'Drill Pagrege Axe',
  '彎月大戰斧': 'Crescent Great Battle Axe', '大型闊刃斧': 'Large Broad Axe', '大型雙刃斧': 'Large Double-Edged Axe',
  '超大皇帝斧': 'Super Emperor Axe', '新月斧': 'Crescent Axe', '米諾陶斯戰斧': 'Minotaur Battle Axe',
  '大型雙刃斧+': 'Large Double-Edged Axe+', '帕魯凱斯之斧': 'Perukes Axe', '薄刃鈎爪斧': 'Thin Hook Claw Axe',
  '彎月長柄斧': 'Crescent Pole Axe', '金屬重斧': 'Metal Heavy Axe', '處刑斧': 'Execution Axe',
  '高速斧': 'High-Speed Axe', '重擊斧': 'Heavy Strike Axe',
  '短矛': 'Short Spear', '攻城槍': 'Siege Lance', '刺槍': 'Thrust Lance', '金屬槍': 'Metal Lance',
  '長柄彎槍': 'Long Pole Curved Lance', '長柄尖槍': 'Long Pole Sharp Lance', '穗槍': 'Tassel Lance',
  '雙叉戟': 'Twin Trident', '護衛槍': 'Guard Lance', '騎士槍': 'Knight Lance', '偃月刀': 'Glaive',
  '大砍槍': 'Great Slash Lance', '長尖槍': 'Long Sharp Lance', '蠍槍': 'Scorpion Lance', '雙刃槍': 'Double-Edged Lance',
  '闊刃槍': 'Broad Lance', '東方長刺鎗': 'Eastern Long Thrust Lance', '蠍槍+': 'Scorpion Lance+',
  '天空之槍': 'Sky Lance', '鈎爪槍': 'Hook Claw Lance', '原始槍': 'Primitive Lance', '三叉戰戟': 'Trident',
  '異型槍': 'Alien Lance', '痛擊槍': 'Pain Strike Lance', '穿刺槍': 'Pierce Lance',
  '輕型弓': 'Light Bow', '威力短弓': 'Power Short Bow', '短戰弓': 'Short Battle Bow', '獵弓': 'Hunting Bow',
  '強弓': 'Strong Bow', '格斗弓': 'Fighting Bow', '狙擊弓': 'Sniper Bow', '超強狙擊弓': 'Super Sniper Bow',
  '殺手長弓': 'Killer Long Bow', '沖擊弓': 'Impact Bow', '米斯特汀之弓': 'Misteltein Bow',
  '巨弓': 'Great Bow', '長格斗弓': 'Long Fighting Bow', '破邪長弓': 'Evil-Breaking Long Bow',
  '月光長弓': 'Moonlight Long Bow', '原始石弓': 'Primitive Stone Bow', '重弦弓': 'Heavy String Bow',
  '月光長弓+': 'Moonlight Long Bow+', '平行弓': 'Parallel Bow', '靈魂之弓': 'Soul Bow',
  '摘星之弓': 'Star-Picking Bow', '魔彈': 'Magic Bullet', '調和之弓': 'Harmony Bow', '月之弓': 'Moon Bow',
  '短杖': 'Short Staff', '權杖': 'Scepter', '大地之杖': 'Earth Staff', '激流權杖': 'Torrent Scepter',
  '魔之手杖': 'Magic Wand', '魔之權杖': 'Magic Scepter', '賢者手杖': 'Sage Wand', '賢者權杖': 'Sage Scepter',
  '琥珀杖': 'Amber Staff', '琥珀權杖': 'Amber Scepter', '魔晶之杖': 'Magic Crystal Staff',
  '元素之杖': 'Elemental Staff', '神聖之杖': 'Holy Staff', '怒音之杖': 'Raging Voice Staff',
  '隱者之杖': 'Hermit Staff', '光明短杖': 'Light Short Staff', '惡魔之杖': 'Demon Staff',
  '落雷權杖+': 'Thunder Scepter+', '太陽短杖': 'Sun Short Staff', '天使之杖': 'Angel Staff',
  '聖者之杖': 'Saint Staff', '星屑短杖': 'Stardust Short Staff', '王者之手': "King's Hand",
  '星錘杖': 'Star Hammer Staff',
  '小刀': 'Knife', '銳刃小刀': 'Sharp Blade Knife', '圓盤小刀': 'Disc Knife', '細刃擲刀': 'Fine Blade Throwing Knife',
  '滑翔小刀': 'Glide Knife', '細直刃小刀': 'Fine Straight Blade Knife', '耳柄小刀': 'Ear Handle Knife',
  '騎士小刀': 'Knight Knife', '球鍔小刀': 'Ball Guard Knife', '雙刃小刀': 'Double-Edged Knife',
  '忍者飛鏢': 'Ninja Shuriken', '闊刃小刀': 'Broad Blade Knife', '觸角小刀': 'Antenna Knife',
  '漢拉提小刀': 'Hanratty Knife', '凶殺刀': 'Murder Blade', '切肉小刀': 'Meat Cleaver Knife',
  '古傳小刀': 'Ancient Knife', '疾速短刀+': 'Swift Short Blade+', '華麗小刀': 'Gorgeous Knife',
  '手里劍': 'Shuriken', '勾爪擲刀': 'Hook Claw Throwing Knife', '幻之匕首': 'Phantom Dagger',
  '破滅刀': 'Ruin Blade', '凶殘刀': 'Brutal Blade',
  '木制大型回力鏢': 'Wooden Large Boomerang', '木製大型回力鏢': 'Wooden Large Boomerang',
  '青銅回力鏢': 'Bronze Boomerang', '追跡者': 'Tracker', '彩光回力鏢': 'Rainbow Boomerang',
  '暗殺回力鏢': 'Assassin Boomerang', '殺敵回力鏢': 'Killer Boomerang', '獅子回力鏢': 'Lion Boomerang',
  '銳角回力鏢': 'Sharp Horn Boomerang', '翼鹿回力鏢': 'Winged Deer Boomerang',
  '阿修塔羅回力鏢': 'Ashtaroth Boomerang', '北斗之鎌刀': 'Big Dipper Scythe', '蛇獅回力鏢': 'Snake Lion Boomerang',
  '鶇回力鏢': 'Thrush Boomerang', '雄翼牛回力鏢': 'Winged Bull Boomerang', '閃光回力鏢': 'Flash Boomerang',
  '凶豹回力鏢': 'Fierce Leopard Boomerang', '赤獅回力鏢': 'Red Lion Boomerang', '雄翼牛回力鏢+': 'Winged Bull Boomerang+',
  '熊翼牛回力鏢+': 'Winged Bull Boomerang+', '天使之翼': 'Angel Wings', '普利辛回力鏢': 'Pre-Sin Boomerang',
  '治愈回力鏢': 'Healing Boomerang', '治癒回力鏢': 'Healing Boomerang', '天秤回力鏢': 'Libra Boomerang',
  '基盤飛鏢': 'Base Dart', '節制飛鏢': 'Temperance Dart',
  '硬皮頭盔': 'Hard Leather Helmet', '銅制頭盔': 'Copper Helmet', '鐵板布盔': 'Iron Plate Cloth Helmet',
  '銅鐵皮盔': 'Copper Iron Helmet', '金屬護額': 'Metal Forehead Guard', '鐵制頭盔': 'Iron Helmet',
  '霸葛頭盔': 'Buckler Helmet', '角飾頭盔': 'Horned Helmet', '開放式頭盔': 'Open-Face Helmet',
  '葛理克頭盔': 'Gothic Helmet', '聖騎士之盔': 'Holy Knight Helm', '巴比克頭盔': 'Babique Helmet',
  '利刃頭盔': 'Blade Helmet', '騎士頭盔': 'Knight Helmet', '鋼制頭盔': 'Steel Helmet',
  '博流蓋爾頭盔': 'Brogue Helmet', '鉚釘頭盔': 'Rivet Helmet', '鋼制頭盔+': 'Steel Helmet+',
  '羽毛頭盔': 'Feather Helmet', '龍盔': 'Dragon Helm', '白金頭盔': 'Platinum Helmet',
  '聖龍頭盔': 'Holy Dragon Helm', '正義頭盔': 'Justice Helmet', '靈力頭盔': 'Spirit Helmet',
  '麻布帽': 'Linen Cap', '硬帽': 'Hard Cap', '輕帽': 'Light Cap', '皮帽': 'Leather Cap',
  '硬皮帽': 'Hard Leather Cap', '可愛的帽子': 'Cute Hat', '時髦帽子': 'Stylish Hat', '鴨舌帽': 'Visor Cap',
  '藍徽章之帽': 'Blue Badge Cap', '高級帽子': 'Premium Hat', '劍客帽': 'Swordsman Cap',
  '裝飾着花的帽子': 'Flower-Decorated Hat', '裝飾著花的帽子': 'Flower-Decorated Hat',
  '青銅帽子': 'Bronze Hat', '淑女帽': 'Lady Hat', '可愛的扁帽子': 'Cute Flat Hat',
  '軍帽': 'Military Cap', '時髦避暑帽': 'Stylish Sun Hat', '可愛的扁帽子+': 'Cute Flat Hat+',
  '羽毛帽': 'Feather Cap', '魔術師之帽': 'Magician Hat', '黃昏之帽': 'Twilight Cap', '妖精之帽': 'Fairy Cap',
  '貝斯神帽': 'Bass God Cap', '神官帽': 'Cleric Cap', '頭目帽子': 'Boss Cap',
  '軟皮甲': 'Soft Leather Armor', '護心甲': 'Heart Guard Armor', '青銅鎧甲': 'Bronze Armor',
  '輕型鎧甲': 'Light Armor', '輕型鎖鏈甲': 'Light Chain Mail', '輕型鎖鍊甲': 'Light Chain Mail',
  '環甲': 'Ring Mail', '鋼鐵鎧甲': 'Steel Armor', '金屬皮甲': 'Metal Leather Armor',
  '長型金屬鎧甲': 'Long Metal Armor', '索狀鎧甲': 'Cord Armor', '劍齒鎧甲': 'Sawtooth Armor',
  '重鐵板甲': 'Heavy Iron Plate Armor', '鐵板半身甲': 'Half Iron Plate Armor', '實戰鎧甲': 'Combat Armor',
  '黃金鎧甲': 'Gold Armor', '重金屬鎧甲': 'Heavy Metal Armor', '野獸之鎧': 'Beast Armor', '實戰鎧甲+': 'Combat Armor+',
  '帝王之鎧': 'Emperor Armor', '亡靈鎧甲': 'Undead Armor', '漆黑之鎧': 'Jet Black Armor',
  '騎士鎧甲': 'Knight Armor', '紅繩威鎧': 'Red Rope Armor', '守護鎧甲': 'Guardian Armor',
  '旅人之服': 'Traveler Clothes', '保護衣': 'Protective Clothes', '羽毛裝': 'Feather Outfit',
  '皮裝': 'Leather Outfit', '硬皮服': 'Hard Leather Clothes', '鎖鏈裝': 'Chain Outfit',
  '布甲': 'Cloth Armor', '櫬甲': 'Padded Armor', '襯甲': 'Padded Armor', '環服': 'Ring Clothes',
  '士兵護衣': 'Soldier Guard Clothes', '功夫裝': 'Kung Fu Outfit', '長索錐衣': 'Long Cord Clothes',
  '索錐上衣': 'Cord Top', '骨衣': 'Bone Clothes', '超級衣服': 'Super Clothes', '疾風之衣': 'Gale Clothes',
  '步兵戰衣': 'Infantry Battle Clothes', '獸骨之衣+': 'Beast Bone Clothes+', '勇者之衣': 'Hero Clothes',
  '女神之衣': 'Goddess Clothes', '不死鳥之服': 'Phoenix Clothes', '靈魂之服': 'Soul Clothes',
  '海洋之服': 'Ocean Clothes', '幻想之服': 'Fantasy Clothes',
  '羽毛袍': 'Feather Robe', '輕皮袍': 'Light Leather Robe', '網袍': 'Net Robe', '風袍': 'Wind Robe',
  '硬皮袍': 'Hard Leather Robe', '環袍': 'Ring Robe', '烏鴉之袍': 'Crow Robe', '月亮之袍': 'Moon Robe',
  '狐皮披風': 'Fox Fur Cloak', '東方法衣': 'Eastern Robe', '聖堂之袍': 'Sanctuary Robe',
  '治愈之袍': 'Healing Robe', '治癒之袍': 'Healing Robe', '聖者之袍': 'Saint Robe', '戰斗長袍': 'Battle Robe',
  '冠軍之袍': 'Champion Robe', '時之袍': 'Time Robe', '死神之袍': 'Death Robe', '勇者之袍': 'Hero Robe',
  '潔淨之袍+': 'Purify Robe+', '黑暗之袍': 'Dark Robe', '聖袍': 'Holy Robe', '靈魂之袍': 'Soul Robe',
  '奇蹟之袍': 'Miracle Robe', '共鳴之袍': 'Resonance Robe', '和平之袍': 'Peace Robe',
  '軟皮靴': 'Soft Leather Boots', '皮靴': 'Leather Boots', '硬皮靴': 'Hard Leather Boots',
  '長靴': 'Long Boots', '厚底靴': 'Platform Boots', '編織的靴子': 'Woven Boots',
  '鎖鏈長靴': 'Chain Long Boots', '鎖鍊長靴': 'Chain Long Boots', '鎖鏈靴': 'Chain Boots', '鎖鍊靴': 'Chain Boots',
  '蜥蜴靴': 'Lizard Boots', '蜥蝪靴': 'Lizard Boots', '蜥蜴長靴': 'Lizard Long Boots', '蜥蝪長靴': 'Lizard Long Boots',
  '防護靴': 'Guard Boots', '鋼靴': 'Steel Boots', '鋼制長靴': 'Steel Long Boots', '水晶靴': 'Crystal Boots',
  '銀靴': 'Silver Boots', '流水之靴': 'Flowing Water Boots', '芙蕾雅之靴': 'Freya Boots',
  '標準長靴+': 'Standard Long Boots+', '鑽石靴': 'Diamond Boots', '鑽石長靴': 'Diamond Long Boots',
  '秘密之靴': 'Secret Boots', '龍之靴': 'Dragon Boots', '幸運靴': 'Lucky Boots', '試力鞋': 'Trial Shoes',
  '運動鞋': 'Sneakers', '馬車鞋': 'Carriage Shoes', '皮鞋': 'Leather Shoes', '安全鞋': 'Safety Shoes',
  '光之鞋': 'Light Shoes', '戰鞋': 'Battle Shoes', '薄板鞋': 'Thin Plate Shoes', '鎖鏈鞋': 'Chain Shoes',
  '鎖鍊鞋': 'Chain Shoes', '蜥蜴鞋': 'Lizard Shoes', '蜥蝪鞋': 'Lizard Shoes', '維京鞋': 'Viking Shoes',
  '特制舞鞋': 'Special Dance Shoes', '特製舞鞋': 'Special Dance Shoes', '戰斗鞋': 'Battle Shoes',
  '騎士鞋': 'Knight Shoes', '妖精鞋': 'Fairy Shoes', '紫水晶鞋': 'Amethyst Shoes', '白金鞋': 'Platinum Shoes',
  '精緻高根鞋': 'Refined High Heels', '妖精鞋+': 'Fairy Shoes+', '神秘之鞋': 'Mystery Shoes',
  '力量之鞋': 'Power Shoes', '黃金鞋': 'Gold Shoes', '龍之鞋': 'Dragon Shoes', '守護之鞋': 'Guardian Shoes',
  '大木屐': 'Large Geta',
  '小圓盾': 'Small Round Shield', '小型盾': 'Small Shield', '板盾': 'Plate Shield', '鳶盾': 'Kite Shield',
  '漩渦重盾': 'Vortex Heavy Shield', '哥特盾': 'Gothic Shield', '士兵盾': 'Soldier Shield',
  '重盾': 'Heavy Shield', '蜥蜴盾': 'Lizard Shield', '蜥蝪盾': 'Lizard Shield', '反光之盾': 'Reflect Shield',
  '聖者之盾': 'Saint Shield', '風之盾': 'Wind Shield', '獅子盾': 'Lion Shield', '防守之盾': 'Defense Shield',
  '黃金之盾': 'Gold Shield', '鏡之盾': 'Mirror Shield', '力量之盾': 'Power Shield',
  '防御之盾+': 'Defense Shield+', '漆黑之盾': 'Jet Black Shield', '火龍之盾': 'Fire Dragon Shield',
  '黑暗之盾': 'Dark Shield', '勇者之盾': 'Hero Shield', '突猛盾': 'Charge Shield', '重型防御盾': 'Heavy Defense Shield',
  '重型防禦盾': 'Heavy Defense Shield',
  '弗旦頭盔': 'Fudan Helm', '弗旦帽': 'Fudan Cap', '弗旦鎧': 'Fudan Armor', '弗旦衣': 'Fudan Clothes',
  '弗旦之袍': 'Fudan Robe', '弗旦靴': 'Fudan Boots', '弗旦鞋': 'Fudan Shoes', '弗旦之盾': 'Fudan Shield',
  '弗旦之戒': 'Fudan Ring', '弗旦頭盔+': 'Fudan Helm+', '弗旦帽+': 'Fudan Cap+', '弗旦鎧+': 'Fudan Armor+',
  '弗旦衣+': 'Fudan Clothes+', '弗旦之袍+': 'Fudan Robe+', '弗旦靴+': 'Fudan Boots+', '弗旦鞋+': 'Fudan Shoes+',
  '弗旦之盾+': 'Fudan Shield+', '弗旦之戒+': 'Fudan Ring+',
  '水龍之劍': 'Water Dragon Sword', '水龍之斧': 'Water Dragon Axe', '水龍之槍': 'Water Dragon Lance',
  '水龍之弓': 'Water Dragon Bow', '水龍之杖': 'Water Dragon Staff', '水龍的小刀': 'Water Dragon Knife',
  '冰龍': 'Ice Dragon', '水龍之盔': 'Water Dragon Helm', '水龍之帽': 'Water Dragon Cap',
  '水龍鎧甲': 'Water Dragon Armor', '水龍之衣': 'Water Dragon Clothes', '水龍法袍': 'Water Dragon Robe',
  '水龍之靴': 'Water Dragon Boots', '水龍之鞋': 'Water Dragon Shoes', '水龍之盾': 'Water Dragon Shield',
  '索爾護腕': 'Thor Bracer', '頓納護腕': 'Donar Bracer', '英靈之誓': 'Oath of Heroes',
  '水晶鏈墜': 'Crystal Pendant', '屈原的戒指': "Qu Yuan's Ring", '狂怒繃帶': 'Rage Bandage',
  '「年」的頸圈': 'Nian Collar', '受詛咒的姜餅人': 'Cursed Gingerbread', '受詛咒的薑餅人': 'Cursed Gingerbread',
  '洗禮的護符': 'Baptism Amulet', '真·戰符': 'True Battle Talisman', '真・戰符': 'True Battle Talisman',
  '聖域星戒': 'Sanctuary Star Ring',
  '仁愛之飾': 'Charity Ornament', '再生之飾': 'Regeneration Ornament', '勇氣之飾': 'Courage Ornament',
  '恢復之飾': 'Recovery Ornament', '突擊之飾': 'Assault Ornament', '迅果之飾': 'Swift Fruit Ornament',
  '猛擊之飾': 'Fierce Strike Ornament', '痛擊之飾': 'Pain Strike Ornament', '暗影之飾': 'Shadow Ornament',
  '馴養之飾': 'Taming Ornament',
};

const GEM_TYPES = {
  '石榴石': { en: 'Garnet', ko: '석류석' }, '黃寶石': { en: 'Topaz', ko: '토파즈' },
  '綠寶石': { en: 'Emerald', ko: '에메랄드' }, '藍寶石': { en: 'Sapphire', ko: '사파이어' },
  '冒險之星': { en: 'Adventurer Star', ko: '모험의 별' }, '紫水晶': { en: 'Amethyst', ko: '자수정' },
  '騎士寶石': { en: 'Knight Gem', ko: '기사 보석' }, '珍珠': { en: 'Pearl', ko: '진주' },
};

const QUEST_GEMS = {
  '砂漠紅星': { en: 'Desert Red Star', ko: '사막 적성' },
  '砂漠橙星': { en: 'Desert Orange Star', ko: '사막 주황성' },
  '流星': { en: 'Meteor', ko: '유성' },
  '冰原之晶': { en: 'Ice Crystal', ko: '빙원의 수정' },
  'O零件': { en: 'Part O', ko: 'O 부품' },
  'Q零件': { en: 'Part Q', ko: 'Q 부품' },
  '黑龍之鱗': { en: 'Black Dragon Scale', ko: '흑룡의 비늘' },
  '白龍之鱗': { en: 'White Dragon Scale', ko: '백룡의 비늘' },
};

const ENCHANT_BRACKET = {
  '海綿': ['Sponge', '스펀지'], '石蠟': ['Paraffin', '파라핀'], '石膏': ['Gypsum', '석고'],
  '滑石': ['Talc', '탈크'], '云母': ['Mica', '운모'], '螢石': ['Fluorite', '형석'],
  '輝石': ['Pyroxene', '휘석'], '石英': ['Quartz', '석영'], '剛玉': ['Corundum', '강옥'],
  '金剛玉': ['Adamantite', '금강석'], '微風': ['Breeze', '미풍'], '暖風': ['Warm Wind', '난풍'],
  '清風': ['Fresh Wind', '청풍'], '強風': ['Strong Wind', '강풍'], '疾風': ['Gale', '질풍'],
  '烈風': ['Violent Wind', '열풍'], '狂風': ['Furious Wind', '광풍'], '暴風': ['Storm', '폭풍'],
  '颶風': ['Hurricane', '허리케인'], '罡風': ['Tempest', '강풍'], '落葉': ['Fallen Leaf', '낙엽'],
  '小草': ['Sprout', '새싹'], '歌聲': ['Song', '노래'], '月影': ['Moon Shadow', '월영'],
  '春風': ['Spring Breeze', '봄바람'], '風雲': ['Wind Cloud', '풍운'], '金星': ['Venus', '금성'],
  '慈雨': ['Blessing Rain', '자비의 비'], '太陽': ['Sun', '태양'], '寂靜': ['Silence', '정적'],
  '霧氣': ['Mist', '안개'], '露水': ['Dew', '이슬'], '水窪': ['Puddle', '웅덩이'],
  '池塘': ['Pond', '연못'], '山澗': ['Mountain Stream', '산골 시내'], '小溪': ['Brook', '개울'],
  '湖泊': ['Lake', '호수'], '河流': ['River', '강'], '港灣': ['Harbor', '항구'], '海洋': ['Ocean', '대양'],
  '預備兵': ['Recruit', '예비병'], '斥侯': ['Scout', '정찰병'], '列兵': ['Private', '열등병'],
  '老兵': ['Veteran', '베테랑'], '騎士': ['Knight', '기사'], '百夫長': ['Centurion', '백부장'],
  '萬夫長': ['Chiliarch', '만부장'], '將軍': ['General', '장군'], '司令': ['Commander', '사령관'],
  '元帥': ['Marshal', '원수'], '火花': ['Spark', '불꽃'], '螢火': ['Firefly', '반딧불'],
  '燭火': ['Candle Flame', '촛불'], '篝火': ['Bonfire', '모닥불'], '灶火': ['Hearth Fire', '난로불'],
  '烽火': ['Beacon Fire', '봉화'], '戰火': ['War Fire', '전화'], '業火': ['Karma Fire', '업화'],
  '聖火': ['Holy Fire', '성화'], '神火': ['Divine Fire', '신화'], '農夫': ['Farmer', '농부'],
  '學徒': ['Apprentice', '견습생'], '學者': ['Scholar', '학자'], '教師': ['Teacher', '교사'],
  '教授': ['Professor', '교수'], '魔法師': ['Magician', '마법사'], '魔導師': ['Archmage', '마도사'],
  '法皇': ['Pontiff', '법황'], '賢者': ['Sage', '현자'], '聖賢': ['Holy Sage', '성현'],
};

const MATERIAL_DICT = {
  '小麥粉': ['Wheat Flour', '밀가루'], '鹿皮': ['Deer Hide', '사슴 가죽'], '雞蛋': ['Egg', '달걀'],
  '神聖米': ['Sacred Rice', '신성한 쌀'], '青椒': ['Green Pepper', '피망'], '蔥': ['Green Onion', '파'],
  '牛奶': ['Milk', '우유'], '大豆': ['Soybean', '대두'], '鹽': ['Salt', '소금'], '醬油': ['Soy Sauce', '간장'],
  '雞肉': ['Chicken', '닭고기'], '芹菜': ['Celery', '셀러리'], '竹筍': ['Bamboo Shoot', '죽순'],
  '海苔': ['Seaweed', '김'], '牛肉': ['Beef', '소고기'], '星鰻': ['Conger Eel', '붕장어'],
  '姜': ['Ginger', '생강'], '馬鈴薯': ['Potato', '감자'], '胡椒': ['Pepper', '후추'], '米': ['Rice', '쌀'],
  '咖哩塊': ['Curry Block', '카레 블록'], '辣椒': ['Chili Pepper', '고추'], '高級奶油': ['Premium Butter', '고급 버터'],
  '霜降牛肉': ['Marbled Beef', '마블링 소고기'], '螃蟹': ['Crab', '게'], '伊勢蝦': ['Ise Shrimp', '이세새우'],
  '海膽': ['Sea Urchin', '성게'], '魚翅': ['Shark Fin', '어 fin'], '鱉': ['Softshell Turtle', '자라'],
  '銅條': ['Copper Bar', '구리괴'], '鐵條': ['Iron Bar', '철괴'], '銀條': ['Silver Bar', '은괴'],
  '鋁條': ['Aluminum Bar', '알루미늄괴'], '純銀條': ['Pure Silver Bar', '순은괴'], '金條': ['Gold Bar', '금괴'],
  '白金條': ['Platinum Bar', '백금괴'], '幻之鋼條': ['Phantom Steel Bar', '환의 강철괴'],
  '幻之銀條': ['Phantom Silver Bar', '환의 은괴'], '藍龍之鱗': ['Blue Dragon Scale', '푸른 용의 비늘'],
  '達馬斯礦條': ['Damascus Ore Bar', '다마스쿠스 광석괴'], '勒格耐席鉧條': ['Lagniappe Bar', '라그니압 광석괴'],
  '謝爾哈特礦條': ['Shillhart Ore Bar', '실하트 광석괴'], '喜馬拉斯礦條': ['Himaras Ore Bar', '히마라스 광석괴'],
  '奧利哈鋼條': ['Orichalcum Bar', '오리하르콘괴'], '印度輕木': ['Balsa Wood', '발사나무'],
  '蘋果薄荷': ['Apple Mint', '애플민트'], '榿': ['Alder', '오리나무'], '檸檬草': ['Lemongrass', '레몬그라스'],
  '黃月木': ['Yellow Moon Wood', '황월목'], '蝴蝶花': ['Butterfly Flower', '나비꽃'], '鐵杉': ['Hemlock', '헤mlock'],
  '果梨': ['Pear Fruit', '배'], '琵琶木': ['Loquat Wood', '비파나무'], '茉莫木': ['Momo Wood', '모모나무'],
  '桃木': ['Peach Wood', '복숭아나무'], '赤松': ['Red Pine', '적송'], '番紅花': ['Saffron', '사프란'],
  '樸': ['Hackberry', '느티나무'], '百里香': ['Thyme', '타임'], '杉': ['Cedar', '삼나무'],
  '單木': ['Single Wood', '단목'], '香草': ['Vanilla', '바닐라'], '罌粟': ['Poppy', '양귀비'],
  '魔法紅蘿卜': ['Magic Carrot', '마법 당근'], '絲柏': ['Cypress', '편백'], '苗香': ['Fennel', '회향'],
  '樺': ['Birch', '자작나무'], '七葉樹': ['Horse Chestnut', '칠엽수'],
};

const FOOD_DICT = {
  '面包': ['Bread', '빵'], '蛋包飯': ['Omelette Rice', '오므라이스'], '法國面包': ['French Bread', '바게트'],
  '炒面': ['Fried Noodles', '볶음면'], '青椒肉絲': ['Pepper Steak', '청피망 고기'], '燒雞': ['Roast Chicken', '구운 닭'],
  '親子丼': ['Oyakodon', '오야코동'], '漢堡': ['Hamburger', '햄버거'], '炒面面包': ['Yakisoba Pan', '야키소바 빵'],
  '壽喜鍋': ['Sukiyaki', '스키야키'], '咖哩飯': ['Curry Rice', '카레라이스'], '韓式泡菜飯': ['Kimchi Rice', '김치밥'],
  '螃蟹鍋': ['Crab Hot Pot', '게 전골'], '牛排': ['Steak', '스테이크'], '醋飯壽司': ['Vinegared Sushi', '초밥'],
  '豪華壽司組': ['Deluxe Sushi Set', '고급 초밥 세트'], '魚翅湯': ['Shark Fin Soup', '어 fin 수프'],
  '鱉料理': ['Softshell Turtle Dish', '자라 요리'], '韓式海鮮鍋': ['Korean Seafood Hot Pot', '한식 해물 전골'],
};

const ACCESSORY_EXTRA = {
  '聖魔石': ['Holy Demon Stone', '성마석'],
  '魔幣箱（100萬）': ['Coin Box (1M)', '마코인 상자（100만）'],
  '魔幣箱（50萬）': ['Coin Box (500K)', '마코인 상자（50만）'],
  '魔幣箱（10萬）': ['Coin Box (100K)', '마코인 상자（10만）'],
  '特技突破石': ['Skill Breakthrough Stone', '특기 돌파석'],
  '貓頭鷹頭盔': ['Owl Helmet', '부엉이 투구'], '偷襲密卷': ['Ambush Scroll', '기습 비급'],
  '充值禮盒': ['Recharge Gift Box', '충전 선물함'], '再生靈藥': ['Regeneration Elixir', '재생 영약'],
  '寵物再生藥劑': ['Pet Regeneration Potion', '펫 재생 약제'], '重來的種子': ['Seed of Renewal', '다시 시작의 씨앗'],
  '改名卡': ['Rename Card', '개명 카드'], '魔族的水晶': ['Demon Crystal', '마족의 수정'],
  '誓言之證': ['Proof of Oath', '서약의 증표'], '風龍蜥的甲殼': ['Wind Dragon Shell', '풍룡 도마뱀 껍질'],
  '鋼騎之礦': ['Steel Knight Ore', '강기의 광석'], '德特家的布': ['Detter Cloth', '데터 가의 천'],
  '火焰之魂': ['Flame Soul', '화염의 영혼'], '曼陀羅草的皮': ['Mandragora Skin', '만드라고라 껍질'],
  '妖草的血': ['Evil Weed Blood', '요초의 피'], '火的水晶碎片': ['Fire Crystal Fragment', '불의 수정 조각'],
  '風的水晶碎片': ['Wind Crystal Fragment', '바람의 수정 조각'], '水的水晶碎片': ['Water Crystal Fragment', '물의 수정 조각'],
  '地的水晶碎片': ['Earth Crystal Fragment', '땅의 수정 조각'], '宇治金時': ['Uji Kintoki', '우지킨토키'],
  '永久冰石': ['Eternal Ice Stone', '영구 빙석'], '白熊肉排': ['Polar Bear Steak', '백熊 스테이크'],
  '火元素之證': ['Fire Element Proof', '화 원소의 증표'], '水元素之證': ['Water Element Proof', '수 원소의 증표'],
  '風元素之證': ['Wind Element Proof', '풍 원소의 증표'], '地元素之證': ['Earth Element Proof', '지 원소의 증표'],
  '星鰻飯糰': ['Conger Eel Rice Ball', '붕장어 주먹밥'],
};

const SKILL_BOOK = {
  '乾坤一擊': ['Qiankun Strike', '건곤일격'], '高級必殺': ['Advanced Critical', '고급 필살'],
  '必殺之心': ['Critical Heart', '필살의 심'], '命中之眼': ['Accuracy Eye', '명중의 눈'],
  '魔力之源': ['Magic Source', '마력의 원'], '閃避奧義': ['Dodge Secret', '회피 오의'],
  '烈焰之力': ['Blaze Power', '열화의 힘'], '狂風之力': ['Gale Power', '광풍의 힘'],
  '寒冰之力': ['Ice Power', '한빙의 힘'], '巨石之力': ['Boulder Power', '거석의 힘'],
  '魔法抵御': ['Magic Resist', '마법 저항'], '閃避要訣': ['Dodge Art', '회피 요결'],
  '野蠻沖擊': ['Savage Impact', '야만 충격'], '反擊之力': ['Counter Power', '반격의 힘'],
};

const BOUNTY_CAT = {
  '生命（全身）': ['HP (Full Body)', '생명（전신）'],
  '防禦（全身）': ['Defense (Full Body)', '방어（전신）'],
  '回復（防具）': ['Recovery (Armor)', '회복（방어구）'],
  '敏捷（足部）': ['Agility (Feet)', '민첩（발）'],
  '攻擊（武器）': ['Attack (Weapon)', '공격（무기）'],
  '精神（武器）': ['Spirit (Weapon)', '정신（무기）'],
  '魔力（頭部）': ['Magic (Head)', '마력（머리）'],
  '任務道具': ['Quest Items', '퀘스트 아이템'],
  '飾品': ['Accessories', '장신구'],
  '特殊': ['Special', '특수'],
  '料理(一箱)': ['Food (Crate)', '요리（한 상자）'],
  '料理(單個)': ['Food (Single)', '요리（개별）'],
  '藥水(一包)': ['Potions (Pack)', '물약（한 봉）'],
  '藥水(單個)': ['Potions (Single)', '물약（개별）'],
  '寵書(普)': ['Pet Book (Normal)', '펫서（일반）'],
  '寵書(良)': ['Pet Book (Fine)', '펫서（양）'],
  '寵書(優)': ['Pet Book (Superior)', '펫서（우）'],
  '半魔(物攻)': ['Half-Demon (Physical)', '반마（물공）'],
  '半魔(魔法)': ['Half-Demon (Magic)', '반마（마법）'],
  '半魔(輔助)': ['Half-Demon (Support)', '반마（보조）'],
  '半魔(狀態)': ['Half-Demon (Status)', '반마（상태）'],
};

const VARIANT_ALIASES = {
  '手裡劍': '手里劍', '麵包劍': '面包劍', '格鬥手斧': '格斗手斧', '格鬥弓': '格斗弓', '格鬥劍': '格斗劍',
  '長格鬥弓': '長格斗弓', '鋼製長靴': '鋼制長靴', '鋼製頭盔': '鋼制頭盔', '鋼製頭盔+': '鋼制頭盔+',
  '銅製頭盔': '铜制頭盔', '鐵製頭盔': '铁制頭盔', '戰鬥手斧': '战斗手斧', '戰鬥長袍': '战斗长袍', '戰鬥鞋': '战斗鞋',
  '鉤爪斧': '钩爪斧', '鉤爪槍': '鈎爪槍', '薄刃鉤爪斧': '薄刃钩爪斧', '水龍之服': '水龍之衣',
  '完全结晶體': '完全結晶體', '蜜桃多拉姆糖': '蜜桃多拉姆糖 ',
  '兇殺刀': '凶殺刀', '兇殘刀': '凶殘刀', '衝擊弓': '沖擊弓', '戰鬥長袍': '戰斗長袍',
  '黃蠍': '黃蝎',
};

function normalizeZh(zh) {
  return VARIANT_ALIASES[zh] || zh;
}

function pair(en, ko) { return { en, ko }; }

function equipKo(zh, en) {
  return { en, ko: getEquipKo(zh, en) };
}

function translateGemTier(zh) {
  const norm = zh.replace(/结晶/g, '結晶');
  for (const [gZh, g] of Object.entries(GEM_TYPES)) {
    const table = [
      [`${gZh}的碎片`, `${g.en} Fragment`, `${g.ko} 조각`],
      [`破損的很嚴重的${gZh}`, `Heavily Damaged ${g.en}`, `심하게 손상된 ${g.ko}`],
      [`破破的${gZh}`, `Broken ${g.en}`, `부서진 ${g.ko}`],
      [`有點破損的${gZh}`, `Slightly Damaged ${g.en}`, `약간 손상된 ${g.ko}`],
      [`還不錯的${gZh}`, `Decent ${g.en}`, `괜찮은 ${g.ko}`],
      [`優良的${gZh}`, `Fine ${g.en}`, `우수한 ${g.ko}`],
      [`非常優良的${gZh}`, `Very Fine ${g.en}`, `매우 우수한 ${g.ko}`],
      [`接近完美的${gZh}`, `Near-Perfect ${g.en}`, `거의 완벽한 ${g.ko}`],
      [`完全結晶體的${gZh}`, `Perfect Crystallized ${g.en}`, `완전 결정체 ${g.ko}`],
      [gZh, g.en, g.ko],
    ];
    for (const [pat, en, ko] of table) {
      if (norm === pat || zh === pat) return pair(en, ko);
    }
  }
  return null;
}

function translateEnchant(zh) {
  const m = zh.match(/^附魔石【(.+)】$/);
  if (!m) return null;
  const b = ENCHANT_BRACKET[m[1]];
  if (!b) return pair(`Enchant Stone [${m[1]}]`, `부마석【${m[1]}】`);
  return pair(`Enchant Stone [${b[0]}]`, `부마석【${b[1]}】`);
}

function translatePotion(zh) {
  let m = zh.match(/^一包生命藥\((\d+)\)$/);
  if (m) return pair(`Life Potion Pack (${m[1]})`, `생명약 한 봉(${m[1]})`);
  m = zh.match(/^生命力回復藥（(\d+)）$/);
  if (m) return pair(`HP Recovery Potion (${m[1]})`, `생명력 회복약（${m[1]}）`);
  m = zh.match(/^一箱(.+)$/);
  if (m && FOOD_DICT[m[1]]) return pair(`Crate of ${FOOD_DICT[m[1]][0]}`, `${FOOD_DICT[m[1]][1]} 한 상자`);
  if (FOOD_DICT[zh]) return pair(FOOD_DICT[zh][0], FOOD_DICT[zh][1]);
  return null;
}

function translateMaterial(zh) {
  let m = zh.match(/^一袋(.+)$/);
  if (m && MATERIAL_DICT[m[1]]) return pair(`Bag of ${MATERIAL_DICT[m[1]][0]}`, `${MATERIAL_DICT[m[1]][1]} 한 자루`);
  if (MATERIAL_DICT[zh]) return pair(MATERIAL_DICT[zh][0], MATERIAL_DICT[zh][1]);
  return null;
}

function translateAccessory(zh) {
  if (ACCESSORY_EXTRA[zh]) return pair(...ACCESSORY_EXTRA[zh]);
  let m = zh.match(/^(.+)\[(普|良|優)\]$/);
  if (m && SKILL_BOOK[m[1]]) {
    const tier = { '普': ['Normal', '일반'], '良': ['Fine', '양'], '優': ['Superior', '우'] };
    return pair(`${SKILL_BOOK[m[1]][0]} [${tier[m[2]][0]}]`, `${SKILL_BOOK[m[1]][1]}[${tier[m[2]][1]}]`);
  }
  m = zh.match(/^(.+)之飾$/);
  if (m) return pair(`${m[1]} Ornament`, convertEquipNameToKo(zh));
  return null;
}

function translateName(zh) {
  if (!zh) return null;
  zh = normalizeZh(zh.trim());
  if (BOUNTY_CAT[zh]) return pair(...BOUNTY_CAT[zh]);
  if (PET_DICT[zh]) return PET_DICT[zh];
  if (QUEST_GEMS[zh]) return QUEST_GEMS[zh];
  if (GEM_TYPES[zh]) return GEM_TYPES[zh];
  const gem = translateGemTier(zh);
  if (gem) return gem;
  const enc = translateEnchant(zh);
  if (enc) return enc;
  const pot = translatePotion(zh);
  if (pot) return pot;
  const mat = translateMaterial(zh);
  if (mat) return mat;
  if (EQUIP_EN[zh]) return equipKo(zh, EQUIP_EN[zh]);
  const acc = translateAccessory(zh);
  if (acc) return acc;
  const koGuess = convertEquipNameToKo(zh);
  if (koGuess && koGuess !== zh) return pair(zh, koGuess);
  return pair(zh, zh);
}

function extractNames() {
  const set = new Set();
  const add = (n) => { if (n && typeof n === 'string') set.add(n.trim()); };

  const eqRaw = fs.readFileSync(path.join(ROOT, 'equipment_catalog.js'), 'utf8');
  for (const m of eqRaw.matchAll(/"name":\s*"([^"]+)"/g)) add(m[1]);

  const pets = JSON.parse(fs.readFileSync(path.join(ROOT, 'pets.json'), 'utf8'));
  function walkPet(p) {
    add(p.name);
    (p.evolutions || []).forEach(walkPet);
  }
  pets.forEach(walkPet);

  const html = fs.readFileSync(path.join(ROOT, 'StarCG_PriceChecker.html'), 'utf8');
  function evalConst(name) {
    const re = new RegExp(`const ${name} = ([\\s\\S]*?);\\n(?:const |function )`, 'm');
    const m = html.match(re);
    if (!m) return null;
    try { return eval('(' + m[1] + ')'); } catch { return null; }
  }

  for (const constName of ['BOUNTY_EQUIPMENT', 'BOUNTY_PETS', 'COMMON_ACCESSORIES', 'COMMON_POTIONS', 'COMMON_MATERIALS', 'COMMON_ENCHANTS']) {
    const data = evalConst(constName);
    if (!data) continue;
    for (const items of Object.values(data)) {
      for (const item of items) {
        if (Array.isArray(item)) add(item[1] ?? item[0]);
        else add(item);
      }
    }
  }

  for (const g of Object.keys(GEM_TYPES)) {
    for (const fn of [
      g => `${g}的碎片`, g => `破損的很嚴重的${g}`, g => `破破的${g}`, g => `有點破損的${g}`,
      g => g, g => `還不錯的${g}`, g => `優良的${g}`, g => `非常優良的${g}`,
      g => `接近完美的${g}`, g => `完全結晶體的${g}`,
    ]) add(fn(g));
  }

  const gemsJs = fs.readFileSync(path.join(ROOT, 'gems_data.js'), 'utf8');
  for (const m of gemsJs.matchAll(/label:\s*'([^']+)'/g)) add(m[1]);
  for (const m of gemsJs.matchAll(/(?:garnet|topaz|emerald|sapphire|adventure|amethyst|knight|pearl):\s*'([^']+)'/g)) add(m[1]);

  return [...set].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function emit(names) {
  const lines = [
    '/**',
    ' * Star CG game name i18n (zh → en / ko)',
    ' * Auto-generated by scripts/build-game-names.ps1 — do not edit by hand',
    ` * Generated: ${new Date().toISOString()}`,
    ` * Count: ${names.length}`,
    ' */',
    '(function (global) {',
    "  'use strict';",
    '  const MAP = {',
  ];
  for (const zh of names) {
    const t = translateName(zh);
    lines.push(`    '${esc(zh)}': { en: '${esc(t.en)}', ko: '${esc(t.ko)}' },`);
  }
  lines.push('  };');
  lines.push("  if (global.StarCG_I18N && typeof global.StarCG_I18N.registerGameNames === 'function') {");
  lines.push('    global.StarCG_I18N.registerGameNames(MAP);');
  lines.push('  }');
  lines.push("})(typeof globalThis !== 'undefined' ? globalThis : window);");
  lines.push('');
  return lines.join('\n');
}

const names = extractNames();
const outPath = path.join(ROOT, 'starcg_game_names.js');
fs.writeFileSync(outPath, emit(names), 'utf8');
console.log(`Wrote ${names.length} names to ${outPath}`);
