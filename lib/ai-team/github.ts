import { createHash } from "node:crypto";
import { parseEvent, parseRequest, publicRequestBody } from "./config";
type Issue = { number: number; title: string; body: string; html_url: string; state: string };
type Comment = { id: number; body: string; user: { login: string }; html_url: string };
export const hashPlan = (body: string) => createHash("sha256").update(body).digest("hex");
export function validateApproval(state: Awaited<ReturnType<typeof inspect>>, commentId: unknown, hash: unknown) {
  if (!state.plan || state.plan.commentId !== commentId || state.plan.hash !== hash) throw new Error("The PM plan changed. Refresh and review the latest plan.");
  if (state.runs.some(r => r.display_title.includes("develop"))) throw new Error("Development has already been dispatched. Review the existing run.");
  return state.plan;
}
export async function github<T>(repo: string, path: string, method = "GET", body?: unknown): Promise<T> {
  if (!process.env.AI_TEAM_GITHUB_TOKEN) throw new Error("AI team GitHub access is not configured on the server.");
  const response = await fetch(`https://api.github.com/repos/${repo}/${path}`, { method, cache: "no-store", headers: { Authorization: `Bearer ${process.env.AI_TEAM_GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`GitHub ${method} failed (${response.status}). Check server token permissions and workflow installation.`);
  return response.status === 204 ? undefined as T : response.json();
}
export async function listIssues(repo: string, project: string) {
  const issues = await pages<Issue>(repo, "issues?state=all&sort=created&direction=desc");
  return issues.filter(i => parseRequest(i.body ?? "")?.project === project);
}
async function pages<T>(repo: string, path: string) {
  const all: T[] = [];
  for (let page = 1; page <= 50; page++) {
    const batch = await github<T[]>(repo, `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    all.push(...batch); if (batch.length < 100) return all;
  }
  throw new Error("Repository history exceeds the pilot scan limit. Status is unavailable rather than incomplete.");
}
export async function inspect(repo: string, issue: Issue) {
  const record = parseRequest(issue.body);
  const comments = await pages<Comment>(repo, `issues/${issue.number}/comments`);
  const events = comments.filter(c => c.user.login === "github-actions[bot]").map(c => ({ comment: c, event: parseEvent(c.body) })).filter(e => e.event?.requestId === record?.requestId && e.event?.version === 1);
  const plan = events.filter(e => e.event?.type === "plan").at(-1);
  type Run = { id: number; display_title: string; html_url: string; status: string; conclusion: string | null; created_at: string };
  const relatedRuns: Run[] = [];
  for (let page = 1; page <= 50; page++) {
    const runs = await github<{ workflow_runs: Run[] }>(repo, `actions/workflows/ai-development.yml/runs?per_page=100&page=${page}`);
    relatedRuns.push(...runs.workflow_runs.filter(r => r.display_title.includes(record!.requestId)));
    if (runs.workflow_runs.length < 100) break;
    if (page === 50) throw new Error("Workflow history exceeds pilot scan limit.");
  }
  let latest = events.at(-1)?.event;
  const prNumber = events.filter(e => typeof e.event?.prNumber === "number").at(-1)?.event?.prNumber;
  let pullRequest = null;
  let checks: unknown[] = [];
  if (typeof prNumber === "number") {
    const pr = await github<{ html_url: string; number: number; head: { sha: string }; state: string; draft: boolean }>(repo, `pulls/${prNumber}`);
    const result = await github<{ check_runs: unknown[] }>(repo, `commits/${pr.head.sha}/check-runs`);
    checks = result.check_runs;
    const qa = events.filter(e => e.event?.type === "qa" && e.event.headSha === pr.head.sha).at(-1)?.event;
    pullRequest = { url: pr.html_url, number: pr.number, headSha: pr.head.sha, state: pr.state, draft: pr.draft, qa: qa ?? null };
    if (typeof latest?.headSha === "string" && latest.headSha !== pr.head.sha) {
      latest = { ...latest, status: "qa_stale", summary: "The pull request changed. The current commit requires renewed build and independent QA.", buildStatus: undefined };
    } else if (qa?.buildStatus) {
      latest = { ...latest, buildStatus: qa.buildStatus };
    }
  }
  return { number: issue.number, title: issue.title, url: issue.html_url, state: issue.state, requestId: record!.requestId, plan: plan ? { commentId: plan.comment.id, hash: hashPlan(plan.comment.body), body: plan.comment.body.replace(/<!-- solutionshq-event:.*? -->/g, ""), url: plan.comment.html_url } : null, latest: latest ?? null, runs: relatedRuns, pullRequest, checks };
}
export async function submit(repo: string, project: string, requestId: string, text: string) {
  const existing = (await listIssues(repo, project)).find(i => parseRequest(i.body)?.requestId === requestId);
  if (existing) return { issue: existing, duplicate: true };
  const issue = await github<Issue>(repo, "issues", "POST", { title: `[AI Development] ${text.split("\n")[0].slice(0, 100)}`, body: publicRequestBody(requestId, project, text) });
  try {
    await github(repo, "actions/workflows/ai-development.yml/dispatches", "POST", { ref: "main", inputs: { phase: "plan", request_issue: String(issue.number), request_id: requestId } });
    return { issue, duplicate: false };
  } catch (error) {
    await github(repo, `issues/${issue.number}/comments`, "POST", { body: "SolutionsHQ could not confirm workflow dispatch. Request saved; inspect GitHub Actions before retrying to avoid duplicate execution." }).catch(() => {});
    throw new Error(`Request saved as issue #${issue.number}, but agent dispatch was not confirmed. Inspect GitHub Actions before retrying. ${error instanceof Error ? error.message : ""}`);
  }
}
