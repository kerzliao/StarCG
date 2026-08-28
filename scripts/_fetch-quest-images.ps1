$ErrorActionPreference = 'Stop'
$GuideBase = 'https://guide.starcg.net'
$pages = @(
    @{ key='sin2'; url='/quests/sins/%E7%BD%AA%E4%BA%8C---%E8%B2%AA%E5%A9%AA%E4%B9%8B%E5%BF%83' }
    @{ key='sin3'; url='/quests/sins/%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91' }
)
$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
foreach ($p in $pages) {
    Write-Host "=== $($p.key) ==="
    $html = $wc.DownloadString($GuideBase + $p.url)
    $m = [regex]::Match($html, '/assets/(quests_sins[^"?]+\.js)')
    if (-not $m.Success) {
        $m = [regex]::Match($html, 'quests/sins/[^"]+\.md\.([A-Za-z0-9_-]+)\.js')
    }
    if (-not $m.Success) {
        Write-Host 'NO JS MATCH'
        Write-Host ($html.Substring(0, [Math]::Min(1500, $html.Length)))
        continue
    }
    $asset = if ($m.Groups.Count -gt 1 -and $m.Value -like '/assets/*') { $m.Groups[1].Value } else { $m.Value }
    if ($asset -notlike 'quests*') { $asset = $m.Groups[1].Value }
    Write-Host "asset=$asset"
    $jsUrl = if ($asset -like 'http*') { $asset } elseif ($asset -like '/assets/*') { $GuideBase + $asset } else { "$GuideBase/assets/$asset" }
    Write-Host "jsUrl=$jsUrl"
    $js = $wc.DownloadString($jsUrl)
    Write-Host "jsLen=$($js.Length)"
    [regex]::Matches($js, '/images/[A-Za-z0-9_-]+\.(?:png|gif|webp)') | ForEach-Object { Write-Host $_.Value }
    [regex]::Matches($js, 'alt="([^"]*之飾[^"]*)"') | ForEach-Object { Write-Host ('alt=' + $_.Groups[1].Value) }
}
