param(
  [string]$RawAssetDir = "pmdo\_downloads\RawAsset",
  [int]$DexMax = 1025,
  [string]$ReferenceCacheDir = "pmdo\_downloads\reference_art\official-artwork",
  [string]$ReportPath = "docs\assets\previews\missing-pokemon-sprite-report.md",
  [string]$ContactSheetPath = "docs\assets\previews\missing-pokemon-generated-contact-sheet.png",
  [int]$Limit = 0,
  [switch]$DryRun,
  [switch]$RefreshReferenceArt,
  [switch]$RegenerateGenerated
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression.FileSystem

function New-Dir($path) {
  New-Item -ItemType Directory -Force -Path $path | Out-Null
}

function New-Bitmap($width, $height) {
  $bitmap = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.Dispose()
  return $bitmap
}

function Fill-Rect($graphics, $x, $y, $w, $h, $color) {
  $brush = New-Object System.Drawing.SolidBrush $color
  $graphics.FillRectangle($brush, $x, $y, $w, $h)
  $brush.Dispose()
}

function Fill-Ellipse($graphics, $x, $y, $w, $h, $color) {
  $brush = New-Object System.Drawing.SolidBrush $color
  $graphics.FillEllipse($brush, $x, $y, $w, $h)
  $brush.Dispose()
}

function Get-DexNameMap($dexMax) {
  $map = @{}
  try {
    $index = Invoke-RestMethod -Uri "https://pokeapi.co/api/v2/pokemon-species?limit=2000" -Headers @{ "User-Agent" = "PokeRom sprite generator" }
  }
  catch {
    Write-Warning "Could not load PokeAPI species names; falling back to local generated credits."
    return $map
  }

  foreach ($entry in $index.results) {
    if ($entry.url -match '/pokemon-species/(\d+)/?$') {
      $id = [int]$Matches[1]
      if ($id -le $dexMax) {
        $map[$id] = $entry.name
      }
    }
  }
  return $map
}

function Get-LocalSpeciesName($spriteRoot, $id) {
  $dexId = Format-DexId $id
  $credits = Join-Path $spriteRoot "$dexId\credits.txt"
  if (Test-Path -LiteralPath $credits) {
    $text = Get-Content -Raw -Path $credits
    if ($text -match 'Generated local PMDO-format sprites for ([^\r\n\(]+)') {
      return $Matches[1].Trim()
    }
  }
  return "pokemon-$id"
}

function Format-DexId($id) {
  return "{0:D4}" -f $id
}

function Get-MissingSpriteIds($spriteRoot, $dexMax, $regenerateGenerated) {
  $missing = New-Object System.Collections.Generic.List[int]
  for ($id = 1; $id -le $dexMax; $id++) {
    $folder = Join-Path $spriteRoot (Format-DexId $id)
    $needsGeneration = -not (Test-Path -LiteralPath $folder)
    if (-not $needsGeneration -and $regenerateGenerated) {
      $credits = Join-Path $folder "credits.txt"
      if ((Test-Path -LiteralPath $credits) -and ((Get-Content -Raw -Path $credits) -match 'generate_missing_pokemon_sprites\.ps1')) {
        $needsGeneration = $true
      }
    }

    if ($needsGeneration) {
      $missing.Add($id)
    }
  }
  return $missing
}

function Download-ReferenceArt($id, $cacheDir, $refresh) {
  New-Dir $cacheDir
  $dexId = Format-DexId $id
  $path = Join-Path $cacheDir "$dexId.png"
  if ((Test-Path -LiteralPath $path) -and -not $refresh) {
    return $path
  }

  $officialUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/$id.png"
  $frontUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/$id.png"
  try {
    Invoke-WebRequest -Uri $officialUrl -OutFile $path -UseBasicParsing -Headers @{ "User-Agent" = "PokeRom sprite generator" }
  }
  catch {
    Invoke-WebRequest -Uri $frontUrl -OutFile $path -UseBasicParsing -Headers @{ "User-Agent" = "PokeRom sprite generator" }
  }
  return $path
}

function Get-AlphaBounds($bitmap) {
  $minX = $bitmap.Width
  $minY = $bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      if ($bitmap.GetPixel($x, $y).A -gt 24) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0 -or $maxY -lt 0) {
    return New-Object System.Drawing.Rectangle 0, 0, $bitmap.Width, $bitmap.Height
  }

  $pad = 4
  $minX = [math]::Max(0, $minX - $pad)
  $minY = [math]::Max(0, $minY - $pad)
  $maxX = [math]::Min($bitmap.Width - 1, $maxX + $pad)
  $maxY = [math]::Min($bitmap.Height - 1, $maxY + $pad)
  return New-Object System.Drawing.Rectangle $minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1)
}

