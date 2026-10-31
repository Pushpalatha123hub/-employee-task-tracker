# Employee Task Tracker (React + FastAPI + PostgreSQL)

## One-time: create the database in pgAdmin 4
1. Open pgAdmin, connect to your server.
2. Right-click Databases > Create > Database, name it `task_tracker`, Save.
(The tables are created automatically when the backend starts.)

## Check backend\.env
It is pre-filled for user `postgres`, password `Pushpa@2702`
(written as `Pushpa%402702` because @ must be URL-encoded).
If your password is different, edit this file.

## Run (Windows)
1. Double-click `1_SETUP_FIRST_TIME.bat`  (only the first time)
2. Double-click `2_RUN_BACKEND.bat`        -> http://localhost:8000/docs
3. Double-click `3_RUN_FRONTEND.bat`       -> http://localhost:5173
Keep both windows open. Open http://localhost:5173 in your browser.

Requirements: Python 3.10+, Node.js 18+, PostgreSQL.

## Manual commands (instead of the .bat files)
Backend:  cd backend / python -m venv .venv / .venv\Scripts\activate / pip install -r requirements.txt / python -m uvicorn main:app --reload
Frontend: cd frontend / npm install / npm run dev

## API
POST/GET /employees, DELETE /employees/{id}, POST/GET /tasks, PATCH /tasks/{id}/status, GET /dashboard
Bonus: /employees?search=name and /tasks?status=Completed
