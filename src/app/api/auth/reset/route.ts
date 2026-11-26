import { hashPassword, safeEqual, sha256 } from "@/lib/server/crypto";
import { ADMIN_ID, readAccount, updateAccount, userById } from "@/lib/server/account";
import { clearAuthCookies, sameOrigin } from "@/lib/server/session";
import { clientIp, limit } from "@/lib/server/rateLimit";
import { body, json, passwordProblem, tooMany, guard } from "@/lib/server/http";

export const runtime = "nodejs";

/** Sets a new password using the one-time token from the reset email ("uid.token"; older links: "token"). */
async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const rl = await limit(`reset:ip:${clientIp(req)}`, 10, 60 * 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);

  const b = await body<{ token: string; password: string }>(req);
  const raw = String(b?.token ?? "").slice(0, 200);
  const [uid, token] = raw.includes(".") ? raw.split(".", 2) : [ADMIN_ID, raw];
  const invalid = () => json({ error: "This reset link is invalid or has expired. Request a new one." }, 400);
  const user = token ? await userById(uid) : null;
  if (!user) return invalid();
  const { reset } = await readAccount(uid);
  if (!reset || reset.expires < Date.now() || !safeEqual(sha256(token), reset.tokenHash)) return invalid();
  const problem = passwordProblem(String(b?.password ?? ""));
  if (problem) return json({ error: problem }, 400);

  const passwordHash = await hashPassword(String(b!.password));
  // Single-use token; every device signed out.
  await updateAccount(uid, (d) => ({ ...d, passwordHash, passwordVersion: d.passwordVersion + 1, reset: undefined, sessions: [] }));
  return clearAuthCookies(json({ ok: true }));
}
export const POST = guard(handlePOST);
