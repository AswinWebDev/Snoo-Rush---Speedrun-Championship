$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$bgRoot = Join-Path $repo 'src\client\public\assets\bg'

Write-Host "Organizing all parallax backgrounds..." -ForegroundColor Cyan

# Create theme directories
$themes = @('cave', 'sky', 'desert', 'ice', 'lava', 'space')
foreach ($theme in $themes) {
    $dir = Join-Path $bgRoot $theme
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Cave (from Seamless Parallax Cave Background/)
$caveSrc = Join-Path $bgRoot 'Seamless Parallax Cave Background'
Copy-Item (Join-Path $caveSrc 'Cave Back.png') (Join-Path $bgRoot 'cave\cave_far.png') -Force
Copy-Item (Join-Path $caveSrc 'Cave Mid.png') (Join-Path $bgRoot 'cave\cave_mid.png') -Force
Copy-Item (Join-Path $caveSrc 'Cave Front.png') (Join-Path $bgRoot 'cave\cave_near.png') -Force
Write-Host "✓ Cave organized" -ForegroundColor Green

# Sky (from Background_Clouds_And_Mountains_Parallax_/Layers/)
$skySrc = Join-Path $bgRoot 'Background_Clouds_And_Mountains_Parallax_\Layers'
Copy-Item (Join-Path $skySrc 'Background01.png') (Join-Path $bgRoot 'sky\sky_far.png') -Force
Copy-Item (Join-Path $skySrc 'BackgroundMountain_01.png') (Join-Path $bgRoot 'sky\sky_mid.png') -Force
Copy-Item (Join-Path $skySrc 'Cloud01.png') (Join-Path $bgRoot 'sky\sky_near.png') -Force
Write-Host "✓ Sky organized" -ForegroundColor Green

# Desert (from desert_parts/)
$desertSrc = Join-Path $bgRoot 'desert_parts'
Copy-Item (Join-Path $desertSrc 'desert_0005_Background.png') (Join-Path $bgRoot 'desert\desert_far.png') -Force
Copy-Item (Join-Path $desertSrc 'desert_0003_Layer-4.png') (Join-Path $bgRoot 'desert\desert_mid.png') -Force
Copy-Item (Join-Path $desertSrc 'desert_0001_Layer-2.png') (Join-Path $bgRoot 'desert\desert_near.png') -Force
Write-Host "✓ Desert organized" -ForegroundColor Green

# Lava/Volcano (from PNG/bg_volcano_layers/)
$lavaSrc = Join-Path $bgRoot 'PNG\bg_volcano_layers'
Copy-Item (Join-Path $lavaSrc 'bg_volcano_1.png') (Join-Path $bgRoot 'lava\lava_far.png') -Force
Copy-Item (Join-Path $lavaSrc 'bg_volcano_3.png') (Join-Path $bgRoot 'lava\lava_mid.png') -Force
Copy-Item (Join-Path $lavaSrc 'bg_volcano_5.png') (Join-Path $bgRoot 'lava\lava_near.png') -Force
Write-Host "✓ Lava organized" -ForegroundColor Green

# Ice (from mountain backgrounds + fog/clouds)
Copy-Item (Join-Path $bgRoot 'smallMountain.png') (Join-Path $bgRoot 'ice\ice_far.png') -Force
Copy-Item (Join-Path $bgRoot 'clouds_1.png') (Join-Path $bgRoot 'ice\ice_mid.png') -Force
Copy-Item (Join-Path $bgRoot 'fog.png') (Join-Path $bgRoot 'ice\ice_near.png') -Force
Write-Host "✓ Ice organized" -ForegroundColor Green

# Space (from bkgd_*.png files)
Copy-Item (Join-Path $bgRoot 'bkgd_0.png') (Join-Path $bgRoot 'space\space_far.png') -Force
Copy-Item (Join-Path $bgRoot 'bkgd_4.png') (Join-Path $bgRoot 'space\space_mid.png') -Force
Copy-Item (Join-Path $bgRoot 'bkgd_7.png') (Join-Path $bgRoot 'space\space_near.png') -Force
Write-Host "✓ Space organized" -ForegroundColor Green

Write-Host "`nAll parallax backgrounds organized successfully!" -ForegroundColor Cyan
Write-Host "Theme folders created in: src/client/public/assets/bg/" -ForegroundColor Yellow
Get-ChildItem (Join-Path $bgRoot '*\*.png') | Group-Object Directory | Select-Object @{Name='Theme';Expression={Split-Path $_.Name -Leaf}}, Count | Format-Table -AutoSize
