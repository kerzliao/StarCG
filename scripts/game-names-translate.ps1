# Translation engine for build-game-names (PowerShell native, PS 5.1)
$script:PetDict = @{}
$script:EquipEn = @{}
$script:GemTypes = @{}
$script:QuestGems = @{}
$script:EnchantBracket = @{}
$script:MaterialDict = @{}
$script:FoodDict = @{}
$script:AccessoryExtra = @{}
$script:SkillBook = @{}
$script:BountyCat = @{}
$script:VariantAliases = @{}

$script:GameNamesScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent (Get-Item 'd:\CG\scripts\game-names-translate.ps1').FullName }
$script:EquipKoEnginePath = Join-Path $script:GameNamesScriptDir 'equip-ko-engine.ps1'
if (Test-Path $script:EquipKoEnginePath) { . $script:EquipKoEnginePath }

function Initialize-GameNameTranslators {
    param([string]$DataDir, [string]$Root)

    $petPath = Join-Path $DataDir 'game-names-pets.json'
    if (Test-Path $petPath) {
        $pj = Get-Content $petPath -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($prop in $pj.PSObject.Properties) {
            $script:PetDict[$prop.Name] = @{ en = $prop.Value.en; ko = $prop.Value.ko }
        }
    }

    $staticPath = Join-Path $DataDir 'game-names-static.json'
    if (Test-Path $staticPath) {
        $s = Get-Content $staticPath -Raw -Encoding UTF8 | ConvertFrom-Json
        Import-GameNameSection $s.equip $script:EquipEn
        Import-GameNameSection $s.gemTypes $script:GemTypes
        Import-GameNameSection $s.questGems $script:QuestGems
        Import-GameNameSection $s.enchant $script:EnchantBracket
        Import-GameNameSection $s.material $script:MaterialDict
        Import-GameNameSection $s.food $script:FoodDict
        Import-GameNameSection $s.accessory $script:AccessoryExtra
        Import-GameNameSection $s.skillBook $script:SkillBook
    }

    Import-DictionariesFromMjs

    if (Get-Command Initialize-EquipKoEngine -ErrorAction SilentlyContinue) {
        Initialize-EquipKoEngine
    }
}

function Import-GameNameSection($obj, [hashtable]$target) {
    if (-not $obj) { return }
    foreach ($prop in $obj.PSObject.Properties) {
        $v = $prop.Value
        if ($v.en) { $target[$prop.Name] = @{ en = $v.en; ko = $v.ko } }
        elseif ($v -is [System.Array] -and $v.Count -ge 2) { $target[$prop.Name] = @{ en = $v[0]; ko = $v[1] } }
        elseif ($v -is [string]) { $target[$prop.Name] = @{ en = $v; ko = $v } }
    }
}

