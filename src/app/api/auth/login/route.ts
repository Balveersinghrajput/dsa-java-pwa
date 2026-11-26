import { verifyPassword } from "@/lib/server/crypto";
import { accountEmail, currentPasswordHash } from "@/lib/server/account";
import { createSession } from "@/lib/server/token";
import { sameOrigin, setAuthCookies } from "@/lib/server/session";
import { clientIp, rateLimit, resetLimit } from "@/lib/server/rateLimit";
import { body, json, tooMany } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const ip = clientIp(req);
  // 5 failed attempts per 15 minutes per IP, 10 per hour for the account (slows password guessing).
  const byIp = rateLimit(`login:ip:${ip}`, 5, 15 * 60_000);
  if (!byIp.ok) return tooMany(byIp.retryAfter);
  const byAcct = rateLimit("login:acct", 10, 60 * 60_000);
  if (!byAcct.ok) return tooMany(byAcct.retryAfter);

  const b = await body<{ email: string; password: string; remember: boolean }>(req);
  const email = String(b?.email ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(b?.password ?? "").slice(0, 256);
  const hash = await currentPasswordHash();
  if (!accountEmail() || !hash) return json({ error: "Login isn't configured on this server." }, 503);

  // Always run the hash so timing doesn't reveal whether the email matched.
  const okPw = await verifyPassword(password, hash);
  if (email !== accountEmail() || !okPw) return json({ error: "Incorrect email or password." }, 401);

  resetLimit(`login:ip:${ip}`);
  resetLimit("login:acct");
  const t = await createSession(b?.remember !== false, req.headers.get("user-agent") ?? "", ip);
  return setAuthCookies(json({ ok: true, email }), t);
}
