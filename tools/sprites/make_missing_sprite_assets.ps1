param(
  [string]$RawAssetDir = "pmdo\_downloads\RawAsset",
  [string]$SpeciesId = "0832",
  [string]$SpeciesName = "Dubwool",
  [switch]$ExportBulbasaur,
  [switch]$WritePreview,
  [string]$PreviewPath = "docs\assets\previews\bulbasaur-dubwool-idle-sleep.png"
)

$ErrorActionPreference = 'Stop'
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

function Fill-Poly($graphics, $points, $color) {
  $brush = New-Object System.Drawing.SolidBrush $color
  $graphics.FillPolygon($brush, $points)
  $brush.Dispose()
}

function New-Point($x, $y) {
  return New-Object System.Drawing.Point ([int]$x), ([int]$y)
}

function Draw-HoofLeg($graphics, $x, $y, $black, $hoof) {
  Fill-Rect $graphics $x $y 4 6 $black
  Fill-Rect $graphics ($x - 1) ($y + 5) 5 2 $hoof
}

function Draw-WoolBody($graphics, $x, $y, $backPatchSide, $black, $patch, $woolShadow, $woolMid, $wool, $woolLight) {
  Fill-Ellipse $graphics ($x + 1) ($y + 7) 34 21 $black
  Fill-Ellipse $graphics ($x + 2) ($y + 6) 32 21 $woolShadow
  Fill-Ellipse $graphics ($x + 4) ($y + 8) 29 17 $wool

  foreach ($puff in @(
    @(3, 9, 8, 8), @(8, 5, 9, 8), @(15, 4, 10, 8), @(23, 6, 9, 8),
    @(0, 15, 8, 9), @(29, 14, 8, 9), @(5, 22, 10, 7), @(16, 24, 11, 6), @(26, 22, 8, 7)
  )) {
    Fill-Ellipse $graphics ($x + $puff[0]) ($y + $puff[1]) $puff[2] $puff[3] $wool
  }

  Fill-Ellipse $graphics ($x + 8) ($y + 7) 18 7 $woolLight
  Fill-Ellipse $graphics ($x + 9) ($y + 14) 18 8 $woolMid
  Fill-Ellipse $graphics ($x + 10) ($y + 13) 16 8 $wool

  if ($backPatchSide -eq "left") {
    Fill-Ellipse $graphics ($x + 4) ($y + 9) 9 7 $patch
    Fill-Ellipse $graphics ($x + 6) ($y + 23) 9 6 $patch
  }
  elseif ($backPatchSide -eq "right") {
    Fill-Ellipse $graphics ($x + 24) ($y + 9) 9 7 $patch
    Fill-Ellipse $graphics ($x + 22) ($y + 23) 9 6 $patch
  }
  else {
    Fill-Ellipse $graphics ($x + 5) ($y + 10) 8 7 $patch
    Fill-Ellipse $graphics ($x + 24) ($y + 10) 8 7 $patch
  }
}

function Draw-FrontHead($graphics, $x, $y, $black, $face, $headWool, $white, $hornDark, $hornLight, $eye, $pupil, $nose) {
  Fill-Ellipse $graphics ($x + 8) ($y + 6) 24 16 $headWool

  Fill-Poly $graphics @(
    (New-Point ($x + 10) ($y + 7)), (New-Point ($x + 5) ($y + 0)),
    (New-Point ($x + 9) ($y + 0)), (New-Point ($x + 16) ($y + 8))
  ) $hornDark
  Fill-Poly $graphics @(
    (New-Point ($x + 30) ($y + 7)), (New-Point ($x + 35) ($y + 0)),
    (New-Point ($x + 31) ($y + 0)), (New-Point ($x + 24) ($y + 8))
  ) $hornDark
  Fill-Rect $graphics ($x + 8) ($y + 2) 4 2 $hornLight
  Fill-Rect $graphics ($x + 28) ($y + 2) 4 2 $hornLight

  Fill-Ellipse $graphics ($x + 13) ($y + 5) 14 15 $black
  Fill-Ellipse $graphics ($x + 14) ($y + 6) 12 13 $face
  Fill-Poly $graphics @(
    (New-Point ($x + 17) ($y + 6)), (New-Point ($x + 23) ($y + 6)),
    (New-Point ($x + 22) ($y + 16)), (New-Point ($x + 18) ($y + 16))
  ) $white
  Fill-Rect $graphics ($x + 19) ($y + 5) 2 4 $white

  Fill-Ellipse $graphics ($x + 10) ($y + 12) 6 4 $hornDark
  Fill-Ellipse $graphics ($x + 24) ($y + 12) 6 4 $hornDark
  Fill-Rect $graphics ($x + 16) ($y + 10) 3 2 $eye
  Fill-Rect $graphics ($x + 22) ($y + 10) 3 2 $eye
  Fill-Rect $graphics ($x + 17) ($y + 10) 1 2 $pupil
  Fill-Rect $graphics ($x + 23) ($y + 10) 1 2 $pupil
  Fill-Rect $graphics ($x + 19) ($y + 14) 3 2 $nose
}

