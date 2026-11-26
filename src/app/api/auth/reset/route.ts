import { hashPassword, safeEqual, sha256 } from "@/lib/server/crypto";
import { readAccount, updateAccount } from "@/lib/server/account";
import { clearAuthCookies, sameOrigin } from "@/lib/server/session";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { body, json, passwordProblem, tooMany } from "@/lib/server/http";

export const runtime = "nodejs";

/** Sets a new password using the one-time token from the reset email. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const rl = rateLimit(`reset:ip:${clientIp(req)}`, 10, 60 * 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter);

  const b = await body<{ token: string; password: string }>(req);
  const token = String(b?.token ?? "");
  const { reset } = await readAccount();
  if (!token || !reset || reset.expires < Date.now() || !safeEqual(sha256(token), reset.tokenHash)) {
    return json({ error: "This reset link is invalid or has expired. Request a new one." }, 400);
  }
  const problem = passwordProblem(String(b?.password ?? ""));
  if (problem) return json({ error: problem }, 400);

  const passwordHash = await hashPassword(String(b!.password));
  await updateAccount((d) => ({ ...d, passwordHash, passwordVersion: d.passwordVersion + 1, reset: undefined, sessions: [] })); // single-use token; every device signed out
  return clearAuthCookies(json({ ok: true }));
}
