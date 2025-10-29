@echo off
cd /d "%~dp0.."
set BG=src\client\public\assets\bg

mkdir "%BG%\cave" 2>nul
mkdir "%BG%\sky" 2>nul
mkdir "%BG%\desert" 2>nul
mkdir "%BG%\ice" 2>nul
mkdir "%BG%\lava" 2>nul
mkdir "%BG%\space" 2>nul

echo Copying cave...
copy "%BG%\Seamless Parallax Cave Background\Cave Back.png" "%BG%\cave\cave_far.png" >nul
copy "%BG%\Seamless Parallax Cave Background\Cave Mid.png" "%BG%\cave\cave_mid.png" >nul
copy "%BG%\Seamless Parallax Cave Background\Cave Front.png" "%BG%\cave\cave_near.png" >nul

echo Copying sky...
copy "%BG%\Background_Clouds_And_Mountains_Parallax_\Layers\Background01.png" "%BG%\sky\sky_far.png" >nul
copy "%BG%\Background_Clouds_And_Mountains_Parallax_\Layers\BackgroundMountain_01.png" "%BG%\sky\sky_mid.png" >nul
copy "%BG%\Background_Clouds_And_Mountains_Parallax_\Layers\Cloud01.png" "%BG%\sky\sky_near.png" >nul

echo Copying desert...
copy "%BG%\desert_parts\desert_0005_Background.png" "%BG%\desert\desert_far.png" >nul
copy "%BG%\desert_parts\desert_0003_Layer-4.png" "%BG%\desert\desert_mid.png" >nul
copy "%BG%\desert_parts\desert_0001_Layer-2.png" "%BG%\desert\desert_near.png" >nul

echo Copying lava...
copy "%BG%\PNG\bg_volcano_layers\bg_volcano_1.png" "%BG%\lava\lava_far.png" >nul
copy "%BG%\PNG\bg_volcano_layers\bg_volcano_3.png" "%BG%\lava\lava_mid.png" >nul
copy "%BG%\PNG\bg_volcano_layers\bg_volcano_5.png" "%BG%\lava\lava_near.png" >nul

echo Copying ice...
copy "%BG%\smallMountain.png" "%BG%\ice\ice_far.png" >nul
copy "%BG%\clouds_1.png" "%BG%\ice\ice_mid.png" >nul
copy "%BG%\fog.png" "%BG%\ice\ice_near.png" >nul

echo Copying space...
copy "%BG%\bkgd_0.png" "%BG%\space\space_far.png" >nul
copy "%BG%\bkgd_4.png" "%BG%\space\space_mid.png" >nul
copy "%BG%\bkgd_7.png" "%BG%\space\space_near.png" >nul

echo Done! All parallax backgrounds organized.
dir "%BG%\cave" /b
dir "%BG%\sky" /b
dir "%BG%\desert" /b
dir "%BG%\ice" /b
dir "%BG%\lava" /b
dir "%BG%\space" /b
