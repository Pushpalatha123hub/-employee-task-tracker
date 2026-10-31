import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="alert">Can't load the dashboard: {error}</p>;
  if (!stats) return <p className="muted">Loading…</p>;

  const done = stats.total_tasks ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0;

  const cards = [
    { label: "Employees", value: stats.total_employees },
    { label: "Total tasks", value: stats.total_tasks },
    { label: "Completed", value: stats.completed_tasks, tone: "done" },
    { label: "Pending", value: stats.pending_tasks, tone: "pending" },
  ];

  return (
    <>
      <header className="page-head">
        <h1>Dashboard</h1>
        <p className="muted">Where the team stands right now.</p>
      </header>

      <section className="stats">
        {cards.map((c) => (
          <div key={c.label} className={`stat ${c.tone || ""}`}>
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-row">
          <h2>Overall progress</h2>
          <span className="muted">
            {stats.completed_tasks} of {stats.total_tasks} tasks completed · {stats.in_progress_tasks} in progress
          </span>
        </div>
        <div className="bar" role="progressbar" aria-valuenow={done} aria-valuemin="0" aria-valuemax="100">
          <div className="bar-fill" style={{ width: `${done}%` }} />
        </div>
      </section>
    </>
  );
}
