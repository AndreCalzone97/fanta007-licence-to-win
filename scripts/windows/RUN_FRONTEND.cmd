@echo off
cd /d "%~dp0\..\..\frontend"
title FANTA007 FRONTEND
npm.cmd run dev -- --host 127.0.0.1 --port 5173
pause
