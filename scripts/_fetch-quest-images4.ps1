$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%BA%8C---%E8%B2%AA%E5%A9%AA%E4%B9%8B%E5%BF%83.md.v4M4OMfs.js')
foreach ($img in @('bKJWFni6','ZIxDwwmo','gSWUUJCO','qb0bwJDp')) {
    $idx = $js.IndexOf($img)
    Write-Host "=== $img idx=$idx ==="
    if ($idx -ge 0) { Write-Host $js.Substring([Math]::Max(0,$idx-120), 280) }
}
Write-Host '--- imports ---'
[regex]::Matches($js, 'import\{([^}]+)\}from"\./chunks/([^"]+)"') | ForEach-Object { Write-Host $_.Groups[2].Value }
