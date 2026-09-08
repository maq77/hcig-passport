@echo off
REM ---------------------------------------------------------------------------
REM  Regenerate the 24/7 Clinic landing pages from the content table,
REM  then build and check.
REM ---------------------------------------------------------------------------
cd /d "%~dp0.."
call node scripts/gen-247-pages.js
call npm test
echo.
pause
