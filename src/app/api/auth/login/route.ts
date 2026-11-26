import { hashPassword, verifyPassword } from "@/lib/server/crypto";
import { accountEmail, normEmail, passwordHashFor, userByEmail } from "@/lib/server/account";
import { createSession } from "@/lib/server/token";
import { sameOrigin, setAuthCookies } from "@/lib/server/session";
import { clientIp, limit, clearLimit } from "@/lib/server/rateLimit";
import { body, json, tooMany, guard } from "@/lib/server/http";

export const runtime = "nodejs";

// Used when the email is unknown, so a wrong email takes as long as a wrong password.
let dummy: Promise<string> | null = null;
const dummyHash = () => (dummy ??= hashPassword("not-a-real-password-#1A"));

async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  if (!accountEmail()) return json({ error: "Login isn't configured on this server." }, 503);
  const ip = clientIp(req);
  const b = await body<{ email: string; password: string; remember: boolean }>(req);
  const email = normEmail(b?.email);
  const password = String(b?.password ?? "").slice(0, 256);

  // 5 failed attempts per 15 minutes per IP, 10 per hour per account (slows password guessing).
  const byIp = await limit(`login:ip:${ip}`, 5, 15 * 60_000);
  if (!byIp.ok) return tooMany(byIp.retryAfter);
  const byAcct = await limit(`login:acct:${email}`, 10, 60 * 60_000);
  if (!byAcct.ok) return tooMany(byAcct.retryAfter);

  const user = await userByEmail(email);
  const hash = (user && (await passwordHashFor(user.id))) || (await dummyHash());
  const okPw = await verifyPassword(password, hash);
  if (!user || !okPw) return json({ error: "Incorrect email or password." }, 401);
  if (user.disabled) return json({ error: "This account has been disabled. Ask the admin to turn it back on." }, 403);

  await clearLimit(`login:ip:${ip}`);
  await clearLimit(`login:acct:${email}`);
  const t = await createSession(user.id, b?.remember !== false, req.headers.get("user-agent") ?? "", ip);
  return setAuthCookies(json({ ok: true, email, role: user.role }), t);
}
export const POST = guard(handlePOST);
