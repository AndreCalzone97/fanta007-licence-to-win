@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -File "%~dp0scripts\windows\Start-Preview.ps1" -OpenBrowser
if errorlevel 1 pause
