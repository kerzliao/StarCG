$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91.md.1xQ6XTBy.js')
foreach ($sym in @("'+e+'", "'+l+'", "'+r+'")) {
    $idx = $js.IndexOf($sym)
    Write-Host "=== $sym idx=$idx ==="
    if ($idx -ge 0) { Write-Host $js.Substring($idx, 350) }
}
