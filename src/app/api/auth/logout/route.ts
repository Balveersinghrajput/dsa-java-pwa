import { revokeSession, sessionIdFromRefresh } from "@/lib/server/token";
import { clearAuthCookies, refreshTokenFromCookie, sameOrigin } from "@/lib/server/session";
import { json, guard } from "@/lib/server/http";

export const runtime = "nodejs";

async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const sid = sessionIdFromRefresh(await refreshTokenFromCookie());
  if (sid) await revokeSession(sid);
  return clearAuthCookies(json({ ok: true }));
}
export const POST = guard(handlePOST);
