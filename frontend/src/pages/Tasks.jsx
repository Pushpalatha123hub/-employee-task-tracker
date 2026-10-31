import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";

const STATUSES = ["Pending", "In Progress", "Completed"];
const PRIORITIES = ["Low", "Medium", "High"];
const EMPTY = { title: "", description: "", priority: "Medium", due_date: "", employee_id: "" };

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(() => {
    api.getTasks(filter).then(setTasks).catch((e) => setError(e.message));
  }, [filter]);

  useEffect(() => { api.getEmployees().then(setEmployees).catch((e) => setError(e.message)); }, []);
  useEffect(loadTasks, [loadTasks]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.addTask({ ...form, employee_id: Number(form.employee_id) });
      setForm(EMPTY);
      loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onStatus(task, status) {
    setError("");
    try {
      const updated = await api.updateTaskStatus(task.id, status);
      setTasks((list) => list.map((t) => (t.id === updated.id ? updated : t)));
      if (filter && updated.status !== filter) loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Tasks</h1>
        <p className="muted">Create a task, assign it, and track it to done.</p>
      </header>

      {error && <p className="alert" role="alert">{error}</p>}

      {employees.length === 0 ? (
        <p className="panel empty">Add at least one employee before creating tasks.</p>
      ) : (
        <form className="panel form-grid" onSubmit={onSubmit}>
          <label className="span-2">Title
            <input name="title" value={form.title} onChange={onChange} required maxLength={150} />
          </label>
          <label>Assign to
            <select name="employee_id" value={form.employee_id} onChange={onChange} required>
              <option value="" disabled>Choose employee</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
          <label>Priority
            <select name="priority" value={form.priority} onChange={onChange}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label>Due date
            <input name="due_date" type="date" min={today()} value={form.due_date} onChange={onChange} required />
          </label>
          <label className="span-3">Description
            <textarea name="description" rows={2} value={form.description} onChange={onChange} />
          </label>
          <button className="btn" disabled={saving}>{saving ? "Creating…" : "Create task"}</button>
        </form>
      )}

      <section className="panel">
        <div className="panel-row">
          <h2>All tasks ({tasks.length})</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status" className="search">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {tasks.length === 0 ? (
          <p className="empty">{filter ? `No ${filter.toLowerCase()} tasks.` : "No tasks yet. Create one above."}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Task</th><th>Assigned to</th><th>Priority</th><th>Due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {tasks.map((t) => {
                  const overdue = t.status !== "Completed" && t.due_date < today();
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="strong">{t.title}</div>
                        {t.description && <div className="muted small">{t.description}</div>}
                      </td>
                      <td>
                        <div className="person">
                          <span className="avatar">{t.employee_name.charAt(0).toUpperCase()}</span>
                          <span>{t.employee_name}</span>
                        </div>
                      </td>
                      <td><span className={`tag p-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                      <td className={overdue ? "overdue" : ""}>
                        {fmt(t.due_date)}{overdue && <span className="small"> (overdue)</span>}
                      </td>
                      <td>
                        <select
                          className={`status s-${t.status.replace(" ", "").toLowerCase()}`}
                          value={t.status}
                          onChange={(e) => onStatus(t, e.target.value)}
                          aria-label={`Status for ${t.title}`}
                        >
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
