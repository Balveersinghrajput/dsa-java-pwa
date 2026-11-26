import { listUsers, progressKey } from "@/lib/server/account";
import { kvGet } from "@/lib/server/kv";
import { getAdmin } from "@/lib/server/admin";
import { summarise } from "@/lib/server/summary";
import { guard, json } from "@/lib/server/http";
import type { StoredProgress } from "@/app/api/progress/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One friend's full saved progress, read-only (admin only). */
async function handleGET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return json({ error: "Admins only." }, 403);
  const { id } = await ctx.params;
  const u = (await listUsers()).find((x) => x.id === id);
  if (!u) return json({ error: "User not found." }, 404);
  const p = await kvGet<StoredProgress>(progressKey(id));
  return json({ user: { id: u.id, name: u.name, email: u.email, created: u.created, disabled: !!u.disabled }, summary: summarise(p), state: p?.state ?? null });
}
export const GET = guard(handleGET);
