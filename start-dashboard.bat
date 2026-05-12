@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on PATH.
  echo Install Node.js or open the live site at https://ai.tcne.us
  pause
  exit /b 1
)

start "AI Chain Monitor Server" /min cmd /c "node server.js 8080"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080"

echo AI Chain Monitor is opening at http://localhost:8080
echo You can close this window.
timeout /t 4 /nobreak >nul

