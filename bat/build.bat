@echo off
REM ---------------------------------------------------------------------------
REM  Build and check, without pushing anything.
REM ---------------------------------------------------------------------------
cd /d "%~dp0.."
call npm test
echo.
pause
