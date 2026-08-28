$ErrorActionPreference = 'Stop'
$GuideBase = 'https://guide.starcg.net'
$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$urls = @(
    'https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%BA%8C---%E8%B2%AA%E5%A9%AA%E4%B9%8B%E5%BF%83.md.v4M4OMfs.js',
    'https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%BA%8C---%E8%B2%AA%E5%A9%AA%E4%B9%8B%E5%BF%83.md.v4M4OMfs.lean.js',
    'https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91.md.1xQ6XTBy.js'
)
foreach ($u in $urls) {
    Write-Host "=== $u ==="
    try {
        $js = $wc.DownloadString($u)
        Write-Host "len=$($js.Length)"
        [regex]::Matches($js, 'alt="([^"]*之飾[^"]*)"') | ForEach-Object { Write-Host ('alt=' + $_.Groups[1].Value) }
        [regex]::Matches($js, '[a-zA-Z_$][a-zA-Z0-9_$]*="(/images/[^"]+)"') | ForEach-Object { Write-Host ($_.Groups[1].Name + '=' + $_.Groups[2].Value) }
    } catch { Write-Host "ERR $($_.Exception.Message)" }
}
