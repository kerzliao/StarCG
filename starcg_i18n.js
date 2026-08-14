/**
 * StarCG shared i18n — zh-TW / en / ko
 * Usage: StarCG_I18N.init({ page: 'char'|'pet'|'price', onChange?: fn })
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'starcg_lang';
  const DEFAULT_LANG = 'zh-TW';
  const LANGS = [
    { code: 'zh-TW', label: '繁中' },
    { code: 'en', label: 'EN' },
    { code: 'ko', label: '한' },
  ];

  const M = {
    'nav.price': { 'zh-TW': '⭐ 市場查價器', en: '⭐ Market Prices', ko: '⭐ 시세 조회' },
    'nav.pet': { 'zh-TW': '🐾 寵物成長模擬', en: '🐾 Pet Growth', ko: '🐾 펫 성장' },
    'nav.char': { 'zh-TW': '⚔️ 角色能力計算', en: '⚔️ Character Stats', ko: '⚔️ 캐릭터 스탯' },
    'nav.site': { 'zh-TW': '🌐 官網', en: '🌐 Official Site', ko: '🌐 공식 사이트' },
    'nav.market': { 'zh-TW': '🏪 官方市場', en: '🏪 Official Market', ko: '🏪 공식 시장' },
    'nav.guide': { 'zh-TW': '📖 官方攻略網', en: '📖 Official Guide', ko: '📖 공식 가이드' },
    'nav.aria': { 'zh-TW': '相關連結', en: 'Related links', ko: '관련 링크' },
    'lang.label': { 'zh-TW': '語言', en: 'Language', ko: '언어' },

    'stat.hp': { 'zh-TW': '生命', en: 'HP', ko: 'HP' },
    'stat.mp': { 'zh-TW': '魔力', en: 'MP', ko: 'MP' },
    'stat.atk': { 'zh-TW': '攻擊', en: 'ATK', ko: '공격' },
    'stat.def': { 'zh-TW': '防禦', en: 'DEF', ko: '방어' },
    'stat.agi': { 'zh-TW': '敏捷', en: 'AGI', ko: '민첩' },
    'stat.spt': { 'zh-TW': '精神', en: 'SPI', ko: '정신' },
    'stat.rec': { 'zh-TW': '回復', en: 'REC', ko: '회복' },
    'stat.charm': { 'zh-TW': '魅力', en: 'CHM', ko: '매력' },
    'stat.matk': { 'zh-TW': '魔攻', en: 'MATK', ko: '마공' },
    'stat.amres': { 'zh-TW': '魔抗', en: 'MRES', ko: '마방' },
    'stat.crit': { 'zh-TW': '必殺', en: 'CRT', ko: '치명' },
    'stat.counter': { 'zh-TW': '反擊', en: 'CTR', ko: '반격' },
    'stat.hit': { 'zh-TW': '命中', en: 'HIT', ko: '명중' },
    'stat.dodge': { 'zh-TW': '閃躲', en: 'EVA', ko: '회피' },
    'stat.poison': { 'zh-TW': '中毒', en: 'Poison', ko: '독' },
    'stat.sleep': { 'zh-TW': '昏睡', en: 'Sleep', ko: '수면' },
    'stat.stone': { 'zh-TW': '石化', en: 'Petrify', ko: '석화' },
    'stat.drunk': { 'zh-TW': '酒醉', en: 'Drunk', ko: '취함' },
    'stat.chaos': { 'zh-TW': '混亂', en: 'Confuse', ko: '혼란' },
    'stat.forget': { 'zh-TW': '遺忘', en: 'Forget', ko: '망각' },

    'common.all': { 'zh-TW': '全部', en: 'All', ko: '전체' },
    'common.name': { 'zh-TW': '名稱', en: 'Name', ko: '이름' },
    'common.lv': { 'zh-TW': 'Lv', en: 'Lv', ko: 'Lv' },
    'common.max': { 'zh-TW': '滿', en: 'Max', ko: 'MAX' },
    'common.remain': { 'zh-TW': '剩餘', en: 'Left', ko: '잔여' },
    'common.unnamed': { 'zh-TW': '未命名', en: 'Untitled', ko: '이름 없음' },
    'common.random': { 'zh-TW': '隨機', en: 'Random', ko: '랜덤' },
    'common.min': { 'zh-TW': '最低', en: 'Min', ko: '최소' },
    'common.avg': { 'zh-TW': '平均', en: 'Avg', ko: '평균' },
    'common.maxVal': { 'zh-TW': '最高', en: 'Max', ko: '최대' },
    'common.custom': { 'zh-TW': '自選', en: 'Pick', ko: '선택' },

    'game.race.humanoid': { 'zh-TW': '人形', en: 'Humanoid', ko: '인형' },
    'game.race.insect': { 'zh-TW': '昆蟲', en: 'Insect', ko: '곤충' },
    'game.race.plant': { 'zh-TW': '植物', en: 'Plant', ko: '식물' },
    'game.race.special': { 'zh-TW': '特殊', en: 'Special', ko: '특수' },
    'game.race.dragon': { 'zh-TW': '龍', en: 'Dragon', ko: '용' },
    'game.race.beast': { 'zh-TW': '野獸', en: 'Beast', ko: '야수' },
    'game.race.flying': { 'zh-TW': '飛行', en: 'Flying', ko: '비행' },
    'game.race.undead': { 'zh-TW': '不死', en: 'Undead', ko: '언데드' },
    'game.race.metal': { 'zh-TW': '金屬', en: 'Metal', ko: '금속' },
    'game.tier.gold': { 'zh-TW': '金', en: 'Gold', ko: '골' },
    'game.tier.silver': { 'zh-TW': '銀', en: 'Silver', ko: '실' },
    'game.tier.normal': { 'zh-TW': '普', en: 'Normal', ko: '일' },

    /* ── Character Calculator ── */
    'char.docTitle': { 'zh-TW': '角色能力計算器 - 星詠魔力', en: 'Character Stats - Star CG', ko: '캐릭터 스탯 - Star CG' },
    'char.title': { 'zh-TW': '⚔️ 角色能力計算器', en: '⚔️ Character Stats Calculator', ko: '⚔️ 캐릭터 스탯 계산기' },
    'char.params': { 'zh-TW': '配點設定', en: 'Point allocation', ko: '포인트 배분' },
    'char.paramsHint': { 'zh-TW': '單項上限為可配點數的一半。', en: 'Each stat cap is half of available points.', ko: '각 스탯 상한은 배분 가능 포인트의 절반입니다.' },
    'char.bonusSystems': { 'zh-TW': '加成系統', en: 'Bonus systems', ko: '보너스 시스템' },
    'char.bonusSystemsHint': { 'zh-TW': '水晶、稱號、修練加成可分別啟用，並疊加至能力結果。', en: 'Crystal, titles, and training can be toggled and stack into results.', ko: '크리스탈·칭호·수련 보너스를 각각 켜고 결과에 중첩합니다.' },
    'char.pointsAvail': { 'zh-TW': '可配點數', en: 'Available', ko: '배분 가능' },
    'char.pointsUsed': { 'zh-TW': '已配點數', en: 'Used', ko: '사용함' },
    'char.pointsRemain': { 'zh-TW': '剩餘', en: 'Left', ko: '잔여' },
    'char.singleMax': { 'zh-TW': '單項最高', en: 'Per-stat cap', ko: '스탯 상한' },
    'char.clearStats': { 'zh-TW': '清空全配點', en: 'Clear all points', ko: '포인트 초기화' },
    'char.level': { 'zh-TW': '預測等級', en: 'Target level', ko: '목표 레벨' },
    'char.vit': { 'zh-TW': '體力', en: 'VIT', ko: '체력' },
    'char.str': { 'zh-TW': '力量', en: 'STR', ko: '힘' },
    'char.defStat': { 'zh-TW': '強度', en: 'DEF stat', ko: '강도' },
    'char.agiStat': { 'zh-TW': '速度', en: 'AGI stat', ko: '속도' },
    'char.mag': { 'zh-TW': '魔法', en: 'MAG', ko: '마법' },
    'char.crystal': { 'zh-TW': '水晶改造', en: 'Crystal upgrade', ko: '크리스탈 개조' },
    'char.crystalLevel': { 'zh-TW': '水晶等級', en: 'Crystal level', ko: '크리스탈 레벨' },
    'char.crystalRollMode': { 'zh-TW': '區間取値', en: 'Roll value', ko: '수치 방식' },
    'char.crystalReroll': { 'zh-TW': '🎲 重骰改造', en: '🎲 Reroll upgrades', ko: '🎲 개조 재굴림' },
    'char.crystalHintRoll': { 'zh-TW': '變更等級時自動補骰缺少的級數', en: 'Auto-roll missing tiers when level changes', ko: '레벨 변경 시 빠진 단계 자동 굴림' },
    'char.crystalHintCustom': { 'zh-TW': '自選模式下請於下方挑選各級詞條', en: 'Pick one stat per tier below', ko: '아래에서 각 단계별 옵션을 선택하세요' },
    'char.crystalCustomTitle': { 'zh-TW': '自選詞條（每級擇一，區間取平均）', en: 'Pick stats (one per tier, range uses average)', ko: '옵션 선택 (단계당 1개, 구간은 평균)' },
    'char.crystalPreview': { 'zh-TW': '水晶能力：', en: 'Crystal stats:', ko: '크리스탈 스탯:' },
    'char.crystalRefSummary': { 'zh-TW': '升級詞條表（每級隨機擇一）', en: 'Upgrade options (random pick per tier)', ko: '강화 옵션 (단계당 랜덤 1개)' },
    'char.crystalRefUpgrade': { 'zh-TW': '升級', en: 'Upgrade', ko: '강화' },
    'char.crystalRefStart': { 'zh-TW': '起始', en: 'Start', ko: '시작' },
    'char.crystalGrpBattle': { 'zh-TW': '攻防敏', en: 'ATK/DEF/AGI', ko: '공방민' },
    'char.crystalGrpVital': { 'zh-TW': '血魔精回', en: 'HP/MP/SPI/REC', ko: 'HP/MP/정/회' },
    'char.crystalGrpMod': { 'zh-TW': '必反命閃', en: 'CRT/CTR/HIT/EVA', ko: '치/반/명/회' },
    'char.crystalNoTier': { 'zh-TW': 'Lv.1 無升級詞條', en: 'Lv.1 has no upgrade rolls', ko: 'Lv.1은 강화 옵션 없음' },
    'char.titleAch': { 'zh-TW': '稱號成就', en: 'Title achievements', ko: '칭호 업적' },
    'char.titleCount': { 'zh-TW': '稱號數量', en: 'Title count', ko: '칭호 수' },
    'char.titleAchTier': { 'zh-TW': '成就門檻', en: 'Achievement tier', ko: '업적 단계' },
    'char.titleAchNone': { 'zh-TW': '尚未達到任何成就門檻', en: 'No achievement tiers unlocked', ko: '해금된 업적 단계 없음' },
    'char.titleAchPreview': { 'zh-TW': '稱號加成（門檻 {n} · {tiers} 階）：', en: 'Title bonus (tier {n} · {tiers} active):', ko: '칭호 보너스 (단계 {n} · {tiers}개):' },
    'char.titleAchRefSummary': { 'zh-TW': '成就加成一覽（疊加）', en: 'Achievement bonuses (stacking)', ko: '업적 보너스 일람 (중첩)' },
    'char.titleAchActive': { 'zh-TW': '激活', en: 'Active', ko: '활성' },
    'char.titleAchBonus': { 'zh-TW': '能力加成（疊加）', en: 'Stat bonus (stacking)', ko: '능력 보너스 (중첩)' },
    'char.titleAchAllResist': { 'zh-TW': '全異常抗性', en: 'All status resist', ko: '전체 이상 내성' },
    'char.titleAchMoveSpeed': { 'zh-TW': '角色移動速度', en: 'Move speed', ko: '이동 속도' },
    'char.train': { 'zh-TW': '修練', en: 'Training', ko: '수련' },
    'char.trainGroupMod': { 'zh-TW': '修正', en: 'Mods', ko: '보정' },
    'char.trainGroupResist': { 'zh-TW': '抗性', en: 'Resists', ko: '내성' },
    'char.trainNone': { 'zh-TW': '各項皆 Lv0，無加成', en: 'All Lv0, no bonus', ko: '모두 Lv0, 보너스 없음' },
    'char.trainPreview': { 'zh-TW': '修練加成：', en: 'Training bonus:', ko: '수련 보너스:' },
    'char.equip': { 'zh-TW': '裝備模擬', en: 'Equipment', ko: '장비 시뮬' },
    'char.equipHint': { 'zh-TW': '點擊欄位從圖鑑選裝備，能力自動帶入。', en: 'Click a slot to pick gear from catalog.', ko: '슬롯을 눌러 도감에서 장비를 선택하세요.' },
    'char.statModeGeneral': { 'zh-TW': '一般屬性（攻防敏回精）', en: 'Core stats (ATK/DEF/AGI/REC/SPI)', ko: '일반 스탯 (공/방/민/회/정)' },
    'char.statModeMod': { 'zh-TW': '修正／抗性', en: 'Mods / Resists', ko: '보정 / 내성' },
    'char.gem': { 'zh-TW': '寶石', en: 'Gem', ko: '보석' },
    'char.enchant': { 'zh-TW': '附魔石', en: 'Enchant', ko: '인챈트' },
    'char.clearEquips': { 'zh-TW': '清空全裝備', en: 'Clear all gear', ko: '장비 전체 해제' },
    'char.hyoriki': { 'zh-TW': '百靈耐（玩家製作／水龍：武器攻、防具防、敏回精 +5%）', en: 'Hyoriki (+5%: weapon ATK, armor DEF, AGI/REC/SPI)', ko: '백령내 (+5%: 무기 공, 방어구 방, 민/회/정)' },
    'char.equipPreviewHint': { 'zh-TW': '游標指向已裝備欄位或寶石／附魔石可預覽效果', en: 'Hover equipped slots or gems to preview stats', ko: '장착 슬롯·보석에 마우스를 올리면 미리보기' },
    'char.results': { 'zh-TW': '能力結果', en: 'Results', ko: '결과' },
    'char.basicResults': { 'zh-TW': '基本值', en: 'Base stats', ko: '기본 스탯' },
    'char.modResults': { 'zh-TW': '修正與抗值', en: 'Mods & resists', ko: '보정·내성' },
    'char.compare': { 'zh-TW': '比較清單', en: 'Compare list', ko: '비교 목록' },
    'char.addCompare': { 'zh-TW': '➕ 加入比較清單', en: '➕ Add to compare', ko: '➕ 비교 목록에 추가' },
    'char.loadCatalog': { 'zh-TW': '⏳ 載入裝備圖鑑…', en: '⏳ Loading equipment catalog…', ko: '⏳ 장비 도감 로딩…' },
    'char.mode.max': { 'zh-TW': '頂值', en: 'Max', ko: '최대' },
    'char.mode.near': { 'zh-TW': '近頂（90%）', en: 'Near max (90%)', ko: '근최대 (90%)' },
    'char.mode.high': { 'zh-TW': '中上（80%）', en: 'High (80%)', ko: '중상 (80%)' },
    'char.mode.avg': { 'zh-TW': '平均（50%）', en: 'Average (50%)', ko: '평균 (50%)' },
    'char.mode.custom': { 'zh-TW': '自訂（手動輸入）', en: 'Custom (manual)', ko: '사용자 지정' },
    'char.picker.basic': { 'zh-TW': '一般屬性', en: 'Core stats', ko: '일반 스탯' },
    'char.picker.extra': { 'zh-TW': '修正／抗性', en: 'Mods / Resists', ko: '보정 / 내성' },
    'char.picker.equip': { 'zh-TW': '選擇裝備：{slot}', en: 'Pick gear: {slot}', ko: '장비 선택: {slot}' },
    'char.picker.gem': { 'zh-TW': '選擇寶石：{slot}', en: 'Pick gem: {slot}', ko: '보석 선택: {slot}' },
    'char.picker.enchant': { 'zh-TW': '選擇附魔石：{slot}', en: 'Pick enchant: {slot}', ko: '인챈트 선택: {slot}' },
    'char.slot.acc1': { 'zh-TW': '飾品1', en: 'Acc 1', ko: '장신구1' },
    'char.slot.hat': { 'zh-TW': '帽子', en: 'Hat', ko: '모자' },
    'char.slot.acc2': { 'zh-TW': '飾品2', en: 'Acc 2', ko: '장신구2' },
    'char.slot.weapon': { 'zh-TW': '武器', en: 'Weapon', ko: '무기' },
    'char.slot.shield': { 'zh-TW': '盾牌', en: 'Shield', ko: '방패' },
    'char.slot.body': { 'zh-TW': '身體', en: 'Body', ko: '몸' },
    'char.slot.shoes': { 'zh-TW': '鞋子', en: 'Shoes', ko: '신발' },

    /* ── Pet Calculator ── */
    'pet.docTitle': { 'zh-TW': '寵物成長模擬器', en: 'Pet Growth Simulator', ko: '펫 성장 시뮬레이터' },
    'pet.title': { 'zh-TW': '🐾 寵物成長模擬器', en: '🐾 Pet Growth Simulator', ko: '🐾 펫 성장 시뮬레이터' },
    'pet.params': { 'zh-TW': '參數設定', en: 'Settings', ko: '설정' },
    'pet.loadCatalog': { 'zh-TW': '⏳ 正在載入寵物圖鑑…', en: '⏳ Loading pet catalog…', ko: '⏳ 펫 도감 로딩…' },
    'pet.race': { 'zh-TW': '🧬 種族', en: '🧬 Race', ko: '🧬 종족' },
    'pet.cardFilter': { 'zh-TW': '🃏 卡等', en: '🃏 Card tier', ko: '🃏 카드 등급' },
    'pet.cardNormal': { 'zh-TW': '普卡', en: 'Normal', ko: '일반' },
    'pet.cardSilver': { 'zh-TW': '銀卡', en: 'Silver', ko: '실버' },
    'pet.cardGold': { 'zh-TW': '金卡', en: 'Gold', ko: '골드' },
    'pet.selectPet': { 'zh-TW': '🔍 選擇圖鑑寵物', en: '🔍 Pick from catalog', ko: '🔍 도감에서 선택' },
    'pet.pleaseSelect': { 'zh-TW': '請選擇', en: 'Select…', ko: '선택…' },
    'pet.maxStarOff': { 'zh-TW': '⭐ 一鍵滿星：OFF', en: '⭐ Max stars: OFF', ko: '⭐ 최대 별: OFF' },
    'pet.maxStarOn': { 'zh-TW': '⭐ 一鍵滿星：ON', en: '⭐ Max stars: ON', ko: '⭐ 최대 별: ON' },
    'pet.name': { 'zh-TW': '✏️ 寵物名稱', en: '✏️ Pet name', ko: '✏️ 펫 이름' },
    'pet.namePh': { 'zh-TW': '選擇圖鑑後自動帶入', en: 'Auto-filled from catalog', ko: '도감 선택 시 자동 입력' },
    'pet.level': { 'zh-TW': '📈 等級 (Lv)', en: '📈 Level (Lv)', ko: '📈 레벨 (Lv)' },
    'pet.cardRank': { 'zh-TW': '🃏 卡片等級', en: '🃏 Card rank', ko: '🃏 카드 랭크' },
    'pet.modGrade': { 'zh-TW': '🔧 改造次數', en: '🔧 Mod count', ko: '🔧 개조 횟수' },
    'pet.modN': { 'zh-TW': '{n} 改', en: '{n} mod', ko: '{n}개조' },
    'pet.rowBase': { 'zh-TW': '原始檔次', en: 'Base stats', ko: '기본 스탯' },
    'pet.rowLost': { 'zh-TW': '掉檔', en: 'Lost', ko: '하락' },
    'pet.rowRand': { 'zh-TW': '隨機檔', en: 'Random', ko: '랜덤' },
    'pet.rowManual': { 'zh-TW': '配點', en: 'Points', ko: '배분' },
    'pet.randSum': { 'zh-TW': '🎲 隨機檔總和：', en: '🎲 Random sum: ', ko: '🎲 랜덤 합: ' },
    'pet.randWarn': { 'zh-TW': '⚠️ 隨機檔總和過高！', en: '⚠️ Random sum too high!', ko: '⚠️ 랜덤 합이 너무 높습니다!' },
    'pet.points': { 'zh-TW': '💎 可用點數：', en: '💎 Available points: ', ko: '💎 사용 가능 포인트: ' },
    'pet.pointWarn': { 'zh-TW': '⚠️ 配點超過上限！', en: '⚠️ Points over cap!', ko: '⚠️ 포인트 상한 초과!' },
    'pet.btnAllVit': { 'zh-TW': '❤️ 全體', en: '❤️ All VIT', ko: '❤️ 체력 전부' },
    'pet.btnAllStr': { 'zh-TW': '💪 全力', en: '💪 All STR', ko: '💪 힘 전부' },
    'pet.btnAllDef': { 'zh-TW': '⚔️ 全強', en: '⚔️ All DEF', ko: '⚔️ 강도 전부' },
    'pet.btnAllAgi': { 'zh-TW': '💨 全速', en: '💨 All AGI', ko: '💨 속도 전부' },
    'pet.btnAllMag': { 'zh-TW': '✨ 全魔', en: '✨ All MAG', ko: '✨ 마법 전부' },
    'pet.addCompare': { 'zh-TW': '➕ 加入比較清單', en: '➕ Add to compare', ko: '➕ 비교 목록에 추가' },
    'pet.preview': { 'zh-TW': '當前數值試算', en: 'Current stats', ko: '현재 스탯' },
    'pet.compare': { 'zh-TW': '成長模擬比較清單', en: 'Growth compare list', ko: '성장 비교 목록' },
    'pet.compareHint': { 'zh-TW': '👆 點列設為基準；再點一次取消。表頭可排序。拖曳 ⋮⋮ 或 ▲▼ 調整順序。', en: '👆 Click a row to set baseline. Sort via headers. Drag to reorder.', ko: '👆 행 클릭으로 기준 설정. 헤더 정렬·드래그로 순서 변경.' },
    'pet.colPoints': { 'zh-TW': '檔次配點', en: 'Stat points', ko: '스탯 배분' },
    'pet.colActions': { 'zh-TW': '操作', en: 'Actions', ko: '작업' },

    /* ── Price Checker (main UI) ── */
    'price.docTitle': { 'zh-TW': '星詠魔力 - 市場查價器', en: 'Star CG - Market Price Checker', ko: 'Star CG - 시세 조회' },
    'price.title': { 'zh-TW': '⭐ 星詠魔力 市場查價器', en: '⭐ Star CG Market Prices', ko: '⭐ Star CG 시세 조회' },
    'price.searchLabel': { 'zh-TW': '🔍 搜尋物品/寵物名稱', en: '🔍 Search item / pet name', ko: '🔍 아이템/펫 검색' },
    'price.searchPh': { 'zh-TW': '輸入名稱關鍵字...', en: 'Enter keyword…', ko: '이름 키워드 입력…' },
    'price.searchBtn': { 'zh-TW': '🔍 搜尋市場', en: '🔍 Search market', ko: '🔍 시장 검색' },
    'price.petScan': { 'zh-TW': '🐾 全場寵掃描', en: '🐾 Scan all pets', ko: '🐾 전체 펫 스캔' },
    'price.bounty': { 'zh-TW': '📋 快捷清單', en: '📋 Quick list', ko: '📋 빠른 목록' },
    'price.procurement': { 'zh-TW': '🛒 懸賞採購清單', en: '🛒 Bounty list', ko: '🛒 현상금 목록' },
    'price.tracked': { 'zh-TW': '⭐ 追蹤清單', en: '⭐ Tracked', ko: '⭐ 추적 목록' },
    'price.gradeFilter': { 'zh-TW': '📜 改造圖', en: '📜 Mod scroll', ko: '📜 개조도' },
    'price.soulFilter': { 'zh-TW': '🎖️ 英靈之誓', en: '🎖️ Soul oath', ko: '🎖️ 영령의 서약' },
    'price.seedFilter': { 'zh-TW': '🌱重來種子', en: '🌱 Rebirth seed', ko: '🌱 윤회 씨앗' },
    'price.exchange': { 'zh-TW': '💱 匯率 (幣:晶)', en: '💱 Rate (coin:crystal)', ko: '💱 환율 (골드:크리)' },
    'price.durability': { 'zh-TW': '🛡️ 耐久滿', en: '🛡️ Full durability', ko: '🛡️ 내구 만땅' },
    'price.exactSearch': { 'zh-TW': '🎯 精確搜尋', en: '🎯 Exact match', ko: '🎯 정확히 일치' },
    'price.petFilters': { 'zh-TW': '🐾 寵物篩選', en: '🐾 Pet filters', ko: '🐾 펫 필터' },
    'price.petLevel': { 'zh-TW': '等級', en: 'Level', ko: '레벨' },
    'price.babyOnly': { 'zh-TW': '🍼 1等', en: '🍼 Lv1', ko: '🍼 Lv1' },
    'price.petTier': { 'zh-TW': '級別', en: 'Tier', ko: '등급' },
    'price.petRace': { 'zh-TW': '種族', en: 'Race', ko: '종족' },
    'price.petTrans': { 'zh-TW': '改造', en: 'Mod', ko: '개조' },
    'price.thLocation': { 'zh-TW': '分流/地點', en: 'Channel/Location', ko: '채널/위치' },
    'price.thStall': { 'zh-TW': '攤位名稱', en: 'Stall', ko: '노점명' },
    'price.thQty': { 'zh-TW': '數量', en: 'Qty', ko: '수량' },
    'price.thType': { 'zh-TW': '類型', en: 'Type', ko: '유형' },
    'price.thLowCoin': { 'zh-TW': '💰 最低', en: '💰 Low', ko: '💰 최저' },
    'price.thAvgCoin': { 'zh-TW': '💰 平均', en: '💰 Avg', ko: '💰 평균' },
    'price.thLowCrystal': { 'zh-TW': '💎 最低', en: '💎 Low', ko: '💎 최저' },
    'price.thAvgCrystal': { 'zh-TW': '💎 平均', en: '💎 Avg', ko: '💎 평균' },
    'price.thTrades': { 'zh-TW': '成交筆數', en: 'Trades', ko: '거래 수' },
    'price.thUpdated': { 'zh-TW': '上次更新', en: 'Updated', ko: '갱신' },
    'price.thTrend': { 'zh-TW': '走勢', en: 'Trend', ko: '추세' },
  };

  const STAT_KEYS = ['hp','mp','atk','def','agi','spt','rec','charm','matk','amres','crit','counter','hit','dodge','poison','sleep','stone','drunk','chaos','forget'];

  let currentLang = DEFAULT_LANG;
  let onChangeCb = null;
  let pageTitleKey = null;
  const GAME_NAMES = {};
  const RACE_I18N_KEY = {
    '人形': 'game.race.humanoid', '昆蟲': 'game.race.insect', '植物': 'game.race.plant',
    '特殊': 'game.race.special', '龍': 'game.race.dragon', '野獸': 'game.race.beast',
    '飛行': 'game.race.flying', '不死': 'game.race.undead', '金屬': 'game.race.metal',
  };

  function getLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGS.some(l => l.code === saved)) return saved;
    } catch (_) {}
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (!LANGS.some(l => l.code === lang)) lang = DEFAULT_LANG;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    document.documentElement.lang = lang;
    document.body?.classList.remove('lang-zh-TW', 'lang-en', 'lang-ko');
    document.body?.classList.add('lang-' + lang);
    if (pageTitleKey) document.title = t(pageTitleKey);
    apply(document);
    if (typeof onChangeCb === 'function') onChangeCb(lang);
  }

  function t(key, params) {
    const entry = M[key];
    let text = entry?.[currentLang] ?? entry?.[DEFAULT_LANG] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  }

  function stat(key) {
    return t('stat.' + key);
  }

  function getStatLabels() {
    return Object.fromEntries(STAT_KEYS.map(k => [k, stat(k)]));
  }

  function apply(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      el.textContent = t(key);
    });
    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (!key) return;
      el.innerHTML = t(key);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      el.placeholder = t(key);
    });
    root.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (!key) return;
      el.title = t(key);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (!key) return;
      el.setAttribute('aria-label', t(key));
    });
    root.querySelectorAll('option[data-i18n-opt]').forEach(el => {
      const key = el.getAttribute('data-i18n-opt');
      if (!key) return;
      el.textContent = t(key);
    });
    root.querySelectorAll('[data-i18n-tip]').forEach(el => {
      const key = el.getAttribute('data-i18n-tip');
      if (!key) return;
      el.setAttribute('data-tip', t(key));
    });
  }

  function registerMessages(extra) {
    if (!extra || typeof extra !== 'object') return;
    Object.assign(M, extra);
    apply(document);
  }

  function registerGameNames(map) {
    if (!map || typeof map !== 'object') return;
    Object.assign(GAME_NAMES, map);
  }

  /** Display game item/pet name: zh-TW = 原文；en/ko = 譯名 · 原文（雙語） */
  function displayGameName(zhName, opts) {
    if (zhName == null || zhName === '') return '';
    const zh = String(zhName);
    if (currentLang === 'zh-TW') return zh;
    const entry = GAME_NAMES[zh];
    if (!entry) return zh;
    const trans = entry[currentLang === 'ko' ? 'ko' : 'en'] || entry.en || '';
    if (!trans || trans === zh) return zh;
    const mode = opts?.mode || 'bilingual';
    if (mode === 'translated') return trans;
    if (mode === 'zh') return zh;
    return `${trans} · ${zh}`;
  }

  function displayRace(raceZh) {
    if (!raceZh) return '';
    if (currentLang === 'zh-TW') return raceZh;
    const base = String(raceZh).replace(/系$/, '');
    const key = RACE_I18N_KEY[base];
    if (!key) return raceZh;
    return `${t(key)} · ${raceZh}`;
  }

  function displayCardTier(tier) {
    if (!tier) return '';
    const s = String(tier);
    if (currentLang === 'zh-TW') return s;
    if (s.includes('金')) return t('game.tier.gold');
    if (s.includes('銀')) return t('game.tier.silver');
    if (s.includes('普')) return t('game.tier.normal');
    return s;
  }

  function injectStyles() {
    if (document.getElementById('starcg-i18n-style')) return;
    const s = document.createElement('style');
    s.id = 'starcg-i18n-style';
    s.textContent = `
      .lang-switcher { display: inline-flex; align-items: center; gap: 0; margin-left: 6px;
        border: 1px solid var(--border, #ddd5c8); border-radius: 6px; overflow: hidden; flex-shrink: 0; }
      .lang-switcher button { border: none; background: transparent; padding: 4px 7px; font-size: 0.72rem;
        cursor: pointer; color: var(--text-secondary, #7a7268); font-weight: 600; line-height: 1.3; }
      .lang-switcher button:hover { background: var(--accent-soft, #ebe6de); color: var(--text-primary, #443c34); }
      .lang-switcher button.active { background: var(--accent, #8b7355); color: #fff; }
      body.lang-en, body.lang-ko { font-family: 'Noto Sans TC', 'Noto Sans KR', 'Noto Sans', -apple-system, sans-serif; }
    `;
    document.head.appendChild(s);
  }

  function mountSwitcher(navEl) {
    if (!navEl || navEl.querySelector('.lang-switcher')) return;
    injectStyles();
    const wrap = document.createElement('div');
    wrap.className = 'lang-switcher';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', t('lang.label'));
    LANGS.forEach(({ code, label }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.dataset.lang = code;
      btn.classList.toggle('active', code === currentLang);
      btn.addEventListener('click', () => {
        if (currentLang === code) return;
        wrap.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.lang === code));
        setLang(code);
      });
      wrap.appendChild(btn);
    });
    navEl.appendChild(wrap);
  }

  function init(opts) {
    opts = opts || {};
    currentLang = getLang();
    onChangeCb = opts.onChange || null;
    pageTitleKey = opts.titleKey || null;
    document.documentElement.lang = currentLang;
    document.body?.classList.add('lang-' + currentLang);
    const nav = document.querySelector('.header-nav');
    mountSwitcher(nav);
    if (pageTitleKey) document.title = t(pageTitleKey);
    apply(document);
  }

  global.StarCG_I18N = {
    init, t, stat, getStatLabels, apply, registerMessages, registerGameNames,
    displayGameName, displayRace, displayCardTier, getLang, setLang, LANGS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
