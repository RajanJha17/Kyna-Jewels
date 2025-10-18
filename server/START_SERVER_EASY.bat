@echo off
echo.
echo ============================================
echo    KYNA JEWELS SERVER - EASY START
echo ============================================
echo.
echo Starting server with batch tracking...
echo.

cd /d "%~dp0"
npx ts-node src/app.ts

pause

