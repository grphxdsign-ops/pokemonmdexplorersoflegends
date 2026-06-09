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

function Draw-Dubwool-Frame($graphics, $originX, $originY, $frameWidth, $frameHeight, $pose, $frameIndex) {
  $black = [System.Drawing.Color]::FromArgb(255, 33, 37, 43)
  $woolDark = [System.Drawing.Color]::FromArgb(255, 204, 211, 214)
  $wool = [System.Drawing.Color]::FromArgb(255, 239, 244, 241)
  $woolLight = [System.Drawing.Color]::FromArgb(255, 255, 255, 249)
  $skin = [System.Drawing.Color]::FromArgb(255, 68, 70, 73)
  $horn = [System.Drawing.Color]::FromArgb(255, 111, 91, 64)
  $red = [System.Drawing.Color]::FromArgb(255, 190, 47, 55)
  $blue = [System.Drawing.Color]::FromArgb(255, 70, 105, 162)

  if ($pose -eq "Sleep") {
    $bob = if (($frameIndex % 2) -eq 0) { 0 } else { 1 }
    $x = $originX + 2
    $y = $originY + 5 + $bob
    Fill-Rect $graphics ($x + 4) ($y + 2) 14 9 $black
    Fill-Rect $graphics ($x + 5) ($y + 1) 12 9 $woolDark
    Fill-Rect $graphics ($x + 6) ($y + 2) 10 7 $wool
    Fill-Rect $graphics ($x + 2) ($y + 5) 18 8 $wool
    Fill-Rect $graphics ($x + 4) ($y + 13) 13 3 $woolDark
    Fill-Rect $graphics ($x + 15) ($y + 6) 4 4 $skin
    Fill-Rect $graphics ($x + 16) ($y + 7) 2 1 $black
    Fill-Rect $graphics ($x + 5) ($y + 15) 3 2 $black
    Fill-Rect $graphics ($x + 13) ($y + 15) 3 2 $black
    return
  }

  $bob = @(0, -1, 0)[$frameIndex % 3]
  $x = $originX + 4
  $y = $originY + 6 + $bob

  Fill-Rect $graphics ($x + 5) ($y + 25) 4 5 $black
  Fill-Rect $graphics ($x + 20) ($y + 25) 4 5 $black
  Fill-Rect $graphics ($x + 3) ($y + 9) 24 18 $black
  Fill-Rect $graphics ($x + 4) ($y + 8) 22 18 $woolDark
  Fill-Rect $graphics ($x + 5) ($y + 9) 20 15 $wool
  Fill-Rect $graphics ($x + 7) ($y + 7) 16 5 $woolLight
  Fill-Rect $graphics ($x + 0) ($y + 15) 5 8 $wool
  Fill-Rect $graphics ($x + 25) ($y + 15) 5 8 $wool
  Fill-Rect $graphics ($x + 10) ($y + 2) 10 9 $skin
  Fill-Rect $graphics ($x + 9) ($y + 3) 12 7 $skin
  Fill-Rect $graphics ($x + 8) ($y + 1) 4 3 $horn
  Fill-Rect $graphics ($x + 18) ($y + 1) 4 3 $horn
  Fill-Rect $graphics ($x + 10) ($y + 5) 3 2 $woolLight
  Fill-Rect $graphics ($x + 17) ($y + 5) 3 2 $woolLight
  Fill-Rect $graphics ($x + 11) ($y + 6) 2 2 $black
  Fill-Rect $graphics ($x + 18) ($y + 6) 2 2 $black
  Fill-Rect $graphics ($x + 14) ($y + 8) 3 2 $red
  Fill-Rect $graphics ($x + 6) ($y + 13) 4 3 $red
  Fill-Rect $graphics ($x + 20) ($y + 13) 4 3 $blue
  Fill-Rect $graphics ($x + 5) ($y + 29) 5 2 $woolDark
  Fill-Rect $graphics ($x + 19) ($y + 29) 5 2 $woolDark
}

function New-Dubwool-AnimSheet($path, $pose, $frameWidth, $frameHeight, $frameCount) {
  $bitmap = New-Bitmap ($frameWidth * $frameCount) $frameHeight
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  for ($i = 0; $i -lt $frameCount; $i++) {
    Draw-Dubwool-Frame $graphics ($i * $frameWidth) 0 $frameWidth $frameHeight $pose $i
  }
  $graphics.Dispose()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function New-ShadowSheet($path, $frameWidth, $frameHeight, $frameCount) {
  $bitmap = New-Bitmap ($frameWidth * $frameCount) $frameHeight
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $shadow = [System.Drawing.Color]::FromArgb(96, 0, 0, 0)
  for ($i = 0; $i -lt $frameCount; $i++) {
    Fill-Rect $graphics (($i * $frameWidth) + [math]::Floor($frameWidth / 2) - 9) ($frameHeight - 7) 18 4 $shadow
  }
  $graphics.Dispose()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function New-OffsetSheet($path, $frameCount) {
  $bitmap = New-Bitmap $frameCount 1
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function Write-Dubwool-Files($root, $speciesId, $speciesName) {
  $spriteDir = Join-Path $root "Sprite\$speciesId"
  New-Dir $spriteDir

  New-Dubwool-AnimSheet (Join-Path $spriteDir "Idle-Anim.png") "Idle" 40 40 3
  New-ShadowSheet (Join-Path $spriteDir "Idle-Shadow.png") 40 40 3
  New-OffsetSheet (Join-Path $spriteDir "Idle-Offsets.png") 3

  New-Dubwool-AnimSheet (Join-Path $spriteDir "Sleep-Anim.png") "Sleep" 32 24 2
  New-ShadowSheet (Join-Path $spriteDir "Sleep-Shadow.png") 32 24 2
  New-OffsetSheet (Join-Path $spriteDir "Sleep-Offsets.png") 2

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
Generated local placeholder sprites for $speciesName.
These files are intended to occupy the PMDO RawAsset sheet format until a hand-authored sheet is available.
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
