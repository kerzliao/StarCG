$wc = New-Object Net.WebClient
$wc.Encoding = [Text.Encoding]::UTF8
$js = $wc.DownloadString('https://guide.starcg.net/assets/quests_sins_%E7%BD%AA%E4%B8%89---%E8%89%B2%E6%AC%B2%E7%9A%84%E8%AA%98%E6%83%91.md.1xQ6XTBy.js')

# simulate Build-ImageMap
$map = @{}
[regex]::Matches($js, '([a-zA-Z_$][a-zA-Z0-9_$]*)="(/images/[A-Za-z0-9_-]+\.(?:png|gif|webp))"') | ForEach-Object {
    if (-not $map.ContainsKey($_.Groups[1].Value)) { $map[$_.Groups[1].Value] = $_.Groups[2].Value }
}
Write-Host "imgMap keys: $($map.Keys -join ', ')"

$pattern = "src=`"'\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\+\s*'[^>]*></td><td[^>]*>([^<]*之飾[^<]*)</td>"
$ms = [regex]::Matches($js, $pattern)
Write-Host "pattern matches: $($ms.Count)"
foreach ($m in $ms) {
    $var = $m.Groups[1].Value
    $name = $m.Groups[2].Value.Trim()
    if ($name -match '^(?<n>.+之飾)') { $name = $Matches['n'] }
    Write-Host "  var=$var name=$name url=$($map[$var])"
}
