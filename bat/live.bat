@echo off
REM ---------------------------------------------------------------------------
REM  Live preview with auto-rebuild.
REM  Watches content/, src/ and docs/, rebuilds on save, and serves the site at
REM  http://localhost:4173 . Leave this window open while you work.
REM ---------------------------------------------------------------------------
cd /d "%~dp0.."
echo.
echo   Building...
call node build.js >nul
echo   Opening http://localhost:4173
start "" http://localhost:4173/247clinic/hotel-landing-pages
echo.
echo   Watching for changes. Close this window to stop.
echo.
node scripts/dev-watch.js
