import { revokeSession, sessionIdFromRefresh } from "@/lib/server/token";
import { clearAuthCookies, refreshTokenFromCookie, sameOrigin } from "@/lib/server/session";
import { json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const sid = sessionIdFromRefresh(await refreshTokenFromCookie());
  if (sid) await revokeSession(sid);
  return clearAuthCookies(json({ ok: true }));
}
