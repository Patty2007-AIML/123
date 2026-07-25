"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type RecordRow = {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string | null;
  status: string;
  registered_at: string;
  started_at: string | null;
  submitted_at: string | null;
  updated_at: string;
  time_remaining_seconds: number;
  attempted_count: number;
  score: number | null;
  focus_warnings: number;
};

type Logs = {
  summary: { total: number; registered: number; inProgress: number; submitted: number };
  records: RecordRow[];
};

function dateTime(value: string | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value)) : "—";
}

function duration(seconds: number) {
  const minute = Math.floor(seconds / 60).toString().padStart(2, "0");
  const second = (seconds % 60).toString().padStart(2, "0");
  return `${minute}:${second}`;
}

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [logs, setLogs] = useState<Logs | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/logs", { cache: "no-store" });
    if (response.status === 401) {
      setLogs(null);
      return;
    }
    if (!response.ok) throw new Error("Could not load the live assessment log.");
    setLogs((await response.json()) as Logs);
  }, []);

  useEffect(() => {
    if (!logs) return;
    const poll = window.setInterval(() => void refresh().catch(() => undefined), 15000);
    return () => window.clearInterval(poll);
  }, [logs, refresh]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!response.ok) {
        setError("Incorrect passcode. Please try again.");
        return;
      }
      await refresh();
      setPasscode("");
    } catch {
      setError("Unable to open the log portal right now.");
    } finally {
      setLoading(false);
    }
  };

  if (!logs) {
    return (
      <main className="admin-login-shell">
        <img className="site-logo admin-page-logo" src="/acm-sigai-tcet-logo.jpg" alt="ACM SIGAI TCET Student Chapter" />
        <form className="admin-login-card" onSubmit={login}>
          <img className="card-logo" src="/acm-sigai-tcet-logo.jpg" alt="ACM SIGAI TCET Student Chapter" />
          <p className="eyebrow blue">TECHNOLOGIA · ROUND 1</p>
          <h1>Assessment logs</h1>
          <p>Secure coordinator access to live candidate activity, completion data, and Excel export.</p>
          <label>
            Admin passcode
            <input type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder="Enter passcode" autoFocus />
          </label>
          {error && <span className="form-error" role="alert">{error}</span>}
          <button className="primary" disabled={loading} type="submit">{loading ? "Opening logs…" : "Open live logs"} <span>→</span></button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-head">
        <div className="head-brand"><img className="head-logo" src="/acm-sigai-tcet-logo.jpg" alt="ACM SIGAI TCET Student Chapter" /><span>TECHNOLOGIA <b>/ ROUND 1</b></span></div>
        <div className="admin-actions">
          <span className="live-label"><i /> LIVE</span>
          <button className="ghost" onClick={() => void refresh().catch(() => setError("Could not refresh the log."))}>Refresh</button>
          <a className="primary export" href="/api/admin/export">Export for Excel <span>↓</span></a>
          <button className="ghost" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setLogs(null); }}>Sign out</button>
        </div>
      </header>
      <section className="admin-content">
        <div className="admin-title"><div><p className="eyebrow blue">Coordinator dashboard</p><h1>Round 1 live assessment log</h1><p>Updates automatically every 15 seconds. Export gives you the current register in an Excel-ready file.</p></div><span>{new Date().toLocaleTimeString("en-IN")}</span></div>
        {error && <p className="form-error">{error}</p>}
        <div className="stat-grid">
          <article><span>REGISTERED</span><b>{logs.summary.total}</b><small>Candidate IDs created</small></article>
          <article><span>WAITING</span><b>{logs.summary.registered}</b><small>Not started yet</small></article>
          <article><span>IN PROGRESS</span><b>{logs.summary.inProgress}</b><small>Currently attempting</small></article>
          <article><span>SUBMITTED</span><b>{logs.summary.submitted}</b><small>Completed or timed out</small></article>
        </div>
        <section className="records-panel">
          <div className="records-title"><div><h2>Candidate records</h2><p>Each row is saved when the student registers, starts, answers, leaves focus, and submits.</p></div><b>{logs.records.length} total</b></div>
          <div className="records-table-wrap"><table><thead><tr><th>Candidate</th><th>Email</th><th>Candidate ID</th><th>Status</th><th>Attempted</th><th>Time left</th><th>Score</th><th>Focus alerts</th><th>Started</th><th>Submitted</th></tr></thead><tbody>{logs.records.map((row) => <tr key={row.candidate_id}><td><b>{row.candidate_name}</b></td><td className="candidate-email">{row.candidate_email || "—"}</td><td><code className="candidate-id">{row.candidate_id}</code></td><td><em className={`status ${row.status}`}>{row.status.replace("_", " ")}</em></td><td>{row.attempted_count}/40</td><td>{duration(row.time_remaining_seconds)}</td><td>{row.score === null ? "Pending" : `${row.score}/40`}</td><td>{row.focus_warnings}</td><td>{dateTime(row.started_at)}</td><td>{dateTime(row.submitted_at)}</td></tr>)}</tbody></table>{logs.records.length === 0 && <div className="empty-log">No students have registered yet. The first Candidate ID will appear here immediately.</div>}</div>
        </section>
      </section>
    </main>
  );
}
