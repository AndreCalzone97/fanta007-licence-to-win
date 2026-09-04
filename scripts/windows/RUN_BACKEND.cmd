@echo off
cd /d "%~dp0\..\.."
title FANTA007 BACKEND
".venv\Scripts\python.exe" -m uvicorn app.main:app --app-dir backend --reload --port 8000
pause
