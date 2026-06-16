$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $root "script.js"
$startupAsset = Join-Path $root "assets\system\startup.m4a"

if (!(Test-Path -LiteralPath $startupAsset)) {
  throw "Expected startup sound asset at assets/system/startup.m4a"
}

$assetInfo = Get-Item -LiteralPath $startupAsset
if ($assetInfo.Length -le 0) {
  throw "Startup sound asset is empty"
}

$script = Get-Content -LiteralPath $scriptPath -Raw

if ($script -notmatch 'startupSound:\s*\{[\s\S]*src:\s*"assets/system/startup\.m4a"[\s\S]*volume:\s*0\.18') {
  throw "Expected startup sound config with assets/system/startup.m4a at volume 0.18"
}

if ($script -notmatch 'startupAudio:\s*null') {
  throw "Expected startup audio to be tracked separately from the music player"
}

if ($script -notmatch 'startupPlayed:\s*false') {
  throw "Expected startup sound to be guarded so it only plays once"
}

if ($script -notmatch 'startupPending:\s*false') {
  throw "Expected blocked startup sound to be tracked for retry"
}

if ($script -notmatch 'function initStartupSound\(\)[\s\S]*new Audio\(resolveAssetPath\(albumConfig\.startupSound\.src\)\)[\s\S]*audio\.volume = albumConfig\.startupSound\.volume') {
  throw "Expected initStartupSound() to create a separate low-volume Audio instance"
}

if ($script -notmatch 'function playStartupSound\(\)[\s\S]*state\.startupPlayed = true[\s\S]*state\.startupPending = false[\s\S]*playPromise\.catch[\s\S]*state\.startupPlayed = false[\s\S]*state\.startupPending = true') {
  throw "Expected playStartupSound() to mark attempts and retry later when playback is blocked"
}

if ($script -notmatch 'function retryPendingStartupSound\(\)[\s\S]*state\.startupPending[\s\S]*playStartupSound\(\);') {
  throw "Expected retryPendingStartupSound() to replay blocked startup audio on user interaction"
}

if ($script -notmatch 'document\.addEventListener\(eventName, retryPendingStartupSound') {
  throw "Expected user interactions to retry pending startup sound"
}

if ($script -notmatch 'function applyPlayerVisuals\(\)[\s\S]*el\.coverArt\.style\.backgroundImage = `url\("\$\{artworkPath\}"\)`;[\s\S]*el\.coverArt\.classList\.add\("has-image"\)') {
  throw "Expected the main cover stage to use albumConfig.artwork"
}

$launchBootSequenceMatch = [regex]::Match($script, 'async function launchBootSequence\(\) \{(?<body>[\s\S]*?)\n\}')
if (!$launchBootSequenceMatch.Success) {
  throw "Could not find launchBootSequence()"
}

$launchBootSequenceBody = $launchBootSequenceMatch.Groups["body"].Value
$runBootIndex = $launchBootSequenceBody.IndexOf("await runBootSequence();")
$revealCallIndex = $launchBootSequenceBody.IndexOf("revealDesktop();")

if ($runBootIndex -lt 0) {
  throw "Expected launchBootSequence() to wait for the boot sequence"
}

if ($revealCallIndex -lt 0) {
  throw "Expected launchBootSequence() to reveal the desktop after boot"
}

if ($revealCallIndex -lt $runBootIndex) {
  throw "Expected desktop reveal to happen after the boot sequence finishes"
}

$revealDesktopMatch = [regex]::Match($script, 'function revealDesktop\(\) \{(?<body>[\s\S]*?)\n\}')
if (!$revealDesktopMatch.Success) {
  throw "Could not find revealDesktop()"
}

$revealDesktopBody = $revealDesktopMatch.Groups["body"].Value
$completeIndex = $revealDesktopBody.IndexOf("state.bootComplete = true;")
$playIndex = $revealDesktopBody.IndexOf("playStartupSound();")
$showShellIndex = $revealDesktopBody.IndexOf("el.appShell.hidden = false;")

if ($completeIndex -lt 0) {
  throw "Expected revealDesktop() to mark boot as complete"
}

if ($playIndex -lt 0) {
  throw "Expected revealDesktop() to trigger startup sound"
}

if ($showShellIndex -lt 0) {
  throw "Expected revealDesktop() to show the app shell"
}

if ($playIndex -lt $completeIndex -or $playIndex -gt $showShellIndex) {
  throw "Expected startup sound to begin after boot completion and before the desktop is shown"
}

Write-Host "Startup sound checks passed."