function Draw-SideHead($graphics, $x, $y, $black, $face, $headWool, $white, $hornDark, $hornLight, $eye, $pupil, $nose) {
  Fill-Ellipse $graphics ($x + 6) ($y + 7) 21 15 $headWool

  Fill-Poly $graphics @(
    (New-Point ($x + 14) ($y + 7)), (New-Point ($x + 11) ($y + 0)),
    (New-Point ($x + 16) ($y + 1)), (New-Point ($x + 20) ($y + 9))
  ) $hornDark
  Fill-Poly $graphics @(
    (New-Point ($x + 20) ($y + 8)), (New-Point ($x + 26) ($y + 1)),
    (New-Point ($x + 29) ($y + 3)), (New-Point ($x + 24) ($y + 12))
  ) $hornDark
  Fill-Rect $graphics ($x + 14) ($y + 2) 3 2 $hornLight
  Fill-Rect $graphics ($x + 24) ($y + 4) 3 2 $hornLight

  Fill-Ellipse $graphics ($x + 15) ($y + 7) 13 13 $black
  Fill-Ellipse $graphics ($x + 16) ($y + 8) 11 11 $face
  Fill-Poly $graphics @(
    (New-Point ($x + 21) ($y + 8)), (New-Point ($x + 27) ($y + 12)),
    (New-Point ($x + 22) ($y + 17)), (New-Point ($x + 19) ($y + 13))
  ) $white
  Fill-Rect $graphics ($x + 22) ($y + 11) 3 2 $eye
  Fill-Rect $graphics ($x + 23) ($y + 11) 1 2 $pupil
  Fill-Rect $graphics ($x + 26) ($y + 14) 2 2 $nose
  Fill-Ellipse $graphics ($x + 24) ($y + 14) 6 4 $hornDark
}

function Draw-BackHead($graphics, $x, $y, $headWool, $hornDark, $hornLight) {
  Fill-Ellipse $graphics ($x + 9) ($y + 8) 22 13 $headWool
  Fill-Poly $graphics @(
    (New-Point ($x + 12) ($y + 8)), (New-Point ($x + 8) ($y + 1)),
    (New-Point ($x + 12) ($y + 0)), (New-Point ($x + 18) ($y + 9))
  ) $hornDark
  Fill-Poly $graphics @(
    (New-Point ($x + 28) ($y + 8)), (New-Point ($x + 32) ($y + 1)),
    (New-Point ($x + 28) ($y + 0)), (New-Point ($x + 22) ($y + 9))
  ) $hornDark
  Fill-Rect $graphics ($x + 11) ($y + 3) 3 2 $hornLight
  Fill-Rect $graphics ($x + 27) ($y + 3) 3 2 $hornLight
}

