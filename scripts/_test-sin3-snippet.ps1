$wc = New-Object Net.WebClient
$wc.Encoding = [Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91.md.1xQ6XTBy.js')
foreach ($needle in @('猛擊', '馴養', '之飾', 'inline-icon', '9pgtu2Dm', 'Ai5b41Vw')) {
    $idx = $js.IndexOf($needle)
    Write-Host "=== $needle idx=$idx ==="
    if ($idx -ge 0) {
        $start = [Math]::Max(0, $idx - 150)
        $len = [Math]::Min(350, $js.Length - $start)
        Write-Host $js.Substring($start, $len)
    }
}
