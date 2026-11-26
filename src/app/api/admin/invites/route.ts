import { randomBytes } from "node:crypto";
import { sha256 } from "@/lib/server/crypto";
import { listInvites, listUsers, updateInvites } from "@/lib/server/account";
import { getAdmin } from "@/lib/server/admin";
import { sameOrigin } from "@/lib/server/session";
import { body, guard, json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY = 86_400_000;

/** Invite links (codes are shown only once, when created). */
async function handleGET() {
  if (!(await getAdmin())) return json({ error: "Admins only." }, 403);
  const users = await listUsers();
  const invites = (await listInvites())
    .sort((a, b) => b.created - a.created)
    .map(({ id, note, created, expires, usedBy, usedAt }) => ({
      id,
      note,
      created,
      expires,
      usedAt: usedAt ?? null,
      usedByName: usedBy ? (users.find((u) => u.id === usedBy)?.name ?? "deleted user") : null,
      status: usedBy ? "used" : expires < Date.now() ? "expired" : "open",
    }));
  return json({ invites });
}

/** Creates a one-time invite link, valid for 1–30 days. */
async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  if (!(await getAdmin())) return json({ error: "Admins only." }, 403);
  const b = await body<{ note: string; days: number }>(req);
  const days = Math.min(30, Math.max(1, Math.round(Number(b?.days) || 7)));
  const code = randomBytes(18).toString("base64url");
  const invite = { id: randomBytes(6).toString("base64url"), codeHash: sha256(code), note: String(b?.note ?? "").trim().slice(0, 60), created: Date.now(), expires: Date.now() + days * DAY };
  // Unused invites that expired over 30 days ago are tidied away; used ones stay as history.
  await updateInvites((l) => [...l.filter((i) => i.usedBy || i.expires > Date.now() - 30 * DAY), invite].slice(-100));
  const base = (process.env.APP_URL || new URL(req.url).origin).replace(/\/$/, "");
  return json({ ok: true, link: `${base}/signup?code=${code}`, expires: invite.expires });
}

/** Revokes an unused invite. */
async function handleDELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  if (!(await getAdmin())) return json({ error: "Admins only." }, 403);
  const id = String((await body<{ id: string }>(req))?.id ?? "");
  await updateInvites((l) => l.filter((i) => i.id !== id || !!i.usedBy));
  return json({ ok: true });
}

export const GET = guard(handleGET);
export const POST = guard(handlePOST);
export const DELETE = guard(handleDELETE);
