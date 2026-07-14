$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root "index.html"
$stylesPath = Join-Path $root "styles.css"
$scriptPath = Join-Path $root "script.js"

$index = Get-Content -LiteralPath $indexPath -Raw
$styles = Get-Content -LiteralPath $stylesPath -Raw
$script = Get-Content -LiteralPath $scriptPath -Raw

if ($index -notmatch 'data-program-launch="tienda"') {
  throw "Expected TIENDA desktop launcher"
}

if ($index -notmatch 'data-start-launch="tienda"') {
  throw "Expected TIENDA Start menu launcher"
}

if ($index -notmatch 'data-program-toggle="tienda"') {
  throw "Expected TIENDA taskbar button"
}

if ($index -notmatch 'id="window-tienda"[\s\S]*data-window="tienda"') {
  throw "Expected TIENDA desktop window markup"
}

$storeWindowMatch = [regex]::Match($index, '<section class="desktop-window desktop-window-game desktop-window-store"[\s\S]*?</section>\s*</section>')
if (!$storeWindowMatch.Success) {
  throw "Expected to find the TIENDA desktop window"
}

$storeMarkup = $storeWindowMatch.Value
if ($storeMarkup -match 'COMING SOON|PROXIMAMENTE|PRÓXIMAMENTE') {
  throw "Expected TIENDA to render a clothing shop, not a coming soon placeholder"
}

foreach ($requiredText in @("TIENDA", "TEES", "VOLTICMANIA", "SAWPULSE", "SIGNAL TEE", "BOLSA", "TOTAL")) {
  if ($storeMarkup -notmatch $requiredText) {
    throw "Expected TIENDA window to include $requiredText"
  }
}

foreach ($clearedText in @('03 ITEMS', '\$115\.00', '\$115')) {
  if ($storeMarkup -match $clearedText) {
    throw "Expected TIENDA cart to start empty without preloaded item totals"
  }
}

foreach ($requiredEmptyCartText in @('0 ITEMS', 'BOLSA VACIA', 'RD\$0\.00', 'RD\$0')) {
  if ($storeMarkup -notmatch $requiredEmptyCartText) {
    throw "Expected TIENDA cart to start empty with $requiredEmptyCartText"
  }
}

foreach ($requiredPesoText in @('RD\$1,600\.00', 'RD\$1,500', 'RD\$1,700\.00')) {
  if ($storeMarkup -notmatch $requiredPesoText) {
    throw "Expected TIENDA product prices to use Dominican pesos: $requiredPesoText"
  }
}

foreach ($forbiddenDollarText in @('(?<!RD)\$[0-9]')) {
  if ($storeMarkup -match $forbiddenDollarText) {
    throw "Expected TIENDA markup not to show plain dollar currency"
  }
}

foreach ($forbiddenText in @("HOODIES", "GORRAS", "GORRA", "PANTALONES", "PANTS", "FREQ HOODIE", "VOLTIC CAP")) {
  if ($storeMarkup -match $forbiddenText) {
    throw "Expected TIENDA window to hide $forbiddenText until that section is ready"
  }
}

foreach ($requiredClass in @("store-window-body", "store-shell", "store-category-tabs", "store-product-grid", "store-bag-panel")) {
  if ($storeMarkup -notmatch $requiredClass) {
    throw "Expected TIENDA window to include .$requiredClass"
  }
}

foreach ($requiredMarkup in @(
  'id="store-register-total"',
  'id="store-bag-count"',
  'id="store-bag-list"',
  'id="store-total"',
  'id="store-checkout-button"',
  'id="store-checkout-modal"',
  'id="store-checkout-form"',
  'id="store-checkout-error"',
  'data-store-product="draco-tee"',
  'data-store-product="voltic-tee"',
  'data-store-product="signal-tee"',
  'data-store-sizes="S,M,L,XL"',
  'data-store-add="draco-tee"',
  'data-store-add="voltic-tee"',
  'data-store-add="signal-tee"'
)) {
  if ($storeMarkup -notmatch [regex]::Escape($requiredMarkup)) {
    throw "Expected TIENDA markup to include $requiredMarkup"
  }
}

if ($styles -match 'store-icon-transparent\.png') {
  throw "Expected .icon-store to render without a missing transparent store icon asset"
}

if ($styles -notmatch '\.icon-store::before[\s\S]*clip-path') {
  throw "Expected .icon-store to draw the tee icon in CSS"
}

foreach ($requiredSelector in @(".desktop-window-store", ".store-window-body", ".store-shell", ".store-category-tabs", ".store-product-grid", ".store-bag-panel")) {
  $escapedSelector = [regex]::Escape($requiredSelector)
  if ($styles -notmatch $escapedSelector) {
    throw "Expected styles for $requiredSelector"
  }
}

if ($styles -notmatch '\.desktop-window-store\s*\{[\s\S]*top:\s*138px;[\s\S]*height:\s*min\(540px,\s*calc\(var\(--app-height\)\s*-\s*198px\s*-\s*var\(--safe-bottom\)\)\);') {
  throw "Expected TIENDA window sizing to stay above the desktop taskbar"
}

if ($styles -match '\.desktop-window-store\s*\{[\s\S]*top:\s*186px;[\s\S]*height:\s*min\(610px,\s*calc\(var\(--app-height\)\s*-\s*170px') {
  throw "Expected TIENDA window not to use the old taskbar-overlapping geometry"
}

foreach ($requiredSelector in @(".store-remove-button", ".store-bag-empty", ".store-checkout-button:disabled", ".store-qty-control", ".store-size-select", ".store-checkout-modal", ".store-payment-fieldset")) {
  if ($styles -notmatch [regex]::Escape($requiredSelector)) {
    throw "Expected cart interaction styles for $requiredSelector"
  }
}

if ($script -notmatch 'tienda:\s*\{\s*open:\s*false,\s*minimized:\s*false,\s*maximized:\s*false') {
  throw "Expected TIENDA window state"
}

if ($script -notmatch 'tienda:\s*document\.getElementById\("window-tienda"\)') {
  throw "Expected TIENDA window element lookup"
}

if ($script -notmatch 'if \(program === "tienda"\) return "store-window-main";') {
  throw "Expected TIENDA keyboard/game focus to start on the shop grid"
}

foreach ($requiredScript in @(
  'storeBag:\s*\[\]',
  'storeNextCartId:\s*1',
  'function bindStoreEvents\(\)',
  'function addStoreProduct\(productId\)',
  'function removeStoreItem\(cartId\)',
  'function changeStoreItemSize\(cartId, nextSize\)',
  'function changeStoreItemQuantity\(cartId, nextQuantity, options = \{\}\)',
  'function renderStoreBag\(\)',
  'function openStoreCheckout\(\)',
  'function handleStoreCheckoutSubmit\(event\)',
  'function validateStoreCheckout\(customer, paymentMethod\)',
  'data-store-remove',
  'dataset\.storeSize',
  'dataset\.storeQuantity',
  'store-remove-button game-target',
  'console\.log\(order\);',
  'status:\s*"Pending"',
  'RD\$',
  'el\.storeRegisterTotal\.textContent = formatStoreMoney\(total, \{ cents: true \}\);'
)) {
  if ($script -notmatch $requiredScript) {
    throw "Expected TIENDA script behavior matching: $requiredScript"
  }
}

Write-Host "Store program checks passed."
