param([switch]$CheckOnly, [switch]$OpenBrowser)
$ErrorActionPreference = 'Stop'
$previewRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$previewUrl = 'http://127.0.0.1:5173'
$backendUrl = 'http://127.0.0.1:8000'
$logDir = Join-Path $previewRoot '.preview-logs'

function Test-Port([int]$Port) {
  $client = [Net.Sockets.TcpClient]::new()
  try { $client.Connect('127.0.0.1', $Port); return $true }
  catch { return $false }
  finally { $client.Dispose() }
}
function Wait-Api([string]$Url, $Process) {
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    if ($Process -and $Process.HasExited) { throw "Server terminato. Controlla i log in $logDir" }
    try {
      $health = Invoke-RestMethod "$Url/api/v1/health" -TimeoutSec 2
      if ($health.service -eq 'fanta007-api' -and $health.status -eq 'ok') { return }
    } catch { if ($attempt -eq 29) { throw "API non raggiungibile tramite $Url. Controlla i log in $logDir" } }
    Start-Sleep -Milliseconds 500
  }
  throw "La porta di $Url risponde con un servizio diverso da FANTA007."
}

if (-not $CheckOnly) {
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  if (-not (Test-Port 8000)) {
    $python = Join-Path $previewRoot '.venv/Scripts/python.exe'
    if (-not (Test-Path -LiteralPath $python)) { throw "Ambiente Python mancante: $python" }
    $apiProcess = Start-Process -FilePath $python -ArgumentList '-m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000' -WorkingDirectory $previewRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDir 'backend.out.log') -RedirectStandardError (Join-Path $logDir 'backend.err.log') -PassThru
  }
  Wait-Api $backendUrl $apiProcess
  if (-not (Test-Port 5173)) {
    $node = (Get-Command node -ErrorAction Stop).Source
    $frontendDir = Join-Path $previewRoot 'frontend'
    if (-not (Test-Path (Join-Path $frontendDir 'node_modules/vite/bin/vite.js'))) { throw 'Dipendenze frontend mancanti: eseguire npm install in frontend.' }
    $webProcess = Start-Process -FilePath $node -ArgumentList 'node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort' -WorkingDirectory $frontendDir -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDir 'frontend.out.log') -RedirectStandardError (Join-Path $logDir 'frontend.err.log') -PassThru
  }
}
if ($CheckOnly) {
  if (-not (Test-Port 8000)) { throw "Backend non attivo su $backendUrl. Avvia prima il servizio API." }
  if (-not (Test-Port 5173)) { throw "Frontend non attivo su $previewUrl. Avvia prima Vite." }
}
Wait-Api $backendUrl $apiProcess
Wait-Api $previewUrl $webProcess
$page = Invoke-WebRequest $previewUrl -UseBasicParsing -TimeoutSec 5
if ($page.Content -notmatch 'FANTA007') { throw 'La porta 5173 non mostra FANTA007. Nessun processo e stato terminato.' }
$players = Invoke-RestMethod "$previewUrl/api/v1/players?limit=1" -TimeoutSec 10
if ($null -eq $players.items -or $players.total -lt 1) { throw 'Il Listone non restituisce i giocatori.' }
Write-Host "Preview verificata: $previewUrl"
Write-Host "Hero H1: $previewUrl/presentazione"
Write-Host "API e Listone disponibili ($($players.total) giocatori)."
if ($OpenBrowser) { Start-Process "$previewUrl/presentazione" }
