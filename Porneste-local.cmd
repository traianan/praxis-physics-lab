@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Este necesar Node.js 22 sau mai nou, instalat o singura data.
 pause
 exit /b 1
)
node scripts/build.mjs
if errorlevel 1 (
 pause
 exit /b 1
)
echo Deschide in browser: http://127.0.0.1:4190
node scripts/serve.mjs
pause
