import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";

const EMPTY = { name: "", email: "", department: "" };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.getEmployees(search).then(setEmployees).catch((e) => setError(e.message));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(t);
  }, [load]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.addEmployee(form);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(emp) {
    if (!window.confirm(`Delete ${emp.name}? Their assigned tasks will be deleted too.`)) return;
    try {
      await api.deleteEmployee(emp.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Employees</h1>
        <p className="muted">Add people to the team, then assign them tasks.</p>
      </header>

      {error && <p className="alert" role="alert">{error}</p>}

      <form className="panel form-grid" onSubmit={onSubmit}>
        <label>Name
          <input name="name" value={form.name} onChange={onChange} required maxLength={100} />
        </label>
        <label>Email
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </label>
        <label>Department
          <input name="department" value={form.department} onChange={onChange} required maxLength={100} />
        </label>
        <button className="btn" disabled={saving}>{saving ? "Adding…" : "Add employee"}</button>
      </form>

      <section className="panel">
        <div className="panel-row">
          <h2>Team ({employees.length})</h2>
          <input
            className="search"
            type="search"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search employees by name"
          />
        </div>

        {employees.length === 0 ? (
          <p className="empty">{search ? "No employees match that name." : "No employees yet. Add the first one above."}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Department</th><th></th></tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="person">
                        <span className="avatar">{emp.name.charAt(0).toUpperCase()}</span>
                        <span className="strong">{emp.name}</span>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td className="right">
                      <button className="btn-link danger" onClick={() => onDelete(emp)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
