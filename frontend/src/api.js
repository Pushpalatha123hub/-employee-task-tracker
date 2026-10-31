const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // FastAPI sends {detail: "msg"} or {detail: [{msg, loc}, ...]} for validation errors
    const d = data.detail;
    const message = Array.isArray(d)
      ? d.map((e) => `${e.loc?.slice(-1)[0]}: ${e.msg}`).join(", ")
      : d || "Something went wrong.";
    throw new Error(message);
  }
  return data;
}

export const api = {
  getDashboard: () => request("/dashboard"),
  getEmployees: (search = "") =>
    request(`/employees${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  addEmployee: (body) => request("/employees", { method: "POST", body: JSON.stringify(body) }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: "DELETE" }),
  getTasks: (status = "") =>
    request(`/tasks${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  addTask: (body) => request("/tasks", { method: "POST", body: JSON.stringify(body) }),
  updateTaskStatus: (id, status) =>
    request(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