function Quantize-Channel($value, $step) {
  return [math]::Min(255, [math]::Max(0, [int]([math]::Round($value / $step) * $step)))
}

function Stylize-Frame($bitmap, $mode) {
  $copy = New-Bitmap $bitmap.Width $bitmap.Height

  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      $c = $bitmap.GetPixel($x, $y)
      if ($c.A -lt 48) {
        $copy.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        continue
      }

      $r = $c.R
      $g = $c.G
      $b = $c.B
      if ($mode -eq "Back") {
        $gray = [int](($r * 0.30) + ($g * 0.45) + ($b * 0.25))
        $r = [int]($gray * 0.74)
        $g = [int]($gray * 0.82)
        $b = [int]($gray * 0.84)
      }
      elseif ($mode -eq "Sleep") {
        $r = [int]($r * 0.88)
        $g = [int]($g * 0.88)
        $b = [int]($b * 0.88)
      }

      $pixel = [System.Drawing.Color]::FromArgb(
        255,
        (Quantize-Channel $r 24),
        (Quantize-Channel $g 24),
        (Quantize-Channel $b 24)
      )
      $copy.SetPixel($x, $y, $pixel)
    }
  }

  $outline = [System.Drawing.Color]::FromArgb(255, 28, 31, 36)
  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      if ($copy.GetPixel($x, $y).A -ne 0) {
        continue
      }

      $hasNeighbor = $false
      for ($ny = -1; $ny -le 1; $ny++) {
        for ($nx = -1; $nx -le 1; $nx++) {
          if ($nx -eq 0 -and $ny -eq 0) { continue }
          $tx = $x + $nx
          $ty = $y + $ny
          if ($tx -lt 0 -or $ty -lt 0 -or $tx -ge $bitmap.Width -or $ty -ge $bitmap.Height) { continue }
          if ($copy.GetPixel($tx, $ty).A -ne 0) {
            $hasNeighbor = $true
            break
          }
        }
        if ($hasNeighbor) { break }
      }

      if ($hasNeighbor) {
        $bitmap.SetPixel($x, $y, $outline)
      }
      else {
        $bitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
      }
    }
  }

  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      $c = $copy.GetPixel($x, $y)
      if ($c.A -ne 0) {
        $bitmap.SetPixel($x, $y, $c)
      }
    }
  }

  $copy.Dispose()
}

