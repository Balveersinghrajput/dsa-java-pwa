import { randomBytes } from "node:crypto";
import { hashPassword, safeEqual, sha256 } from "@/lib/server/crypto";
import { accountEmail, listInvites, normEmail, updateAccount, updateInvites, updateUsers, userByEmail } from "@/lib/server/account";
import { createSession } from "@/lib/server/token";
import { sameOrigin, setAuthCookies } from "@/lib/server/session";
import { clientIp, limit } from "@/lib/server/rateLimit";
import { body, guard, json, passwordProblem, tooMany } from "@/lib/server/http";

export const runtime = "nodejs";

const findInvite = async (code: string) => {
  const h = sha256(code);
  return (await listInvites()).find((i) => safeEqual(i.codeHash, h)) ?? null;
};

/** Is this invite code usable? (lets the sign-up page show a friendly message first) */
async function handleGET(req: Request) {
  const rl = await limit(`signup:check:${clientIp(req)}`, 30, 60 * 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const code = new URL(req.url).searchParams.get("code") ?? "";
  const inv = code ? await findInvite(code) : null;
  if (!inv || inv.usedBy || inv.expires < Date.now()) return json({ ok: false, error: "This invite link is invalid, expired or already used. Ask the admin for a new one." }, 400);
  return json({ ok: true, expires: inv.expires });
}

/** Creates a friend's account from a one-time invite code. */
async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const rl = await limit(`signup:ip:${clientIp(req)}`, 5, 60 * 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);

  const b = await body<{ code: string; name: string; email: string; password: string }>(req);
  const code = String(b?.code ?? "").slice(0, 100);
  const name = String(b?.name ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
  const email = normEmail(b?.email);
  const password = String(b?.password ?? "");

  if (!name) return json({ error: "Enter your name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid email address." }, 400);
  const problem = passwordProblem(password);
  if (problem) return json({ error: problem }, 400);
  if (email === accountEmail() || (await userByEmail(email))) return json({ error: "An account with this email already exists. Sign in instead." }, 409);

  const inv = code ? await findInvite(code) : null;
  if (!inv || inv.usedBy || inv.expires < Date.now()) return json({ error: "This invite link is invalid, expired or already used. Ask the admin for a new one." }, 400);

  const uid = `u_${randomBytes(9).toString("base64url")}`;
  // Claim the invite atomically so one link can only ever create one account.
  let claimed = false;
  await updateInvites((list) =>
    list.map((i) => {
      if (i.id !== inv.id || i.usedBy || i.expires < Date.now()) return i;
      claimed = true;
      return { ...i, usedBy: uid, usedAt: Date.now() };
    }),
  );
  if (!claimed) return json({ error: "This invite link was just used. Ask the admin for a new one." }, 400);

  let duplicate = false;
  await updateUsers((users) => {
    if (users.some((u) => u.email === email)) {
      duplicate = true;
      return users;
    }
    return [...users, { id: uid, email, name, created: Date.now(), invitedBy: inv.id }];
  });
  if (duplicate) {
    await updateInvites((list) => list.map((i) => (i.id === inv.id ? { ...i, usedBy: undefined, usedAt: undefined } : i)));
    return json({ error: "An account with this email already exists. Sign in instead." }, 409);
  }

  const passwordHash = await hashPassword(password);
  await updateAccount(uid, (d) => ({ ...d, passwordHash }));
  const t = await createSession(uid, true, req.headers.get("user-agent") ?? "", clientIp(req));
  return setAuthCookies(json({ ok: true }), t);
}

export const GET = guard(handleGET);
export const POST = guard(handlePOST);
