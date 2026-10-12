"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import AIDevelopmentTeam from "./AIDevelopmentTeam";
import ProjectDesktopLayout from "./ProjectDesktopLayout";
import ProjectApplicationPreview from "./ProjectApplicationPreview";
import Link from "next/link";
import { projects } from "@/data/projects";
import type { WorkspaceAction, WorkspaceAssignment, WorkspaceView } from "@/lib/workspace/types";

const tabs = ["Workshop", "Next Steps", "Prompt Builder", "Development Team"] as const;
type Tab = typeof tabs[number];
function Sources({ refs, revision }: { refs: string[]; revision?: number }) {
  return <details className="small workspace-sources"><summary>Context sources{revision !== undefined ? ` · revision ${revision}` : ""}</summary>{refs.length ? <ul>{refs.map(ref => <li key={ref} className="workspace-hash">{ref}</li>)}</ul> : <p>Project registry context; no discussion sources recorded.</p>}</details>;
}
export default function ProjectWorkspace({ project, name, repository, enabled }: { project: string; name: string; repository?: string; enabled: boolean }) {
  const [tab, setTab] = useState<Tab>("Workshop");
  const [focusRightKey, setFocusRightKey] = useState(0);
  const [session, setSession] = useState<{ authenticated: boolean; configured: boolean } | null>(null);
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState<WorkspaceView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [importText, setImportText] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [fact, setFact] = useState("");
  const [kind, setKind] = useState<"decision" | "requirement">("decision");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [editor, setEditor] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const initialized = useRef(false);
  const syncInFlight = useRef(false);
  const pending = useRef<WorkspaceAction | null>(null);
  const selected = workspace?.assignments.find(a => `${a.id}:v${a.version}` === selectedId) ?? null;
  const dirty = selected ? editor !== selected.content : editor.length > 0;
  const approved = selected?.status === "approved" && !dirty ? selected : null;
  const registry = projects.find(item => item.slug === project);
  function choose(assignment: WorkspaceAssignment) { setSelectedId(`${assignment.id}:v${assignment.version}`); setEditor(assignment.content); }
  const refresh = useCallback(async (reconcile = true): Promise<WorkspaceView | null> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workspace/${project}${reconcile ? "" : "?reconcile=0"}`, { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) setSession(current => current ? { ...current, authenticated: false } : null);
      if (!response.ok) throw new Error(data.error || "Project context could not be loaded.");
      setWorkspace(current => current && current.revision > data.revision ? current : data);
      setSelectedSources(current => current.filter(id => (data as WorkspaceView).messages.some(item => item.id === id)));
      if (!initialized.current) {
        initialized.current = true;
        const latest = [...data.assignments as WorkspaceAssignment[]].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.version - a.version)[0];
        if (latest) { setSelectedId(`${latest.id}:v${latest.version}`); setEditor(latest.content); }
      }
      return data;
    } catch (e) { setError(e instanceof Error ? e.message : "Project context unavailable."); return null; }
    finally { setLoading(false); }
  }, [project]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ai-team/session", { cache: "no-store", signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Owner session unavailable.");
      setSession(await response.json());
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Owner session unavailable."); });
    return () => controller.abort();
  }, []);
  useEffect(() => { if (session?.authenticated) void refresh(); }, [session?.authenticated, refresh]);
  useEffect(() => {
    if (!session?.authenticated || busy) return;
    const sync = async () => {
      if (document.visibilityState !== "visible" || syncInFlight.current) return;
      syncInFlight.current = true;
      try { await refresh(false); } finally { syncInFlight.current = false; }
    };
    const interval = setInterval(() => { void sync(); }, 30000);
    const foreground = () => { void sync(); };
    window.addEventListener("focus", foreground);
    document.addEventListener("visibilitychange", foreground);
    return () => { clearInterval(interval); window.removeEventListener("focus", foreground); document.removeEventListener("visibilitychange", foreground); };
  }, [session?.authenticated, busy, refresh]);
  async function login() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/ai-team/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign in failed.");
      setPassword(""); setSession({ authenticated: true, configured: true });
    } catch (e) { setError(e instanceof Error ? e.message : "Sign in failed."); }
    finally { setBusy(false); }
  }
  async function retryAccess() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/ai-team/session", { cache: "no-store" });
      if (!response.ok) throw new Error("Owner session unavailable.");
      setSession(await response.json());
    } catch (e) { setError(e instanceof Error ? e.message : "Owner session unavailable."); }
    finally { setBusy(false); }
  }
  async function mutate(input: Omit<WorkspaceAction, "requestId" | "revision">, retry = false, explicitRequestId?: string): Promise<boolean> {
    if (!workspace) return false;
    const body = retry && pending.current ? pending.current : { ...input, requestId: explicitRequestId ?? crypto.randomUUID(), revision: workspace.revision };
    pending.current = body;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/workspace/${project}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (response.status === 401) setSession(current => current ? { ...current, authenticated: false } : null);
      if (!response.ok) {
        if (response.status === 409) { pending.current = null; await refresh(); }
        throw new Error(data.error || "Operation failed. Saved project context is preserved.");
      }
      pending.current = null;
      setNotice(data.message || "Saved to private project context.");
      const fresh = await refresh();
      if (!data.failed && ["build_assignment", "save_assignment"].includes(body.action) && fresh) {
        const latest = [...fresh.assignments].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.version - a.version)[0];
        if (latest) choose(latest);
      }
      return !data.failed;
    } catch (e) { setError(e instanceof Error ? e.message : "Operation interrupted. Refresh to check the persisted outcome before retrying."); return false; }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/api/ai-team/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Sign out failed.");
      setWorkspace(null); setEditor(""); setSelectedId(""); setMessage(""); setFact(""); setImportText(""); setSelectedSources([]); initialized.current = false;
      setSession({ authenticated: false, configured: true });
    } catch (e) { setError(e instanceof Error ? e.message : "Sign out failed."); }
    finally { setBusy(false); }
  }
  async function deleteContext() {
    if (!workspace || deleteConfirm !== project) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/workspace/${project}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: crypto.randomUUID(), revision: workspace.revision, confirm: deleteConfirm }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Deletion failed.");
      setDeleteConfirm(""); setEditor(""); setSelectedId(""); setSelectedSources([]); pending.current = null; setNotice(data.message); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Deletion failed."); }
    finally { setBusy(false); }
  }
  function toggleSource(id: string) { setSelectedSources(current => current.includes(id) ? current.filter(ref => ref !== id) : [...current, id]); }
  const sourceRefs = selectedSources.length ? selectedSources : workspace?.messages.filter(m => m.status === "complete").slice(-40).map(m => m.id) ?? [];
  return <section className="panel project-workspace" aria-labelledby="workspace-heading">
    <div className="section-heading"><div><div className="eyebrow">Connected project context</div><h2 id="workspace-heading">{name} workspace</h2></div>{session?.authenticated && <button className="button secondary-button" disabled={busy} onClick={() => void signOut()}>Sign out</button>}</div>
    <ProjectDesktopLayout showRight={tab === "Development Team"} focusRightKey={focusRightKey} left={<>
      <div className="eyebrow">Projects</div><nav className="desktop-project-links" aria-label="Project shortcuts">{projects.map(item => <Link key={item.slug} href={`/projects/${item.slug}`} aria-current={item.slug === project ? "page" : undefined}>{item.name}</Link>)}</nav>
      <h3>Saved discussions</h3>{!session?.authenticated ? <p className="small">Sign in to load private history.</p> : !workspace?.messages.length ? <p className="small">No saved discussions loaded.</p> : <div className="desktop-history">{workspace.messages.filter(m => m.role === "user").slice(-16).reverse().map(item => <button className="button secondary-button" key={item.id} onClick={() => { setTab("Workshop"); setSelectedSources([item.id]); }}>{item.content.slice(0, 95)}{item.content.length > 95 ? "…" : ""}<span className="small">{new Date(item.createdAt).toLocaleDateString()}</span></button>)}</div>}
    </>} right={session?.authenticated && workspace ? <>
      <div className="eyebrow">Activity and approvals</div>
      {workspace.development.map(item => <article className="workspace-message" key={item.requestId}><strong>Saved handoff: {item.outcome}</strong><p className="small workspace-hash">Request {item.requestId} · observed {new Date(item.observedAt).toLocaleString()}</p>{item.issue && repository && <a href={`https://github.com/${repository}/issues/${item.issue}`} target="_blank" rel="noreferrer">GitHub request #{item.issue}</a>}{item.error && <p role="status">{item.error}</p>}{item.outcome === "uncertain" && <p className="small">Automatic replay is blocked. Reconcile the existing request before recovery.</p>}</article>)}
      <AIDevelopmentTeam key={approved ? `${approved.id}:v${approved.version}:${approved.hash}` : "unapproved"} project={project} repository={repository} enabled={enabled && workspace.capabilities.development} assignment={approved} submit={requestId => approved ? mutate({ action: "submit_assignment", assignmentId: approved.id, version: approved.version, hash: approved.hash }, false, requestId) : Promise.resolve(false)} onRefresh={async () => { await refresh(); }} />
    </> : <><div className="eyebrow">Development activity</div><h3>AI Development Team</h3><p className="small">Sign in to see saved requests, GitHub activity, build results, QA findings, and approval gates.</p><p className="small">{enabled ? "TriDrone is the first development target. Server configuration and an approved assignment are required." : "Development is awaiting repository onboarding. Workshop and assignment drafting are available after workspace setup."}</p><p className="small">Merging, deploying, and publishing require your separate approval.</p></>}>
    <div className="workspace-tabs" role="tablist" aria-label="Project workspace views">{tabs.map((label, index) => <button key={label} id={`workspace-tab-${label.replaceAll(" ", "-")}`} className={`button ${tab === label ? "primary-button" : "secondary-button"}`} role="tab" tabIndex={tab === label ? 0 : -1} aria-selected={tab === label} aria-controls="workspace-view" onClick={() => { setTab(label); if (label === "Development Team") setFocusRightKey(value => value + 1); }} onKeyDown={e => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      e.preventDefault(); const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      setTab(tabs[next]); if (tabs[next] === "Development Team") setFocusRightKey(value => value + 1);
      document.getElementById(`workspace-tab-${tabs[next].replaceAll(" ", "-")}`)?.focus();
    }}>{label}</button>)}</div>
    <details className="workspace-specifications"><summary>Project specifications and companion links</summary><p className="small">{registry?.currentStatus}</p><p className="small">Next registered move: {registry?.nextStep}</p><div className="ai-actions">{registry?.ssotUrl && <a className="button secondary-button" href={registry.ssotUrl} target="_blank" rel="noreferrer">Read project specifications</a>}{repository && <a className="button secondary-button" href={`https://github.com/${repository}`} target="_blank" rel="noreferrer">Browse source and README</a>}{registry?.app && <a className="button secondary-button" href={registry.app} target="_blank" rel="noreferrer">Open application preview</a>}</div><p className="small">Existing Resume in ChatGPT remains available above for your external companion conversation. Workshop history is stored separately.</p><ProjectApplicationPreview name={name} registeredUrl={registry?.app} selfProject={project === "solutions-hq"} /></details>
    {!session && !error && <p role="status">Checking owner access…</p>}
    {(!session && error || session && !session.configured) && <button className="button secondary-button" disabled={busy} onClick={() => void retryAccess()}>Check owner access again</button>}
    {session && !session.configured && <p role="status">Owner access is not configured on this server. Configure owner authentication, a private database, and conversational AI to activate this workspace.</p>}
    {session?.configured && !session.authenticated && <form className="workspace-form" onSubmit={e => { e.preventDefault(); void login(); }}><label htmlFor="workspace-password">Owner password</label><input id="workspace-password" type="password" autoComplete="current-password" required maxLength={512} value={password} onChange={e => setPassword(e.target.value)} /><button className="button" disabled={busy}>Sign in to private workspace</button></form>}
    {session?.authenticated && <>
      <div className="workspace-toolbar"><p className="small">{workspace ? `Private saved context · revision ${workspace.revision}` : "Private context unavailable"}{loading ? " · refreshing…" : ""}</p><button className="button secondary-button" disabled={busy || loading} onClick={() => { setError(""); void refresh(); }}>Refresh context</button></div>
      {workspace && !workspace.capabilities.ai && <p role="status">Conversational AI is not configured. Saved history and manual assignment editing remain available; AI responses cannot be generated yet.</p>}
      {workspace && <div id="workspace-view" role="tabpanel" aria-labelledby={`workspace-tab-${tab.replaceAll(" ", "-")}`} aria-busy={busy}>
        {tab === "Workshop" && <>
          <h3>Workshop</h3><p className="small">Brainstorm and solve problems using this project's saved context. Workshop cannot initiate development, merge, deploy, or publish. Select discussion messages to carry into Prompt Builder; accepted facts are included automatically.</p>
          <div className="workspace-transcript" aria-label="Saved workshop discussion">{workspace.messages.length === 0 ? <p className="small">Start a discussion or import a summary from a prior conversation.</p> : workspace.messages.map(item => <article key={item.id} className={`workspace-message workspace-message-${item.role}`}>
            <div className="workspace-message-heading"><strong>{item.role === "user" ? "You" : "Project assistant"}</strong><span className="small">{item.status} · {new Date(item.createdAt).toLocaleString()}</span></div><p className="workspace-copy">{item.content || "Response is incomplete."}</p>
            {item.status !== "complete" && <p role="status">{item.error || "This operation is pending or interrupted. Refresh to check its saved outcome; your discussion is preserved."}</p>}
            <label className="workspace-source-choice"><input type="checkbox" checked={selectedSources.includes(item.id)} disabled={!selectedSources.includes(item.id) && selectedSources.length >= 50} onChange={() => toggleSource(item.id)} />Use this message in Prompt Builder</label><Sources refs={item.sourceRefs} revision={item.contextRevision} />
          </article>)}</div>
          <form className="workspace-form" onSubmit={async e => { e.preventDefault(); if (await mutate({ action: "workshop", content: message })) setMessage(""); }}><label htmlFor="workspace-message">Discuss the project</label><textarea id="workspace-message" rows={4} required minLength={2} maxLength={12000} value={message} onChange={e => setMessage(e.target.value)} placeholder="Explore a decision, describe a problem, or work through an idea." /><button className="button" disabled={busy || !workspace.capabilities.ai}>{busy ? "Saving and thinking…" : "Send to Workshop"}</button></form>
          <button className="button secondary-button" disabled={busy} onClick={() => setTab("Prompt Builder")}>Build an assignment from this discussion</button>
          <details className="workspace-section"><summary>Save an accepted decision or requirement</summary><p className="small">AI suggestions become accepted project facts only when you explicitly save them here.</p><form className="workspace-form" onSubmit={async e => { e.preventDefault(); if (await mutate({ action: "accept_fact", kind, content: fact, sourceRefs })) setFact(""); }}><label htmlFor="workspace-fact-kind">Fact type</label><select id="workspace-fact-kind" value={kind} onChange={e => setKind(e.target.value as typeof kind)}><option value="decision">Decision</option><option value="requirement">Requirement</option></select><label htmlFor="workspace-fact">Accepted fact</label><textarea id="workspace-fact" rows={3} required maxLength={4000} value={fact} onChange={e => setFact(e.target.value)} /><button className="button" disabled={busy}>Save accepted fact</button></form>{workspace.facts.map(item => <article className="workspace-message" key={item.id}><strong>{item.kind}</strong><p className="workspace-copy">{item.content}</p><Sources refs={item.sourceRefs} /></article>)}</details>
          <details className="workspace-section"><summary>Import a prior discussion summary</summary><p className="small">External ChatGPT history is not automatically imported. Paste only the prior summary you want saved privately. Imports cannot authorize engineering work.</p><form className="workspace-form" onSubmit={async e => { e.preventDefault(); if (await mutate({ action: "import", content: importText, sourceLabel })) { setImportText(""); setSourceLabel(""); } }}><label htmlFor="workspace-import-source">Source name or reference</label><input id="workspace-import-source" required maxLength={300} value={sourceLabel} onChange={e => setSourceLabel(e.target.value)} /><label htmlFor="workspace-import">Prior summary</label><textarea id="workspace-import" required rows={5} maxLength={14000} value={importText} onChange={e => setImportText(e.target.value)} /><button className="button" disabled={busy}>Save imported summary</button></form></details>
        </>}
        {tab === "Next Steps" && <><h3>Next Steps</h3><p className="small">Recommendations use accepted facts, saved discussions, assignments, and available development evidence. They do not start work.</p><p className="small">Development evidence: {workspace.developmentFreshness || "No fresh GitHub evidence has been confirmed. Refresh development evidence before relying on readiness."}</p><button className="button" disabled={busy || !workspace.capabilities.ai} onClick={() => void mutate({ action: "next_steps" })}>Generate recommendations from current context</button>{workspace.recommendations.map(item => <article className="workspace-message" key={item.id}><p className="small">{item.status} · {new Date(item.createdAt).toLocaleString()}{` · used revision ${item.contextRevision}; current revision ${workspace.revision}`}</p><p className="workspace-copy">{item.content || item.error || "Recommendation incomplete. Refresh to check saved progress."}</p><Sources refs={item.sourceRefs} revision={item.contextRevision} /></article>)}</>}
        {tab === "Prompt Builder" && <><h3>Prompt Builder</h3><p className="small">Turn your discussion into a reviewed assignment: objective, repository, context, scope and exclusions, constraints, acceptance criteria, tests, and unresolved questions. Saving a revision creates an immutable version and revokes prior approval.</p><p className="small">{selectedSources.length ? `${selectedSources.length} selected discussion sources` : "Up to 40 recent saved discussion messages"} and accepted facts are carried automatically. Repository: {repository || "Not onboarded; assignment drafting is available."}</p><button className="button" disabled={busy || dirty || !workspace.capabilities.ai} onClick={() => void mutate({ action: "build_assignment", sourceRefs })}>Generate assignment from discussion</button>
          {workspace.assignments.length > 0 && <label className="workspace-form" htmlFor="workspace-version">Saved assignment version<select id="workspace-version" disabled={busy} value={selectedId} onChange={e => { const found = workspace.assignments.find(a => `${a.id}:v${a.version}` === e.target.value); if (found) choose(found); }}>{workspace.assignments.map(a => <option key={`${a.id}:v${a.version}`} value={`${a.id}:v${a.version}`}>Version {a.version} · {a.status}</option>)}</select></label>}
          <form className="workspace-form" onSubmit={e => { e.preventDefault(); void mutate({ action: "save_assignment", assignmentId: selected?.id, version: selected?.version, content: editor, sourceRefs }); }}><label htmlFor="workspace-assignment">Editable assignment</label><textarea id="workspace-assignment" disabled={busy} rows={18} required minLength={10} maxLength={14000} value={editor} onChange={e => setEditor(e.target.value)} placeholder={"## Objective\n\n## Repository\n\n## Context\n\n## Scope\n\n## Exclusions\n\n## Constraints\n\n## Acceptance criteria\n\n## Tests\n\n## Unresolved questions\n"} /><button className="button" disabled={busy || !dirty}>{selected ? "Save as new version" : "Save assignment draft"}</button></form>
          {dirty && <p role="status">Unsaved edits are not approved. Save a new version and review it before development submission.</p>}{selected && <><p className="small workspace-hash">Version {selected.version} · {selected.status} · SHA-256 {selected.hash}</p><Sources refs={selected.sourceRefs} revision={selected.contextRevision} /><button className="button" disabled={busy || dirty || selected.status !== "draft"} onClick={() => void mutate({ action: "approve_assignment", assignmentId: selected.id, version: selected.version, hash: selected.hash })}>Approve this exact assignment version</button>{approved && <button className="button primary-button" onClick={() => setTab("Development Team")}>Review GitHub handoff</button>}</>}
        </>}
        {tab === "Development Team" && <><h3>Review the development handoff</h3><p>Development activity appears beside your workspace on desktop and below this view on mobile.</p><p className="small">{approved ? `Assignment v${approved.version} is approved. Review the exact GitHub issue in Development Team before sending it for PM planning.` : "Review and approve a saved assignment in Prompt Builder first. A separate PM scope approval is required before implementation."}</p><button className="button secondary-button" onClick={() => setTab("Prompt Builder")}>Review assignment in Prompt Builder</button></>}
      </div>}
      {workspace && <details className="workspace-section"><summary>Private context export and deletion</summary><p className="small">Export includes saved private discussions, accepted facts, assignments, and evidence. Deletion removes private context here; existing GitHub issues and PRs remain, and non-sensitive dispatch records prevent replay.</p><a className="button secondary-button" href={`/api/workspace/${project}?export=1`} download={`${project}-workspace.json`}>Export private project context</a><form className="workspace-form" onSubmit={e => { e.preventDefault(); void deleteContext(); }}><label htmlFor="workspace-delete">To delete private context, type {project}</label><input id="workspace-delete" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} autoComplete="off" /><button className="button" disabled={busy || deleteConfirm !== project}>Delete this project's private context</button></form></details>}
    </>}
    {notice && <p role="status">{notice}</p>}{error && <div role="alert"><p>{error}</p>{pending.current && <button className="button secondary-button" disabled={busy} onClick={() => void mutate(pending.current!, true)}>Reconcile interrupted operation</button>}<p className="small">Saved records remain available after refresh. A repeated operation checks its saved outcome; it does not silently start a second engineering run.</p></div>}
    </ProjectDesktopLayout>
  </section>;
}