function Draw-ReferenceIntoFrame($source, $bounds, $frameWidth, $frameHeight, $maxWidth, $maxHeight, $bob, $mirror, $mode) {
  $frame = New-Bitmap $frameWidth $frameHeight
  $graphics = [System.Drawing.Graphics]::FromImage($frame)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

  $scale = [math]::Min($maxWidth / $bounds.Width, $maxHeight / $bounds.Height)
  $drawW = [math]::Max(1, [int][math]::Floor($bounds.Width * $scale))
  $drawH = [math]::Max(1, [int][math]::Floor($bounds.Height * $scale))
  if ($mode -eq "Sleep") {
    $drawW = [math]::Min($frameWidth - 4, [int][math]::Floor($drawW * 1.08))
    $drawH = [math]::Max(8, [int][math]::Floor($drawH * 0.72))
  }

  $drawX = [int][math]::Floor(($frameWidth - $drawW) / 2)
  $drawY = [int]($frameHeight - $drawH - 3 + $bob)
  if ($mode -eq "Back") {
    $drawY += 1
  }

  $dest = New-Object System.Drawing.Rectangle $drawX, $drawY, $drawW, $drawH
  if ($mirror) {
    $state = $graphics.Save()
    $graphics.TranslateTransform($frameWidth, 0)
    $graphics.ScaleTransform(-1, 1)
    $mirrorDest = New-Object System.Drawing.Rectangle ($frameWidth - $drawX - $drawW), $drawY, $drawW, $drawH
    $graphics.DrawImage($source, $mirrorDest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Restore($state)
  }
  else {
    $graphics.DrawImage($source, $dest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
  }

  $graphics.Dispose()
  Stylize-Frame $frame $mode
  return $frame
}

function New-AnimSheetFromReference($path, $sourcePath, $pose, $frameWidth, $frameHeight, $frameCount, $directionCount) {
  $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
  $bounds = Get-AlphaBounds $source
  $sheet = New-Bitmap ($frameWidth * $frameCount) ($frameHeight * $directionCount)
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

  for ($dir = 0; $dir -lt $directionCount; $dir++) {
    for ($frameIndex = 0; $frameIndex -lt $frameCount; $frameIndex++) {
      $bob = @(0, -1, 0)[$frameIndex % 3]
      $mode = "Front"
      $mirror = $false
      if ($pose -eq "Sleep") {
        $bob = if (($frameIndex % 2) -eq 0) { 0 } else { 1 }
        $mode = "Sleep"
      }
      elseif ($dir -in @(3, 4, 5)) {
        $mode = "Back"
        $mirror = $dir -eq 5
      }
      elseif ($dir -in @(6, 7)) {
        $mirror = $true
      }

      $maxWidth = if ($pose -eq "Sleep") { 23 } else { 30 }
      $maxHeight = if ($pose -eq "Sleep") { 22 } else { 32 }
      $frame = Draw-ReferenceIntoFrame $source $bounds $frameWidth $frameHeight $maxWidth $maxHeight $bob $mirror $mode
      $dest = New-Object System.Drawing.Rectangle ($frameIndex * $frameWidth), ($dir * $frameHeight), $frameWidth, $frameHeight
      $graphics.DrawImage($frame, $dest, 0, 0, $frameWidth, $frameHeight, [System.Drawing.GraphicsUnit]::Pixel)
      $frame.Dispose()
    }
  }

  $graphics.Dispose()
  $sheet.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $sheet.Dispose()
  $source.Dispose()
}

function New-ShadowSheet($path, $frameWidth, $frameHeight, $frameCount, $directionCount) {
  $bitmap = New-Bitmap ($frameWidth * $frameCount) ($frameHeight * $directionCount)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  $shadow = [System.Drawing.Color]::FromArgb(88, 0, 0, 0)
  for ($dir = 0; $dir -lt $directionCount; $dir++) {
    for ($i = 0; $i -lt $frameCount; $i++) {
      Fill-Ellipse $graphics (($i * $frameWidth) + [math]::Floor($frameWidth / 2) - 12) (($dir * $frameHeight) + $frameHeight - 8) 24 5 $shadow
    }
  }
  $graphics.Dispose()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function New-OffsetSheet($path, $frameWidth, $frameHeight, $frameCount, $directionCount) {
  $bitmap = New-Bitmap ($frameWidth * $frameCount) ($frameHeight * $directionCount)
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function Write-AnimData($path) {
  @"
<?xml version="1.0" ?>
<AnimData>
  <ShadowSize>1</ShadowSize>
  <Anims>
    <Anim>
      <Name>Idle</Name>
      <Index>0</Index>
      <FrameWidth>32</FrameWidth>
      <FrameHeight>40</FrameHeight>
      <Durations>
        <Duration>40</Duration>
        <Duration>6</Duration>
        <Duration>6</Duration>
      </Durations>
    </Anim>
    <Anim>
      <Name>Sleep</Name>
      <Index>1</Index>
      <FrameWidth>24</FrameWidth>
      <FrameHeight>24</FrameHeight>
      <Durations>
        <Duration>30</Duration>
        <Duration>35</Duration>
      </Durations>
    </Anim>
  </Anims>
</AnimData>
"@ | Set-Content -Encoding UTF8 $path
}

function Write-GeneratedSpecies($root, $id, $name, $sourcePath) {
  $dexId = Format-DexId $id
  $spriteDir = Join-Path $root "Sprite\$dexId"
  New-Dir $spriteDir

  New-AnimSheetFromReference (Join-Path $spriteDir "Idle-Anim.png") $sourcePath "Idle" 32 40 3 8
  New-ShadowSheet (Join-Path $spriteDir "Idle-Shadow.png") 32 40 3 8
  New-OffsetSheet (Join-Path $spriteDir "Idle-Offsets.png") 32 40 3 8

  New-AnimSheetFromReference (Join-Path $spriteDir "Sleep-Anim.png") $sourcePath "Sleep" 24 24 2 1
  New-ShadowSheet (Join-Path $spriteDir "Sleep-Shadow.png") 24 24 2 1
  New-OffsetSheet (Join-Path $spriteDir "Sleep-Offsets.png") 24 24 2 1

  Write-AnimData (Join-Path $spriteDir "AnimData.xml")
  @"
Generated local PMDO-format sprites for $name ($dexId).
Reference art source: PokeAPI official artwork cache.
Generated by tools/sprites/generate_missing_pokemon_sprites.ps1.
"@ | Set-Content -Encoding UTF8 (Join-Path $spriteDir "credits.txt")

  return $spriteDir
}

function Get-ImageInfo($path) {
  $bitmap = [System.Drawing.Bitmap]::FromFile($path)
  $nonTransparent = 0
  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      if ($bitmap.GetPixel($x, $y).A -gt 0) {
        $nonTransparent++
      }
    }
  }
  $info = [pscustomobject]@{
    Width = $bitmap.Width
    Height = $bitmap.Height
    NonTransparent = $nonTransparent
  }
  $bitmap.Dispose()
  return $info
}

function Test-GeneratedSpecies($spriteDir) {
  $idle = Join-Path $spriteDir "Idle-Anim.png"
  $sleep = Join-Path $spriteDir "Sleep-Anim.png"
  $idleInfo = Get-ImageInfo $idle
  $sleepInfo = Get-ImageInfo $sleep
  $ok = (
    $idleInfo.Width -eq 96 -and
    $idleInfo.Height -eq 320 -and
    $sleepInfo.Width -eq 48 -and
    $sleepInfo.Height -eq 24 -and
    $idleInfo.NonTransparent -gt 900 -and
    $sleepInfo.NonTransparent -gt 70
  )
  return [pscustomobject]@{
    Ok = $ok
    IdlePixels = $idleInfo.NonTransparent
    SleepPixels = $sleepInfo.NonTransparent
  }
}

function Draw-Text($graphics, $text, $x, $y, $size, $bold) {
  $style = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
  $font = New-Object System.Drawing.Font "Segoe UI", $size, $style
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 33, 37, 43))
  $graphics.DrawString($text, $font, $brush, $x, $y)
  $brush.Dispose()
  $font.Dispose()
}

