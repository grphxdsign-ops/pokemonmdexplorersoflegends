param(
  [string]$RawAssetDir = "pmdo\_downloads\RawAsset",
  [int]$DexMax = 1025,
  [string]$ReferenceCacheDir = "pmdo\_downloads\reference_art\official-artwork",
  [string]$ReportPath = "docs\assets\previews\missing-pokemon-sprite-report.md",
  [string]$ContactSheetPath = "docs\assets\previews\missing-pokemon-generated-contact-sheet.png",
  [string]$TemplateSpeciesId = "0001",
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
      $shadowWidth = [math]::Max(16, [int][math]::Round($frameWidth * 0.45))
      $shadowHeight = [math]::Max(3, [int][math]::Round($frameHeight * 0.04))
      Fill-Ellipse $graphics (($i * $frameWidth) + [math]::Floor($frameWidth / 2) - [math]::Floor($shadowWidth / 2)) (($dir * $frameHeight) + $frameHeight - [math]::Max(8, [int][math]::Round($frameHeight * 0.09))) $shadowWidth $shadowHeight $shadow
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

function Get-TemplateAnimations($root, $templateSpeciesId) {
  $templateDir = Join-Path $root "Sprite\$templateSpeciesId"
  $xmlPath = Join-Path $templateDir "AnimData.xml"
  $xml = [xml](Get-Content -Raw -Path $xmlPath)
  $animations = New-Object System.Collections.Generic.List[object]

  foreach ($anim in $xml.AnimData.Anims.Anim) {
    $name = [string]$anim.Name
    $copyOf = if ($anim.CopyOf) { [string]$anim.CopyOf } else { "" }
    $index = if ($anim.Index) { [int]$anim.Index } else { $null }
    $durations = @()
    if ($anim.Durations -and $anim.Durations.Duration) {
      foreach ($duration in $anim.Durations.Duration) {
        $durations += [int]$duration
      }
    }

    $sourceFrameWidth = if ($anim.FrameWidth) { [int]$anim.FrameWidth } else { 0 }
    $sourceFrameHeight = if ($anim.FrameHeight) { [int]$anim.FrameHeight } else { 0 }
    $frameCount = $durations.Count
    $directionCount = 0

    if (-not $copyOf) {
      $sheetPath = Join-Path $templateDir "$name-Anim.png"
      if (Test-Path -LiteralPath $sheetPath) {
        $sheet = [System.Drawing.Bitmap]::FromFile($sheetPath)
        if ($sourceFrameWidth -gt 0 -and $sourceFrameHeight -gt 0) {
          $frameCount = [math]::Max(1, [int]($sheet.Width / $sourceFrameWidth))
          $directionCount = [math]::Max(1, [int]($sheet.Height / $sourceFrameHeight))
        }
        $sheet.Dispose()
      }
      if ($directionCount -le 0) { $directionCount = 1 }
    }

    $animations.Add([pscustomobject]@{
      Name = $name
      Index = $index
      CopyOf = $copyOf
      RushFrame = if ($anim.RushFrame) { [int]$anim.RushFrame } else { $null }
      HitFrame = if ($anim.HitFrame) { [int]$anim.HitFrame } else { $null }
      ReturnFrame = if ($anim.ReturnFrame) { [int]$anim.ReturnFrame } else { $null }
      Durations = $durations
      FrameCount = $frameCount
      DirectionCount = $directionCount
    })
  }

  return $animations
}

function Get-FullFrameSize($animationName) {
  switch ($animationName) {
    "Attack" { return New-Object System.Drawing.Size 320, 256 }
    "Swing" { return New-Object System.Drawing.Size 320, 256 }
    "Double" { return New-Object System.Drawing.Size 320, 256 }
    "Hop" { return New-Object System.Drawing.Size 224, 320 }
    "LeapForth" { return New-Object System.Drawing.Size 224, 320 }
    "Sleep" { return New-Object System.Drawing.Size 192, 128 }
    "EventSleep" { return New-Object System.Drawing.Size 192, 128 }
    "Laying" { return New-Object System.Drawing.Size 192, 128 }
    "Trip" { return New-Object System.Drawing.Size 224, 144 }
    "Faint" { return New-Object System.Drawing.Size 224, 144 }
    "Cringe" { return New-Object System.Drawing.Size 224, 160 }
    "Tumble" { return New-Object System.Drawing.Size 224, 160 }
    "TumbleBack" { return New-Object System.Drawing.Size 224, 160 }
    "HitGround" { return New-Object System.Drawing.Size 224, 160 }
    default { return New-Object System.Drawing.Size 192, 192 }
  }
}

function Get-FullMaxDrawSize($animationName, $frameWidth, $frameHeight) {
  $maxW = [math]::Max(32, $frameWidth - 18)
  $maxH = [math]::Max(32, $frameHeight - 18)
  if ($animationName -in @("Sleep", "EventSleep", "Laying", "Trip", "Faint", "Tumble", "TumbleBack", "HitGround")) {
    $maxH = [math]::Max(32, $frameHeight - 22)
  }
  return New-Object System.Drawing.Size $maxW, $maxH
}

function Get-DirectionVector($directionIndex) {
  $vectors = @(
    @(0, 1),
    @(1, 1),
    @(1, 0),
    @(1, -1),
    @(0, -1),
    @(-1, -1),
    @(-1, 0),
    @(-1, 1)
  )
  if ($directionIndex -lt 0 -or $directionIndex -ge $vectors.Count) {
    return @(0, 1)
  }
  return $vectors[$directionIndex]
}

function Get-FullAnimationMotion($animationName, $frameIndex, $frameCount, $directionIndex) {
  $vector = Get-DirectionVector $directionIndex
  $dx = $vector[0]
  $dy = $vector[1]
  $x = 0
  $y = 0
  $scale = 1.0
  $rotate = 0
  $scaleX = 1.0
  $scaleY = 1.0

  switch ($animationName) {
    "Idle" { $y = @(0, -3, 0)[$frameIndex % 3] }
    "Walk" { $y = @(0, -6, -2, 0, -6, -2)[$frameIndex % 6]; $x = $dx * @(0, 4, 7, 4, 0, -3)[$frameIndex % 6]; $rotate = @(-2, 2, -1, 2, -2, 1)[$frameIndex % 6] }
    "Attack" { $lunge = @(0, 12, 26, 38, 30, 18, 8, 0, -4, 0, 0)[$frameIndex % 11]; $x = $dx * $lunge; $y = $dy * $lunge; $rotate = @(0, -4, -8, -12, -8, -4, 0, 3, 0, 0, 0)[$frameIndex % 11]; $scaleX = 1.08; $scaleY = .94 }
    "Charge" { $lunge = @(0, 8, 16, 26, 36, 30, 22, 14, 6, 0)[$frameIndex % 10]; $x = $dx * $lunge; $y = $dy * $lunge; $rotate = -7; $scaleX = 1.12; $scaleY = .86 }
    "Shoot" { $lunge = @(0, 10, 20, 10, -8, 0)[$frameIndex % 6]; $x = $dx * $lunge; $y = $dy * $lunge; $rotate = @(0, -3, -5, 0, 3, 0)[$frameIndex % 6]; $scaleX = 1.04 }
    "Swing" { $lunge = @(0, 12, 24, 34, 26, 10, -8, -4, 0)[$frameIndex % 9]; $x = $dx * $lunge; $y = $dy * $lunge; $rotate = @(0, -10, -18, -24, -12, 8, 18, 8, 0)[$frameIndex % 9] }
    "Double" { $lunge = @(0, 10, 22, 8, 0, -8, 0, 12, 26, 10, 0, -8, 0, 8, 0, 0)[$frameIndex % 16]; $x = $dx * $lunge; $y = $dy * $lunge; $rotate = @(-4, -12, -18, -8, 4, 12, 0, -12, -18, -8, 4, 12, 0, -4, 0, 0)[$frameIndex % 16] }
    "Hop" {
      $t = if ($frameCount -le 1) { 0 } else { $frameIndex / [double]($frameCount - 1) }
      $y = -[int][math]::Round([math]::Sin($t * [math]::PI) * 92)
      $scaleY = @(1.0, .92, 1.06, 1.1, 1.06, .98, .92, 1.02, 1.0, 1.0)[$frameIndex % 10]
    }
    "LeapForth" {
      $t = if ($frameCount -le 1) { 0 } else { $frameIndex / [double]($frameCount - 1) }
      $y = -[int][math]::Round([math]::Sin($t * [math]::PI) * 86)
      $x = $dx * [int][math]::Round($t * 34)
      $rotate = -10
    }
    "Shake" { $x = @(-8, 8, -8, 8, -4, 4)[$frameIndex % 6]; $rotate = @(-6, 6, -6, 6, -3, 3)[$frameIndex % 6] }
    "Hurt" { $x = @(-12, 8)[$frameIndex % 2]; $y = 4; $rotate = @(12, -8)[$frameIndex % 2]; $scaleY = .94 }
    "Pain" { $x = @(-10, 10, -8, 8, -6, 6, -4, 4, -3, 3, 0, 0)[$frameIndex % 12]; $y = 5; $rotate = @(-10, 10, -8, 8, -6, 6, -4, 4, -2, 2, 0, 0)[$frameIndex % 12]; $scaleY = .92 }
    "DeepBreath" { $scale = @(1.0, 1.02, 1.05, 1.08, 1.05, 1.02, 1.0, .98, 1.0)[$frameIndex % 9] }
    "Nod" { $y = @(0, 8, 0)[$frameIndex % 3]; $scaleY = @(1.0, .9, 1.0)[$frameIndex % 3] }
    "Float" { $y = @(0, -8, -12, -6)[$frameIndex % 4] }
    "Pose" { $y = @(0, -10, -16, -8, 0)[$frameIndex % 5]; $scale = @(1.0, 1.03, 1.06, 1.03, 1.0)[$frameIndex % 5]; $rotate = @(0, -4, 0, 4, 0)[$frameIndex % 5] }
    "Pull" { $x = -$dx * @(0, 8, 14, 18, 14, 8, 0)[$frameIndex % 7]; $y = -$dy * @(0, 8, 14, 18, 14, 8, 0)[$frameIndex % 7]; $rotate = @(0, 5, 9, 12, 9, 5, 0)[$frameIndex % 7] }
    "Wake" { $y = @(22, 14, 8, 2, -4, 0)[$frameIndex % 6]; $scaleY = @(.68, .74, .84, .94, 1.04, 1.0)[$frameIndex % 6] }
    "Eat" { $y = @(0, 5, 0, 5)[$frameIndex % 4]; $rotate = @(8, 15, 8, 15)[$frameIndex % 4]; $scaleY = .93 }
    "Tumble" { $x = @(0, 10, 18, 12, 0, -10, -18, -8)[$frameIndex % 8]; $y = @(4, 8, 12, 8, 4, 8, 12, 8)[$frameIndex % 8]; $scale = .92; $rotate = @(0, 45, 90, 135, 180, 225, 270, 315)[$frameIndex % 8] }
    "TumbleBack" { $x = @(0, -8, -18, -12, 0, 10, 18, 12, 4, 0)[$frameIndex % 10]; $y = @(4, 8, 12, 8, 4, 8, 12, 8, 5, 4)[$frameIndex % 10]; $scale = .92; $rotate = @(0, -36, -72, -108, -144, -180, -216, -252, -288, -324)[$frameIndex % 10] }
    "Sink" { $y = $frameIndex * 12; $scale = [math]::Max(.45, 1.0 - ($frameIndex * .045)) }
    "Trip" { $y = 16; $x = @(0, 8, 16, 8, 0)[$frameIndex % 5]; $rotate = @(0, 15, 38, 55, 72)[$frameIndex % 5]; $scaleY = .84 }
    "Faint" { $y = @(0, 10, 22, 22)[$frameIndex % 4]; $scale = @(1.0, .96, .9, .9)[$frameIndex % 4]; $rotate = @(0, 35, 75, 90)[$frameIndex % 4]; $scaleY = .72 }
    "Cringe" { $x = @(-8, 6)[$frameIndex % 2]; $scale = .94; $scaleY = .82 }
    "LostBalance" { $x = @(-12, 12)[$frameIndex % 2]; $y = 8; $rotate = @(-14, 14)[$frameIndex % 2] }
    "HitGround" { $y = @(20, 14, 8, 4, 8, 4, 2, 0)[$frameIndex % 8]; $scale = .9; $rotate = 90; $scaleY = .66 }
    "Laying" { $rotate = 90; $scaleY = .66 }
    "Sleep" { $scaleX = 1.22; $scaleY = .58 }
    "EventSleep" { $scaleX = 1.22; $scaleY = .58 }
    "LookUp" { $y = -5; $rotate = -6 }
    "Sit" { $scaleY = .82; $y = 10 }
  }

  return [pscustomobject]@{ X = $x; Y = $y; Scale = $scale; Rotate = $rotate; ScaleX = $scaleX; ScaleY = $scaleY }
}

function New-CanonicalReferenceSprite($sourcePath) {
  $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
  $bounds = Get-AlphaBounds $source
  $sprite = New-Bitmap 128 128
  $graphics = [System.Drawing.Graphics]::FromImage($sprite)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  $scale = [math]::Min(104 / $bounds.Width, 104 / $bounds.Height)
  $drawW = [math]::Max(1, [int][math]::Round($bounds.Width * $scale))
  $drawH = [math]::Max(1, [int][math]::Round($bounds.Height * $scale))
  $dest = New-Object System.Drawing.Rectangle ([int][math]::Floor((128 - $drawW) / 2)), ([int][math]::Floor((128 - $drawH) / 2)), $drawW, $drawH
  $graphics.DrawImage($source, $dest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()
  $source.Dispose()
  Stylize-Frame $sprite "Front"
  return $sprite
}

function Draw-FullReferenceFrame($graphics, $sprite, $animationName, $frameX, $frameY, $frameWidth, $frameHeight, $frameIndex, $frameCount, $directionIndex) {
  $motion = Get-FullAnimationMotion $animationName $frameIndex $frameCount $directionIndex
  $maxDraw = Get-FullMaxDrawSize $animationName $frameWidth $frameHeight
  $scale = [math]::Min($maxDraw.Width / $sprite.Width, $maxDraw.Height / $sprite.Height) * $motion.Scale
  $drawW = [math]::Max(1, [int][math]::Round($sprite.Width * $scale * $motion.ScaleX))
  $drawH = [math]::Max(1, [int][math]::Round($sprite.Height * $scale * $motion.ScaleY))

  if ($animationName -in @("Sleep", "EventSleep", "Laying", "Faint", "HitGround")) {
    $drawY = $frameY + $frameHeight - $drawH - 6 + $motion.Y
  }
  else {
    $drawY = $frameY + $frameHeight - $drawH - 8 + $motion.Y
  }
  $drawX = $frameX + [int][math]::Floor(($frameWidth - $drawW) / 2) + $motion.X

  $state = $graphics.Save()
  $graphics.SetClip((New-Object System.Drawing.Rectangle $frameX, $frameY, $frameWidth, $frameHeight), [System.Drawing.Drawing2D.CombineMode]::Replace)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

  $centerX = $drawX + ($drawW / 2.0)
  $centerY = $drawY + ($drawH / 2.0)
  $graphics.TranslateTransform($centerX, $centerY)
  if ($directionIndex -in @(5, 6, 7)) {
    $graphics.ScaleTransform(-1, 1)
  }
  $graphics.RotateTransform($motion.Rotate)
  $dest = New-Object System.Drawing.Rectangle ([int][math]::Round(-$drawW / 2.0)), ([int][math]::Round(-$drawH / 2.0)), $drawW, $drawH
  $graphics.DrawImage($sprite, $dest, 0, 0, $sprite.Width, $sprite.Height, [System.Drawing.GraphicsUnit]::Pixel)

  $graphics.Restore($state)
}

function New-FullAnimSheetFromReference($path, $sprite, $animationName, $frameWidth, $frameHeight, $frameCount, $directionCount) {
  $sheet = New-Bitmap ($frameWidth * $frameCount) ($frameHeight * $directionCount)
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  for ($dir = 0; $dir -lt $directionCount; $dir++) {
    for ($frameIndex = 0; $frameIndex -lt $frameCount; $frameIndex++) {
      Draw-FullReferenceFrame $graphics $sprite $animationName ($frameIndex * $frameWidth) ($dir * $frameHeight) $frameWidth $frameHeight $frameIndex $frameCount $dir
    }
  }
  $graphics.Dispose()
  $sheet.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $sheet.Dispose()
}

function Write-FullAnimData($path, $animations, $frameSizeMap) {
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('<?xml version="1.0" ?>')
  $lines.Add('<AnimData>')
  $lines.Add('  <ShadowSize>1</ShadowSize>')
  $lines.Add('  <Anims>')

  foreach ($anim in $animations) {
    $lines.Add('    <Anim>')
    $lines.Add("      <Name>$($anim.Name)</Name>")
    if ($null -ne $anim.Index) {
      $lines.Add("      <Index>$($anim.Index)</Index>")
    }
    if ($anim.CopyOf) {
      $lines.Add("      <CopyOf>$($anim.CopyOf)</CopyOf>")
    }
    else {
      $size = $frameSizeMap[$anim.Name]
      $lines.Add("      <FrameWidth>$($size.Width)</FrameWidth>")
      $lines.Add("      <FrameHeight>$($size.Height)</FrameHeight>")
      if ($null -ne $anim.RushFrame) { $lines.Add("      <RushFrame>$($anim.RushFrame)</RushFrame>") }
      if ($null -ne $anim.HitFrame) { $lines.Add("      <HitFrame>$($anim.HitFrame)</HitFrame>") }
      if ($null -ne $anim.ReturnFrame) { $lines.Add("      <ReturnFrame>$($anim.ReturnFrame)</ReturnFrame>") }
      $lines.Add('      <Durations>')
      foreach ($duration in $anim.Durations) {
        $lines.Add("        <Duration>$duration</Duration>")
      }
      $lines.Add('      </Durations>')
    }
    $lines.Add('    </Anim>')
  }

  $lines.Add('  </Anims>')
  $lines.Add('</AnimData>')
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($path, (($lines -join "`n") + "`n"), $utf8NoBom)
}

function Write-GeneratedSpecies($root, $id, $name, $sourcePath) {
  $dexId = Format-DexId $id
  $spriteDir = Join-Path $root "Sprite\$dexId"
  New-Dir $spriteDir

  $animations = Get-TemplateAnimations $root $TemplateSpeciesId
  $frameSizeMap = @{}
  $sprite = New-CanonicalReferenceSprite $sourcePath

  foreach ($anim in $animations) {
    if ($anim.CopyOf) { continue }
    $size = Get-FullFrameSize $anim.Name
    $frameSizeMap[$anim.Name] = $size
    New-FullAnimSheetFromReference (Join-Path $spriteDir "$($anim.Name)-Anim.png") $sprite $anim.Name $size.Width $size.Height $anim.FrameCount $anim.DirectionCount
    New-ShadowSheet (Join-Path $spriteDir "$($anim.Name)-Shadow.png") $size.Width $size.Height $anim.FrameCount $anim.DirectionCount
    New-OffsetSheet (Join-Path $spriteDir "$($anim.Name)-Offsets.png") $size.Width $size.Height $anim.FrameCount $anim.DirectionCount
  }

  $sprite.Dispose()
  Write-FullAnimData (Join-Path $spriteDir "AnimData.xml") $animations $frameSizeMap
  @"
Generated local PMDO-format sprites for $name ($dexId).
Reference art source: PokeAPI official artwork cache.
Generated by tools/sprites/generate_missing_pokemon_sprites.ps1.
Generation mode: full Bulbasaur-template action set.
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
  $spriteRoot = Split-Path -Parent $spriteDir
  $templateDir = Join-Path $spriteRoot $TemplateSpeciesId
  $templateFiles = Get-ChildItem $templateDir -File | Where-Object { $_.Name -ne "credits.txt" } | Sort-Object Name | Select-Object -ExpandProperty Name
  $targetFiles = Get-ChildItem $spriteDir -File | Where-Object { $_.Name -ne "credits.txt" } | Sort-Object Name | Select-Object -ExpandProperty Name
  $missing = @($templateFiles | Where-Object { $targetFiles -notcontains $_ })
  $extra = @($targetFiles | Where-Object { $templateFiles -notcontains $_ })
  $ok = (
    $missing.Count -eq 0 -and
    $extra.Count -eq 0 -and
    $idleInfo.Width -gt 0 -and
    $idleInfo.Height -gt 0 -and
    $sleepInfo.Width -gt 0 -and
    $sleepInfo.Height -gt 0 -and
    $idleInfo.NonTransparent -gt 900 -and
    $sleepInfo.NonTransparent -gt 70
  )
  return [pscustomobject]@{
    Ok = $ok
    IdlePixels = $idleInfo.NonTransparent
    SleepPixels = $sleepInfo.NonTransparent
    GeneratedFiles = $targetFiles.Count
    MissingFiles = $missing.Count
    ExtraFiles = $extra.Count
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

  Draw-Text $graphics "Generated Missing Pokemon PMDO Action Sprite Pass" $margin 24 24 $true
  Draw-Text $graphics "$($rows.Count) generated species, first full-action idle frame shown." $margin 60 13 $false

  for ($i = 0; $i -lt $rows.Count; $i++) {
    $row = $rows[$i]
    $col = $i % $cols
    $tileRow = [int][math]::Floor($i / $cols)
    $x = $margin + ($col * $tileW)
    $y = $headerH + ($tileRow * $tileH)
    Draw-Checker $graphics $x ($y + 24) 96 120

    $idle = Join-Path $root ("Sprite\{0}\Idle-Anim.png" -f $row.DexId)
    $bitmap = [System.Drawing.Bitmap]::FromFile($idle)
    $frame = New-Bitmap 192 192
    $frameGraphics = [System.Drawing.Graphics]::FromImage($frame)
    $frameGraphics.DrawImage($bitmap, (New-Object System.Drawing.Rectangle 0, 0, 192, 192), (New-Object System.Drawing.Rectangle 0, 0, 192, 192), [System.Drawing.GraphicsUnit]::Pixel)
    $frameGraphics.Dispose()
    $bitmap.Dispose()

    $bounds = Get-AlphaBounds $frame
    $scale = [math]::Min(96 / $bounds.Width, 120 / $bounds.Height)
    $drawW = [math]::Max(1, [int][math]::Round($bounds.Width * $scale))
    $drawH = [math]::Max(1, [int][math]::Round($bounds.Height * $scale))
    $dest = New-Object System.Drawing.Rectangle ($x + [int][math]::Floor((96 - $drawW) / 2)), ($y + 24 + [int][math]::Floor((120 - $drawH) / 2)), $drawW, $drawH
    $graphics.DrawImage($frame, $dest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
    $frame.Dispose()

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
  $lines.Add("- Verification checks: Bulbasaur file parity, nontransparent pixel coverage, generated first-frame contact sheet")
  $lines.Add("- Direction rows: reference conversion with mirrored side rows and transformed action poses")
  $lines.Add("- Animation surface: full Bulbasaur-template action set")
  $lines.Add('- Reference art: PokeAPI official artwork PNGs cached under `pmdo/_downloads/reference_art/official-artwork`')
  $lines.Add("")
  $lines.Add("| Dex | Name | Files | Missing | Extra | Idle pixels | Sleep pixels | Status |")
  $lines.Add("| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |")
  foreach ($row in $rows) {
    $status = if ($row.Ok) { "ok" } else { "failed" }
    $lines.Add("| $($row.DexId) | $($row.Name) | $($row.GeneratedFiles) | $($row.MissingFiles) | $($row.ExtraFiles) | $($row.IdlePixels) | $($row.SleepPixels) | $status |")
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
    GeneratedFiles = $verification.GeneratedFiles
    MissingFiles = $verification.MissingFiles
    ExtraFiles = $verification.ExtraFiles
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
