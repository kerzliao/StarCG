$ErrorActionPreference = 'Stop'
$Out = Join-Path $PSScriptRoot '..\equipment.json'
$ImageDir = Join-Path $PSScriptRoot '..\equipment_images'
$DupReportPath = Join-Path $PSScriptRoot '..\equipment_image_duplicates.json'
$GuideBase = 'https://guide.starcg.net'
$ChunkCache = @{}

$Categories = @(
    @{ slug='sword'; slot='weapon'; calcSlot='weapon'; hash='BIXT0ZtI' },
    @{ slug='axe'; slot='weapon'; calcSlot='weapon'; hash='BBVvAE8P' },
    @{ slug='spear'; slot='weapon'; calcSlot='weapon'; hash='FqFwG8e9' },
    @{ slug='bow'; slot='weapon'; calcSlot='weapon'; hash='DNNDnMqy' },
    @{ slug='staff'; slot='weapon'; calcSlot='weapon'; hash='3JEtVTV8' },
    @{ slug='dagger'; slot='weapon'; calcSlot='weapon'; hash='CcyC14O6' },
    @{ slug='boomerang'; slot='weapon'; calcSlot='weapon'; hash='DTqsnTNQ' },
    @{ slug='helmet'; slot='armor'; calcSlot='hat'; hash='nJ5MC6hh' },
    @{ slug='hat'; slot='armor'; calcSlot='hat'; hash='DRh5zdqM' },
    @{ slug='headwear'; slot='armor'; calcSlot='hat'; hash='XWdbhxSP' },
    @{ slug='armor'; slot='armor'; calcSlot='body'; hash='DSxtAy29' },
    @{ slug='clothes'; slot='armor'; calcSlot='body'; hash='P5S210ON' },
    @{ slug='robe'; slot='armor'; calcSlot='body'; hash='DieuYXqp' },
    @{ slug='boots'; slot='armor'; calcSlot='shoes'; hash='DrQDHeCq' },
    @{ slug='shoes'; slot='armor'; calcSlot='shoes'; hash='vOVWsCPc' },
    @{ slug='shield'; slot='armor'; calcSlot='shield'; hash='De6WYGe8' },
    @{ slug='ring'; slot='accessory'; calcSlot='acc'; hash='Cie_VO4F' },
    @{ slug='necklace'; slot='accessory'; calcSlot='acc'; hash='Cw0FtUd1' },
    @{ slug='earring'; slot='accessory'; calcSlot='acc'; hash='I1tjr7Py' },
    @{ slug='bracelet'; slot='accessory'; calcSlot='acc'; hash='BWXjZxmr' },
    @{ slug='amulet'; slot='accessory'; calcSlot='acc'; hash='21aQvbaf' },
    @{ slug='instrument'; slot='accessory'; calcSlot='acc'; hash='DnY3p-90' },
    @{ slug='super-artifact'; slot='special'; calcSlot='weapon'; hash='CR8uLzm0' },
    @{ slug='fudan'; slot='special'; calcSlot='body'; hash='0aFHp8Th' },
    @{ slug='water-dragon'; slot='special'; calcSlot='body'; hash='D5uLadWK' },
    @{ slug='forest'; slot='special'; calcSlot='weapon'; hash='ByZf3krv' }
)

function L([int[]]$c) { -join ($c | ForEach-Object { [char]$_ }) }

$LabelPatterns = @(
    @{ label=(L 0x751F,0x547D); key='hp' },
    @{ label='HP'; key='hp' },
    @{ label=(L 0x9B54,0x529B); key='mp' },
    @{ label='MP'; key='mp' },
    @{ label=(L 0x653B,0x64CA); key='atk' },
    @{ label=(L 0x9632,0x79A6); key='def' },
    @{ label=(L 0x654F,0x6377); key='agi' },
    @{ label=(L 0x7CBE,0x795E); key='spt' },
    @{ label=(L 0x56DE,0x5FA9); key='rec' },
    @{ label=(L 0x9B45,0x529B); key='charm' },
    @{ label=(L 0x9B54,0x653B); key='matk' },
    @{ label=(L 0x6297,0x9B54); key='amres' },
    @{ label=(L 0x9B54,0x6297); key='amres' },
    @{ label=(L 0x5FC5,0x6BBA); key='crit' },
    @{ label=(L 0x53CD,0x64CA); key='counter' },
    @{ label=(L 0x547D,0x4E2D); key='hit' },
    @{ label=(L 0x9583,0x8EBA); key='dodge' },
    @{ label=(L 0x9583,0x8EB2); key='dodge' },
    @{ label=(L 0x4E2D,0x6BD2); key='poison' },
    @{ label=(L 0x660F,0x7761); key='sleep' },
    @{ label=(L 0x77F3,0x5316); key='stone' },
    @{ label=(L 0x9152,0x9189); key='drunk' },
    @{ label=(L 0x9189,0x9152); key='drunk' },
    @{ label=(L 0x6DF7,0x4E82); key='chaos' },
    @{ label=(L 0x907A,0x5FD8); key='forget' }
)
$StatKeys = $LabelPatterns | ForEach-Object { $_.key } | Select-Object -Unique

function Fetch-Utf8([string]$Url) {
    if ($ChunkCache.ContainsKey($Url)) { return $ChunkCache[$Url] }
    $wc = New-Object System.Net.WebClient
    $wc.Encoding = [System.Text.Encoding]::UTF8
    $text = $wc.DownloadString($Url)
    $ChunkCache[$Url] = $text
    return $text
}

function Get-TableHtml([string]$Text) {
    $start = $Text.IndexOf('<table class="starcg-table"')
    if ($start -lt 0) { return '' }
    $end = $Text.IndexOf('</table>', $start)
    if ($end -lt 0) { return '' }
    return $Text.Substring($start, $end - $start + 8)
}

