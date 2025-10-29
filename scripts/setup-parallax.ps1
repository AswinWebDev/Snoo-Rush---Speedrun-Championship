$ErrorActionPreference = 'Stop'

# Resolve repo root from script location
$repo = Split-Path -Parent $PSScriptRoot
$public = Join-Path $repo 'src\client\public'
$assetsOut = Join-Path $public 'assets'
$bgForest = Join-Path $assetsOut 'bg\forest'

# Create directories
New-Item -ItemType Directory -Force -Path $bgForest | Out-Null

# Placeholders for Boot/Preloader
$assetsRoot = Join-Path $repo 'assets'
Copy-Item (Join-Path $assetsRoot 'default-splash.png') (Join-Path $assetsOut 'bg.png') -Force
Copy-Item (Join-Path $assetsRoot 'default-icon.png') (Join-Path $assetsOut 'logo.png') -Force

# Download CC0 forest parallax pack
$zipUrl = 'https://opengameart.org/sites/default/files/parallax_background_forest.zip'
$zipPath = Join-Path $env:TEMP 'parallax_background_forest.zip'
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

# Extract
$extract = Join-Path $env:TEMP 'parallax_forest_extracted'
if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
Expand-Archive -Force -LiteralPath $zipPath -DestinationPath $extract

# Map likely layers to expected filenames
$sky = Get-ChildItem -Recurse $extract -Include *sky*.png, *cloud*.png -File | Sort-Object Length -Descending | Select-Object -First 1
$far = Get-ChildItem -Recurse $extract -Include *mountain*.png, *far*.png -File | Sort-Object Length -Descending | Select-Object -First 1
$mid = Get-ChildItem -Recurse $extract -Include *tree*.png, *forest*.png, *mid*.png -File | Sort-Object Length -Descending | Select-Object -First 1
$near = Get-ChildItem -Recurse $extract -Include *rock*.png, *foreground*.png, *near*.png -File | Sort-Object Length -Descending | Select-Object -First 1

if ($sky)  { Copy-Item $sky.FullName  (Join-Path $bgForest 'forest_sky.png')  -Force } else { Write-Warning 'No sky layer found' }
if ($far)  { Copy-Item $far.FullName  (Join-Path $bgForest 'forest_far.png')  -Force } else { Write-Warning 'No far layer found' }
if ($mid)  { Copy-Item $mid.FullName  (Join-Path $bgForest 'forest_mid.png')  -Force } else { Write-Warning 'No mid layer found' }
if ($near) { Copy-Item $near.FullName (Join-Path $bgForest 'forest_near.png') -Force } else { Write-Warning 'No near layer found' }

Write-Host 'Mapped files:'
Get-ChildItem $bgForest -File | Format-Table Name, Length -AutoSize

Write-Host "Done. Assets copied to: $bgForest"