function Import-DictionariesFromMjs {
    $scriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { 'd:\CG\scripts' }
    $mjsPath = Join-Path $scriptRoot 'build-game-names.mjs'
    if (-not (Test-Path $mjsPath)) { return }
    $text = [IO.File]::ReadAllText($mjsPath, (New-Object System.Text.UTF8Encoding $false))

    function Import-Section([string]$body, [hashtable]$target, [switch]$IsEquipString) {
        if ($IsEquipString) {
            [regex]::Matches($body, "'([^']+)': ""([^""]*)""") | ForEach-Object {
                $k = $_.Groups[1].Value; $v = $_.Groups[2].Value
                if ($k.Length -ge 1) { $target[$k] = @{ en = $v; ko = $v } }
            }
            [regex]::Matches($body, "'([^']+)': '((?:\\'|[^'])*)'") | ForEach-Object {
                $k = $_.Groups[1].Value; $v = $_.Groups[2].Value -replace "\\'", "'"
                if ($k.Length -ge 1 -and -not $target.ContainsKey($k)) { $target[$k] = @{ en = $v; ko = $v } }
            }
        } else {
            [regex]::Matches($body, "'([^']+)': \{ en: '([^']*(?:\\'[^']*)*)', ko: '([^']*)' \}") | ForEach-Object {
                $target[$_.Groups[1].Value] = @{ en = ($_.Groups[2].Value -replace "\\'", "'"); ko = $_.Groups[3].Value }
            }
            [regex]::Matches($body, "'([^']+)': \['([^']*)', '([^']*)'\]") | ForEach-Object {
                $target[$_.Groups[1].Value] = @{ en = $_.Groups[2].Value; ko = $_.Groups[3].Value }
            }
        }
    }

    if ($text -match 'const EQUIP_EN = \{([\s\S]*?)\n\};') { Import-Section $Matches[1] $script:EquipEn -IsEquipString }
    if ($text -match 'const GEM_TYPES = \{([\s\S]*?)\n\};') { Import-Section $Matches[1] $script:GemTypes }
    if ($text -match 'const QUEST_GEMS = \{([\s\S]*?)\n\};') { Import-Section $Matches[1] $script:QuestGems }
    if ($text -match 'const ENCHANT_BRACKET = \{([\s\S]*?)\n\};') { Import-Section $Matches[1] $script:EnchantBracket }
    if ($text -match 'const MATERIAL_DICT = \{([\s\S]*?)\n\};') { Import-Section $Matches[1] $script:MaterialDict }
    if ($text -match 'const FOOD_DICT = \{([\s\S]*?)\n\};') { Import-Section $Matches[1] $script:FoodDict }
    if ($text -match 'const ACCESSORY_EXTRA = \{([\s\S]*?)\n\};') { Import-Section $Matches[1] $script:AccessoryExtra }
    if ($text -match 'const SKILL_BOOK = \{([\s\S]*?)\n\};') { Import-Section $Matches[1] $script:SkillBook }
    if ($text -match 'const BOUNTY_CAT = \{([\s\S]*?)\n\};') { Import-Section $Matches[1] $script:BountyCat }
    if ($text -match 'const VARIANT_ALIASES = \{([\s\S]*?)\n\};') {
        [regex]::Matches($Matches[1], "'([^']+)': '([^']*)'") | ForEach-Object {
            $script:VariantAliases[$_.Groups[1].Value] = $_.Groups[2].Value
        }
    }
}

function Escape-GameNameJs([string]$s) {
    if ($null -eq $s) { return '' }
    return ($s -replace '\\','\\\\' -replace "'","\'")
}

function Translate-GemTier([string]$zh) {
    $norm = $zh.Replace('结晶', '結晶')
    foreach ($gZh in @($script:GemTypes.Keys)) {
        $g = $script:GemTypes[$gZh]
        $frag = [string][char]0x7684 + [char]0x788E + [char]0x7247
        $rows = @(
            @("$gZh$frag", "$($g.en) Fragment", "$($g.ko) $($([char]0xC870 + [char]0xAC01))"),
            @("$([char]0x7834 + [char]0x640D + [char]0x7684 + [char]0x5F88 + [char]0x56B4 + [char]0x91CD + [char]0x7684)$gZh", "Heavily Damaged $($g.en)", "$([char]0xC2EC + [char]0xD558 + [char]0xAC8C) $($([char]0xC190 + [char]0xC0C1 + [char]0xB41C)) $($g.ko)"),
            @("$([char]0x7834 + [char]0x7834 + [char]0x7684)$gZh", "Broken $($g.en)", "$([char]0xBD80 + [char]0xC11C + [char]0xC778) $($g.ko)"),
            @("$([char]0x6709 + [char]0x9EDE + [char]0x7834 + [char]0x640D + [char]0x7684)$gZh", "Slightly Damaged $($g.en)", "$([char]0xC57D + [char]0xAC04) $($([char]0xC190 + [char]0xC0C1 + [char]0xB41C)) $($g.ko)"),
            @("$([char]0x9084 + [char]0x4E0D + [char]0x932F + [char]0x7684)$gZh", "Decent $($g.en)", "$([char]0xAD6C + [char]0xCC9E + [char]0xC740) $($g.ko)"),
            @("$([char]0x512A + [char]0x826F + [char]0x7684)$gZh", "Fine $($g.en)", "$([char]0xC6B0 + [char]0xC218 + [char]0xD55C) $($g.ko)"),
            @("$([char]0x975E + [char]0x5E38 + [char]0x512A + [char]0x826F + [char]0x7684)$gZh", "Very Fine $($g.en)", "$([char]0xB9E4 + [char]0xC6B0) $($([char]0xC6B0 + [char]0xC218 + [char]0xD55C)) $($g.ko)"),
            @("$([char]0x63A5 + [char]0x8FD1 + [char]0x5B8C + [char]0x7F8E + [char]0x7684)$gZh", "Near-Perfect $($g.en)", "$([char]0xAC70 + [char]0xC758) $($([char]0xC644 + [char]0xBCBD + [char]0xD55C)) $($g.ko)"),
            @("$([char]0x5B8C + [char]0x5168 + [char]0x7ED3 + [char]0x6676 + [char]0x9AD4 + [char]0x7684)$gZh", "Perfect Crystallized $($g.en)", "$([char]0xC644 + [char]0xC804) $($([char]0xACB0 + [char]0xC815 + [char]0xCCB4)) $($g.ko)"),
            @($gZh, $g.en, $g.ko)
        )
        foreach ($row in $rows) { if ($norm -eq $row[0] -or $zh -eq $row[0]) { return @{ en = $row[1]; ko = $row[2] } } }
    }
    return $null
}

