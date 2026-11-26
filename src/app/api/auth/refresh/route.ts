import { NextResponse, type NextRequest } from "next/server";
import { rotate } from "@/lib/server/token";
import { clearAuthCookies, refreshTokenFromCookie, sameOrigin, setAuthCookies } from "@/lib/server/session";
import { clientIp, limit } from "@/lib/server/rateLimit";
import { json, tooMany, guard } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/api/") ? n : "/");

/** Page navigations: middleware sends expired sessions here; we rotate tokens and bounce back. */
async function handleGET(req: NextRequest) {
  const next = safeNext(req.nextUrl.searchParams.get("next"));
  const rl = await limit(`refresh:ip:${clientIp(req)}`, 30, 60_000);
  const t = rl.ok ? await rotate(await refreshTokenFromCookie(), clientIp(req)) : null;
  if (!t) {
    const login = new URL("/login", req.url);
    if (next !== "/") login.searchParams.set("next", next);
    return clearAuthCookies(NextResponse.redirect(login));
  }
  return setAuthCookies(NextResponse.redirect(new URL(next, req.url)), t);
}

/** Background refresh from the app (fetch). */
async function handlePOST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const rl = await limit(`refresh:ip:${clientIp(req)}`, 30, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const t = await rotate(await refreshTokenFromCookie(), clientIp(req));
  if (!t) return clearAuthCookies(json({ error: "Session expired. Please sign in again." }, 401));
  return setAuthCookies(json({ ok: true }), t);
}
export const GET = guard(handleGET);
export const POST = guard(handlePOST);
