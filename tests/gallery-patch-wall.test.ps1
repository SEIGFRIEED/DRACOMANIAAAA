$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root "index.html"
$stylesPath = Join-Path $root "styles.css"
$scriptPath = Join-Path $root "script.js"
$firstPatchAsset = Join-Path $root "assets\gallery\logo-voltic.jpg"
$secondPatchAsset = Join-Path $root "assets\gallery\hand-sign.jpg"
$thirdPatchAsset = Join-Path $root "assets\gallery\seifpf.jpg"
$doodlePatchAsset = Join-Path $root "assets\doodles\new-patch.svg"

$index = Get-Content -LiteralPath $indexPath -Raw
$styles = Get-Content -LiteralPath $stylesPath -Raw
$script = Get-Content -LiteralPath $scriptPath -Raw

$galleryWindowMatch = [regex]::Match($index, '<section class="desktop-window desktop-window-game desktop-window-gallery"[\s\S]*?</section>\s*</section>')
if (!$galleryWindowMatch.Success) {
  throw "Expected to find the GALERIA desktop window markup"
}

$galleryMarkup = $galleryWindowMatch.Value

if ($galleryMarkup -match 'COMING SOON') {
  throw "Expected GALERIA to remove the COMING SOON placeholder"
}

if ($galleryMarkup -notmatch 'class="gallery-patch-wall game-target"') {
  throw "Expected GALERIA to render the patch wall as the focusable game target"
}

if ($galleryMarkup -notmatch 'class="gallery-patch gallery-patch-emblem"') {
  throw "Expected GALERIA to include the first emblem patch"
}

if ($galleryMarkup -notmatch 'class="gallery-patch gallery-patch-hand"') {
  throw "Expected GALERIA to include the second hand patch"
}

if ($galleryMarkup -notmatch 'class="gallery-patch gallery-patch-seif"') {
  throw "Expected GALERIA to include the third SEIF patch"
}

if (!(Test-Path -LiteralPath $firstPatchAsset)) {
  throw "Expected first gallery photo at assets/gallery/logo-voltic.jpg"
}

foreach ($patchAsset in @($firstPatchAsset, $secondPatchAsset, $thirdPatchAsset)) {
  if (!(Test-Path -LiteralPath $patchAsset)) {
    throw "Expected gallery patch asset to exist: $patchAsset"
  }

  $patchInfo = Get-Item -LiteralPath $patchAsset
  if ($patchInfo.Length -le 0) {
    throw "Expected gallery patch asset to be non-empty: $patchAsset"
  }
}

if (!(Test-Path -LiteralPath $doodlePatchAsset)) {
  throw "Expected doodle patch asset to exist: assets/doodles/new-patch.svg"
}

$doodleInfo = Get-Item -LiteralPath $doodlePatchAsset
if ($doodleInfo.Length -le 0) {
  throw "Expected doodle patch asset to be non-empty: assets/doodles/new-patch.svg"
}

if ($galleryMarkup -notmatch '<img class="gallery-patch-photo" src="assets/gallery/logo-voltic\.jpg" alt="">') {
  throw "Expected the first patch to render the provided photo asset"
}

if ($galleryMarkup -notmatch '<img class="gallery-patch-photo" src="assets/gallery/hand-sign\.jpg" alt="">') {
  throw "Expected the second patch to render the provided hand photo asset"
}

if ($galleryMarkup -notmatch '<img class="gallery-patch-photo" src="assets/gallery/seifpf\.jpg" alt="">') {
  throw "Expected the third patch to render the provided SEIF photo asset"
}

$patchPhotoCount = ([regex]::Matches($galleryMarkup, 'class="gallery-patch-photo"')).Count
if ($patchPhotoCount -ne 3) {
  throw "Expected GALERIA to render exactly three patch photos"
}

if ($galleryMarkup -match 'data-doodle=') {
  throw "Expected GALERIA to remove red doodle data elements"
}

if ($galleryMarkup -match 'class="gallery-doodle') {
  throw "Expected GALERIA to render no red doodle SVG elements"
}

if ($styles -notmatch '\.gallery-window-body') {
  throw "Expected gallery-specific window body styles"
}

if ($styles -notmatch '\.gallery-patch-wall') {
  throw "Expected archive wall styles for gallery patches"
}

if ($styles -notmatch '\.gallery-patch-emblem') {
  throw "Expected specific styling hook for the first emblem patch"
}

if ($styles -notmatch '\.gallery-patch-photo') {
  throw "Expected image styling for gallery patch photos"
}

if ($styles -match '\.gallery-doodle') {
  throw "Expected gallery doodle styles to be removed"
}

if ($script -notmatch 'if \(program === "galeria"\) return "gallery-patch-wall";') {
  throw "Expected gallery keyboard/game focus to start on the patch wall"
}

if ($script -notmatch 'image:\s*"assets/doodles/new-patch\.svg"') {
  throw "Expected albumConfig.doodles to reference the SVG doodle patch asset"
}

if ($script -match 'new-patch\.jpg') {
  throw "Expected albumConfig.doodles not to reference the missing JPG doodle patch asset"
}

if ($script -notmatch 'function renderGalleryPatchWall\(\)[\s\S]*gallery-patch-doodle[\s\S]*resolveAssetPath\(doodle\.image\)') {
  throw "Expected renderGalleryPatchWall() to append configured doodle patches"
}

if ($script -notmatch 'renderGalleryPatchWall\(\);[\s\S]*void startExperience\(\);') {
  throw "Expected init() to render the gallery patch wall before starting the experience"
}

if ($script -match 'fig\.dataset\.doodle') {
  throw "Expected doodle patches not to use old red doodle data attributes"
}

Write-Host "Gallery patch wall checks passed."
