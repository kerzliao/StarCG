$wc = New-Object Net.WebClient
$wc.Encoding = [Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91.md.1xQ6XTBy.js')
$patterns = @(
    'src="''\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\+\s*''"[^>]*></td><td[^>]*>([^<]*之飾[^<]*)</td>',
    "src=`"'\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\+\s*'`"[^>]*></td><td[^>]*>([^<]*之飾[^<]*)</td>"
)
$i = 0
foreach ($p in $patterns) {
    $i++
    $ms = [regex]::Matches($js, $p)
    Write-Host "pattern $i count=$($ms.Count)"
    foreach ($m in $ms) { Write-Host "  var=$($m.Groups[1].Value) text=$($m.Groups[2].Value)" }
}
