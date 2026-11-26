import { readAccount, updateAccount } from "@/lib/server/account";
import { getUser, sameOrigin } from "@/lib/server/session";
import { body, json, guard } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Signed-in devices (no token data is ever returned). */
async function handleGET() {
  const u = await getUser();
  if (!u) return json({ error: "Please sign in again." }, 401);
  const list = (await readAccount(u.uid)).sessions
    .filter((s) => s.expires > Date.now())
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .map((s) => ({ id: s.id, ua: s.ua, ip: s.ip, created: s.created, lastUsed: s.lastUsed, expires: s.expires, current: s.id === u.sid }));
  return json({ sessions: list });
}

/** Revoke one session ({ id }) or every other session ({ others: true }). */
async function handleDELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const u = await getUser();
  if (!u) return json({ error: "Please sign in again." }, 401);
  const b = await body<{ id: string; others: boolean }>(req);
  await updateAccount(u.uid, (d) => ({
    ...d,
    sessions: d.sessions.filter((s) => (b?.others ? s.id === u.sid : s.id !== String(b?.id ?? ""))),
  }));
  return json({ ok: true });
}
export const GET = guard(handleGET);
export const DELETE = guard(handleDELETE);