function Draw-Dubwool-Core($graphics, $originX, $originY, $pose, $frameIndex, $directionIndex) {
  $black = [System.Drawing.Color]::FromArgb(255, 31, 29, 31)
  $nearBlack = [System.Drawing.Color]::FromArgb(255, 18, 20, 24)
  $patch = [System.Drawing.Color]::FromArgb(255, 77, 61, 63)
  $headWool = [System.Drawing.Color]::FromArgb(255, 116, 123, 124)
  $woolShadow = [System.Drawing.Color]::FromArgb(255, 202, 208, 207)
  $woolMid = [System.Drawing.Color]::FromArgb(255, 226, 232, 229)
  $wool = [System.Drawing.Color]::FromArgb(255, 244, 247, 242)
  $woolLight = [System.Drawing.Color]::FromArgb(255, 255, 255, 249)
  $face = [System.Drawing.Color]::FromArgb(255, 50, 44, 48)
  $hornDark = [System.Drawing.Color]::FromArgb(255, 93, 67, 58)
  $hornLight = [System.Drawing.Color]::FromArgb(255, 138, 105, 88)
  $hoof = [System.Drawing.Color]::FromArgb(255, 88, 54, 50)
  $eye = [System.Drawing.Color]::FromArgb(255, 215, 200, 104)
  $pupil = [System.Drawing.Color]::FromArgb(255, 22, 24, 25)
  $nose = [System.Drawing.Color]::FromArgb(255, 196, 118, 121)

  if ($pose -eq "Sleep") {
    $bob = if (($frameIndex % 2) -eq 0) { 0 } else { 1 }
    $x = $originX + 1
    $y = $originY + 2 + $bob
    Draw-WoolBody $graphics ($x + 0) ($y + 0) "left" $nearBlack $patch $woolShadow $woolMid $wool $woolLight
    Fill-Ellipse $graphics ($x + 19) ($y + 6) 12 10 $headWool
    Fill-Ellipse $graphics ($x + 21) ($y + 7) 9 9 $face
    Fill-Poly $graphics @(
      (New-Point ($x + 24) ($y + 6)), (New-Point ($x + 30) ($y + 1)),
      (New-Point ($x + 32) ($y + 3)), (New-Point ($x + 28) ($y + 9))
    ) $hornDark
    Fill-Poly $graphics @(
      (New-Point ($x + 20) ($y + 8)), (New-Point ($x + 15) ($y + 4)),
      (New-Point ($x + 17) ($y + 2)), (New-Point ($x + 24) ($y + 9))
    ) $hornDark
    Fill-Rect $graphics ($x + 25) ($y + 11) 3 2 $woolLight
    Fill-Rect $graphics ($x + 27) ($y + 13) 1 1 $nose
    Fill-Rect $graphics ($x + 8) ($y + 21) 4 2 $nearBlack
    Fill-Rect $graphics ($x + 21) ($y + 21) 4 2 $nearBlack
    return
  }

  $bob = @(0, -1, 0)[$frameIndex % 3]
  $x = $originX + 1
  $y = $originY + 5 + $bob

  Draw-HoofLeg $graphics ($x + 8) ($y + 25) $nearBlack $hoof
  Draw-HoofLeg $graphics ($x + 23) ($y + 25) $nearBlack $hoof

  if ($directionIndex -eq 0) {
    Draw-WoolBody $graphics ($x + 1) ($y + 4) "both" $nearBlack $patch $woolShadow $woolMid $wool $woolLight
    Draw-FrontHead $graphics $x ($y - 1) $nearBlack $face $headWool $woolLight $hornDark $hornLight $eye $pupil $nose
  }
  elseif ($directionIndex -eq 1 -or $directionIndex -eq 7) {
    Draw-WoolBody $graphics ($x + 0) ($y + 4) "left" $nearBlack $patch $woolShadow $woolMid $wool $woolLight
    Draw-SideHead $graphics ($x + 8) ($y - 1) $nearBlack $face $headWool $woolLight $hornDark $hornLight $eye $pupil $nose
  }
  elseif ($directionIndex -eq 2 -or $directionIndex -eq 6) {
    Draw-HoofLeg $graphics ($x + 14) ($y + 25) $nearBlack $hoof
    Draw-WoolBody $graphics ($x + 0) ($y + 4) "left" $nearBlack $patch $woolShadow $woolMid $wool $woolLight
    Draw-SideHead $graphics ($x + 9) ($y - 1) $nearBlack $face $headWool $woolLight $hornDark $hornLight $eye $pupil $nose
  }
  elseif ($directionIndex -eq 3 -or $directionIndex -eq 5) {
    Draw-HoofLeg $graphics ($x + 14) ($y + 25) $nearBlack $hoof
    Draw-WoolBody $graphics ($x + 1) ($y + 4) "right" $nearBlack $patch $woolShadow $woolMid $wool $woolLight
    Draw-BackHead $graphics ($x + 4) ($y - 1) $headWool $hornDark $hornLight
    Fill-Rect $graphics ($x + 31) ($y + 15) 3 3 $nearBlack
  }
  else {
    Draw-WoolBody $graphics ($x + 1) ($y + 4) "both" $nearBlack $patch $woolShadow $woolMid $wool $woolLight
    Draw-BackHead $graphics ($x + 0) ($y - 1) $headWool $hornDark $hornLight
    Fill-Rect $graphics ($x + 31) ($y + 16) 3 3 $nearBlack
  }
}