function Parse-NumPair([string]$Text) {
    $c = ($Text -replace '\s','')
    if ($c -match '([+\-]?\d+)~([+\-]?\d+)') { return @([int]$Matches[1], [int]$Matches[2]) }
    if ($c -match '([+\-]?\d+)') { $n = [int]$Matches[1]; return @($n, $n) }
    return $null
}

function Normalize-EquipName([string]$Name) {
    if (-not $Name) { return $Name }
    $dot = [char]0x00B7
    $n = $Name
    foreach ($ch in @([char]0x30FB, [char]0xFF65, [char]0xFF0E, [char]0x2022)) {
        $n = $n.Replace([string]$ch, [string]$dot)
    }
    return $n
}

function Parse-StatSpan([string]$Span) {
    $plain = ($Span -replace '<[^>]+>', '')
    $plain = ($plain -replace '\s+', ' ').Trim()
    $durability = L 0x8010, 0x4E45
    $downSuffix = L 0x4E0B, 0x964D
    if (-not $plain -or $plain.StartsWith($durability)) { return $null }
    if ($plain.EndsWith($downSuffix)) { return $null }
    foreach ($lp in $LabelPatterns) {
        if ($plain.StartsWith($lp.label)) {
            $nums = Parse-NumPair $plain.Substring($lp.label.Length)
            if ($nums) { return @{ key=$lp.key; min=$nums[0]; max=$nums[1] } }
        }
    }
    return $null
}

function New-StringDict {
    return [System.Collections.Generic.Dictionary[string, string]]::new([StringComparer]::Ordinal)
}

function Resolve-GuideUrl([string]$Ref) {
    if ([string]::IsNullOrWhiteSpace($Ref)) { return $null }
    $Ref = $Ref.Trim()
    if ($Ref -match '^https?://') { return $Ref }
    if ($Ref.StartsWith('//')) { return 'https:' + $Ref }
    if (-not $Ref.StartsWith('/')) { $Ref = '/' + $Ref }
    return $GuideBase + $Ref
}

function Get-ChunkInternalImages([string]$ChunkJs) {
    $internal = New-StringDict
    [regex]::Matches($ChunkJs, '([a-zA-Z_$][a-zA-Z0-9_$]*)="(/images/[A-Za-z0-9_-]+\.(?:png|gif|webp))"') | ForEach-Object {
        if (-not $internal.ContainsKey($_.Groups[1].Value)) { $internal[$_.Groups[1].Value] = $_.Groups[2].Value }
    }
    [regex]::Matches($ChunkJs, '([a-zA-Z_$][a-zA-Z0-9_$]*)="(https?://[^"]+/pet/image/[^"]+\.(?:png|gif|webp))"') | ForEach-Object {
        if (-not $internal.ContainsKey($_.Groups[1].Value)) { $internal[$_.Groups[1].Value] = $_.Groups[2].Value }
    }
    return $internal
}

function Get-ChunkExportMap([string]$ChunkJs) {
    $internal = Get-ChunkInternalImages $ChunkJs
    $exports = New-StringDict
    $em = [regex]::Match($ChunkJs, 'export\{([^}]+)\}')
    if (-not $em.Success) { return $exports }
    foreach ($part in ($em.Groups[1].Value -split ',')) {
        $part = $part.Trim()
        if ($part -match '^([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)$') {
            $inName = $Matches[1]; $exName = $Matches[2]
            if ($internal.ContainsKey($inName)) { $exports[$exName] = $internal[$inName] }
        } elseif ($part -match '^([a-zA-Z_$][a-zA-Z0-9_$]*)$' -and $internal.ContainsKey($Matches[1])) {
            $exports[$Matches[1]] = $internal[$Matches[1]]
        }
    }
    return $exports
}

function Build-ImageMap([string]$Text) {
    $map = New-StringDict
    [regex]::Matches($Text, '([a-zA-Z_$][a-zA-Z0-9_$]*)="(/images/[A-Za-z0-9_-]+\.(?:png|gif|webp))"') | ForEach-Object {
        if (-not $map.ContainsKey($_.Groups[1].Value)) { $map[$_.Groups[1].Value] = $_.Groups[2].Value }
    }
    [regex]::Matches($Text, '([a-zA-Z_$][a-zA-Z0-9_$]*)="(https?://[^"]+/pet/image/[^"]+\.(?:png|gif|webp))"') | ForEach-Object {
        if (-not $map.ContainsKey($_.Groups[1].Value)) { $map[$_.Groups[1].Value] = $_.Groups[2].Value }
    }
    foreach ($im in [regex]::Matches($Text, 'import\{([^}]+)\}from"\./chunks/([^"]+\.js)"')) {
        $chunkFile = $im.Groups[2].Value
        if ($chunkFile -like 'framework*') { continue }
        $chunkUrl = "https://guide.starcg.net/assets/chunks/$chunkFile"
        try {
            $chunk = Fetch-Utf8 $chunkUrl
            $exports = Get-ChunkExportMap $chunk
            foreach ($part in ($im.Groups[1].Value -split ',')) {
                $part = $part.Trim()
                if ($part -match '^([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)$') {
                    $exName = $Matches[1]; $localAlias = $Matches[2]
                    if ($exports.ContainsKey($exName)) { $map[$localAlias] = $exports[$exName] }
                } elseif ($part -match '^([a-zA-Z_$][a-zA-Z0-9_$]*)$') {
                    $sym = $Matches[1]
                    if ($exports.ContainsKey($sym)) { $map[$sym] = $exports[$sym] }
                }
            }
            if ($exports.Count -eq 0 -and $chunkFile -match '^([A-Za-z0-9_-]+)\.') {
                $hash = $Matches[1]
                if ($chunk -match "/images/$([regex]::Escape($hash))\.(png|gif|webp)") {
                    $path = "/images/$hash.$($Matches[1])"
                    foreach ($part in ($im.Groups[1].Value -split ',')) {
                        $part = $part.Trim()
                        if ($part -match '^([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)$') {
                            if (-not $map.ContainsKey($Matches[2])) { $map[$Matches[2]] = $path }
                        }
                    }
                }
            }
        } catch {
            Write-Host "  chunk skip $chunkFile"
        }
    }
    return $map
}

