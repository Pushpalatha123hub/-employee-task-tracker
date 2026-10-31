@echo off
cd /d "%~dp0backend"
call .venv\Scripts\activate
echo Backend: http://localhost:8000/docs   (keep this window open)
python -m uvicorn main:app --reload
pause
