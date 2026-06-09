param(
  [string]$RawAssetDir = "pmdo\_downloads\RawAsset",
  [string]$SpeciesId = "0832",
  [string]$SpeciesName = "Dubwool",
  [switch]$ExportBulbasaur
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

function Draw-Dubwool-Frame($graphics, $originX, $originY, $frameWidth, $frameHeight, $pose, $frameIndex, $directionIndex) {
  $black = [System.Drawing.Color]::FromArgb(255, 33, 37, 43)
  $nearBlack = [System.Drawing.Color]::FromArgb(255, 21, 25, 31)
  $woolDark = [System.Drawing.Color]::FromArgb(255, 204, 211, 214)
  $wool = [System.Drawing.Color]::FromArgb(255, 239, 244, 241)
  $woolLight = [System.Drawing.Color]::FromArgb(255, 255, 255, 249)
  $skin = [System.Drawing.Color]::FromArgb(255, 68, 70, 73)
  $horn = [System.Drawing.Color]::FromArgb(255, 111, 91, 64)
  $red = [System.Drawing.Color]::FromArgb(255, 190, 47, 55)
  $blue = [System.Drawing.Color]::FromArgb(255, 70, 105, 162)

  if ($pose -eq "Sleep") {
    $bob = if (($frameIndex % 2) -eq 0) { 0 } else { 1 }
    $x = $originX + 3
    $y = $originY + 4 + $bob
    Fill-Rect $graphics ($x + 4) ($y + 2) 22 11 $black
    Fill-Rect $graphics ($x + 5) ($y + 1) 20 11 $woolDark
    Fill-Rect $graphics ($x + 6) ($y + 2) 18 9 $wool
    Fill-Rect $graphics ($x + 2) ($y + 7) 26 8 $wool
    Fill-Rect $graphics ($x + 5) ($y + 15) 19 3 $woolDark
    Fill-Rect $graphics ($x + 21) ($y + 8) 5 5 $skin
    Fill-Rect $graphics ($x + 22) ($y + 9) 2 2 $nearBlack
    Fill-Rect $graphics ($x + 6) ($y + 17) 4 2 $nearBlack
    Fill-Rect $graphics ($x + 19) ($y + 17) 4 2 $nearBlack
    return
  }

  $bob = @(0, -1, 0)[$frameIndex % 3]
  $x = $originX + 3
  $y = $originY + 6 + $bob
  $facingFront = $directionIndex -in @(0, 1, 7)
  $facingBack = $directionIndex -in @(3, 4, 5)
  $facingLeft = $directionIndex -in @(5, 6, 7)
  $facingRight = $directionIndex -in @(1, 2, 3)
  $sideShift = if ($facingLeft) { -2 } elseif ($facingRight) { 2 } else { 0 }
  $headX = $x + 11 + $sideShift
  $headY = $y + 2

  Fill-Rect $graphics ($x + 6) ($y + 27) 5 6 $nearBlack
  Fill-Rect $graphics ($x + 23) ($y + 27) 5 6 $nearBlack
  Fill-Rect $graphics ($x + 4) ($y + 11) 29 18 $black
  Fill-Rect $graphics ($x + 5) ($y + 10) 27 18 $woolDark
  Fill-Rect $graphics ($x + 6) ($y + 11) 25 15 $wool
  Fill-Rect $graphics ($x + 8) ($y + 8) 20 5 $woolLight
  Fill-Rect $graphics ($x + 1) ($y + 16) 6 9 $wool
  Fill-Rect $graphics ($x + 31) ($y + 16) 6 9 $wool
  Fill-Rect $graphics ($x + 7) ($y + 29) 6 2 $woolDark
  Fill-Rect $graphics ($x + 22) ($y + 29) 6 2 $woolDark

  if ($facingBack) {
    Fill-Rect $graphics ($headX - 2) ($headY + 2) 14 8 $nearBlack
    Fill-Rect $graphics ($headX - 4) ($headY + 0) 4 4 $horn
    Fill-Rect $graphics ($headX + 10) ($headY + 0) 4 4 $horn
    Fill-Rect $graphics ($x + 10) ($y + 15) 5 4 $blue
    Fill-Rect $graphics ($x + 22) ($y + 15) 5 4 $red
    return
  }

  Fill-Rect $graphics ($headX - 1) ($headY + 1) 14 11 $nearBlack
  Fill-Rect $graphics ($headX + 0) ($headY + 0) 12 10 $skin
  Fill-Rect $graphics ($headX - 4) ($headY - 1) 5 4 $horn
  Fill-Rect $graphics ($headX + 11) ($headY - 1) 5 4 $horn
  Fill-Rect $graphics ($headX - 5) ($headY + 1) 4 3 $horn
  Fill-Rect $graphics ($headX + 13) ($headY + 1) 4 3 $horn
  Fill-Rect $graphics ($headX + 2) ($headY + 4) 3 2 $woolLight
  Fill-Rect $graphics ($headX + 8) ($headY + 4) 3 2 $woolLight
  Fill-Rect $graphics ($headX + 3) ($headY + 5) 2 2 $nearBlack
  Fill-Rect $graphics ($headX + 9) ($headY + 5) 2 2 $nearBlack
  Fill-Rect $graphics ($headX + 5) ($headY + 8) 3 2 $red

  if ($facingLeft) {
    Fill-Rect $graphics ($x + 5) ($y + 15) 4 4 $blue
    Fill-Rect $graphics ($x + 21) ($y + 15) 5 4 $red
  }
  elseif ($facingRight) {
    Fill-Rect $graphics ($x + 9) ($y + 15) 5 4 $red
    Fill-Rect $graphics ($x + 27) ($y + 15) 4 4 $blue
  }
  else {
    Fill-Rect $graphics ($x + 8) ($y + 15) 5 4 $red
    Fill-Rect $graphics ($x + 25) ($y + 15) 5 4 $blue
  }
}

function New-Dubwool-AnimSheet($path, $pose, $frameWidth, $frameHeight, $frameCount, $directionCount) {
  $bitmap = New-Bitmap ($frameWidth * $frameCount) ($frameHeight * $directionCount)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
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
Design reference: Dubwool is a white Normal-type sheep based on Jacob sheep traits, with black-and-white coloring, four horns, and red/blue body markings.
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

$resolvedRoot = Resolve-Path $RawAssetDir
if ($ExportBulbasaur) {
  $zip = Export-Bulbasaur $resolvedRoot
  Write-Output "Bulbasaur export: $zip"
}

$dubwoolDir = Write-Dubwool-Files $resolvedRoot $SpeciesId $SpeciesName
Write-Output "$SpeciesName sprite sheets: $dubwoolDir"
