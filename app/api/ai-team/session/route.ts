import { cookies } from "next/headers";
import { configured, equal, issueSession, readJson, sameOrigin, sessionCookie, validSession } from "@/lib/ai-team/auth";
export const runtime = "nodejs";
export async function GET() {
  return Response.json({ configured: configured(), authenticated: validSession((await cookies()).get(sessionCookie)?.value) }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Origin rejected." }, { status: 403 });
  if (!configured()) return Response.json({ error: "Owner access is not configured on the server." }, { status: 503 });
  try {
    const body = await readJson(request);
    // Fixed delay reduces online guessing without keeping an unreliable process-local limiter.
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (typeof body.password !== "string" || !equal(body.password, process.env.HQ_OWNER_PASSWORD!)) return Response.json({ error: "Incorrect password." }, { status: 401 });
    (await cookies()).set(sessionCookie, issueSession(), { httpOnly: true, secure: new URL(process.env.HQ_APP_ORIGIN ?? request.url).protocol === "https:", sameSite: "strict", path: "/", maxAge: 28800 });
    return Response.json({ authenticated: true });
  } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Origin rejected." }, { status: 403 });
  (await cookies()).delete(sessionCookie);
  return Response.json({ authenticated: false });
}
