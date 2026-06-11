param(
  [string]$RawAssetDir = "pmdo\_downloads\RawAsset",
  [string]$SpeciesId = "0832",
  [string]$SpeciesName = "Dubwool",
  [switch]$ExportBulbasaur,
  [switch]$WritePreview,
  [string]$PreviewPath = "docs\assets\previews\bulbasaur-dubwool-idle-sleep.png",
  [string]$GeneratedDubwoolReferencePath = "tools\sprites\references\dubwool-generated-reference.png",
  [string]$TemplateSpeciesId = "0001",
  [string]$AnimationReportPath = "docs\assets\previews\dubwool-animation-file-report.md",
  [string]$AnimationContactSheetPath = "docs\assets\previews\dubwool-animation-contact-sheet.png"
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

function New-Dubwool-AnimSheet($path, $pose, $frameWidth, $frameHeight, $frameCount, $directionCount, $sourceFrameWidth, $sourceFrameHeight, $maxDrawWidth, $maxDrawHeight) {
  $bitmap = New-Bitmap ($frameWidth * $frameCount) ($frameHeight * $directionCount)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  for ($dir = 0; $dir -lt $directionCount; $dir++) {
    for ($i = 0; $i -lt $frameCount; $i++) {
      $sourceFrame = New-Bitmap $sourceFrameWidth $sourceFrameHeight
      $sourceGraphics = [System.Drawing.Graphics]::FromImage($sourceFrame)
      $sourceGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
      $sourceGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
      $sourceGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
      Draw-Dubwool-Frame $sourceGraphics 0 0 $sourceFrameWidth $sourceFrameHeight $pose $i $dir
      $sourceGraphics.Dispose()

      $scale = [math]::Min($maxDrawWidth / $sourceFrameWidth, $maxDrawHeight / $sourceFrameHeight)
      $drawW = [math]::Max(1, [int][math]::Floor($sourceFrameWidth * $scale))
      $drawH = [math]::Max(1, [int][math]::Floor($sourceFrameHeight * $scale))
      $drawX = ($i * $frameWidth) + [int][math]::Floor(($frameWidth - $drawW) / 2)
      $drawY = ($dir * $frameHeight) + $frameHeight - $drawH - $(if ($pose -eq "Sleep") { 1 } else { 3 })
      $dest = New-Object System.Drawing.Rectangle $drawX, $drawY, $drawW, $drawH
      $graphics.DrawImage($sourceFrame, $dest, 0, 0, $sourceFrameWidth, $sourceFrameHeight, [System.Drawing.GraphicsUnit]::Pixel)
      $sourceFrame.Dispose()
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
      $shadowWidth = [math]::Max(16, [int][math]::Round($frameWidth * 0.45))
      $shadowHeight = [math]::Max(3, [int][math]::Round($frameHeight * 0.04))
      Fill-Rect $graphics (($i * $frameWidth) + [math]::Floor($frameWidth / 2) - [math]::Floor($shadowWidth / 2)) (($dir * $frameHeight) + $frameHeight - [math]::Max(8, [int][math]::Round($frameHeight * 0.09))) $shadowWidth $shadowHeight $shadow
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

function Test-BackgroundPixel($color) {
  if ($color.A -eq 0) { return $true }
  $max = [math]::Max($color.R, [math]::Max($color.G, $color.B))
  $min = [math]::Min($color.R, [math]::Min($color.G, $color.B))
  $brightness = ($color.R + $color.G + $color.B) / 3.0
  $saturation = if ($max -le 0) { 0 } else { ($max - $min) / [double]$max }
  return (($brightness -ge 185 -and $saturation -le 0.12) -or ($brightness -ge 214 -and $saturation -le 0.25) -or ($min -ge 235))
}

function Clear-ConnectedBackground($bitmap) {
  $width = $bitmap.Width
  $height = $bitmap.Height
  $visited = New-Object bool[] ($width * $height)
  $queue = New-Object 'System.Collections.Generic.Queue[int]'

  function Add-BackgroundPoint($x, $y) {
    if ($x -lt 0 -or $y -lt 0 -or $x -ge $width -or $y -ge $height) { return }
    $index = ($y * $width) + $x
    if ($visited[$index]) { return }
    if (-not (Test-BackgroundPixel $bitmap.GetPixel($x, $y))) { return }
    $visited[$index] = $true
    $queue.Enqueue($index)
  }

  for ($x = 0; $x -lt $width; $x++) {
    Add-BackgroundPoint $x 0
    Add-BackgroundPoint $x ($height - 1)
  }
  for ($y = 0; $y -lt $height; $y++) {
    Add-BackgroundPoint 0 $y
    Add-BackgroundPoint ($width - 1) $y
  }

  while ($queue.Count -gt 0) {
    $index = $queue.Dequeue()
    $x = $index % $width
    $y = [int][math]::Floor($index / $width)
    Add-BackgroundPoint ($x + 1) $y
    Add-BackgroundPoint ($x - 1) $y
    Add-BackgroundPoint $x ($y + 1)
    Add-BackgroundPoint $x ($y - 1)
  }

  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      if ($visited[($y * $width) + $x]) {
        $bitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
      }
    }
  }
}

function Get-OpaqueBounds($bitmap) {
  $minX = $bitmap.Width
  $minY = $bitmap.Height
  $maxX = -1
  $maxY = -1
  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      if ($bitmap.GetPixel($x, $y).A -le 0) { continue }
      if ($x -lt $minX) { $minX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
  if ($maxX -lt 0 -or $maxY -lt 0) {
    return [System.Drawing.Rectangle]::Empty
  }
  return [System.Drawing.Rectangle]::FromLTRB($minX, $minY, ($maxX + 1), ($maxY + 1))
}

function Get-DubwoolReferenceCellRect($source, $col, $row) {
  $x0 = [int][math]::Floor($source.Width * $col / 4.0)
  $x1 = [int][math]::Floor($source.Width * ($col + 1) / 4.0)
  $y0 = [int][math]::Floor($source.Height * $row / 3.0)
  $y1 = [int][math]::Floor($source.Height * ($row + 1) / 3.0)
  return New-Object System.Drawing.Rectangle $x0, $y0, ($x1 - $x0), ($y1 - $y0)
}

function Get-DubwoolReferencePose($source, $col, $row) {
  $cell = Get-DubwoolReferenceCellRect $source $col $row
  $bitmap = New-Bitmap $cell.Width $cell.Height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.DrawImage($source, (New-Object System.Drawing.Rectangle 0, 0, $cell.Width, $cell.Height), $cell, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()

  Clear-ConnectedBackground $bitmap
  $bounds = Get-OpaqueBounds $bitmap
  if ($bounds.Width -le 0 -or $bounds.Height -le 0) {
    return $bitmap
  }

  $pad = 6
  $x = [math]::Max(0, $bounds.X - $pad)
  $y = [math]::Max(0, $bounds.Y - $pad)
  $right = [math]::Min($bitmap.Width, $bounds.Right + $pad)
  $bottom = [math]::Min($bitmap.Height, $bounds.Bottom + $pad)
  $cropRect = [System.Drawing.Rectangle]::FromLTRB($x, $y, $right, $bottom)
  $cropped = New-Bitmap $cropRect.Width $cropRect.Height
  $cropGraphics = [System.Drawing.Graphics]::FromImage($cropped)
  $cropGraphics.DrawImage($bitmap, (New-Object System.Drawing.Rectangle 0, 0, $cropRect.Width, $cropRect.Height), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
  $cropGraphics.Dispose()
  $bitmap.Dispose()
  return $cropped
}

function New-DubwoolPoseCache($referencePath) {
  $resolvedReferencePath = Resolve-Path $referencePath
  $source = [System.Drawing.Bitmap]::FromFile($resolvedReferencePath)
  $cache = @{}
  for ($row = 0; $row -lt 3; $row++) {
    for ($col = 0; $col -lt 4; $col++) {
      $cache["$col,$row"] = Get-DubwoolReferencePose $source $col $row
    }
  }
  $source.Dispose()
  return $cache
}

function Get-PoseFromCache($poseCache, $col, $row) {
  return $poseCache["$col,$row"]
}

function Get-DubwoolIdleCell($directionIndex) {
  $cells = @(
    @(0, 0),
    @(1, 0),
    @(3, 1),
    @(2, 1),
    @(1, 2),
    @(0, 2),
    @(0, 1),
    @(2, 0)
  )
  return $cells[$directionIndex]
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

function Get-GeneratedFrameSize($animationName) {
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

function Get-MaxDrawSize($animationName, $frameWidth, $frameHeight) {
  $maxW = [math]::Max(32, $frameWidth - 18)
  $maxH = [math]::Max(32, $frameHeight - 18)
  if ($animationName -in @("Sleep", "EventSleep", "Laying", "Trip", "Faint", "Tumble", "TumbleBack", "HitGround")) {
    $maxH = [math]::Max(32, $frameHeight - 22)
  }
  return New-Object System.Drawing.Size $maxW, $maxH
}

function Get-AnimationMotion($animationName, $frameIndex, $frameCount, $directionIndex) {
  $vector = Get-DirectionVector $directionIndex
  $dx = $vector[0]
  $dy = $vector[1]
  $x = 0
  $y = 0
  $scale = 1.0

  switch ($animationName) {
    "Idle" { $y = @(0, -3, 0)[$frameIndex % 3] }
    "Walk" { $y = @(0, -6, -2, 0, -6, -2)[$frameIndex % 6]; $x = $dx * @(0, 4, 7, 4, 0, -3)[$frameIndex % 6] }
    "Attack" { $lunge = @(0, 12, 26, 38, 30, 18, 8, 0, -4, 0, 0)[$frameIndex % 11]; $x = $dx * $lunge; $y = $dy * $lunge }
    "Charge" { $lunge = @(0, 8, 16, 26, 36, 30, 22, 14, 6, 0)[$frameIndex % 10]; $x = $dx * $lunge; $y = $dy * $lunge }
    "Shoot" { $lunge = @(0, 10, 20, 10, -8, 0)[$frameIndex % 6]; $x = $dx * $lunge; $y = $dy * $lunge }
    "Swing" { $lunge = @(0, 12, 24, 34, 26, 10, -8, -4, 0)[$frameIndex % 9]; $x = $dx * $lunge; $y = $dy * $lunge }
    "Double" { $lunge = @(0, 10, 22, 8, 0, -8, 0, 12, 26, 10, 0, -8, 0, 8, 0, 0)[$frameIndex % 16]; $x = $dx * $lunge; $y = $dy * $lunge }
    "Hop" {
      $t = if ($frameCount -le 1) { 0 } else { $frameIndex / [double]($frameCount - 1) }
      $y = -[int][math]::Round([math]::Sin($t * [math]::PI) * 92)
    }
    "LeapForth" {
      $t = if ($frameCount -le 1) { 0 } else { $frameIndex / [double]($frameCount - 1) }
      $y = -[int][math]::Round([math]::Sin($t * [math]::PI) * 86)
      $x = $dx * [int][math]::Round($t * 34)
    }
    "Shake" { $x = @(-8, 8, -8, 8, -4, 4)[$frameIndex % 6] }
    "Hurt" { $x = @(-12, 8)[$frameIndex % 2]; $y = 4 }
    "Pain" { $x = @(-10, 10, -8, 8, -6, 6, -4, 4, -3, 3, 0, 0)[$frameIndex % 12]; $y = 5 }
    "DeepBreath" { $scale = @(1.0, 1.02, 1.05, 1.08, 1.05, 1.02, 1.0, .98, 1.0)[$frameIndex % 9] }
    "Nod" { $y = @(0, 8, 0)[$frameIndex % 3] }
    "Float" { $y = @(0, -8, -12, -6)[$frameIndex % 4] }
    "Pose" { $y = @(0, -10, -16, -8, 0)[$frameIndex % 5]; $scale = @(1.0, 1.03, 1.06, 1.03, 1.0)[$frameIndex % 5] }
    "Pull" { $x = -$dx * @(0, 8, 14, 18, 14, 8, 0)[$frameIndex % 7]; $y = -$dy * @(0, 8, 14, 18, 14, 8, 0)[$frameIndex % 7] }
    "Wake" { $y = @(22, 14, 8, 2, -4, 0)[$frameIndex % 6] }
    "Eat" { $y = @(0, 5, 0, 5)[$frameIndex % 4] }
    "Tumble" { $x = @(0, 10, 18, 12, 0, -10, -18, -8)[$frameIndex % 8]; $y = @(4, 8, 12, 8, 4, 8, 12, 8)[$frameIndex % 8]; $scale = .92 }
    "TumbleBack" { $x = @(0, -8, -18, -12, 0, 10, 18, 12, 4, 0)[$frameIndex % 10]; $y = @(4, 8, 12, 8, 4, 8, 12, 8, 5, 4)[$frameIndex % 10]; $scale = .92 }
    "Sink" { $y = $frameIndex * 12; $scale = [math]::Max(.45, 1.0 - ($frameIndex * .045)) }
    "Trip" { $y = 16; $x = @(0, 8, 16, 8, 0)[$frameIndex % 5] }
    "Faint" { $y = @(0, 10, 22, 22)[$frameIndex % 4]; $scale = @(1.0, .96, .9, .9)[$frameIndex % 4] }
    "Cringe" { $x = @(-8, 6)[$frameIndex % 2]; $scale = .94 }
    "LostBalance" { $x = @(-12, 12)[$frameIndex % 2]; $y = 8 }
    "HitGround" { $y = @(20, 14, 8, 4, 8, 4, 2, 0)[$frameIndex % 8]; $scale = .9 }
  }

  return [pscustomobject]@{ X = $x; Y = $y; Scale = $scale }
}

function Get-AnimationPoseCell($animationName, $directionIndex, $frameIndex, $frameCount) {
  if ($animationName -in @("Sleep", "EventSleep", "Laying")) {
    return @(@(2, 2), @(3, 2))[$frameIndex % 2]
  }
  if ($animationName -in @("Trip", "Faint", "Tumble", "TumbleBack", "HitGround")) {
    return @(@(2, 2), @(3, 2))[$frameIndex % 2]
  }
  if ($animationName -eq "Wake" -and $frameIndex -lt 2) {
    return @(@(2, 2), @(3, 2))[$frameIndex % 2]
  }
  if ($animationName -eq "Rotate") {
    return Get-DubwoolIdleCell ($frameIndex % 8)
  }
  if ($animationName -in @("Eat", "DeepBreath", "Sit", "LookUp", "Cringe", "LostBalance")) {
    return @(0, 0)
  }
  return Get-DubwoolIdleCell ($directionIndex % 8)
}

function Draw-ReferencePoseIntoFrame($graphics, $pose, $frameX, $frameY, $frameWidth, $frameHeight, $maxDrawWidth, $maxDrawHeight, $verticalOffset, $horizontalOffset, $scaleMultiplier) {
  $scale = [math]::Min($maxDrawWidth / $pose.Width, $maxDrawHeight / $pose.Height)
  $scale = $scale * $scaleMultiplier
  $drawW = [math]::Max(1, [int][math]::Round($pose.Width * $scale))
  $drawH = [math]::Max(1, [int][math]::Round($pose.Height * $scale))
  $drawX = $frameX + [int][math]::Floor(($frameWidth - $drawW) / 2) + $horizontalOffset
  $drawY = $frameY + $frameHeight - $drawH - 8 + $verticalOffset
  $dest = New-Object System.Drawing.Rectangle $drawX, $drawY, $drawW, $drawH

  $state = $graphics.Save()
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  $graphics.DrawImage($pose, $dest, 0, 0, $pose.Width, $pose.Height, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Restore($state)
}

function New-Dubwool-ReferenceAnimSheet($path, $poseCache, $animationName, $frameWidth, $frameHeight, $frameCount, $directionCount) {
  $bitmap = New-Bitmap ($frameWidth * $frameCount) ($frameHeight * $directionCount)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $maxDraw = Get-MaxDrawSize $animationName $frameWidth $frameHeight

  for ($dir = 0; $dir -lt $directionCount; $dir++) {
    for ($i = 0; $i -lt $frameCount; $i++) {
      $cell = Get-AnimationPoseCell $animationName $dir $i $frameCount
      $motion = Get-AnimationMotion $animationName $i $frameCount $dir
      $pose = Get-PoseFromCache $poseCache $cell[0] $cell[1]
      Draw-ReferencePoseIntoFrame $graphics $pose ($i * $frameWidth) ($dir * $frameHeight) $frameWidth $frameHeight $maxDraw.Width $maxDraw.Height $motion.Y $motion.X $motion.Scale
    }
  }

  $graphics.Dispose()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
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
      SourceFrameWidth = $sourceFrameWidth
      SourceFrameHeight = $sourceFrameHeight
    })
  }

  return $animations
}

function Write-DubwoolAnimData($path, $animations, $frameSizeMap) {
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('<?xml version="1.0" ?>')
  $lines.Add('<AnimData>')
  $lines.Add("  <ShadowSize>1</ShadowSize>")
  $lines.Add("  <Anims>")

  foreach ($anim in $animations) {
    $lines.Add("    <Anim>")
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
      $lines.Add("      <Durations>")
      foreach ($duration in $anim.Durations) {
        $lines.Add("        <Duration>$duration</Duration>")
      }
      $lines.Add("      </Durations>")
    }
    $lines.Add("    </Anim>")
  }

  $lines.Add("  </Anims>")
  $lines.Add("</AnimData>")
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($path, (($lines -join "`n") + "`n"), $utf8NoBom)
}

function Write-DubwoolAnimationReport($path, $root, $speciesId, $animations, $frameSizeMap) {
  $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($path)
  New-Dir (Split-Path -Parent $resolvedPath)
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('# Dubwool Animation File Report')
  $lines.Add('')
  $lines.Add("- Generated on: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz'))")
  $lines.Add('- Template species: Bulbasaur (0001)')
  $lines.Add("- Target species: Dubwool ($speciesId)")
  $lines.Add('- Reference: tools/sprites/references/dubwool-generated-reference.png')
  $lines.Add('- CopyOf entries preserved without physical sheets, matching Bulbasaur behavior.')
  $lines.Add('')
  $lines.Add('| Animation | Frames | Directions | Frame size | Files |')
  $lines.Add('| --- | ---: | ---: | --- | --- |')

  $spriteDir = Join-Path $root "Sprite\$speciesId"
  foreach ($anim in $animations) {
    if ($anim.CopyOf) {
      $lines.Add("| $($anim.Name) | copy | copy | CopyOf $($anim.CopyOf) | AnimData only |")
      continue
    }
    $size = $frameSizeMap[$anim.Name]
    $files = @("$($anim.Name)-Anim.png", "$($anim.Name)-Offsets.png", "$($anim.Name)-Shadow.png")
    $missing = @()
    foreach ($file in $files) {
      if (-not (Test-Path -LiteralPath (Join-Path $spriteDir $file))) {
        $missing += $file
      }
    }
    $status = if ($missing.Count -eq 0) { "ok" } else { "missing: $($missing -join ', ')" }
    $lines.Add("| $($anim.Name) | $($anim.FrameCount) | $($anim.DirectionCount) | $($size.Width)x$($size.Height) | $status |")
  }

  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($resolvedPath, (($lines -join "`n") + "`n"), $utf8NoBom)
  return $resolvedPath
}

function Draw-CroppedFrame($graphics, $sheetPath, $frameWidth, $frameHeight, $destX, $destY, $boxSize) {
  $sheet = [System.Drawing.Bitmap]::FromFile($sheetPath)
  $frame = New-Bitmap $frameWidth $frameHeight
  $frameGraphics = [System.Drawing.Graphics]::FromImage($frame)
  $frameGraphics.DrawImage($sheet, (New-Object System.Drawing.Rectangle 0, 0, $frameWidth, $frameHeight), (New-Object System.Drawing.Rectangle 0, 0, $frameWidth, $frameHeight), [System.Drawing.GraphicsUnit]::Pixel)
  $frameGraphics.Dispose()
  $sheet.Dispose()

  $bounds = Get-OpaqueBounds $frame
  if ($bounds.Width -le 0 -or $bounds.Height -le 0) {
    $frame.Dispose()
    return
  }

  $scale = [math]::Min($boxSize / $bounds.Width, $boxSize / $bounds.Height)
  $drawW = [math]::Max(1, [int][math]::Round($bounds.Width * $scale))
  $drawH = [math]::Max(1, [int][math]::Round($bounds.Height * $scale))
  $dest = New-Object System.Drawing.Rectangle ($destX + [int][math]::Floor(($boxSize - $drawW) / 2)), ($destY + [int][math]::Floor(($boxSize - $drawH) / 2)), $drawW, $drawH
  $graphics.DrawImage($frame, $dest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
  $frame.Dispose()
}

function Write-DubwoolAnimationContactSheet($path, $root, $speciesId, $animations, $frameSizeMap) {
  $sheetAnims = @($animations | Where-Object { -not $_.CopyOf })
  $cols = 5
  $tileW = 210
  $tileH = 188
  $boxSize = 128
  $margin = 36
  $headerH = 90
  $rows = [math]::Max(1, [int][math]::Ceiling($sheetAnims.Count / $cols))
  $width = ($cols * $tileW) + ($margin * 2)
  $height = $headerH + ($rows * $tileH) + $margin
  $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($path)
  New-Dir (Split-Path -Parent $resolvedPath)

  $canvas = New-Bitmap $width $height
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 246, 248, 250))
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  Draw-Text $graphics "Dubwool Animation Coverage" $margin 24 24 $true
  Draw-Text $graphics "$($sheetAnims.Count) physical animations generated from the reference PNG." $margin 58 13 $false

  $spriteDir = Join-Path $root "Sprite\$speciesId"
  for ($i = 0; $i -lt $sheetAnims.Count; $i++) {
    $anim = $sheetAnims[$i]
    $col = $i % $cols
    $row = [int][math]::Floor($i / $cols)
    $x = $margin + ($col * $tileW)
    $y = $headerH + ($row * $tileH)
    Draw-Checker $graphics $x ($y + 10) $boxSize $boxSize
    $size = $frameSizeMap[$anim.Name]
    Draw-CroppedFrame $graphics (Join-Path $spriteDir "$($anim.Name)-Anim.png") $size.Width $size.Height $x ($y + 10) $boxSize
    Draw-Text $graphics $anim.Name $x ($y + 146) 11 $true
    Draw-Text $graphics ("{0}f x {1}dir" -f $anim.FrameCount, $anim.DirectionCount) $x ($y + 164) 9 $false
  }

  $graphics.Dispose()
  $canvas.Save($resolvedPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
  return $resolvedPath
}

function Write-Dubwool-Files($root, $speciesId, $speciesName, $referencePath, $templateSpeciesId, $reportPath, $contactSheetPath) {
  $spriteDir = Join-Path $root "Sprite\$speciesId"
  New-Dir $spriteDir

  $animations = Get-TemplateAnimations $root $templateSpeciesId
  $poseCache = New-DubwoolPoseCache $referencePath
  $frameSizeMap = @{}

  foreach ($anim in $animations) {
    if ($anim.CopyOf) { continue }
    $size = Get-GeneratedFrameSize $anim.Name
    $frameSizeMap[$anim.Name] = $size
    New-Dubwool-ReferenceAnimSheet (Join-Path $spriteDir "$($anim.Name)-Anim.png") $poseCache $anim.Name $size.Width $size.Height $anim.FrameCount $anim.DirectionCount
    New-ShadowSheet (Join-Path $spriteDir "$($anim.Name)-Shadow.png") $size.Width $size.Height $anim.FrameCount $anim.DirectionCount
    New-OffsetSheet (Join-Path $spriteDir "$($anim.Name)-Offsets.png") $size.Width $size.Height $anim.FrameCount $anim.DirectionCount
  }

  Write-DubwoolAnimData (Join-Path $spriteDir "AnimData.xml") $animations $frameSizeMap

  @"
Generated local PMDO-format sprites for $speciesName.
Design reference: tools/sprites/references/dubwool-generated-reference.png.
"@ | Set-Content -Encoding UTF8 (Join-Path $spriteDir "credits.txt")

  $report = Write-DubwoolAnimationReport $reportPath $root $speciesId $animations $frameSizeMap
  $contact = Write-DubwoolAnimationContactSheet $contactSheetPath $root $speciesId $animations $frameSizeMap

  foreach ($pose in $poseCache.Values) {
    $pose.Dispose()
  }

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
  $destW = [int][math]::Round($srcW * $scale)
  $destH = [int][math]::Round($srcH * $scale)
  $dest = New-Object System.Drawing.Rectangle $destX, $destY, $destW, $destH
  $src = New-Object System.Drawing.Rectangle $srcX, $srcY, $srcW, $srcH
  Draw-Checker $graphics $destX $destY $destW $destH
  $graphics.DrawImage($bitmap, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
  $bitmap.Dispose()
}

function Write-ComparisonPreview($root, $previewPath) {
  $resolvedPreviewPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($previewPath)
  New-Dir (Split-Path -Parent $resolvedPreviewPath)

  $canvas = New-Bitmap 1400 1800
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 246, 248, 250))
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

  Draw-Text $graphics "PMDO Sprite Reference Pass" 36 24 28 $true
  Draw-Text $graphics "Bulbasaur source frames beside image-derived Dubwool frames from the generated reference PNG." 38 68 15 $false

  $bulbIdle = Join-Path $root "Sprite\0001\Idle-Anim.png"
  $bulbSleep = Join-Path $root "Sprite\0001\Sleep-Anim.png"
  $dubIdle = Join-Path $root "Sprite\0832\Idle-Anim.png"
  $dubSleep = Join-Path $root "Sprite\0832\Sleep-Anim.png"

  Draw-Text $graphics "Bulbasaur Idle: PMDO source, first row" 42 126 18 $true
  Draw-SheetRegion $graphics $bulbIdle 0 0 96 40 42 166 5
  Draw-Text $graphics "Bulbasaur Sleep: PMDO source" 42 400 18 $true
  Draw-SheetRegion $graphics $bulbSleep 0 0 48 24 42 440 7

  Draw-Text $graphics "Dubwool Idle: image-derived first row" 42 650 18 $true
  Draw-SheetRegion $graphics $dubIdle 0 0 576 192 42 690 1
  Draw-Text $graphics "Dubwool Sleep: image-derived" 42 930 18 $true
  Draw-SheetRegion $graphics $dubSleep 0 0 384 128 42 970 1

  Draw-Text $graphics "Dubwool Full Idle Atlas" 650 126 18 $true
  Draw-SheetRegion $graphics $dubIdle 0 0 576 1536 650 166 0.5

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

$dubwoolDir = Write-Dubwool-Files $resolvedRoot $SpeciesId $SpeciesName $GeneratedDubwoolReferencePath $TemplateSpeciesId $AnimationReportPath $AnimationContactSheetPath
Write-Output "$SpeciesName sprite sheets: $dubwoolDir"

if ($WritePreview) {
  $preview = Write-ComparisonPreview $resolvedRoot $PreviewPath
  Write-Output "Preview: $preview"
}
