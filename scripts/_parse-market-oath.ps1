$raw = Get-Content 'd:\CG\_market_oath.json' -Raw -Encoding UTF8
$data = $raw | ConvertFrom-Json
$names = @{}
$sample = $null
foreach ($prop in $data.itemsByCd.PSObject.Properties) {
  foreach ($it in $prop.Value) {
    if ($it.ITEM_ID -eq 1007001 -or $it.ITEM_ID -eq 1007002 -or $it.ITEM_ID -eq 1007003) {
      if (-not $sample) { $sample = $it }
      $key = [string]$it.ITEM_ID
      if (-not $names.ContainsKey($key)) {
        $names[$key] = [pscustomobject]@{
          ITEM_ID = $it.ITEM_ID
          ITEM_TRUENAME = $it.ITEM_TRUENAME
          ITEM_BASEIMAGENUMBER = $it.ITEM_BASEIMAGENUMBER
          gif = "https://member.starcg.net/metamo/item/$($it.ITEM_BASEIMAGENUMBER).gif"
          png = "https://member.starcg.net/metamo/png/$($it.ITEM_BASEIMAGENUMBER).png"
        }
      }
    }
  }
}
$names.Values | ConvertTo-Json -Depth 4 | Set-Content 'd:\CG\_market_oath_images.json' -Encoding UTF8
if ($sample) { $sample | ConvertTo-Json -Depth 4 | Set-Content 'd:\CG\_market_oath_sample.json' -Encoding UTF8 }
