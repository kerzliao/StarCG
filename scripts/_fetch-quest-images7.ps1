$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%BA%8C---%E8%B2%AA%E5%A9%AA%E4%B9%8B%E5%BF%83.md.v4M4OMfs.js')
$idx = $js.IndexOf("'+r+'")
Write-Host $js.Substring($idx, 500)
$js3 = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91.md.1xQ6XTBy.js')
$start = $js3.IndexOf('const ')
Write-Host $js3.Substring($start, 250)
$idx3 = $js3.IndexOf("inline-icon")
Write-Host $js3.Substring($idx3-80, 900)
