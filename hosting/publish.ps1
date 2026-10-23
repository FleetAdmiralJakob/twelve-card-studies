$ErrorActionPreference = 'Stop'
$cardWorkspace = Split-Path -Parent $PSScriptRoot
Push-Location $cardWorkspace
try {
  $cardPreviousOrigin = $env:CARD_SITE_ORIGIN
  try {
    if (!$env:CARD_SITE_ORIGIN) { $env:CARD_SITE_ORIGIN = 'http://jakobs-pc.taile7e918.ts.net:8787' }
    & node scripts/build-vercel.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Website build or historical report validation failed.' }
    & node scripts/check-routes.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Public route validation failed.' }
  } finally {
    $env:CARD_SITE_ORIGIN = $cardPreviousOrigin
  }

  # Stage only the fingerprinted public inventory. Old releases stay available
  # for rollback and are never reachable through the current site's routes.
  $cardDestination = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'TwelveCardCollection'))
  $cardReleaseName = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
  $cardReleaseRoot = [IO.Path]::GetFullPath((Join-Path $cardDestination "releases\$cardReleaseName"))
  if (!$cardReleaseRoot.StartsWith($cardDestination + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Release must stay inside the website destination.' }
  if (Test-Path -LiteralPath $cardReleaseRoot) { throw 'Release destination already exists.' }
  New-Item -ItemType Directory -Path (Join-Path $cardReleaseRoot 'site') -Force | Out-Null
  $cardInventory = Get-Content -LiteralPath (Join-Path $cardWorkspace 'dist\public-files.json') -Raw | ConvertFrom-Json
  if ($cardInventory.Count -lt 20) { throw 'Public inventory is incomplete.' }
  $cardSeen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  foreach ($cardFile in $cardInventory) {
    if ($cardFile.path -notmatch '^[A-Za-z0-9][A-Za-z0-9@._/-]*$' -or ($cardFile.path.Split('/') -contains '..') -or !$cardSeen.Add($cardFile.path)) { throw "Invalid or duplicate public path: $($cardFile.path)" }
    $cardSource = Join-Path (Join-Path $cardWorkspace 'site') $cardFile.path
    $cardTarget = Join-Path (Join-Path $cardReleaseRoot 'site') $cardFile.path
    New-Item -ItemType Directory -Path (Split-Path -Parent $cardTarget) -Force | Out-Null
    Copy-Item -LiteralPath $cardSource -Destination $cardTarget
    if ((Get-Item -LiteralPath $cardTarget).Length -ne $cardFile.bytes -or (Get-FileHash -LiteralPath $cardTarget -Algorithm SHA256).Hash.ToLowerInvariant() -ne $cardFile.sha256) { throw "Publication fingerprint mismatch: $($cardFile.path)" }
  }
  foreach ($cardRuntimePath in @('vercel.json', 'scripts\preview.mjs', 'hosting\serve.mjs')) {
    $cardRuntimeTarget = Join-Path $cardReleaseRoot $cardRuntimePath
    New-Item -ItemType Directory -Path (Split-Path -Parent $cardRuntimeTarget) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $cardWorkspace $cardRuntimePath) -Destination $cardRuntimeTarget
  }
  Copy-Item -LiteralPath (Join-Path $cardWorkspace 'dist\public-files.json') -Destination (Join-Path $cardReleaseRoot 'public-files.json')

  # Keep the existing scheduled-task command stable. The launcher selects a
  # complete release; its server shares Vercel routes/headers and enables HTML
  # compression without exposing gzip/Brotli siblings as separate public files.
  $cardHostedServer = Join-Path $cardDestination 'serve.mjs'
  $cardLauncher = @'
import {readFile} from 'node:fs/promises';
const {release} = JSON.parse((await readFile(new URL('./current.json', import.meta.url), 'utf8')).replace(/^\uFEFF/, ''));
if (!/^[0-9]{8}-[0-9]{6}-[a-f0-9]{8}$/.test(release)) throw new Error('Invalid website release');
await import(new URL('./releases/' + release + '/hosting/serve.mjs', import.meta.url));
'@
  $cardUtf8 = [Text.UTF8Encoding]::new($false)
  [IO.File]::WriteAllText($cardHostedServer, $cardLauncher, $cardUtf8)
  $cardPointerTemp = Join-Path $cardDestination ("current-" + $cardReleaseName + '.json')
  [IO.File]::WriteAllText($cardPointerTemp, (@{ release = $cardReleaseName } | ConvertTo-Json), $cardUtf8)
  Move-Item -LiteralPath $cardPointerTemp -Destination (Join-Path $cardDestination 'current.json') -Force

  Stop-ScheduledTask -TaskName 'TwelveCardCollection'
  # Stop only the surviving Node process for this existing website task.
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {
    $_.CommandLine -and $_.CommandLine.Contains($cardHostedServer)
  } | ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction SilentlyContinue }
  for ($cardStopAttempt = 0; $cardStopAttempt -lt 40; $cardStopAttempt++) {
    if ((Get-ScheduledTask -TaskName 'TwelveCardCollection').State -ne 'Running') { break }
    Start-Sleep -Milliseconds 250
  }
  Start-ScheduledTask -TaskName 'TwelveCardCollection'
  $cardReady = $false
  $cardExpectedHub = ($cardInventory | Where-Object { $_.path -eq 'index.html' }).sha256
  # PowerShell's HTTP handler can append compression encodings even when the
  # caller requests identity. Every supported ETag still pins the same raw hub.
  $cardExpectedTags = @(('"' + $cardExpectedHub + '"'), ('"' + $cardExpectedHub + '-br"'), ('"' + $cardExpectedHub + '-gzip"'))
  for ($cardAttempt = 0; $cardAttempt -lt 30; $cardAttempt++) {
    try {
      $cardResponse = Invoke-WebRequest -Uri 'http://127.0.0.1:18787/collections/' -Method Head -Headers @{ 'Accept-Encoding' = 'identity' } -TimeoutSec 2
      if ($cardResponse.StatusCode -eq 200 -and $cardExpectedTags -contains [string]$cardResponse.Headers['ETag']) { $cardReady = $true; break }
    } catch { }
    Start-Sleep -Milliseconds 500
  }
  if (!$cardReady) { throw "Release $cardReleaseName was staged, but the scheduled website server did not become ready." }
  Write-Output "Published release ${cardReleaseName}: collection hub at / and /collections/, Revision 1 at /original/, Revision 2 at /revision-2/svg/."
} finally {
  Pop-Location
}
