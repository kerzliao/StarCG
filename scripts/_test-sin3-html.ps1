$wc = New-Object Net.WebClient
$wc.Encoding = [Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91.md.1xQ6XTBy.js')
# find all img+td patterns
$ms = [regex]::Matches($js, 'src="[^"]{0,80}"[^>]{0,80}></td><td[^>]{0,40}>([^<]{0,40})</td>')
Write-Host "img-td matches: $($ms.Count)"
foreach ($m in $ms) { Write-Host "  text=$($m.Groups[1].Value)" }

# find l variable usage
$ms2 = [regex]::Matches($js, '.{0,80}\+l\+.{0,120}')
Write-Host "l usage: $($ms2.Count)"
foreach ($m in $ms2) { Write-Host "  $($m.Value)" }

# dump around 9pgtu2Dm
$idx = $js.IndexOf('9pgtu2Dm')
Write-Host "around image const:"
Write-Host $js.Substring($idx, [Math]::Min(2000, $js.Length - $idx))
