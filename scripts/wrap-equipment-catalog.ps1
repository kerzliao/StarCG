$ErrorActionPreference = 'Stop'
$jsonPath = Join-Path $PSScriptRoot '..\equipment.json'
$jsPath = Join-Path $PSScriptRoot '..\equipment_catalog.js'
$json = [System.IO.File]::ReadAllText($jsonPath, [System.Text.UTF8Encoding]::new($false))
$js = "// Auto-generated from equipment.json`r`nwindow.EQUIPMENT_CATALOG = $($json.Trim());`r`n"
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($jsPath, $js, $utf8)
Write-Host "Wrote $jsPath size=$((Get-Item $jsPath).Length)"
