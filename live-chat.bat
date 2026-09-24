@echo off
REM HCIG Hive: Launch Live Dual-Agent Dialogue & Monitoring Console
title HCIG Hive - Live Agent Dialogue
cd /d "%~dp0"
node hive/live-dialogue.js %*
pause
