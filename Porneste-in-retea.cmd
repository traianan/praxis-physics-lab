@echo off
cd /d "%~dp0"
node scripts/build.mjs
if errorlevel 1 exit /b 1
echo Pentru tableta, foloseste adresa IP locala a PC-ului urmata de :4190
echo PC-ul si tableta trebuie sa fie in aceeasi retea Wi-Fi. Internetul nu este necesar.
node scripts/serve.mjs --lan
pause