function Resolve-RowImageCandidate([string]$Candidate, $ImgMap) {
    if ([string]::IsNullOrWhiteSpace($Candidate)) { return $null }
    $c = $Candidate.Trim()
    if ($c -match "^'\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\+\s*'$") {
        $sym = $Matches[1]
        if ($ImgMap.ContainsKey($sym)) { return $ImgMap[$sym] }
        return $null
    }
    if ($c -match '^https?://') { return $c }
    if ($c.StartsWith('/')) { return $c }
    return $null
}

function Get-RowImage([string]$ItemCell, $ImgMap) {
    if (-not $ItemCell) { return $null }
    $imgTag = [regex]::Match($ItemCell, '<img\b[^>]*>', 'IgnoreCase')
    if (-not $imgTag.Success) { return $null }
    $tag = $imgTag.Value
    $candidates = [System.Collections.Generic.List[string]]::new()
    foreach ($attr in @('src', 'data-src', 'data-lazy-src', 'data-original')) {
        $m = [regex]::Match($tag, "$attr=`"([^`"]*)`"", 'IgnoreCase')
        if ($m.Success -and $m.Groups[1].Value) { $candidates.Add($m.Groups[1].Value) }
    }
    $ss = [regex]::Match($tag, 'srcset=`"([^`"]+)`"', 'IgnoreCase')
    if ($ss.Success) {
        $first = ($ss.Groups[1].Value.Split(',')[0].Trim() -replace '\s+\d+[wx]$', '').Trim()
        if ($first) { $candidates.Add($first) }
    }
    foreach ($c in $candidates) {
        $resolved = Resolve-RowImageCandidate $c $ImgMap
        if ($resolved) { return (Resolve-GuideUrl $resolved) }
    }
    return $null
}

function Test-RemoteImage([string]$Url) {
    foreach ($method in @('HEAD', 'GET')) {
        try {
            $req = [System.Net.HttpWebRequest]::Create($Url)
            $req.Method = $method
            $req.Timeout = 25000
            $req.UserAgent = 'StarCG-EquipmentCatalog/1.0'
            if ($method -eq 'GET') { $req.AllowAutoRedirect = $true }
            $resp = $req.GetResponse()
            $status = [int]$resp.StatusCode
            $ctype = $resp.ContentType
            if ($method -eq 'GET' -and $resp -is [System.Net.HttpWebResponse]) {
                $resp.Close()
            } else { $resp.Close() }
            if ($status -eq 200 -and $ctype -match 'image/') {
                return @{ ok = $true; status = $status; contentType = $ctype; method = $method }
            }
        } catch {
            if ($method -eq 'GET') {
                return @{ ok = $false; status = 0; contentType = ''; method = $method; error = $_.Exception.Message }
            }
        }
    }
    return @{ ok = $false; status = 0; contentType = ''; method = 'GET'; error = 'unreachable' }
}

function Get-UrlFileName([string]$Url) {
    $ext = 'png'
    if ($Url -match '\.(png|gif|webp)(?:\?|$)') { $ext = $Matches[1] }
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Url)
    $hash = $sha.ComputeHash($bytes)
    $hex = -join ($hash[0..7] | ForEach-Object { $_.ToString('x2') })
    return "$hex.$ext"
}

function Process-EquipmentImages($Items) {
    if (-not (Test-Path $ImageDir)) { New-Item -ItemType Directory -Path $ImageDir | Out-Null }
    $urlToItems = New-Object 'System.Collections.Generic.Dictionary[string,System.Collections.Generic.List[string]]' ([StringComparer]::Ordinal)
    $urlToLocal = New-StringDict
    $verified = 0; $failed = 0; $downloaded = 0

    foreach ($it in $Items) {
        $remote = $it.image
        if (-not $remote) { continue }
        $remote = Resolve-GuideUrl $remote
        if (-not $remote) { $it.image = $null; continue }

        if (-not $urlToItems.ContainsKey($remote)) {
            $urlToItems[$remote] = [System.Collections.Generic.List[string]]::new()
        }
        $urlToItems[$remote].Add($it.id)

        if (-not $urlToLocal.ContainsKey($remote)) {
            $check = Test-RemoteImage $remote
            if (-not $check.ok) {
                Write-Host "  image FAIL $($it.id) $($check.status) $($check.contentType) $remote"
                $urlToLocal[$remote] = $null
                $failed++
            } else {
                $fileName = Get-UrlFileName $remote
                $localPath = Join-Path $ImageDir $fileName
                $relPath = 'equipment_images/' + $fileName
                if (-not (Test-Path $localPath)) {
                    $wc = New-Object System.Net.WebClient
                    $wc.Headers.Add('User-Agent', 'StarCG-EquipmentCatalog/1.0')
                    $wc.DownloadFile($remote, $localPath)
                    $downloaded++
                }
                $urlToLocal[$remote] = $relPath
                $verified++
                Write-Host "  image OK $($check.status) $($check.contentType) -> $relPath"
            }
        }

        $local = $urlToLocal[$remote]
        $it.image = $(if ($local) { $local } else { $null })
    }

    $dupes = @()
    foreach ($kv in $urlToItems.GetEnumerator()) {
        if ($kv.Value.Count -gt 1) {
            $local = $null
            if ($urlToLocal.ContainsKey($kv.Key)) { $local = $urlToLocal[$kv.Key] }
            $dupes += [ordered]@{
                sourceUrl = $kv.Key
                localPath = $local
                count = $kv.Value.Count
                items = @($kv.Value)
            }
        }
    }
    $dupReport = [ordered]@{
        generated = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
        duplicateGroups = $dupes.Count
        groups = ($dupes | Sort-Object { $_.count } -Descending)
    }
    $dupJson = $dupReport | ConvertTo-Json -Depth 6
    [System.IO.File]::WriteAllText($DupReportPath, $dupJson, (New-Object System.Text.UTF8Encoding $false))

    $withImg = @($Items | Where-Object { $_.image }).Count
    Write-Host "Images: verified=$verified failed=$failed downloaded=$downloaded withImage=$withImg duplicateGroups=$($dupes.Count)"
    return $Items
}

function Parse-Table([string]$Html, $Cat, $ImgMap) {
    $items = @()
    $rows = [regex]::Matches($Html, '<tr[^>]*>[\s\S]*?</tr>')
    foreach ($row in $rows) {
        $rowText = $row.Value
        if ($rowText -notmatch 'class="item-name"') { continue }
        if ($rowText -notmatch 'class="item-name"[^>]*>[\s\S]*?<strong[^>]*>([^<]+)</strong>') { continue }
        $name = $Matches[1].Trim()
        if (-not $name) { continue }

        $itemCell = ''
        if ($rowText -match 'class="item-name"[^>]*>([\s\S]*?)</td>') { $itemCell = $Matches[1] }
        $image = Get-RowImage $itemCell $ImgMap

        $level = $null
        if ($rowText -match '<td class="center"[^>]*>\s*(\d+)\s') { $level = [int]$Matches[1] }

        $stats = @{}; foreach ($k in $StatKeys) { $stats[$k] = 0 }
        $ranges = @{}
        $parts = $rowText -split '</td>'
        $statPart = if ($parts.Count -ge 4) { $parts[3] } else { '' }
        $spans = [regex]::Matches($statPart, '<span class="text-[^"]+"[^>]*>[\s\S]*?</span>', 'IgnoreCase')
        foreach ($m in $spans) {
            $p = Parse-StatSpan $m.Value
            if (-not $p) { continue }
            $stats[$p.key] = $p.max
            if ($p.min -ne $p.max) { $ranges[$p.key] = @($p.min, $p.max) }
        }

        $id = "$($Cat.slug)|$name|$level"
        $calcSlot = Resolve-CalcSlot $name $Cat.calcSlot $Cat.slug
        $acquirePart = if ($parts.Count -ge 5) { $parts[4] } else { '' }
        $acquire = ($acquirePart -replace '<[^>]+>', ' ' -replace '\s+', ' ').Trim()
        $item = [ordered]@{
            id=$id; name=$name; categorySlug=$Cat.slug; slotGroup=$Cat.slot; calcSlot=$calcSlot; level=$level; stats=$stats; image=$image
        }
        if ($acquire) { $item.acquire = $acquire }
        if ($ranges.Count) { $item.ranges = $ranges }
        $items += [pscustomobject]$item
    }
    return $items
}

$ItemKeyMap = @{
    ITEM_MODIFYHP='hp'; ITEM_MODIFYFORCEPOINT='mp'; ITEM_MODIFYATTACK='atk'; ITEM_MODIFYDEFENCE='def'
    ITEM_MODIFYAGILITY='agi'; ITEM_MODIFYRECOVERY='rec'; ITEM_MODIFYMAGIC='spt'; ITEM_ADM='matk'; ITEM_RSS='amres'
    ITEM_MODIFYCRITICAL='crit'; ITEM_MODIFYHITRATE='hit'; ITEM_MODIFYCOUNTER='counter'; ITEM_MODIFYAVOID='dodge'
}

function Enrich-FromMaxStats($Items) {
    $jsPath = Join-Path $PSScriptRoot '..\equipment_max_stats.js'
    if (-not (Test-Path $jsPath)) { return $Items }
    $js = [System.IO.File]::ReadAllText($jsPath, [System.Text.UTF8Encoding]::new($false))
    $map = @{}
    foreach ($m in [regex]::Matches($js, "'([^']+)':\s*\{([^\}]*)\}")) {
        $name = $m.Groups[1].Value
        if ($name -in @('EQUIPMENT_MAX_STAT_KEYS','EQUIPMENT_STAT_LABELS','EQUIPMENT_MAX_STATS')) { continue }
        $stats = @{}
        foreach ($sm in [regex]::Matches($m.Groups[2].Value, "'(ITEM_[A-Z_]+)':(-?\d+)")) {
            $k = $ItemKeyMap[$sm.Groups[1].Value]
            if ($k) { $stats[$k] = [int]$sm.Groups[2].Value }
        }
        if ($stats.Count) {
            $map[$name] = $stats
            $norm = Normalize-EquipName $name
            if ($norm -ne $name -and -not $map.ContainsKey($norm)) { $map[$norm] = $stats }
        }
    }
    foreach ($it in $Items) {
        $extra = $map[$it.name]
        if (-not $extra) { $extra = $map[(Normalize-EquipName $it.name)] }
        if (-not $extra) { continue }
        foreach ($kv in $extra.GetEnumerator()) {
            if ($it.stats[$kv.Key] -eq 0) { $it.stats[$kv.Key] = $kv.Value }
        }
    }
    return $Items
}

function U([byte[]]$Bytes) { [System.Text.Encoding]::UTF8.GetString($Bytes) }

function Read-EventAccessoryNames {
    $path = Join-Path $PSScriptRoot 'event_accessory_names.json'
    $txt = [System.IO.File]::ReadAllText($path, [System.Text.UTF8Encoding]::new($false))
    return ($txt | ConvertFrom-Json)
}

$EventNames = Read-EventAccessoryNames

$AccessoryWhitelist = @(
    (L 0x8FC5,0x679C,0x4E4B,0x98FE),
    (L 0x7A81,0x64CA,0x4E4B,0x98FE),
    (L 0x75DB,0x64CA,0x4E4B,0x98FE),
    (L 0x4EC1,0x611B,0x4E4B,0x98FE),
    (L 0x6062,0x5FA9,0x4E4B,0x98FE),
    (L 0x52C7,0x6C23,0x4E4B,0x98FE),
    (L 0x6697,0x5F71,0x4E4B,0x98FE),
    (L 0x518D,0x751F,0x4E4B,0x98FE),
    (L 0x731B,0x64CA,0x4E4B,0x98FE),
    (U 0xE9,0xA6,0xB4,0xE9,0xA4,0x8A,0xE4,0xB9,0x8B,0xE9,0xA3,0xBE),
    (L 0x6D17,0x79AE,0x7684,0x8B77,0x7B26),
    (L 0x771F,0x30FB,0x6230,0x7B26),
    (L 0x8056,0x57DF,0x661F,0x6212),
    (L 0x5F17,0x65E6,0x4E4B,0x6212,0x2B),
    (L 0x5F17,0x65E6,0x4E4B,0x6212),
    $EventNames.band,
    $EventNames.ginger,
    $EventNames.oath,
    $EventNames.ring
)
$PlayerMadePattern = L 0x73A9,0x5BB6,0x88FD,0x4F5C
$SeriesCategorySlugs = @('fudan', 'water-dragon')

function New-EmptyStats {
    $stats = @{}
    foreach ($k in $StatKeys) { $stats[$k] = 0 }
    return $stats
}

function Get-GuidePageJs([string[]]$PagePaths) {
    foreach ($PagePath in $PagePaths) {
        foreach ($suffix in @('', '.html')) {
            try {
                $html = Fetch-Utf8 ($GuideBase + $PagePath + $suffix)
                $m = [regex]::Match($html, '/assets/(quests_sins[^"?]+\.lean\.js)')
                if ($m.Success) {
                    $full = $m.Groups[1].Value -replace '\.lean\.js$', '.js'
                    return Fetch-Utf8 ($GuideBase + '/assets/' + $full)
                }
                $m2 = [regex]::Match($html, '/assets/(quests_sins[^"?]+\.js)')
                if ($m2.Success -and $m2.Groups[1].Value -notlike '*.lean.js') {
                    return Fetch-Utf8 ($GuideBase + '/assets/' + $m2.Groups[1].Value)
                }
            } catch {}
        }
    }
    return $null
}

function Get-AccessoryBaseName([string]$Text) {
    $suffix = L 0x4E4B,0x98FE
    $idx = $Text.IndexOf($suffix)
    if ($idx -ge 0) { return $Text.Substring(0, $idx + $suffix.Length) }
    return $Text.Trim()
}

function Parse-QuestAccessoryImages([string]$PageJs) {
    $map = @{}
    if (-not $PageJs) { return $map }
    $imgMap = Build-ImageMap $PageJs
    $patterns = @(
        "src=`"'\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\+\s*'[^>]*class=`"inline-icon`"[^>]*></td><td[^>]*><strong[^>]*>([^<]+)</strong>",
        "src=`"'\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\+\s*'[^>]*></td><td[^>]*>([^<]+)</td>"
    )
    foreach ($pattern in $patterns) {
        foreach ($m in [regex]::Matches($PageJs, $pattern)) {
            $var = $m.Groups[1].Value
            $name = Get-AccessoryBaseName $m.Groups[2].Value
            if (-not $map.ContainsKey($name) -and $imgMap.ContainsKey($var)) { $map[$name] = $imgMap[$var] }
        }
    }
    return $map
}

function Resolve-QuestAccessoryImage($PageCache, [string]$ItemName) {
    if (-not $PageCache) { return $null }
    $images = $PageCache.images
    if ($images.ContainsKey($ItemName)) { return $images[$ItemName] }
    foreach ($kv in $images.GetEnumerator()) {
        if ($ItemName.StartsWith($kv.Key) -or $kv.Key.StartsWith($ItemName)) { return $kv.Value }
    }
    return $null
}

function Build-QuestAccessoryItems {
    $questSin2 = U 0xE4,0xBB,0xBB,0xE5,0x8B,0x99,0xEF,0xBC,0x9A,0x20,0xE7,0xBD,0xAA,0xE4,0xBA,0x8C,0x20,0x2D,0x20,0xE8,0xB2,0xAA,0xE5,0xA9,0xAA,0xE4,0xB9,0x8B,0xE5,0xBF,0x83
    $questSin3 = U 0xE4,0xBB,0xBB,0xE5,0x8B,0x99,0xEF,0xBC,0x9A,0x20,0xE7,0xBD,0xAA,0xE4,0xB8,0x89,0x20,0x2D,0x20,0xE8,0x89,0xB2,0xE6,0xAC,0xB2,0xE7,0x9A,0x84,0xE8,0xAA,0x98,0xE6,0x83,0x91
    $nameTrain = U 0xE9,0xA6,0xB4,0xE9,0xA4,0x8A,0xE4,0xB9,0x8B,0xE9,0xA3,0xBE
    $sin2Pages = @(
        (L 0x2F,0x71,0x75,0x65,0x73,0x74,0x73,0x2F,0x73,0x69,0x6E,0x73,0x2F,0x7F6A,0x4E8C,0x2D,0x2D,0x2D,0x8CAA,0x5AEE,0x4E4B,0x5FC3),
        '/quests/sins/%E7%BD%AA%E4%BA%8C---%E8%B2%AA%E5%A9%AA%E4%B9%8B%E5%BF%83'
    )
    $sin3Pages = @(
        (L 0x2F,0x71,0x75,0x65,0x73,0x74,0x73,0x2F,0x73,0x69,0x6E,0x73,0x2F,0x7F6A,0x4E09,0x2D,0x2D,0x2D,0x8272,0x6B32,0x7684,0x8A98,0x60D1),
        '/quests/sins/%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91'
    )
    $defs = @(
        @{ name=(L 0x52C7,0x6C23,0x4E4B,0x98FE); level=7; acquire=$questSin2; pages=$sin2Pages; stats=@{ atk=17; def=17; agi=17; hp=45; mp=45 } }
        @{ name=(L 0x6697,0x5F71,0x4E4B,0x98FE); level=7; acquire=$questSin2; pages=$sin2Pages; stats=@{ def=100; hp=55 } }
        @{ name=(L 0x518D,0x751F,0x4E4B,0x98FE); level=7; acquire=$questSin2; pages=$sin2Pages; stats=@{ mp=100 } }
        @{ name=(L 0x731B,0x64CA,0x4E4B,0x98FE); level=7; acquire=$questSin3; pages=$sin3Pages; stats=@{ atk=27; agi=26; hp=75 } }
        @{ name=$nameTrain; level=7; acquire=$questSin3; pages=$sin3Pages; stats=@{ atk=16; rec=7; stone=18; hp=75 } }
    )
    $pageJsCache = @{}
    $items = @()
    foreach ($def in $defs) {
        $pageKey = ($def.pages -join '|')
        if (-not $pageJsCache.ContainsKey($pageKey)) {
            $js = Get-GuidePageJs $def.pages
            $pageJsCache[$pageKey] = @{ js = $js; images = (Parse-QuestAccessoryImages $js) }
        }
        $stats = New-EmptyStats
        foreach ($kv in $def.stats.GetEnumerator()) { $stats[$kv.Key] = $kv.Value }
        $item = [ordered]@{
            id = "necklace|$($def.name)|$($def.level)"
            name = $def.name
            categorySlug = 'necklace'
            slotGroup = 'accessory'
            calcSlot = 'acc'
            level = $def.level
            stats = $stats
            acquire = $def.acquire
        }
        $image = Resolve-QuestAccessoryImage $pageJsCache[$pageKey] $def.name
        if ($image) { $item.image = $image }
        $items += [pscustomobject]$item
    }
    return $items
}

function Get-StarCgPageImages([string]$Url) {
    $map = @{}
    try {
        $html = Fetch-Utf8 $Url
        foreach ($m in [regex]::Matches($html, '<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"')) {
            $alt = $m.Groups[2].Value.Trim()
            if ($alt -and -not $map.ContainsKey($alt)) { $map[$alt] = $m.Groups[1].Value }
        }
    } catch {
        Write-Host "  starcg page images fail ${Url}: $($_.Exception.Message)"
    }
    return $map
}

function New-ManualAccessoryItem($def) {
    $stats = New-EmptyStats
    $ranges = @{}
    if ($def.stats) {
        foreach ($kv in $def.stats.GetEnumerator()) { $stats[$kv.Key] = $kv.Value }
    }
    if ($def.ranges) {
        foreach ($kv in $def.ranges.GetEnumerator()) {
            $ranges[$kv.Key] = @([int]$kv.Value[0], [int]$kv.Value[1])
            $stats[$kv.Key] = [int]$kv.Value[1]
        }
    }
    $slotGroup = if ($def.calcSlot -eq 'acc') { 'accessory' } else { 'armor' }
    $idSuffix = if ($def.itemId) { [string]$def.itemId } else { [string]$def.level }
    $item = [ordered]@{
        id = "$($def.categorySlug)|$($def.name)|$idSuffix"
        name = $def.name
        categorySlug = $def.categorySlug
        slotGroup = $slotGroup
        calcSlot = $def.calcSlot
        level = $def.level
        stats = $stats
        acquire = $def.acquire
    }
    if ($def.itemId) { $item.itemId = [int]$def.itemId }
    if ($def.variant) { $item.variant = $def.variant }
    if ($ranges.Count) { $item.ranges = $ranges }
    if ($def.image) { $item.image = $def.image }
    return [pscustomobject]$item
}

function Build-EventAccessoryItems {
    $img1128 = Get-StarCgPageImages 'https://www.starcg.net/1128.php'
    $img20260611 = Get-StarCgPageImages 'https://www.starcg.net/20260611.php'
    $acqXmas = U 0xE6,0xB4,0xBB,0xE5,0x8B,0x95,0xEF,0xBC,0x9A,0x32,0x30,0x32,0x35,0xE8,0x81,0x96,0xE8,0xAA,0x95,0xE7,0xAF,0x80,0xE9,0x99,0x90,0xE6,0x99,0x82,0xE6,0xB4,0xBB,0xE5,0x8B,0x95
    $acqQingming = U 0xE4,0xBB,0xBB,0xE5,0x8B,0x99,0xEF,0xBC,0x9A,0xE6,0xB8,0x85,0xE6,0x98,0x8E,0xE7,0xAF,0x80,0xE3,0x80,0x8C,0xE8,0x8B,0xB1,0xE9,0x9D,0x88,0xE4,0xB9,0x8B,0xE8,0xAA,0x93,0xE3,0x80,0x8D
    $acqQuyuan = U 0xE6,0xB4,0xBB,0xE5,0x8B,0x95,0xEF,0xBC,0x9A,0xE7,0xAB,0xAF,0xE5,0x8D,0x88,0xE7,0xAF,0x80,0xE3,0x80,0x8C,0xE5,0x9B,0x9E,0xE6,0x86,0xB6,0xE5,0xB1,0x88,0xE5,0x8E,0x9F,0xE7,0x9A,0x84,0xE5,0x8B,0x87,0xE8,0x80,0x85,0xE3,0x80,0x8D
    $nameBand = $EventNames.band
    $nameGinger = $EventNames.ginger
    $nameOath = $EventNames.oath
    $nameRing = $EventNames.ring
    $imgBand = 'https://www.starcg.net/item/26242.gif'
    $imgGinger = 'https://www.starcg.net/item/99197.gif'
    $imgRing = 'https://www.starcg.net/pet/25849.gif'
    # 英靈之誓：官方市場 ITEM_BASEIMAGENUMBER → metamo/item/{n}.gif
    $imgOathBlue = 'https://member.starcg.net/metamo/item/27545.gif'
    $imgOathRed = 'https://member.starcg.net/metamo/item/27546.gif'
    $imgOathYellow = 'https://member.starcg.net/metamo/item/27547.gif'
    if ($img1128.ContainsKey($nameBand)) { $imgBand = $img1128[$nameBand] }
    if ($img1128.ContainsKey($nameGinger)) { $imgGinger = $img1128[$nameGinger] }
    if ($img20260611.ContainsKey($nameRing)) { $imgRing = $img20260611[$nameRing] }
    $range420 = @{
        hp=@(4,20); mp=@(4,20); atk=@(4,20); def=@(4,20); agi=@(4,20)
        spt=@(4,20); rec=@(4,20); amres=@(4,20); matk=@(4,20)
    }
    $defs = @(
        @{
            name=$nameBand; categorySlug='bracelet'; calcSlot='acc'; level=1; acquire=$acqXmas
            ranges=@{ atk=@(20,40); crit=@(5,15); hit=@(1,10) }
            image=$imgBand
        }
        @{
            name=$nameGinger; categorySlug='headband'; calcSlot='acc'; level=1; acquire=$acqXmas
            stats=@{ hp=50 }; ranges=@{ def=@(10,20); agi=@(10,20); dodge=@(5,15) }
            image=$imgGinger
        }
        @{
            name=$nameOath; categorySlug='amulet'; calcSlot='acc'; level=1; acquire=$acqQingming
            itemId=1007001; variant=$EventNames.oathBlue
            stats=@{ hp=-100; mp=-100; atk=10; def=10; agi=10; spt=10; rec=10; amres=10; matk=10; crit=10; counter=10; hit=10; dodge=10 }
            image=$imgOathBlue
        }
        @{
            name=$nameOath; categorySlug='amulet'; calcSlot='acc'; level=1; acquire=$acqQingming
            itemId=1007002; variant=$EventNames.oathRed
            ranges=($range420 + @{ crit=@(4,20); counter=@(4,20) })
            image=$imgOathRed
        }
        @{
            name=$nameOath; categorySlug='amulet'; calcSlot='acc'; level=1; acquire=$acqQingming
            itemId=1007003; variant=$EventNames.oathYellow
            ranges=($range420 + @{ dodge=@(4,20); counter=@(4,20) })
            image=$imgOathYellow
        }
        @{
            name=$nameRing; categorySlug='ring'; calcSlot='acc'; level=1; acquire=$acqQuyuan
            ranges=@{ atk=@(1,30); def=@(1,30); spt=@(1,30); amres=@(1,30); crit=@(1,20); dodge=@(1,20) }
            image=$imgRing
        }
    )
    return @($defs | ForEach-Object { New-ManualAccessoryItem $_ })
}

function Merge-ManualItems([System.Collections.ArrayList]$all, $seen, $manualItems, [string]$label) {
    $byId = @{}
    for ($qi = 0; $qi -lt $all.Count; $qi++) { $byId[$all[$qi].id] = $qi }
    foreach ($it in $manualItems) {
        if ($byId.ContainsKey($it.id)) {
            $ex = $all[$byId[$it.id]]
            if (-not $ex.image -and $it.image) { $ex.image = $it.image }
            if ($it.acquire) { $ex.acquire = $it.acquire }
            if ($it.ranges) { $ex.ranges = $it.ranges }
            if ($it.stats) {
                foreach ($sk in $StatKeys) {
                    if ([int]$it.stats[$sk] -ne 0) { $ex.stats[$sk] = $it.stats[$sk] }
                }
            }
            Write-Host "  $label patch $($it.id) image=$([bool]$it.image)"
        } elseif (-not $seen.ContainsKey($it.id)) {
            $seen[$it.id] = $true
            $byId[$it.id] = $all.Count
            [void]$all.Add($it)
        }
    }
}

function Resolve-CalcSlot([string]$Name, [string]$Default, [string]$CategorySlug) {
    if ($CategorySlug -notin $SeriesCategorySlugs) { return $Default }
    $n = $Name.TrimEnd('+')
    $ends = {
        param([string]$Suffix)
        return $n.EndsWith($Suffix) -or ($n -eq $Suffix)
    }
    if (& $ends (L 0x982D,0x76D4)) { return 'hat' }
    if (& $ends (L 0x4E4B,0x76D1)) { return 'hat' }
    if (& $ends (L 0x4E4B,0x5E3D)) { return 'hat' }
    if ($n -eq (L 0x5F17,0x65E6,0x5E3D)) { return 'hat' }
    if (& $ends (L 0x93E7,0x7532)) { return 'body' }
    if (& $ends (L 0x4E4B,0x670D)) { return 'body' }
    if (& $ends (L 0x6CD5,0x888D)) { return 'body' }
    if (& $ends (L 0x4E4B,0x888D)) { return 'body' }
    if ($n -eq (L 0x5F17,0x65E6,0x8863)) { return 'body' }
    if (& $ends (L 0x93E7)) { return 'body' }
    if (& $ends (L 0x4E4B,0x9774)) { return 'shoes' }
    if (& $ends (L 0x4E4B,0x978B)) { return 'shoes' }
    if (& $ends (L 0x9774)) { return 'shoes' }
    if (& $ends (L 0x978B)) { return 'shoes' }
    if ($n.Contains((L 0x76FE))) { return 'shield' }
    if ($n.Contains((L 0x6212))) { return 'acc' }
    if (& $ends (L 0x528D)) { return 'weapon' }
    if (& $ends (L 0x65A7)) { return 'weapon' }
    if (& $ends (L 0x69CD)) { return 'weapon' }
    if (& $ends (L 0x5F13)) { return 'weapon' }
    if (& $ends (L 0x6756)) { return 'weapon' }
    if (& $ends (L 0x5C0F,0x5200)) { return 'weapon' }
    if ($n -eq (L 0x51B0,0x9F8D)) { return 'weapon' }
    return $Default
}

function Filter-Equipment($Items) {
    return @($Items | Where-Object {
        if ($_.categorySlug -in $SeriesCategorySlugs) { return $true }
        if ($_.name -in $AccessoryWhitelist) { return $true }
        if ($_.calcSlot -eq 'acc') { return $false }
        ($_.acquire -as [string]) -match $PlayerMadePattern
    })
}

function Dedup-ByNameLevel($Items) {
    $special = @('fudan', 'water-dragon', 'forest', 'super-artifact')
    $map = @{}
    foreach ($it in $Items) {
        $key = if ($it.itemId) { $it.id } else { "$($it.name)|$($it.level)" }
        if (-not $map.ContainsKey($key)) { $map[$key] = $it; continue }
        $old = $map[$key]
        if ($it.categorySlug -eq 'water-dragon' -and $old.categorySlug -ne 'water-dragon') { $map[$key] = $it; continue }
        if ($old.categorySlug -eq 'water-dragon' -and $it.categorySlug -ne 'water-dragon') { continue }
        $oldSpec = $old.categorySlug -in $special
        $newSpec = $it.categorySlug -in $special
        if ($oldSpec -and -not $newSpec) { $map[$key] = $it }
    }
    return @($map.Values)
}

$all = [System.Collections.ArrayList]@()
$seen = @{}
foreach ($cat in $Categories) {
    $url = "https://guide.starcg.net/assets/equipment_$($cat.slug).md.$($cat.hash).js"
    try {
        $text = Fetch-Utf8 $url
        $imgMap = Build-ImageMap $text
        $items = Parse-Table (Get-TableHtml $text) $cat $imgMap
        $imgCount = ($items | Where-Object { $_.image }).Count
        foreach ($it in $items) {
            if ($seen.ContainsKey($it.id)) { continue }
            $seen[$it.id] = $true
            [void]$all.Add($it)
        }
        Write-Host "OK $($cat.slug): $($items.Count) items, $imgCount images, map=$($imgMap.Count)"
    } catch { Write-Host "FAIL $($cat.slug): $($_.Exception.Message)" }
}
$questAcc = Build-QuestAccessoryItems
Write-Host "Quest accessories: $($questAcc.Count)"
Merge-ManualItems $all $seen $questAcc 'quest'
$eventAcc = Build-EventAccessoryItems
Write-Host "Event accessories: $($eventAcc.Count)"
Merge-ManualItems $all $seen $eventAcc 'event'
$all = @($all)
$all = Enrich-FromMaxStats $all
$before = $all.Count
$all = Filter-Equipment $all
$afterFilter = $all.Count
$all = Dedup-ByNameLevel $all
$all = Process-EquipmentImages $all
$withImg = ($all | Where-Object { $_.image }).Count
$zeroStat = @($all | Where-Object {
    $sum = 0
    foreach ($k in $StatKeys) { $sum += [math]::Abs([int]$_.stats[$k]) }
    $rSum = 0
    if ($_.ranges) { foreach ($rk in $_.ranges.Keys) { $rSum += [math]::Abs([int]$_.ranges[$rk][1]) } }
    $sum -eq 0 -and $rSum -eq 0
})
if ($zeroStat.Count) {
    Write-Warning "Items with no parsed stats: $($zeroStat.Count)"
    $zeroStat | Select-Object -First 10 | ForEach-Object { Write-Warning "  $($_.id)" }
}
Write-Host "Filtered: $before -> $afterFilter -> $($all.Count) items (deduped)"
$payload = [ordered]@{
    version=(Get-Date -Format 'yyyy-MM-dd')
    source='https://guide.starcg.net/equipment/'
    filter='accessory-whitelist; non-accessory=player-made; +fudan/water-dragon series'
    count=$all.Count
    imageCount=$withImg
    items=($all | Sort-Object categorySlug, level, name)
}
$json = $payload | ConvertTo-Json -Depth 8
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($Out, $json, $utf8)
$jsOut = Join-Path $PSScriptRoot '..\equipment_catalog.js'
$js = "// Auto-generated - run build-equipment-catalog.ps1`r`nwindow.EQUIPMENT_CATALOG = " + $json.Trim() + ";`r`n"
[System.IO.File]::WriteAllText($jsOut, $js, $utf8)
Write-Host "Wrote $Out count=$($all.Count) images=$withImg"
Write-Host "Wrote $jsOut"
