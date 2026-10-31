from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

Priority = Literal["Low", "Medium", "High"]
Status = Literal["Pending", "In Progress", "Completed"]


# ---------- Employees ----------
class EmployeeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    department: str = Field(min_length=1, max_length=100)


class EmployeeOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: str


# ---------- Tasks ----------
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = ""
    priority: Priority = "Medium"
    due_date: date
    employee_id: int


class TaskStatusUpdate(BaseModel):
    status: Status


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    priority: Priority
    due_date: date
    status: Status
    employee_id: int
    employee_name: str


# ---------- Dashboard ----------
class DashboardOut(BaseModel):
    total_employees: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    in_progress_tasks: int
