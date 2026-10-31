from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from psycopg2 import errors

import schemas
from database import get_cursor, init_db

init_db()  # creates the tables if they don't exist

app = FastAPI(title="Employee Task Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Every task is returned together with its assigned employee's name (JOIN).
TASK_SELECT = """
    SELECT t.id, t.title, t.description, t.priority, t.due_date, t.status,
           t.employee_id, e.name AS employee_name
    FROM tasks t
    JOIN employees e ON e.id = t.employee_id
"""


# ======================= EMPLOYEES =======================
@app.post("/employees", response_model=schemas.EmployeeOut, status_code=201, tags=["Employees"])
def create_employee(payload: schemas.EmployeeCreate):
    try:
        with get_cursor() as cur:
            cur.execute(
                """INSERT INTO employees (name, email, department)
                   VALUES (%s, %s, %s)
                   RETURNING id, name, email, department""",
                (payload.name.strip(), payload.email.lower(), payload.department.strip()),
            )
            return cur.fetchone()
    except errors.UniqueViolation:
        raise HTTPException(409, "An employee with this email already exists.")


@app.get("/employees", response_model=list[schemas.EmployeeOut], tags=["Employees"])
def list_employees(search: Optional[str] = Query(None, description="Filter by employee name")):
    with get_cursor() as cur:
        if search:
            cur.execute(
                """SELECT id, name, email, department FROM employees
                   WHERE name ILIKE %s ORDER BY name""",
                (f"%{search}%",),
            )
        else:
            cur.execute("SELECT id, name, email, department FROM employees ORDER BY name")
        return cur.fetchall()


@app.delete("/employees/{employee_id}", status_code=204, tags=["Employees"])
def delete_employee(employee_id: int):
    # Their tasks are removed automatically by ON DELETE CASCADE in the table definition.
    with get_cursor() as cur:
        cur.execute("DELETE FROM employees WHERE id = %s", (employee_id,))
        if cur.rowcount == 0:
            raise HTTPException(404, "Employee not found.")


# ========================= TASKS =========================
@app.post("/tasks", response_model=schemas.TaskOut, status_code=201, tags=["Tasks"])
def create_task(payload: schemas.TaskCreate):
    with get_cursor() as cur:
        cur.execute("SELECT 1 FROM employees WHERE id = %s", (payload.employee_id,))
        if cur.fetchone() is None:
            raise HTTPException(404, "Assigned employee not found.")
        cur.execute(
            """INSERT INTO tasks (title, description, priority, due_date, employee_id)
               VALUES (%s, %s, %s, %s, %s) RETURNING id""",
            (payload.title.strip(), payload.description, payload.priority,
             payload.due_date, payload.employee_id),
        )
        new_id = cur.fetchone()["id"]
        cur.execute(TASK_SELECT + " WHERE t.id = %s", (new_id,))
        return cur.fetchone()


@app.get("/tasks", response_model=list[schemas.TaskOut], tags=["Tasks"])
def list_tasks(status_filter: Optional[schemas.Status] = Query(None, alias="status")):
    with get_cursor() as cur:
        if status_filter:
            cur.execute(TASK_SELECT + " WHERE t.status = %s ORDER BY t.due_date, t.id", (status_filter,))
        else:
            cur.execute(TASK_SELECT + " ORDER BY t.due_date, t.id")
        return cur.fetchall()


@app.patch("/tasks/{task_id}/status", response_model=schemas.TaskOut, tags=["Tasks"])
def update_task_status(task_id: int, payload: schemas.TaskStatusUpdate):
    with get_cursor() as cur:
        cur.execute("UPDATE tasks SET status = %s WHERE id = %s", (payload.status, task_id))
        if cur.rowcount == 0:
            raise HTTPException(404, "Task not found.")
        cur.execute(TASK_SELECT + " WHERE t.id = %s", (task_id,))
        return cur.fetchone()


# ======================= DASHBOARD =======================
@app.get("/dashboard", response_model=schemas.DashboardOut, tags=["Dashboard"])
def dashboard():
    with get_cursor() as cur:
        cur.execute(
            """SELECT
                 (SELECT COUNT(*) FROM employees)                              AS total_employees,
                 COUNT(*)                                                      AS total_tasks,
                 COUNT(*) FILTER (WHERE status = 'Completed')                  AS completed_tasks,
                 COUNT(*) FILTER (WHERE status = 'Pending')                    AS pending_tasks,
                 COUNT(*) FILTER (WHERE status = 'In Progress')                AS in_progress_tasks
               FROM tasks"""
        )
        return cur.fetchone()


# ========================= HOME ==========================
@app.get("/", tags=["Health"])
def home():
    return {"message": "Employee Task Tracker API is running. Open /docs to test."}
