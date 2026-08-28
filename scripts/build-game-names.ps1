#Requires -Version 5.1
<#
.SYNOPSIS
  Regenerate d:\CG\starcg_game_names.js from equipment/pets/price-checker/gems sources.
.DESCRIPTION
  Uses scripts/build-game-names.mjs when Node.js is available; otherwise falls back to
  embedded PowerShell translation engine (same output format).
#>
$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$OutFile = Join-Path $Root 'starcg_game_names.js'
$Mjs = Join-Path $ScriptDir 'build-game-names.mjs'

function Find-Node {
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    $candidates = @(
        $(if ($cmd) { $cmd.Source }),
        "$env:ProgramFiles\nodejs\node.exe",
        "${env:ProgramFiles(x86)}\nodejs\node.exe",
        "$env:LOCALAPPDATA\Programs\node\node.exe"
    ) | Where-Object { $_ -and (Test-Path $_) }
    return $candidates | Select-Object -First 1
}

$node = Find-Node
if ($node) {
    Write-Host "Using Node.js: $node"
    & $node $Mjs
    if ($LASTEXITCODE -ne 0) { throw "build-game-names.mjs failed ($LASTEXITCODE)" }
} else {
    Write-Host "Node.js not found — using PowerShell fallback"
    . (Join-Path $ScriptDir 'build-game-names-core.ps1')
    Build-GameNamesFile -Root $Root -OutFile $OutFile
}

if (-not (Test-Path $OutFile)) { throw "Output not created: $OutFile" }
$count = ([regex]::Matches([IO.File]::ReadAllText($OutFile, [Text.UTF8Encoding]::new($false)), "(?m)^\s+'")).Count
Write-Host "Done: $OutFile ($count entries)"
