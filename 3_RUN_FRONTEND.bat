@echo off
cd /d "%~dp0frontend"
echo Frontend: http://localhost:5173   (keep this window open)
call npm run dev
pause
