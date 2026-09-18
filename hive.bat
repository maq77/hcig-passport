@echo off
rem HCIG Hive: one double-click starts everything.
rem   hub + watcher + dispatcher, the dashboard in the browser,
rem   and a Windows Terminal window with Claude (head) and agy side by side.
rem   hive.bat hub     only the hub and dashboard
rem   hive.bat stop    stop the hub
cd /d "%~dp0"

if /i "%1"=="stop" (
  for /f %%p in (.hive\state\hub.pid) do taskkill /PID %%p /T /F >nul 2>&1
  echo Hive hub stopped.
  exit /b
)

rem 0. First run: install and build the dashboard if it is missing.
if not exist hive\ui\index.html (
  echo Building the Hive dashboard, first run only...
  pushd hive\web
  call npm install --silent
  call npm run build
  popd
)

rem    hive.bat dev   dashboard with live reload on http://localhost:4401, for UI work
if /i "%1"=="dev" (
  start "HCIG Hive hub" /min node hive\hub.js
  start "Hive UI dev" cmd /k "cd /d hive\web && npm run dev"
  ping -n 5 127.0.0.1 >nul
  start "" http://localhost:4401
  exit /b
)

rem 1. Hub, in the background. Exits quietly if one is already running.
start "HCIG Hive hub" /min node hive\hub.js
ping -n 3 127.0.0.1 >nul

rem 2. Dashboard.
start "" http://localhost:4400

if /i "%1"=="hub" exit /b

rem 3. Terminal: Claude as head on the left, agy on the right, Hive status below.
where wt >nul 2>&1
if errorlevel 1 (
  start "Claude (head)" cmd /k claude
  start "agy" cmd /k agy
  exit /b
)
wt -w hive new-tab --title "Claude (head)" -d "%~dp0." cmd /k claude ^
 ; split-pane -V --size 0.42 --title "agy" -d "%~dp0." cmd /k agy ^
 ; split-pane -H --size 0.35 --title "Hive" -d "%~dp0." cmd /k "node hive\cli.js status"