function Draw-Checker($graphics, $x, $y, $w, $h) {
  $light = [System.Drawing.Color]::FromArgb(255, 232, 238, 242)
  $dark = [System.Drawing.Color]::FromArgb(255, 207, 218, 225)
  $cell = 12
  for ($py = 0; $py -lt $h; $py += $cell) {
    for ($px = 0; $px -lt $w; $px += $cell) {
      $color = if ((([math]::Floor($px / $cell) + [math]::Floor($py / $cell)) % 2) -eq 0) { $light } else { $dark }
      Fill-Rect $graphics ($x + $px) ($y + $py) ([math]::Min($cell, $w - $px)) ([math]::Min($cell, $h - $py)) $color
    }
  }
}

function Write-ContactSheet($root, $rows, $path) {
  $cols = 7
  $tileW = 148
  $tileH = 166
  $margin = 32
  $headerH = 92
  $rowCount = [math]::Max(1, [int][math]::Ceiling($rows.Count / $cols))
  $width = ($cols * $tileW) + ($margin * 2)
  $height = $headerH + ($rowCount * $tileH) + $margin

  $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($path)
  New-Dir (Split-Path -Parent $resolvedPath)

  $sheet = New-Bitmap $width $height
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 246, 248, 250))
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

  Draw-Text $graphics "Generated Missing Pokemon PMDO Sprite Pass" $margin 24 24 $true
  Draw-Text $graphics "$($rows.Count) generated species, first 32x40 idle frame shown at 3x scale." $margin 60 13 $false

  for ($i = 0; $i -lt $rows.Count; $i++) {
    $row = $rows[$i]
    $col = $i % $cols
    $tileRow = [int][math]::Floor($i / $cols)
    $x = $margin + ($col * $tileW)
    $y = $headerH + ($tileRow * $tileH)
    Draw-Checker $graphics $x ($y + 24) 96 120

    $idle = Join-Path $root ("Sprite\{0}\Idle-Anim.png" -f $row.DexId)
    $bitmap = [System.Drawing.Bitmap]::FromFile($idle)
    $dest = New-Object System.Drawing.Rectangle $x, ($y + 24), 96, 120
    $src = New-Object System.Drawing.Rectangle 0, 0, 32, 40
    $graphics.DrawImage($bitmap, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
    $bitmap.Dispose()

    Draw-Text $graphics ("{0} {1}" -f $row.DexId, $row.Name) $x ($y + 148) 10 $false
  }

  $graphics.Dispose()
  $sheet.Save($resolvedPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $sheet.Dispose()
  return $resolvedPath
}

function Write-Report($path, $dexMax, $initialMissing, $rows, $failures) {
  $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($path)
  New-Dir (Split-Path -Parent $resolvedPath)
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add("# Missing Pokemon Sprite Generation Report")
  $lines.Add("")
  $lines.Add("- Generated on: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz'))")
  $lines.Add("- National Dex range: 0001-$('{0:D4}' -f $dexMax)")
  $lines.Add("- Missing folders detected before generation: $initialMissing")
  $lines.Add("- Generated folders this run: $($rows.Count)")
  $lines.Add("- Verification failures: $($failures.Count)")
  $lines.Add("- Verification checks: PMDO sheet dimensions, nontransparent pixel coverage, generated first-frame contact sheet")
  $lines.Add("- Direction rows: front reference conversion with mirrored side rows and desaturated back-row proxies")
  $lines.Add('- Reference art: PokeAPI official artwork PNGs cached under `pmdo/_downloads/reference_art/official-artwork`')
  $lines.Add("")
  $lines.Add("| Dex | Name | Idle pixels | Sleep pixels | Status |")
  $lines.Add("| --- | --- | ---: | ---: | --- |")
  foreach ($row in $rows) {
    $status = if ($row.Ok) { "ok" } else { "failed" }
    $lines.Add("| $($row.DexId) | $($row.Name) | $($row.IdlePixels) | $($row.SleepPixels) | $status |")
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($resolvedPath, (($lines -join "`n") + "`n"), $utf8NoBom)
  return $resolvedPath
}

$resolvedRoot = Resolve-Path $RawAssetDir
$spriteRoot = Join-Path $resolvedRoot "Sprite"
$resolvedCache = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($ReferenceCacheDir)
$missing = Get-MissingSpriteIds $spriteRoot $DexMax $RegenerateGenerated
$initialMissing = $missing.Count
if ($Limit -gt 0) {
  $missing = $missing | Select-Object -First $Limit
}

Write-Output "Missing sprite folders detected: $initialMissing"
if ($DryRun) {
  $missing | ForEach-Object { Write-Output (Format-DexId $_) }
  exit 0
}

$nameMap = Get-DexNameMap $DexMax
$rows = New-Object System.Collections.Generic.List[object]
$failures = New-Object System.Collections.Generic.List[object]

foreach ($id in $missing) {
  $dexId = Format-DexId $id
  $name = if ($nameMap.ContainsKey($id)) { $nameMap[$id] } else { Get-LocalSpeciesName $spriteRoot $id }
  Write-Output "Generating $dexId $name"
  $sourcePath = Download-ReferenceArt $id $resolvedCache $RefreshReferenceArt
  $spriteDir = Write-GeneratedSpecies $resolvedRoot $id $name $sourcePath
  $verification = Test-GeneratedSpecies $spriteDir
  $row = [pscustomobject]@{
    DexId = $dexId
    Name = $name
    SpriteDir = $spriteDir
    SourcePath = $sourcePath
    IdlePixels = $verification.IdlePixels
    SleepPixels = $verification.SleepPixels
    Ok = $verification.Ok
  }
  $rows.Add($row)
  if (-not $verification.Ok) {
    $failures.Add($row)
  }
}

$report = Write-Report $ReportPath $DexMax $initialMissing $rows $failures
$contact = Write-ContactSheet $resolvedRoot $rows $ContactSheetPath
Write-Output "Generated species: $($rows.Count)"
Write-Output "Verification failures: $($failures.Count)"
Write-Output "Report: $report"
Write-Output "Contact sheet: $contact"

if ($failures.Count -gt 0) {
  throw "Generated sprite verification failed for $($failures.Count) species."
}
