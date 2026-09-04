@echo off
setlocal
cd /d "%~dp0"
title FANTA007 - avvio pulito

echo.
echo ===============================================
echo FANTA007 - AVVIO PULITO BACKEND + FRONTEND
echo ===============================================
echo Chiudo eventuali vecchi server sulle porte 8000 e 5173...

for %%P in (8000 5173) do (
  for /f "tokens=5" %%A in ('netstat -aon ^| findstr ":%%P" ^| findstr "LISTENING"') do (
    taskkill /PID %%A /F >nul 2>&1
  )
)

if not exist ".venv\Scripts\python.exe" (
  echo Creo ambiente Python...
  py -3.11 -m venv .venv >nul 2>&1
  if errorlevel 1 python -m venv .venv
)

echo Verifico dipendenze backend...
".venv\Scripts\python.exe" -m pip install -e ".\backend" >nul
if errorlevel 1 (
  echo ERRORE: installazione backend non riuscita.
  pause
  exit /b 1
)

if not exist "frontend\node_modules" (
  echo Installo dipendenze frontend...
  pushd frontend
  call npm.cmd install
  if errorlevel 1 (
    popd
    echo ERRORE: npm install non riuscito.
    pause
    exit /b 1
  )
  popd
)

echo Avvio API e frontend della stessa copia del progetto...
start "" "%~dp0scripts\windows\RUN_BACKEND.cmd"
timeout /t 3 /nobreak >nul
start "" "%~dp0scripts\windows\RUN_FRONTEND.cmd"
timeout /t 4 /nobreak >nul
start "" "http://127.0.0.1:5173"

echo.
echo Fatto. Test rapido nel Dossier:
echo Federico Dimarco - 2025/26 - Gol segnati 7 - Assist 17.
echo.
pause
