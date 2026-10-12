import { cookies } from "next/headers";
import { sessionCookie, validSession, sameOrigin, readJson } from "@/lib/ai-team/auth";
import { teamProjects, parseRequest } from "@/lib/ai-team/config";
import { github, inspect, listIssues, submit, validateApproval } from "@/lib/ai-team/github";
import { database } from "@/lib/workspace/database";
import { WorkspaceStore, WorkspaceError } from "@/lib/workspace/store";
import { authorizePlanApproval } from "@/lib/workspace/service";
export const runtime = "nodejs";
type Context = { params: Promise<{ project: string }> };
async function access(context: Context) {
  if (!validSession((await cookies()).get(sessionCookie)?.value)) throw new Error("Sign in as owner.");
  const { project } = await context.params;
  const config = Object.hasOwn(teamProjects, project) ? teamProjects[project] : undefined;
  if (!config?.enabled) throw new Error("This repository has not been onboarded.");
  return { project, repo: config.repo };
}
export async function GET(_request: Request, context: Context) {
  try {
    const { project, repo } = await access(context);
    const issues = await listIssues(repo, project);
    const requests = await Promise.all(issues.slice(0, 10).map(issue => inspect(repo, issue)));
    return Response.json({ requests }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Status unavailable." }, { status: 503 }); }
}
export async function POST(request: Request, context: Context) {
  if (!sameOrigin(request)) return Response.json({ error: "Origin rejected." }, { status: 403 });
  try {
    const { project, repo } = await access(context);
    const body = await readJson(request);
    if (body.action === "submit") {
      throw new Error("Direct plain-text development submission is disabled. Review and approve an exact workspace assignment, then submit it through the Development view.");
    }
    if (body.action === "approve") {
      if (!Number.isSafeInteger(body.issue)) throw new Error("A valid request issue is required.");
      try { await authorizePlanApproval(new WorkspaceStore(database()), project, body.issue as number); }
      catch (error) { if (error instanceof WorkspaceError) throw error; throw new Error("Approved assignment verification is unavailable. Check workspace database configuration."); }
      const issues = await listIssues(repo, project);
      const issue = issues.find(i => i.number === body.issue);
      if (!issue) throw new Error("Request was not found in this project.");
      const state = await inspect(repo, issue);
      const plan = validateApproval(state, body.planCommentId, body.planHash);
      await github(repo, `issues/${issue.number}/comments`, "POST", { body: `Owner approved PM plan comment ${plan.commentId} (SHA256 ${plan.hash}) through SolutionsHQ. Approval covers development and draft PR preparation only.` });
      await github(repo, "actions/workflows/ai-development.yml/dispatches", "POST", { ref: "main", inputs: { phase: "develop", request_issue: String(issue.number), request_id: parseRequest(issue.body)!.requestId, plan_comment_id: String(plan.commentId), plan_sha256: plan.hash } });
      return Response.json({ message: "Approved scope and dispatched development. Waiting for runner confirmation." });
    }
    throw new Error("Unknown action.");
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 400 }); }
}
