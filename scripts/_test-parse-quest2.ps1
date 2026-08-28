$wc = New-Object Net.WebClient
$wc.Encoding = [Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91.md.1xQ6XTBy.js')
$idx = $js.IndexOf("'+l+'")
Write-Host "context:"
Write-Host $js.Substring($idx, 180)
$p = [regex]::Match($js, "\+'\+l\+'[^<]*</td><td[^>]*>([^<]+)</td>")
Write-Host "simple match=$($p.Success) name=$($p.Groups[1].Value)"
