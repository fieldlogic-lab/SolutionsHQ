import { randomUUID } from "node:crypto";
import { teamProjects, parseRequest } from "@/lib/ai-team/config";
import { inspect, listIssues, submit } from "@/lib/ai-team/github";
import { converse, type ConversationMode } from "./ai";
import { assembleContext, projectRegistry, repositoryContext, validSources } from "./context";
import { canonicalJson, contentHash, event, ownerId, WorkspaceError, WorkspaceStore } from "./store";
import type { WorkspaceAction, WorkspaceAssignment, WorkspaceView } from "./types";
const stamp = () => new Date().toISOString();
const dependencies = { ai: converse, repository: repositoryContext, submit, inspect, listIssues };
export class WorkspaceService {
  store: WorkspaceStore;
  private deps: typeof dependencies;
  constructor(store: WorkspaceStore, deps = dependencies) { this.store = store; this.deps = deps; }
  async view(project: string, reconcile = true): Promise<WorkspaceView> {
    projectRegistry(project);
    if (reconcile) await this.reconcile(project);
    const record = await this.store.read(project);
    return { ...record.state, project, revision: record.revision, capabilities: { database: true, ai: Boolean(process.env.OPENAI_API_KEY && process.env.HQ_AI_MODEL), development: Boolean(Object.hasOwn(teamProjects, project) && teamProjects[project].enabled && process.env.AI_TEAM_GITHUB_TOKEN) }, developmentFreshness: record.state.development.length ? "Timestamped GitHub observations; only current full-SHA build and QA evidence is valid." : "No development evidence has been verified." };
  }
  async act(project: string, input: WorkspaceAction) {
    projectRegistry(project);
    if (!["workshop", "next_steps", "build_assignment", "save_assignment", "approve_assignment", "accept_fact", "import", "submit_assignment"].includes(input.action)) throw new WorkspaceError("Unknown workspace action.");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId) || !Number.isSafeInteger(input.revision) || input.revision < 0) throw new WorkspaceError("A valid request UUID and project revision are required.");
    if (input.content !== undefined && (typeof input.content !== "string" || input.content.length > 14000)) throw new WorkspaceError("Content exceeds the 14,000 character limit.");
    if (input.sourceRefs !== undefined && (!Array.isArray(input.sourceRefs) || input.sourceRefs.length > 50 || input.sourceRefs.some(s => typeof s !== "string" || s.length > 300))) throw new WorkspaceError("Invalid source references.");
    if (["workshop", "next_steps", "build_assignment"].includes(input.action)) return this.runAI(project, input);
    const result = await this.store.mutate(project, input.requestId, input.revision, input, async (record, sql) => {
      this.capacity(record.state);
      const allowed = validSources(project, record);
      const sourceRefs = input.sourceRefs?.length ? input.sourceRefs : ["owner:manual"];
      if (sourceRefs.some(s => !allowed.has(s))) throw new WorkspaceError("A selected source no longer belongs to this project.");
      const content = input.content?.trim() ?? "";
      if (input.action === "accept_fact") {
        if (!["decision", "requirement"].includes(input.kind ?? "") || content.length < 3 || content.length > 4000) throw new WorkspaceError("Save a decision or requirement between 3 and 4,000 characters.");
        const fact = { id: randomUUID(), kind: input.kind!, content, sourceRefs, createdAt: stamp() };
        record.state.facts.push(fact); record.state.events.push(event("owner_accepted_fact", [fact.id, ...sourceRefs]));
        return { message: "Saved as owner-accepted project context. Repository files were not changed.", fact };
      }
      if (input.action === "import") {
        if (content.length < 3 || typeof input.sourceLabel !== "string" || !input.sourceLabel.trim() || input.sourceLabel.length > 300) throw new WorkspaceError("Provide imported text and a short source label.");
        const imported = { id: randomUUID(), role: "user" as const, content: `Imported context — ${input.sourceLabel.trim()}\n\n${content}`, status: "complete" as const, createdAt: stamp(), sourceRefs: ["owner:manual"], operationId: input.requestId, contextRevision: record.revision };
        record.state.messages.push(imported); record.state.events.push(event("untrusted_context_imported", [imported.id]));
        return { message: "Imported as untrusted discussion context. No decision, requirement, or development permission was accepted.", imported };
      }
      if (input.action === "save_assignment") {
        if (content.length < 10) throw new WorkspaceError("Assignment needs at least 10 characters.");
        const prior = input.assignmentId ? record.state.assignments.filter(a => a.id === input.assignmentId).at(-1) : undefined;
        if (input.assignmentId && (!prior || prior.version !== input.version)) throw new WorkspaceError("Assignment version changed. Refresh before editing.", 409);
        if (prior?.status === "approved" || prior?.status === "submitted") prior.status = "revoked";
        const assignment: WorkspaceAssignment = { id: prior?.id ?? randomUUID(), version: (prior?.version ?? 0) + 1, content, hash: contentHash(content), status: "draft", sourceRefs, contextRevision: record.revision, contextSnapshot: assembleContext(project, record, { status: "unavailable", reason: "Manual draft; baseline must be reviewed before engineering.", sources: [] }), createdAt: stamp() };
        record.state.assignments.push(assignment); record.state.events.push(event("assignment_version_saved", [`${assignment.id}:v${assignment.version}`, ...sourceRefs]));
        return { message: "Saved a new draft version. Previous approval cannot authorize this version.", assignment };
      }
      const assignment = record.state.assignments.filter(a => a.id === input.assignmentId).at(-1);
      if (!assignment || assignment.version !== input.version || assignment.hash !== input.hash || assignment.hash !== contentHash(assignment.content)) throw new WorkspaceError("The exact current assignment version and hash must be reviewed.", 409);
      if (input.action === "approve_assignment") {
        if (assignment.status !== "draft") throw new WorkspaceError("Only the current draft can be approved.", 409);
        validateAssignment(assignment.content, Object.hasOwn(teamProjects, project) ? teamProjects[project].repo : undefined);
        assignment.status = "approved"; assignment.approvedAt = stamp(); record.state.events.push(event("assignment_exact_version_approved", [`${assignment.id}:v${assignment.version}`]));
        return { message: "Approved this exact assignment snapshot. Development has not started.", assignment };
      }
      const config = Object.hasOwn(teamProjects, project) ? teamProjects[project] : undefined;
      if (!config?.enabled) throw new WorkspaceError("Development is not onboarded for this project's repository.");
      if (assignment.status !== "approved" || !assignment.approvedAt) throw new WorkspaceError("Approve the exact assignment before submitting it to Development.", 409);
      if (!process.env.AI_TEAM_GITHUB_TOKEN) throw new WorkspaceError("AI team GitHub access is not configured.", 503);
      await sql.query("INSERT INTO hq_dispatch_tombstone(owner_id,project,request_id,outcome) VALUES($1,$2,$3::uuid,'pending')", [ownerId, project, input.requestId]);
      assignment.status = "submitted"; assignment.submittedRequestId = input.requestId;
      record.state.development.push({ requestId: input.requestId, outcome: "pending", observedAt: stamp() });
      record.state.events.push(event("development_dispatch_intent", [`${assignment.id}:v${assignment.version}`]));
      return { message: "Approved assignment dispatch intent saved.", assignment, dispatchIntent: true };
    });
    if (input.action === "submit_assignment" && !result.replay && "dispatchIntent" in result) {
      const assignment = result.assignment as WorkspaceAssignment;
      let outcome = "uncertain"; let issue: number | undefined;
      try {
        const dispatched = await this.deps.submit(teamProjects[project].repo, project, input.requestId, assignment.content);
        issue = dispatched.issue.number; outcome = dispatched.duplicate ? "uncertain" : "confirmed";
      } catch { /* A failed response can still have created the issue or run. Never automatically retry. */ }
      await this.store.db.query("UPDATE hq_dispatch_tombstone SET outcome=$3,issue_number=$4,updated_at=now() WHERE owner_id=$1 AND request_id=$2::uuid", [ownerId, input.requestId, outcome, issue ?? null]);
      await this.store.finish(project, input.requestId, state => { const link = state.development.find(d => d.requestId === input.requestId); if (link) { link.outcome = outcome; link.issue = issue; link.observedAt = stamp(); if (outcome === "uncertain") link.error = "Dispatch was not confirmed. Inspect/reconcile the existing UUID before any manual recovery; automatic replay is blocked."; } });
      return { ...result, dispatchOutcome: outcome, issue, message: outcome === "confirmed" ? "Assignment saved and PM workflow dispatched; waiting for runner evidence." : "Dispatch outcome is uncertain. No automatic retry will occur. Refresh to reconcile existing GitHub evidence." };
    }
    return result;
  }
  private capacity(state: import("./types").WorkspaceState) {
    if (state.messages.length >= 500 || state.assignments.length >= 100 || state.facts.length >= 200 || state.events.length >= 2000 || JSON.stringify(state).length > 2000000) throw new WorkspaceError("Pilot context retention limit reached. Export and curate/delete context before adding more.", 409);
  }
  private async runAI(project: string, input: WorkspaceAction) {
    await this.reconcile(project);
    const repository = await this.deps.repository(project);
    let context: ReturnType<typeof assembleContext> | undefined;
    const result = await this.store.mutate(project, input.requestId, input.revision, input, record => {
      this.capacity(record.state);
      const today = stamp().slice(0, 10);
      const used = record.state.events.filter(e => e.type === "ai_started" && e.createdAt.startsWith(today)).length;
      const dailyLimit = Math.max(1, Math.min(100, Number(process.env.HQ_AI_DAILY_LIMIT) || 40));
      if (used >= dailyLimit) throw new WorkspaceError("Project daily conversational request limit reached.", 429);
      const allowed = validSources(project, record);
      const sourceRefs = input.sourceRefs ?? [];
      if (sourceRefs.some(s => !allowed.has(s))) throw new WorkspaceError("Selected discussion sources belong to another project or no longer exist.");
      const content = input.content?.trim() || (input.action === "next_steps" ? "Recommend the next practical steps." : input.action === "build_assignment" ? "Build an editable assignment from the selected discussion and accepted facts." : "");
      if (!content) throw new WorkspaceError("Enter a workshop message.");
      context = assembleContext(project, record, repository, sourceRefs);
      record.state.messages.push({ id: randomUUID(), role: "user", content, status: "complete", createdAt: stamp(), sourceRefs, operationId: input.requestId, contextRevision: record.revision });
      const target = { id: randomUUID(), content: "", status: "pending" as const, createdAt: stamp(), sourceRefs, operationId: input.requestId, contextRevision: record.revision };
      if (input.action === "workshop") record.state.messages.push({ ...target, role: "assistant" });
      else record.state.recommendations.push(target);
      record.state.events.push(event("ai_started", sourceRefs));
      return { message: "Conversation attempt saved.", operationId: input.requestId, contextRevision: record.revision };
    });
    if (result.replay) return { ...result, message: "This attempt is already saved. Refresh to see its current result; no duplicate provider call was made." };
    try {
      const output = await this.deps.ai(input.action as ConversationMode, input.content ?? "", context!);
      const valid = new Set([`registry:${project}`, "owner:manual", ...context!.messages.flatMap(m => [m.id, ...m.sourceRefs]), ...context!.acceptedFacts.flatMap(f => [f.id, ...f.sourceRefs]), ...context!.assignments.flatMap(a => [`${a.id}:v${a.version}`, ...a.sourceRefs]), ...repository.sources.map(s => s.source), ...context!.development.map(d => `github-request:${d.requestId}`)]);
      if (output.sourceRefs.some(s => !valid.has(s))) throw new Error("Conversational response cited an unverified source.");
      const text = `${output.content}${output.unresolvedQuestions.length ? `\n\nUnresolved questions:\n${output.unresolvedQuestions.map(q => `- ${q}`).join("\n")}` : ""}`;
      if (text.length > 14000) throw new Error("Combined conversational output exceeds 14,000 characters. Start a new attempt requesting a shorter response.");
      const assignmentSources = [...new Set([...(input.sourceRefs ?? []), ...output.sourceRefs])];
      if (input.action === "build_assignment" && assignmentSources.length > 50) throw new Error("Assignment provenance exceeds 50 sources. Select fewer discussion sources and try a new attempt.");
      await this.store.finish(project, input.requestId, state => {
        const target = input.action === "workshop" ? state.messages.find(m => m.operationId === input.requestId && m.role === "assistant") : state.recommendations.find(r => r.operationId === input.requestId);
        if (!target || target.status !== "pending") return false;
        target.status = "complete"; target.content = text; target.sourceRefs = output.sourceRefs;
        if (input.action === "build_assignment") {
          const assignment: WorkspaceAssignment = { id: randomUUID(), version: 1, hash: contentHash(text), content: text, status: "draft", sourceRefs: assignmentSources, contextRevision: result.contextRevision, contextSnapshot: context, createdAt: stamp() };
          state.assignments.push(assignment); state.events.push(event("assignment_draft_generated", [`${assignment.id}:v1`, ...assignment.sourceRefs]));
        }
      });
      return { ...result, message: input.action === "build_assignment" ? "Draft assignment generated. Review, edit, and explicitly approve it before Development." : "Conversation result saved. No development was started." };
    } catch (error) {
      await this.store.finish(project, input.requestId, state => {
        const target = input.action === "workshop" ? state.messages.find(m => m.operationId === input.requestId && m.role === "assistant") : state.recommendations.find(r => r.operationId === input.requestId);
        if (target?.status === "pending") { target.status = "failed"; target.error = error instanceof Error ? error.message : "Conversation failed."; }
      });
      return { ...result, failed: true, message: "Conversation attempt failed and was saved visibly. Start a new attempt to retry; no development was started." };
    }
  }
  async reconcile(project: string) {
    projectRegistry(project);
    const record = await this.store.read(project);
    const interrupted = [...record.state.messages, ...record.state.recommendations].filter(m => m.status === "pending" && Date.now() - Date.parse(m.createdAt) > 120000);
    for (const pending of interrupted) await this.store.finish(project, pending.operationId, state => {
      const target = [...state.messages, ...state.recommendations].find(m => m.id === pending.id);
      if (!target || target.status !== "pending") return false;
      target.status = "failed"; target.error = "This conversation attempt was interrupted. Start a new attempt; the saved discussion remains available.";
    });
    const config = Object.hasOwn(teamProjects, project) ? teamProjects[project] : undefined;
    if (!config?.enabled) return;
    const tombstones = await this.store.dispatches(project);
    if (!tombstones.length) return;
    let issues: Awaited<ReturnType<typeof listIssues>> = [];
    try { issues = await this.deps.listIssues(config.repo, project); } catch { /* Explicit unavailable observation below. */ }
    for (const entry of tombstones) {
      const requestId = String(entry.request_id);
      const candidates = issues.filter(i => parseRequest(i.body)?.requestId === requestId);
      const issue = entry.issue_number ? candidates.find(i => i.number === Number(entry.issue_number)) : candidates.sort((a, b) => a.number - b.number)[0];
      let evidence: unknown; let error: string | undefined; let outcome = String(entry.outcome);
      if (issue) { try { evidence = await this.deps.inspect(config.repo, issue); outcome = "observed"; } catch { error = "Fresh GitHub development evidence unavailable. Previous observations are stale."; } }
      else error = "No matching GitHub request was verified. Dispatch may be uncertain; automatic replay is blocked.";
      if (outcome === "pending" && Date.now() - Date.parse(String(entry.updated_at)) > 120000) outcome = "uncertain";
      await this.store.db.query("UPDATE hq_dispatch_tombstone SET outcome=$3,issue_number=COALESCE($4,issue_number),updated_at=CASE WHEN outcome<>$3 THEN now() ELSE updated_at END WHERE owner_id=$1 AND request_id=$2::uuid", [ownerId, requestId, outcome, issue?.number ?? null]);
      await this.store.finish(project, requestId, state => {
        const link = state.development.find(d => d.requestId === requestId);
        if (!link) return false;
        if (canonicalJson({ outcome: link.outcome, evidence: link.evidence, error: link.error }) === canonicalJson({ outcome, evidence, error })) return false;
        link.outcome = outcome; link.evidence = evidence; link.error = error; link.issue = issue?.number ?? link.issue; link.observedAt = stamp();
        state.events.push(event("development_evidence_reconciled", [`github-request:${requestId}`]));
      });
    }
  }
}
export function validateAssignment(content: string, repo?: string) {
  const sections = ["Objective", "Repository", "Context", "Scope", "Exclusions", "Constraints", "Acceptance criteria", "Tests", "Unresolved questions"];
  const missing = sections.filter(section => !new RegExp(`(?:^|\\n)\\s*(?:#{1,6}\\s*)?${section}\\s*(?::|\\n)`, "i").test(content));
  if (missing.length) throw new WorkspaceError(`Assignment needs explicit sections before approval: ${missing.join(", ")}.`);
  if (repo && !content.includes(repo)) throw new WorkspaceError("Assignment Repository must identify the configured target repository exactly.");
}
export async function authorizePlanApproval(store: WorkspaceStore, project: string, issue: number) {
  const links = await store.db.query("SELECT request_id,outcome FROM hq_dispatch_tombstone WHERE owner_id=$1 AND project=$2 AND issue_number=$3", [ownerId, project, issue]);
  const link = links.rows.find(l => ["confirmed", "observed"].includes(String(l.outcome)));
  if (!link) throw new WorkspaceError("This PM request is not linked to an approved workspace assignment. Submit the exact approved assignment through Development first.", 409);
  const record = await store.read(project);
  const assignment = record.state.assignments.find(a => a.submittedRequestId === String(link.request_id) && a.status === "submitted" && a.approvedAt && a.hash === contentHash(a.content));
  if (!assignment) throw new WorkspaceError("The submitted assignment is unavailable or its approval could not be verified.", 409);
}
