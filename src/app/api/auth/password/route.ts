import { hashPassword, verifyPassword } from "@/lib/server/crypto";
import { passwordHashFor, updateAccount } from "@/lib/server/account";
import { createSession } from "@/lib/server/token";
import { getUser, sameOrigin, setAuthCookies } from "@/lib/server/session";
import { clientIp, limit } from "@/lib/server/rateLimit";
import { body, json, passwordProblem, tooMany, guard } from "@/lib/server/http";

export const runtime = "nodejs";

/** Change password while signed in. Signs out every other device. */
async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const u = await getUser();
  if (!u) return json({ error: "Please sign in again." }, 401);
  const rl = await limit(`pw:ip:${clientIp(req)}`, 5, 15 * 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);

  const b = await body<{ current: string; next: string }>(req);
  if (!(await verifyPassword(String(b?.current ?? "").slice(0, 256), await passwordHashFor(u.uid)))) return json({ error: "Current password is incorrect." }, 400);
  const problem = passwordProblem(String(b?.next ?? ""));
  if (problem) return json({ error: problem }, 400);

  const passwordHash = await hashPassword(String(b!.next));
  await updateAccount(u.uid, (d) => ({ ...d, passwordHash, passwordVersion: d.passwordVersion + 1, reset: undefined, sessions: [] }));
  const t = await createSession(u.uid, true, req.headers.get("user-agent") ?? "", clientIp(req)); // keep this device signed in
  return setAuthCookies(json({ ok: true }), t);
}
export const POST = guard(handlePOST);
