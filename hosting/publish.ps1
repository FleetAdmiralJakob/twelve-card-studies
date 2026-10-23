$ErrorActionPreference = 'Stop'
$cardWorkspace = Split-Path -Parent $PSScriptRoot
Push-Location $cardWorkspace
try {
  $cardPreviousOrigin = $env:CARD_SITE_ORIGIN
  try {
    if (!$env:CARD_SITE_ORIGIN) { $env:CARD_SITE_ORIGIN = 'http://jakobs-pc.taile7e918.ts.net:8787' }
    & node build.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Website build failed.' }
  } finally {
    $env:CARD_SITE_ORIGIN = $cardPreviousOrigin
  }
  $cardDestination = Join-Path $env:LOCALAPPDATA 'TwelveCardCollection'
  New-Item -ItemType Directory -Path $cardDestination -Force | Out-Null
  foreach ($suffix in @('', '.br', '.gz')) {
    Copy-Item -LiteralPath (Join-Path $cardWorkspace "dist\hosted.html$suffix") -Destination (Join-Path $cardDestination "index.html$suffix") -Force
    Copy-Item -LiteralPath (Join-Path $cardWorkspace "dist\css.html$suffix") -Destination (Join-Path $cardDestination "css.html$suffix") -Force
    Copy-Item -LiteralPath (Join-Path $cardWorkspace "dist\basic.html$suffix") -Destination (Join-Path $cardDestination "basic.html$suffix") -Force
    Copy-Item -LiteralPath (Join-Path $cardWorkspace "dist\hybrid.html$suffix") -Destination (Join-Path $cardDestination "hybrid.html$suffix") -Force
    if (Test-Path -LiteralPath (Join-Path $cardWorkspace "dist\compare.html$suffix")) {
      Copy-Item -LiteralPath (Join-Path $cardWorkspace "dist\compare.html$suffix") -Destination (Join-Path $cardDestination "compare.html$suffix") -Force
    }
    if (Test-Path -LiteralPath (Join-Path $cardWorkspace "dist\bench.html$suffix")) {
      Copy-Item -LiteralPath (Join-Path $cardWorkspace "dist\bench.html$suffix") -Destination (Join-Path $cardDestination "bench.html$suffix") -Force
    }
  }
  $cardHybridDestination = Join-Path $cardDestination 'hybrid'
  New-Item -ItemType Directory -Path $cardHybridDestination -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $cardWorkspace 'dist\hybrid\assets') -Destination $cardHybridDestination -Recurse -Force
  Copy-Item -LiteralPath (Join-Path $cardWorkspace 'dist\hybrid-source.zip') -Destination (Join-Path $cardDestination 'hybrid-source.zip') -Force
  if (Test-Path -LiteralPath (Join-Path $cardWorkspace 'benchmarks\four-combined.json')) {
    Copy-Item -LiteralPath (Join-Path $cardWorkspace 'benchmarks\four-combined.json') -Destination (Join-Path $cardDestination 'four-benchmark-results.json') -Force
  }
  if (Test-Path -LiteralPath (Join-Path $cardWorkspace 'benchmarks\combined.json')) {
    Copy-Item -LiteralPath (Join-Path $cardWorkspace 'benchmarks\combined.json') -Destination (Join-Path $cardDestination 'benchmark-results.json') -Force
  }
  Copy-Item -LiteralPath (Join-Path $cardWorkspace 'assets\reference.png') -Destination (Join-Path $cardDestination 'reference.png') -Force
  $cardSourceServer = Join-Path $PSScriptRoot 'serve.mjs'
  $cardHostedServer = Join-Path $cardDestination 'serve.mjs'
  $cardServerChanged = !(Test-Path -LiteralPath $cardHostedServer) -or ((Get-FileHash -LiteralPath $cardSourceServer).Hash -ne (Get-FileHash -LiteralPath $cardHostedServer).Hash)
  if ($cardServerChanged) {
    Stop-ScheduledTask -TaskName 'TwelveCardCollection'
    # Stop only a surviving child of this specific website task, if present.
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {
      $_.CommandLine -and $_.CommandLine.Contains($cardHostedServer)
    } | ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction SilentlyContinue }
    for ($cardStopAttempt = 0; $cardStopAttempt -lt 40; $cardStopAttempt++) {
      if ((Get-ScheduledTask -TaskName 'TwelveCardCollection').State -ne 'Running') { break }
      Start-Sleep -Milliseconds 250
    }
    Copy-Item -LiteralPath $cardSourceServer -Destination $cardHostedServer -Force
  }
  Start-ScheduledTask -TaskName 'TwelveCardCollection'
  $cardReady = $false
  for ($cardAttempt = 0; $cardAttempt -lt 30; $cardAttempt++) {
    try {
      $cardResponse = Invoke-WebRequest -Uri 'http://127.0.0.1:18787/basic/' -Method Head -TimeoutSec 2
      if ($cardResponse.StatusCode -eq 200) { $cardReady = $true; break }
    } catch { }
    Start-Sleep -Milliseconds 500
  }
  if (!$cardReady) { throw 'The website task started but its HTTP server did not become ready.' }
  Write-Output 'Published four editions at /, /css/, /basic/, /hybrid/; new comparison at /compare/.'
} finally {
  Pop-Location
}
