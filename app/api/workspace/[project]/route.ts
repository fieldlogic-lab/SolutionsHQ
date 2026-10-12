import { cookies } from "next/headers";
import { readJson, sameOrigin, sessionCookie, validSession } from "@/lib/ai-team/auth";
import { database } from "@/lib/workspace/database";
import { projectRegistry } from "@/lib/workspace/context";
import { WorkspaceStore, WorkspaceError } from "@/lib/workspace/store";
import { WorkspaceService } from "@/lib/workspace/service";
import type { WorkspaceAction } from "@/lib/workspace/types";
export const runtime = "nodejs";
export const maxDuration = 60;
type Context = { params: Promise<{ project: string }> };
async function access(context: Context) {
  if (!validSession((await cookies()).get(sessionCookie)?.value)) throw new WorkspaceError("Sign in as owner to access private project context.", 401);
  const { project } = await context.params;
  try { projectRegistry(project); } catch { throw new WorkspaceError("Unknown project.", 404); }
  if (!process.env.DATABASE_URL) throw new WorkspaceError("Private workspace database is not configured. Set server DATABASE_URL and run the migration.", 503);
  return { project, service: new WorkspaceService(new WorkspaceStore(database())) };
}
function failure(error: unknown) {
  if (error instanceof WorkspaceError) return Response.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  return Response.json({ error: "Private workspace operation is unavailable. Check server database configuration and migration; no automatic development retry was made." }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
export async function GET(request: Request, context: Context) {
  try {
    const { project, service } = await access(context);
    const query = new URL(request.url).searchParams;
    const state = await service.view(project, query.get("reconcile") !== "0");
    const exporting = query.get("export") === "1";
    return Response.json(state, { headers: { "Cache-Control": "no-store", ...(exporting ? { "Content-Disposition": `attachment; filename="${project}-private-context.json"` } : {}) } });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request, context: Context) {
  if (!sameOrigin(request)) return Response.json({ error: "Origin rejected." }, { status: 403 });
  try {
    const { project, service } = await access(context);
    const body = await readJson(request, 128000);
    if (typeof body.action !== "string" || typeof body.requestId !== "string" || typeof body.revision !== "number") throw new WorkspaceError("Action, request ID, and current revision are required.");
    return Response.json(await service.act(project, body as unknown as WorkspaceAction), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return Response.json({ error: "Origin rejected." }, { status: 403 });
  try {
    const { project, service } = await access(context);
    const body = await readJson(request, 128000);
    if (body.confirm !== project || typeof body.requestId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.requestId) || !Number.isSafeInteger(body.revision)) throw new WorkspaceError("Confirm deletion with the exact project key, request UUID, and current revision.");
    return Response.json(await service.store.delete(project, body.requestId, body.revision as number), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
