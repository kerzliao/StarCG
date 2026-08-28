$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%BA%8C---%E8%B2%AA%E5%A9%AA%E4%B9%8B%E5%BF%83.md.v4M4OMfs.js')
$idx = $js.IndexOf("'+l+'")
Write-Host "l idx=$idx"
Write-Host $js.Substring($idx, 400)
$idx2 = $js.IndexOf("'+n+'")
Write-Host "n idx=$idx2"
Write-Host $js.Substring($idx2, 400)