function Draw-Dubwool-Frame($graphics, $originX, $originY, $frameWidth, $frameHeight, $pose, $frameIndex, $directionIndex) {
  $mirror = $directionIndex -in @(5, 6, 7)
  if ($pose -eq "Sleep" -or -not $mirror) {
    Draw-Dubwool-Core $graphics $originX $originY $pose $frameIndex $directionIndex
    return
  }

  $state = $graphics.Save()
  $graphics.TranslateTransform(($originX + $frameWidth), $originY)
  $graphics.ScaleTransform(-1, 1)
  Draw-Dubwool-Core $graphics 0 0 $pose $frameIndex $directionIndex
  $graphics.Restore($state)
}

function New-Dubwool-AnimSheet($path, $pose, $frameWidth, $frameHeight, $frameCount, $directionCount) {
  $bitmap = New-Bitmap ($frameWidth * $frameCount) ($frameHeight * $directionCount)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  for ($dir = 0; $dir -lt $directionCount; $dir++) {
    for ($i = 0; $i -lt $frameCount; $i++) {
      Draw-Dubwool-Frame $graphics ($i * $frameWidth) ($dir * $frameHeight) $frameWidth $frameHeight $pose $i $dir
    }
  }
  $graphics.Dispose()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function New-ShadowSheet($path, $frameWidth, $frameHeight, $frameCount, $directionCount) {
  $bitmap = New-Bitmap ($frameWidth * $frameCount) ($frameHeight * $directionCount)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $shadow = [System.Drawing.Color]::FromArgb(96, 0, 0, 0)
  for ($dir = 0; $dir -lt $directionCount; $dir++) {
    for ($i = 0; $i -lt $frameCount; $i++) {
      Fill-Rect $graphics (($i * $frameWidth) + [math]::Floor($frameWidth / 2) - 11) (($dir * $frameHeight) + $frameHeight - 7) 22 4 $shadow
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

function Write-Dubwool-Files($root, $speciesId, $speciesName) {
  $spriteDir = Join-Path $root "Sprite\$speciesId"
  New-Dir $spriteDir

  New-Dubwool-AnimSheet (Join-Path $spriteDir "Idle-Anim.png") "Idle" 40 40 3 8
  New-ShadowSheet (Join-Path $spriteDir "Idle-Shadow.png") 40 40 3 8
  New-OffsetSheet (Join-Path $spriteDir "Idle-Offsets.png") 40 40 3 8

  New-Dubwool-AnimSheet (Join-Path $spriteDir "Sleep-Anim.png") "Sleep" 32 24 2 1
  New-ShadowSheet (Join-Path $spriteDir "Sleep-Shadow.png") 32 24 2 1
  New-OffsetSheet (Join-Path $spriteDir "Sleep-Offsets.png") 32 24 2 1

  @"
<?xml version="1.0" ?>
<AnimData>
  <ShadowSize>1</ShadowSize>
  <Anims>
    <Anim>
      <Name>Idle</Name>
      <Index>0</Index>
      <FrameWidth>40</FrameWidth>
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
      <FrameWidth>32</FrameWidth>
      <FrameHeight>24</FrameHeight>
      <Durations>
        <Duration>30</Duration>
        <Duration>35</Duration>
      </Durations>
    </Anim>
  </Anims>
</AnimData>
"@ | Set-Content -Encoding UTF8 (Join-Path $spriteDir "AnimData.xml")

  @"
Generated local PMDO-format sprites for $speciesName.
Design reference: Dubwool is a white Normal-type sheep based on Jacob sheep traits, with black-and-white coloring, four horns, and dark wool patches.
"@ | Set-Content -Encoding UTF8 (Join-Path $spriteDir "credits.txt")

  return $spriteDir
}

function Export-Bulbasaur($root) {
  $exportDir = Join-Path (Split-Path -Parent $root) "exports\bulbasaur-idle-sleep"
  New-Dir $exportDir

  foreach ($name in @("Idle", "Sleep")) {
    Copy-Item -LiteralPath (Join-Path $root "Sprite\0001\$name-Anim.png") -Destination (Join-Path $exportDir "Bulbasaur-$name-Anim.png") -Force
    Copy-Item -LiteralPath (Join-Path $root "Sprite\0001\$name-Offsets.png") -Destination (Join-Path $exportDir "Bulbasaur-$name-Offsets.png") -Force
    Copy-Item -LiteralPath (Join-Path $root "Sprite\0001\$name-Shadow.png") -Destination (Join-Path $exportDir "Bulbasaur-$name-Shadow.png") -Force
  }

  $zipPath = Join-Path (Split-Path -Parent $exportDir) "bulbasaur-idle-sleep.zip"
  if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }
  [System.IO.Compression.ZipFile]::CreateFromDirectory($exportDir, $zipPath)
  return $zipPath
}

function Draw-Text($graphics, $text, $x, $y, $size, $bold) {
  $style = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
  $font = New-Object System.Drawing.Font "Segoe UI", $size, $style
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 34, 39, 45))
  $graphics.DrawString($text, $font, $brush, $x, $y)
  $brush.Dispose()
  $font.Dispose()
}

function Draw-Checker($graphics, $x, $y, $w, $h) {
  $light = [System.Drawing.Color]::FromArgb(255, 232, 238, 242)
  $dark = [System.Drawing.Color]::FromArgb(255, 207, 218, 225)
  $cell = 20
  for ($py = 0; $py -lt $h; $py += $cell) {
    for ($px = 0; $px -lt $w; $px += $cell) {
      $color = if ((([math]::Floor($px / $cell) + [math]::Floor($py / $cell)) % 2) -eq 0) { $light } else { $dark }
      Fill-Rect $graphics ($x + $px) ($y + $py) ([math]::Min($cell, $w - $px)) ([math]::Min($cell, $h - $py)) $color
    }
  }
}

function Draw-SheetRegion($graphics, $path, $srcX, $srcY, $srcW, $srcH, $destX, $destY, $scale) {
  $bitmap = [System.Drawing.Bitmap]::FromFile($path)
  $dest = New-Object System.Drawing.Rectangle $destX, $destY, ($srcW * $scale), ($srcH * $scale)
  $src = New-Object System.Drawing.Rectangle $srcX, $srcY, $srcW, $srcH
  Draw-Checker $graphics $destX $destY ($srcW * $scale) ($srcH * $scale)
  $graphics.DrawImage($bitmap, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
  $bitmap.Dispose()
}

function Write-ComparisonPreview($root, $previewPath) {
  $resolvedPreviewPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($previewPath)
  New-Dir (Split-Path -Parent $resolvedPreviewPath)

  $canvas = New-Bitmap 1050 1500
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 246, 248, 250))
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

  Draw-Text $graphics "PMDO Sprite Reference Pass" 36 24 28 $true
  Draw-Text $graphics "Bulbasaur source frames beside generated Dubwool idle, sleep, and full direction atlas." 38 68 15 $false

  $bulbIdle = Join-Path $root "Sprite\0001\Idle-Anim.png"
  $bulbSleep = Join-Path $root "Sprite\0001\Sleep-Anim.png"
  $dubIdle = Join-Path $root "Sprite\0832\Idle-Anim.png"
  $dubSleep = Join-Path $root "Sprite\0832\Sleep-Anim.png"

  Draw-Text $graphics "Bulbasaur Idle: PMDO source, first row" 42 126 18 $true
  Draw-SheetRegion $graphics $bulbIdle 0 0 96 40 42 166 5
  Draw-Text $graphics "Bulbasaur Sleep: PMDO source" 42 400 18 $true
  Draw-SheetRegion $graphics $bulbSleep 0 0 48 24 42 440 7

  Draw-Text $graphics "Dubwool Idle: generated first row" 42 650 18 $true
  Draw-SheetRegion $graphics $dubIdle 0 0 120 40 42 690 5
  Draw-Text $graphics "Dubwool Sleep: generated" 42 930 18 $true
  Draw-SheetRegion $graphics $dubSleep 0 0 64 24 42 970 7

  Draw-Text $graphics "Dubwool Full Idle Atlas" 650 126 18 $true
  Draw-SheetRegion $graphics $dubIdle 0 0 120 320 650 166 3

  $graphics.Dispose()
  $canvas.Save($resolvedPreviewPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
  return $resolvedPreviewPath
}

$resolvedRoot = Resolve-Path $RawAssetDir
if ($ExportBulbasaur) {
  $zip = Export-Bulbasaur $resolvedRoot
  Write-Output "Bulbasaur export: $zip"
}

$dubwoolDir = Write-Dubwool-Files $resolvedRoot $SpeciesId $SpeciesName
Write-Output "$SpeciesName sprite sheets: $dubwoolDir"

if ($WritePreview) {
  $preview = Write-ComparisonPreview $resolvedRoot $PreviewPath
  Write-Output "Preview: $preview"
}