function Translate-Enchant([string]$zh) {
    $encZh = [char]0x9644 + [char]0x9B54 + [char]0x77F3
    $encKo = [char]0xBD80 + [char]0xB354 + [char]0xC11D
    if ($zh -notmatch "^$([regex]::Escape($encZh))\u3010(.+)\u3011$") { return $null }
    $inner = $Matches[1]
    if ($script:EnchantBracket.ContainsKey($inner)) {
        $b = $script:EnchantBracket[$inner]
        return @{ en = "Enchant Stone [$($b.en)]"; ko = "$encKo$([char]0x3010)$($b.ko)$([char]0x3011)" }
    }
    return @{ en = "Enchant Stone [$inner]"; ko = "$encKo$([char]0x3010)$inner$([char]0x3011)" }
}

function Translate-Potion([string]$zh) {
    $fwOpen = [char]0xFF08
    $fwClose = [char]0xFF09
    $packLife = [string][char]0x4E00 + [char]0x5305 + [char]0x751F + [char]0x547D + [char]0x85E5
    $singleLife = [string][char]0x751F + [char]0x547D + [char]0x529B + [char]0x56DE + [char]0x5FA9 + [char]0x85E5
    if ($zh.StartsWith($packLife) -and $zh -match '\((\d+)\)$') {
        $n = $Matches[1]
        $ko = [char]0xC0DD + [char]0xBA85 + [char]0xC57D + ' ' + [char]0xD55C + ' ' + [char]0xB77D + "($n)"
        return @{ en = "Life Potion Pack ($n)"; ko = $ko }
    }
    if ($zh.StartsWith($singleLife) -and $zh.EndsWith($fwClose) -and $zh -match '(\d+)') {
        $n = $Matches[1]
        $ko = [string][char]0xC0DD + [char]0xBA85 + [char]0xB825 + [char]0xD68C + [char]0xBCF5 + [char]0xC57D + $fwOpen + $n + $fwClose
        return @{ en = "HP Recovery Potion ($n)"; ko = $ko }
    }
    if ($script:FoodDict.ContainsKey($zh)) { return $script:FoodDict[$zh] }
    $crate = [char]0x4E00 + [char]0x7BB1
    if ($zh.StartsWith($crate) -and $zh.Length -gt 2) {
        $base = $zh.Substring(2)
        if ($script:FoodDict.ContainsKey($base)) {
            $f = $script:FoodDict[$base]
            $koBag = [char]0xD55C + [char]0xC790 + [char]0xB974
            return @{ en = "Crate of $($f.en)"; ko = "$($f.ko) $koBag" }
        }
    }
    return $null
}

