import { deleteUser, listUsers, progressKey, readAccount, updateAccount, updateUsers } from "@/lib/server/account";
import { kvGet } from "@/lib/server/kv";
import { getAdmin } from "@/lib/server/admin";
import { sameOrigin } from "@/lib/server/session";
import { summarise } from "@/lib/server/summary";
import { body, guard, json } from "@/lib/server/http";
import type { StoredProgress } from "@/app/api/progress/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Friends with headline progress (admin only). */
async function handleGET() {
  if (!(await getAdmin())) return json({ error: "Admins only." }, 403);
  const users = await listUsers();
  const rows = await Promise.all(
    users.map(async (u) => {
      const [p, acct] = await Promise.all([kvGet<StoredProgress>(progressKey(u.id)), readAccount(u.id)]);
      const lastSeen = Math.max(0, ...acct.sessions.map((s) => s.lastUsed));
      return { id: u.id, name: u.name, email: u.email, created: u.created, disabled: !!u.disabled, devices: acct.sessions.length, lastSeen: lastSeen || null, ...summarise(p) };
    }),
  );
  return json({ users: rows.sort((a, b) => b.created - a.created) });
}

/** Turn a friend's access off/on ({ id, disabled }). Disabling signs them out everywhere. */
async function handlePATCH(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  if (!(await getAdmin())) return json({ error: "Admins only." }, 403);
  const b = await body<{ id: string; disabled: boolean }>(req);
  const id = String(b?.id ?? "");
  let found = false;
  await updateUsers((users) => users.map((u) => (u.id === id ? ((found = true), { ...u, disabled: !!b?.disabled }) : u)));
  if (!found) return json({ error: "User not found." }, 404);
  if (b?.disabled) await updateAccount(id, (d) => ({ ...d, sessions: [] }));
  return json({ ok: true });
}

/** Permanently deletes a friend's account and all their progress ({ id }). */
async function handleDELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  if (!(await getAdmin())) return json({ error: "Admins only." }, 403);
  const id = String((await body<{ id: string }>(req))?.id ?? "");
  if (!(await listUsers()).some((u) => u.id === id)) return json({ error: "User not found." }, 404);
  await deleteUser(id);
  return json({ ok: true });
}

export const GET = guard(handleGET);
export const PATCH = guard(handlePATCH);
export const DELETE = guard(handleDELETE);
