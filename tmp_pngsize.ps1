foreach ($f in @('IMG-20260816-WA0002.png','IMG-20260816-WA0003.png')) {
  $p = Join-Path 'photos' $f
  $b = [System.IO.File]::ReadAllBytes($p)
  $w = [BitConverter]::ToUInt32(($b[19..16]), 0)
  $h = [BitConverter]::ToUInt32(($b[23..20]), 0)
  Write-Output ("{0} {1}x{2}" -f $f, $w, $h)
}
