import { readAccount } from "@/lib/server/account";
import { getUser } from "@/lib/server/session";
import { json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getUser();
  if (!u) return json({ error: "Not signed in." }, 401);
  const s = (await readAccount()).sessions.find((x) => x.id === u.sid);
  return json({ email: u.sub, accessExpires: u.exp, sessionExpires: s?.expires ?? null, since: s?.created ?? null });
}
