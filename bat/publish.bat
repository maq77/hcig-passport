@echo off
REM ---------------------------------------------------------------------------
REM  Push everything to HCIG Work.
REM  Builds, checks, commits and pushes. It REFUSES to push if the check fails,
REM  so a broken page never reaches Vercel.
REM
REM  Usage:  publish.bat
REM          publish.bat "your commit message"
REM ---------------------------------------------------------------------------
cd /d "%~dp0.."
echo.
echo   Publishing to HCIG Work...
echo.
if "%~1"=="" ( call npm run publish ) else ( call npm run publish "%~1" )
echo.
if errorlevel 1 (
  echo   STOPPED. Nothing was pushed. Read the error above.
) else (
  echo   Done. https://hcig-passport.vercel.app/
)
echo.
pause
