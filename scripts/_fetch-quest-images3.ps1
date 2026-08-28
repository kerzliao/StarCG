$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%BA%8C---%E8%B2%AA%E5%A9%AA%E4%B9%8B%E5%BF%83.md.v4M4OMfs.js')
$idx = $js.IndexOf('勇氣')
if ($idx -lt 0) { $idx = $js.IndexOf('之飾') }
Write-Host "idx=$idx"
if ($idx -ge 0) { Write-Host $js.Substring([Math]::Max(0,$idx-200), 500) }
[regex]::Matches($js, 'import\{([^}]+)\}from"\./chunks/([^"]+)"') | ForEach-Object { Write-Host ('chunk=' + $_.Groups[2].Value + ' im=' + $_.Groups[1].Value) }
