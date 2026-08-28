$wc = New-Object Net.WebClient
$wc.Encoding = [Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91.md.1xQ6XTBy.js')
$map = @{}
[regex]::Matches($js, '([a-zA-Z_$][a-zA-Z0-9_$]*)="(/images/[A-Za-z0-9_-]+\.(?:png|gif|webp))"') | ForEach-Object {
    if (-not $map.ContainsKey($_.Groups[1].Value)) { $map[$_.Groups[1].Value] = $_.Groups[2].Value }
}
$pattern = "src=`"'\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\+\s*'[^>]*></td><td[^>]*>([^<]+)</td>"
$ms = [regex]::Matches($js, $pattern)
Write-Host "generic pattern matches: $($ms.Count)"
$shi = [char]0x98FE  # 飾
foreach ($m in $ms) {
    $var = $m.Groups[1].Value
    $text = $m.Groups[2].Value.Trim()
    $name = $text
    if ($text -match ('^(.+' + [char]0x4E4B + $shi + ')')) { $name = $Matches[1] }
    Write-Host "  var=$var text=$text name=$name url=$($map[$var])"
}
