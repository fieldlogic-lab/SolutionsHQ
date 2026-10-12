"use client";
import { useCallback, useEffect, useState } from "react";
import { publicRequestBody } from "@/lib/ai-team/config";
type TeamRequest = { number: number; title: string; url: string; plan: { commentId: number; hash: string; body: string; url: string } | null; latest: { status?: string; summary?: string; buildStatus?: string } | null; runs: { id: number; html_url: string; display_title: string; status: string; conclusion: string | null }[]; pullRequest: { url: string; number: number; headSha: string; qa: { status?: string; findings?: unknown; summary?: string } | null } | null; checks: { id: number; name: string; status: string; conclusion: string | null; html_url: string }[] };
export type ApprovedAssignment = { id: string; version: number; hash: string; content: string; status: string };
export default function AIDevelopmentTeam({ project, repository, enabled, assignment, submit, onRefresh }: { project: string; repository?: string; enabled: boolean; assignment: ApprovedAssignment | null; submit: (requestId: string) => Promise<boolean>; onRefresh: () => Promise<void> }) {
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [requestId] = useState(() => crypto.randomUUID());
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/ai-team/${project}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Development status unavailable.");
      setRequests(body.requests); setLoaded(true); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Status unavailable."); }
  }, [project]);
  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const interval = setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 30000);
    return () => clearInterval(interval);
  }, [enabled, refresh]);
  async function submitAssignment() {
    if (!consent || !assignment || assignment.status !== "approved") return;
    setBusy(true); setError(""); setMessage("");
    try { if (await submit(requestId)) { setConsent(false); setMessage("Assignment handoff saved. Review the tracked workflow for execution confirmation."); await refresh(); } }
    finally { setBusy(false); }
  }
  async function approvePlan(item: TeamRequest) {
    if (!item.plan) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/ai-team/${project}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve", issue: item.number, planCommentId: item.plan.commentId, planHash: item.plan.hash }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "PM approval failed.");
      setMessage(body.message); await Promise.all([refresh(), onRefresh()]);
    } catch (e) { setError(e instanceof Error ? e.message : "PM approval failed."); }
    finally { setBusy(false); }
  }
  return <div className="ai-team workspace-development">
    <div className="eyebrow">Project Manager → Developer → Independent QA</div><h3>AI Development Team</h3>
    <p className="small">{repository ? <>Repository: <a href={`https://github.com/${repository}`} target="_blank" rel="noreferrer">{repository}</a>. </> : "No development repository is registered. "}Merging, deploying, and publishing require your separate approval.</p>
    {!enabled ? <p role="status">Development is unavailable until repository onboarding and server GitHub access are configured. Workshop, Next Steps, and Prompt Builder remain available.</p> : <>
      <h4>1. Approve an assignment in Prompt Builder</h4>
      {!assignment ? <p className="small">Review and approve a saved assignment version in Prompt Builder before sending it here.</p> : <>
        <p>Assignment v{assignment.version} · {assignment.status}</p>
        <details open><summary>Exact issue shared with GitHub</summary><p className="small">Title: [AI Development] {assignment.content.split("\n")[0].slice(0, 100)}</p><pre className="ai-plan">{publicRequestBody(requestId, project, assignment.content)}</pre></details>
        <p className="small">Assignment SHA-256: <span className="workspace-hash">{assignment.hash}</span>. This content will be included in an issue in {repository}; repository viewers can read it. Private workshop messages are not automatically published.</p>
        <label className="workspace-consent"><input type="checkbox" checked={consent} disabled={busy || assignment.status !== "approved"} onChange={e => setConsent(e.target.checked)} />I reviewed this exact assignment and approve sharing it with the target GitHub repository for PM planning.</label>
        <button className="button primary-button" disabled={busy || !consent || assignment.status !== "approved"} onClick={() => void submitAssignment()}>{busy ? "Sending…" : "Submit approved assignment for PM planning"}</button>
      </>}
      <h4>2. Review the PM plan before implementation</h4><p className="small">Assignment approval authorizes planning. The PM scope requires a separate approval before Developer and independent QA work begins.</p>
      <button className="button secondary-button" disabled={busy} onClick={() => { void refresh(); void onRefresh(); }}>Refresh development evidence</button>
      {!loaded && !error && <p role="status">Loading development status…</p>}{loaded && requests.length === 0 && <p className="small">No development requests are recorded yet.</p>}
      <p className="small">Status refreshes every 30 seconds while visible. Up to 10 recent requests are shown.</p>
      {requests.map(item => <article key={item.number} className="ai-request-card">
        <h4><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h4><p>{item.latest?.status ?? (item.runs.length ? "Workflow received — waiting for PM update" : "Request saved — agent execution not yet confirmed")}</p>
        {item.latest?.summary && <p>{item.latest.summary}</p>}{item.latest?.buildStatus && <p>Workflow build: {item.latest.buildStatus}</p>}
        {item.plan && <details><summary>Review PM scope and acceptance criteria</summary><pre className="ai-plan">{item.plan.body}</pre><a href={item.plan.url} target="_blank" rel="noreferrer">View original plan</a></details>}
        {item.plan && !item.runs.some(r => r.display_title.includes("develop")) && <button className="button" disabled={busy} onClick={() => void approvePlan(item)}>Approve this PM scope and start development</button>}
        {item.runs.map(run => <p className="small" key={run.id}><a href={run.html_url} target="_blank" rel="noreferrer">{run.display_title}</a>: {run.conclusion ?? run.status}</p>)}
        {item.pullRequest && <><a href={item.pullRequest.url} target="_blank" rel="noreferrer">Review pull request #{item.pullRequest.number}</a><p className="small workspace-hash">Current commit: {item.pullRequest.headSha}</p><p>Independent QA: {item.pullRequest.qa?.status ?? "No QA result for the current commit"}</p>{item.pullRequest.qa && <pre className="ai-plan">{item.pullRequest.qa.summary}{"\n"}{JSON.stringify(item.pullRequest.qa.findings, null, 2)}</pre>}</>}
        {item.checks.map(check => <p className="small" key={check.id}><a href={check.html_url} target="_blank" rel="noreferrer">{check.name}</a>: {check.conclusion ?? check.status}</p>)}
      </article>)}
    </>}{message && <p role="status">{message}</p>}{error && <p role="alert">{error} <button className="button secondary-button" onClick={() => void refresh()}>Retry status</button></p>}
  </div>;
}
