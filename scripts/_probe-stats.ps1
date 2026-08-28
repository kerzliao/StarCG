$ErrorActionPreference = 'Stop'
function L([int[]]$c) { -join ($c | ForEach-Object { [char]$_ }) }
$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$t = $wc.DownloadString('https://guide.starcg.net/assets/equipment_fudan.md.0aFHp8Th.js')
$tdEnd = [string]('<' + '/td>')
$rows = [regex]::Matches($t, '<tr[^>]*>[\s\S]*?</tr>')
foreach ($row in $rows) {
    if ($row.Value -notmatch '<strong[^>]*>([^<]+)</strong>') { continue }
    $name = $Matches[1].Trim()
    if ($name -notmatch '弗旦') { continue }
    $parts = $row.Value -split $tdEnd
    $statPart = if ($parts.Count -ge 4) { $parts[3] } else { '' }
    $plain = ($statPart -replace '<[^>]+>', ' ' -replace '\s+', ' ').Trim()
    $spanCount = ([regex]::Matches($statPart, '<span class="text-[^"]+"')).Count
    Write-Host "$name | spans=$spanCount | $plain"
}
