import { readAccount, userById } from "@/lib/server/account";
import { getUser } from "@/lib/server/session";
import { json, guard } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleGET() {
  const u = await getUser();
  if (!u) return json({ error: "Not signed in." }, 401);
  const [info, acct] = await Promise.all([userById(u.uid), readAccount(u.uid)]);
  const s = acct.sessions.find((x) => x.id === u.sid);
  return json({ id: u.uid, role: u.role, name: info?.name ?? "", email: u.sub, accessExpires: u.exp, sessionExpires: s?.expires ?? null, since: s?.created ?? null });
}
export const GET = guard(handleGET);
