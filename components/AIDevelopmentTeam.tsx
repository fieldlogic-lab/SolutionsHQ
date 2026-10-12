"use client";
import { useCallback, useEffect, useState } from "react";
type TeamRequest = { number: number; title: string; url: string; plan: { commentId: number; hash: string; body: string; url: string } | null; latest: { status?: string; summary?: string; buildStatus?: string } | null; runs: { id: number; html_url: string; display_title: string; status: string; conclusion: string | null }[]; pullRequest: { url: string; number: number; headSha: string; qa: { status?: string; findings?: unknown; summary?: string } | null } | null; checks: { id: number; name: string; status: string; conclusion: string | null; html_url: string }[] };
export default function AIDevelopmentTeam({ project, repository, enabled }: { project: string; repository: string; enabled: boolean }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [requestId, setRequestId] = useState("");
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/ai-team/${project}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setRequests(body.requests); setStatusError("");
    } catch (e) { setStatusError(e instanceof Error ? e.message : "Status unavailable."); }
  }, [project]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/ai-team/session", { cache: "no-store" }).then(r => r.json()).then(body => { if (!cancelled) { setAuthenticated(body.authenticated); setConfigured(body.configured); } }).catch(() => { if (!cancelled) setError("Owner session unavailable."); });
    return () => { cancelled = true; };
  }, [enabled]);
  useEffect(() => {
    if (!authenticated) return;
    void refresh();
    const interval = setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 30000);
    return () => clearInterval(interval);
  }, [authenticated, refresh]);
  async function act(path: string, body: unknown) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage(result.message ?? "Signed in.");
      if (path.endsWith("session")) { setAuthenticated(true); setPassword(""); }
      else { await refresh(); if (body && (body as { action?: string }).action === "submit") { setText(""); setRequestId(""); } }
    } catch (e) { setError(e instanceof Error ? e.message : "Request failed."); }
    finally { setBusy(false); }
  }
  return <section className="panel ai-team" aria-labelledby="ai-team-heading">
    <div className="eyebrow">Project Manager → Developer → Independent QA</div>
    <h2 id="ai-team-heading">AI Development Team</h2>
    <p className="small">Repository: <a href={`https://github.com/${repository}`} target="_blank" rel="noreferrer">{repository}</a>. Merging, deploying, and publishing require your separate approval.</p>
    {!enabled ? <p className="small">This project is awaiting workflow onboarding. TriDrone is the first pilot.</p> : <>
      {!configured && <p role="status">Owner access needs server configuration. See the AI team setup guide.</p>}
      {!authenticated && configured && <form onSubmit={e => { e.preventDefault(); void act("/api/ai-team/session", { password }); }}>
        <label htmlFor="ai-password">Owner password</label>
        <input id="ai-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={512} />
        <button className="button" disabled={busy}>Sign in</button>
      </form>}
      {authenticated && <>
        <form onSubmit={e => { e.preventDefault(); const id = requestId || crypto.randomUUID(); setRequestId(id); void act(`/api/ai-team/${project}`, { action: "submit", requestId: id, text }); }}>
          <label htmlFor="ai-request">Describe the development work</label>
          <textarea id="ai-request" rows={5} minLength={10} maxLength={10000} value={text} onChange={e => setText(e.target.value)} required placeholder="Describe the change, expected behavior, and any constraints." disabled={busy} />
          <button className="button" disabled={busy}>Submit for PM planning</button>
        </form>
        <div className="ai-actions"><button className="button secondary-button" disabled={busy} onClick={() => void refresh()}>Refresh status</button><button className="button secondary-button" disabled={busy} onClick={async () => { await fetch("/api/ai-team/session", { method: "DELETE" }); setAuthenticated(false); setRequests([]); }}>Sign out</button></div>
        <p className="small">Status refreshes every 30 seconds while this page is visible. Up to 10 recent requests are shown.</p>
        {requests.map(item => <article key={item.number} className="ai-request-card">
          <h3><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h3>
          <p>{item.latest?.status ?? (item.runs.length ? "Workflow received — waiting for PM update" : "Request saved — agent execution not yet confirmed")}</p>
          {item.latest?.summary && <p>{item.latest.summary}</p>}{item.latest?.buildStatus && <p>Workflow build: {item.latest.buildStatus}</p>}
          {item.plan && <details><summary>Review PM scope and acceptance criteria</summary><pre className="ai-plan">{item.plan.body}</pre><a href={item.plan.url} target="_blank" rel="noreferrer">View original plan</a></details>}
          {item.plan && !item.runs.some(r => r.display_title.includes("develop")) && <button className="button" disabled={busy} onClick={() => void act(`/api/ai-team/${project}`, { action: "approve", issue: item.number, planCommentId: item.plan!.commentId, planHash: item.plan!.hash })}>Approve this plan and start development</button>}
          {item.runs.map(run => <p className="small" key={run.id}><a href={run.html_url} target="_blank" rel="noreferrer">{run.display_title}</a>: {run.conclusion ?? run.status}</p>)}
          {item.pullRequest && <><a href={item.pullRequest.url} target="_blank" rel="noreferrer">Review pull request #{item.pullRequest.number}</a><p className="small">Current commit: {item.pullRequest.headSha}</p><p>Independent QA: {item.pullRequest.qa?.status ?? "No QA result for the current commit"}</p>{item.pullRequest.qa && <pre className="ai-plan">{item.pullRequest.qa.summary}{"\n"}{JSON.stringify(item.pullRequest.qa.findings, null, 2)}</pre>}</>}
          {item.checks.map(check => <p className="small" key={check.id}><a href={check.html_url} target="_blank" rel="noreferrer">{check.name}</a>: {check.conclusion ?? check.status}</p>)}
        </article>)}
      </>}
      {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}{statusError && <p role="alert">{statusError}</p>}
    </>}
  </section>;
}


