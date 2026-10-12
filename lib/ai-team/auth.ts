import { createHash, createHmac, timingSafeEqual } from "node:crypto";
export const sessionCookie = "hq_owner";
const digest = (value: string) => createHash("sha256").update(value).digest();
export function equal(a: string, b: string) { return timingSafeEqual(digest(a), digest(b)); }
export function configured() { return (process.env.HQ_OWNER_PASSWORD?.length ?? 0) >= 32 && (process.env.HQ_SESSION_SECRET?.length ?? 0) >= 32; }
const signingKey = () => `${process.env.HQ_SESSION_SECRET}:${digest(process.env.HQ_OWNER_PASSWORD ?? "").toString("hex")}`;
export function issueSession(now = Date.now()) {
  const expiry = String(now + 8 * 60 * 60 * 1000);
  return `${expiry}.${createHmac("sha256", signingKey()).update(expiry).digest("hex")}`;
}
export function validSession(value: string | undefined, now = Date.now()) {
  if (!configured() || !value) return false;
  const [expiry, signature, extra] = value.split(".");
  if (extra || !signature || !/^\d+$/.test(expiry) || Number(expiry) <= now || Number(expiry) > now + 8 * 60 * 60 * 1000) return false;
  return equal(signature, createHmac("sha256", signingKey()).update(expiry).digest("hex"));
}
export function sameOrigin(request: Request) {
  const expected = process.env.HQ_APP_ORIGIN;
  if (expected) {
    try { const canonical = new URL(expected); const loopback = ["localhost", "127.0.0.1"].includes(canonical.hostname); if (canonical.origin !== expected || (process.env.NODE_ENV === "production" && canonical.protocol !== "https:" && !(loopback && canonical.protocol === "http:"))) return false; } catch { return false; }
    return request.headers.get("origin") === expected;
  }
  // Production uses an explicit canonical origin. Host fallback supports local development
  // where Next internally rewrites request.url to localhost despite a 127.0.0.1 browser URL.
  if (process.env.NODE_ENV === "production") return false;
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return false;
  return request.headers.get("origin") === `${url.protocol}//${host}`;
}
export async function readJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing request body.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.byteLength; if (size > 16000) { await reader.cancel(); throw new Error("Request is too large."); } chunks.push(chunk.value); }
  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}
