(function () {
  const lv = (fn) => Array.from({ length: 10 }, (_, i) => fn(i + 1));

  const GEM_WEAPON = {
    garnet: lv(() => ({})),
    topaz: lv((L) => ({ crit: L, atkPct: -2 * L })),
    emerald: lv((L) => ({ crit: L, counter: -L })),
    sapphire: lv((L) => ({ atkPct: 1 + 2 * L, dodgeMult: 0.9 })),
    adventure: lv((L) => ({ atkPct: 8 + 2 * L })),
    amethyst: lv((L) => ({ def: 8 * L, atkPct: L })),
    knight: lv((L) => ({ hit: L, atkPct: -2 * L })),
    pearl: lv((L) => ({ hp: 20 + 10 * L })),
  };

  const GEM_ARMOR = {
    garnet: lv(() => ({})),
    topaz: lv((L) => ({ counter: L, defPct: -2 * L })),
    emerald: lv((L) => ({ crit: -L, counter: L })),
    sapphire: lv((L) => ({ hit: -L, defPct: 1 + 2 * L })),
    adventure: lv((L) => ({ defPct: 8 + 2 * L })),
    amethyst: lv((L) => ({ atk: 4 * L, defPct: L })),
    knight: lv((L) => ({ dodge: L, defPct: -2 * L })),
    pearl: lv((L) => ({ hp: 10 + 5 * L })),
  };

  const ENCHANT_RANGES = {
    def: lv((L) => [[4, 7], [6, 9], [8, 11], [10, 14], [14, 18], [17, 22], [22, 30], [28, 38], [36, 52], [48, 66]][L - 1]),
    agi: lv((L) => [[2, 5], [3, 6], [4, 7], [5, 9], [6, 12], [8, 15], [11, 19], [16, 24], [20, 32], [27, 40]][L - 1]),
    hp: lv((L) => [[6, 15], [9, 18], [12, 22], [16, 26], [22, 32], [30, 40], [38, 52], [50, 68], [66, 88], [80, 120]][L - 1]),
    mp: lv((L) => [[14, 25], [19, 32], [25, 40], [30, 50], [40, 62], [54, 78], [72, 98], [96, 128], [124, 166], [160, 220]][L - 1]),
    atk: lv((L) => [[2, 4], [3, 5], [4, 6], [5, 8], [6, 11], [8, 13], [11, 17], [14, 22], [19, 28], [25, 36]][L - 1]),
    rec: lv((L) => [[1, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 6], [5, 8], [7, 10], [9, 13], [11, 18]][L - 1]),
    spt: lv((L) => [[1, 3], [2, 3], [3, 4], [3, 5], [4, 7], [5, 9], [7, 11], [10, 14], [13, 18], [16, 25]][L - 1]),
  };

  const GEM_TYPE_IDS = ['garnet', 'topaz', 'emerald', 'sapphire', 'adventure', 'amethyst', 'knight', 'pearl'];
  const GEM_TYPE_LABELS = {
    garnet: '石榴石', topaz: '黃寶石', emerald: '綠寶石', sapphire: '藍寶石',
    adventure: '冒險之星', amethyst: '紫水晶', knight: '騎士寶石', pearl: '珍珠',
  };
  const GEM_TIER_NAMES = (type) => lv((L) => {
    const g = GEM_TYPE_LABELS[type];
    return [
      `${g}的碎片`, `破損的很嚴重的${g}`, `破破的${g}`, `有點破損的${g}`, g,
      `還不錯的${g}`, `優良的${g}`, `非常優良的${g}`, `接近完美的${g}`, `完全結晶體的${g}`,
    ][L - 1];
  });

  const ENCHANT_TYPE_LABELS = {
    def: '防禦（全身）', agi: '敏捷（足部）', hp: '生命（全身）', mp: '魔力（頭部）',
    atk: '攻擊（武器）', rec: '回復（防具）', spt: '精神（武器）',
  };
  const ENCHANT_STAT_KEY = {
    def: 'def', agi: 'agi', hp: 'hp', mp: 'mp', atk: 'atk', rec: 'rec', spt: 'spt',
  };
  const ENCHANT_SLOT_RULES = {
    def: ['hat', 'body', 'shoes', 'shield'],
    agi: ['shoes'],
    hp: ['hat', 'body', 'shoes', 'shield'],
    mp: ['hat'],
    atk: ['weapon'],
    rec: ['body'],
    spt: ['weapon'],
  };
  const GEM_SLOT_IDS = ['hat', 'weapon', 'shield', 'body', 'shoes'];
  const GEM_DECORATE_RATIOS = { max: 1.2, near: 1.16, high: 1.12, avg: 1.0, min: 0.8 };

  /** 圖片來源：guide.starcg.net/production/gems */
  const GEM_IMAGE_BASE = 'https://guide.starcg.net/images/';
  const GEM_TYPE_IMAGES = {
    garnet: 'r87i88Ew.png',
    topaz: 'yzGN24hM.png',
    emerald: '7lzo40TN.png',
    sapphire: 'fPwMy2m8.png',
    adventure: 'fPwMy2m8.png',
    amethyst: 'fSgSCyYZ.png',
    knight: 'fSgSCyYZ.png',
    pearl: 'yGd0iyjF.png',
  };
  const QUEST_GEM_IMAGES = {
    desert_red: '8FIEISVb.png',
    desert_orange: '2GLjqYJ8.png',
    meteor: 'NVbmyPKx.png',
    ice_crystal: 'fPwMy2m8.png',
    holy_stone: 'yGd0iyjF.png',
    part_o: 'DRiJc3Ew.png',
    part_q: 'DRiJc3Ew.png',
    black_dragon: 'vlG31Rvi.png',
    white_dragon: 'FiZwlCRz.png',
  };
  /** 附魔石：1–6 / 7–9 / 10 級各一組圖（同攻略表） */
  const ENCHANT_IMAGE_TIERS = [
    { def: 'eq92ItPU.png', agi: 'nk3zWEzp.png', hp: 'eq92ItPU.png', mp: 'F5As7pyq.png', atk: 'FEPxhhw2.png', rec: 'd4G8Scxx.png', spt: 'FEPxhhw2.png' },
    { def: 'EYmsmG52.png', agi: 'tSGBz8sY.png', hp: 'EYmsmG52.png', mp: 'PpJ9WCAa.png', atk: '47sTpttT.png', rec: 'p2c0stY1.png', spt: '47sTpttT.png' },
    { def: 'EAtpbmKi.png', agi: 'zJmZe2Ca.png', hp: 'EAtpbmKi.png', mp: 'nk3zWEzp.png', atk: 'l6AI9lvJ.png', rec: 'qjiu0izo.png', spt: 'l6AI9lvJ.png' },
  ];

  function enchantImageTier(level) {
    if (level >= 10) return 2;
    if (level >= 7) return 1;
    return 0;
  }

  function gemImageUrl(type) {
    const file = GEM_TYPE_IMAGES[type];
    return file ? GEM_IMAGE_BASE + file : '';
  }

  function questGemImageUrl(id) {
    const file = QUEST_GEM_IMAGES[id];
    return file ? GEM_IMAGE_BASE + file : '';
  }

  function enchantImageUrl(type, level) {
    const tier = ENCHANT_IMAGE_TIERS[enchantImageTier(level)];
    const file = tier?.[type];
    return file ? GEM_IMAGE_BASE + file : '';
  }

  function decorPickerImageUrl(item) {
    if (!item) return '';
    if (item.pickerKind === 'gem') {
      return isQuestGem(item.gemType) ? questGemImageUrl(item.gemType) : gemImageUrl(item.gemType);
    }
    if (item.pickerKind === 'enchant') return enchantImageUrl(item.enchantType, item.enchantLevel);
    return '';
  }

  /** 任務寶石：固定等級；數值為固定值或 [min,max] 浮動區間 */
  const QUEST_GEMS = {
    desert_red: {
      label: '砂漠紅星', level: 4,
      weapon: { crit: [-1, 5], counter: [-1, 5] },
      armor: { hit: [-1, 3], dodge: [-1, 3] },
    },
    desert_orange: {
      label: '砂漠橙星', level: 6,
      weapon: { crit: [-3, 7], counter: [-3, 7] },
      armor: { hit: [-3, 5], dodge: [-3, 5] },
    },
    meteor: {
      label: '流星', level: 5,
      weapon: { crit: 3, atk: -3 },
      armor: { dodge: 3, def: -3 },
    },
    ice_crystal: {
      label: '冰原之晶', level: 4,
      weapon: { rec: [3, 10] },
      armor: { spt: 3 },
    },
    holy_stone: {
      label: '聖魔石', level: 5,
      weapon: { hp: 15, mp: 15 },
      armor: { hp: 10, mp: 10, agi: [1, 2], hit: [1, 3] },
    },
    part_o: {
      label: 'O零件', level: 10,
      weapon: { allPct: 20, critPct: 10, hitPct: 10 },
      armor: { allPct: 20, critPct: 10, hitPct: 10, amresPct: 5 },
    },
    part_q: {
      label: 'Q零件', level: 11,
      weapon: { allPct: 30, critPct: 15, hitPct: 15 },
      armor: { allPct: 30, critPct: 15, hitPct: 15, amresPct: 10 },
    },
    black_dragon: {
      label: '黑龍之鱗', level: 10,
      weapon: { atk: 10, dodge: 9, crit: 1 },
      armor: { atk: 10, dodge: 9, crit: 1 },
    },
    white_dragon: {
      label: '白龍之鱗', level: 10,
      weapon: { atk: 10, hit: 9, counter: 1 },
      armor: { atk: 10, hit: 9, counter: 1 },
    },
  };
  const QUEST_GEM_IDS = Object.keys(QUEST_GEMS);

  function isQuestGem(id) { return id in QUEST_GEMS; }

  function getGemLabel(id) {
    return QUEST_GEMS[id]?.label || GEM_TYPE_LABELS[id] || id;
  }

  window.GEMS_DATA = {
    GEM_WEAPON, GEM_ARMOR, ENCHANT_RANGES, GEM_TYPE_IDS, GEM_TYPE_LABELS, GEM_TIER_NAMES,
    QUEST_GEMS, QUEST_GEM_IDS, isQuestGem, getGemLabel,
    ENCHANT_TYPE_LABELS, ENCHANT_STAT_KEY, ENCHANT_SLOT_RULES, GEM_SLOT_IDS, GEM_DECORATE_RATIOS,
    GEM_IMAGE_BASE, gemImageUrl, questGemImageUrl, enchantImageUrl, decorPickerImageUrl,
  };
})();
