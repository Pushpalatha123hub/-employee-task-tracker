@echo off
echo ===== Backend setup =====
cd /d "%~dp0backend"
python -m venv .venv
call .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
echo.
echo ===== Frontend setup =====
cd /d "%~dp0frontend"
call npm install
echo.
echo Setup finished. Now double-click 2_RUN_BACKEND.bat and 3_RUN_FRONTEND.bat
pause