function Translate-Material([string]$zh) {
    $bag = [char]0x4E00 + [char]0x888B
    if ($zh.StartsWith($bag) -and $zh.Length -gt 2) {
        $base = $zh.Substring(2)
        if ($script:MaterialDict.ContainsKey($base)) {
            $m = $script:MaterialDict[$base]
            return @{ en = "Bag of $($m.en)"; ko = "$($m.ko) $($([char]0xD55C + [char]0xC790 + [char]0xB974))" }
        }
    }
    if ($script:MaterialDict.ContainsKey($zh)) { return $script:MaterialDict[$zh] }
    return $null
}

function Translate-Accessory([string]$zh) {
    if ($script:AccessoryExtra.ContainsKey($zh)) { return $script:AccessoryExtra[$zh] }
    $tierChars = @([char]0x666E, [char]0x826F, [char]0x512A)
    if ($zh -match '\[(.+)\]$') {
        $tier = $Matches[1]
        if ($tierChars -contains $tier[0]) {
            $skill = $zh.Substring(0, $zh.Length - $tier.Length - 2)
            if ($script:SkillBook.ContainsKey($skill)) {
                $sk = $script:SkillBook[$skill]
                $tEn = @{ ([char]0x666E)='Normal'; ([char]0x826F)='Fine'; ([char]0x512A)='Superior' }
                $tKo = @{ ([char]0x666E)=[string][char]0xC77C + [char]0xBC18; ([char]0x826F)=[char]0xC591; ([char]0x512A)=[char]0xC6B0 }
                $tc = $tier[0]
                return @{ en = "$($sk.en) [$($tEn[$tc])]"; ko = "$($sk.ko)[$($tKo[$tc])]" }
            }
        }
    }
    $orn = [char]0x4E4B + [char]0x98FE
    if ($zh.EndsWith($orn) -and $zh.Length -gt 2) {
        $base = $zh.Substring(0, $zh.Length - 2)
        $ko = if (Get-Command Convert-EquipNameToKo -ErrorAction SilentlyContinue) {
            Convert-EquipNameToKo $zh
        } else {
            $base + ([string][char]0xC758 + [char]0xC7A5 + [char]0xC2E0)
        }
        return @{ en = ($base + ' Ornament'); ko = $ko }
    }
    return $null
}

function Translate-GameName([string]$zh) {
    if (-not $zh) { return @{ en = ''; ko = '' } }
    $zh = $zh.Trim()
    if ($script:VariantAliases.ContainsKey($zh)) { $zh = $script:VariantAliases[$zh] }
    if ($script:BountyCat.ContainsKey($zh)) { return $script:BountyCat[$zh] }
    if ($script:PetDict.ContainsKey($zh)) { return $script:PetDict[$zh] }
    if ($script:QuestGems.ContainsKey($zh)) { return $script:QuestGems[$zh] }
    if ($script:GemTypes.ContainsKey($zh)) { return $script:GemTypes[$zh] }
    $g = Translate-GemTier $zh; if ($g) { return $g }
    $e = Translate-Enchant $zh; if ($e) { return $e }
    $p = Translate-Potion $zh; if ($p) { return $p }
    $m = Translate-Material $zh; if ($m) { return $m }
    if ($script:EquipEn.ContainsKey($zh)) {
        $en = $script:EquipEn[$zh].en
        $ko = if (Get-Command Get-EquipKo -ErrorAction SilentlyContinue) { Get-EquipKo $zh $en } else { $en }
        return @{ en = $en; ko = $ko }
    }
    $a = Translate-Accessory $zh; if ($a) { return $a }
    if (Get-Command Convert-EquipNameToKo -ErrorAction SilentlyContinue) {
        $koGuess = Convert-EquipNameToKo $zh
        if ($koGuess -and $koGuess -ne $zh) { return @{ en = $zh; ko = $koGuess } }
    }
    return @{ en = $zh; ko = $zh }
}
