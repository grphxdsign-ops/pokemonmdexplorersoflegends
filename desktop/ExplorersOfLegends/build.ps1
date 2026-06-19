$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceDir = Join-Path $root 'Source'
$buildDir = Join-Path $root 'build'
$exe = Join-Path $buildDir 'ExplorersOfLegends.exe'
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'

if (!(Test-Path $csc)) {
  $csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe'
}

if (!(Test-Path $csc)) {
  throw 'Could not find the Windows C# compiler.'
}

New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

$sources = Get-ChildItem -Path $sourceDir -Filter '*.cs' | Sort-Object Name | ForEach-Object { $_.FullName }

& $csc `
  /nologo `
  /target:winexe `
  /platform:anycpu `
  /optimize+ `
  /out:$exe `
  /reference:System.dll `
  /reference:System.Core.dll `
  /reference:System.Drawing.dll `
  /reference:System.Windows.Forms.dll `
  $sources

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "Built $exe"
