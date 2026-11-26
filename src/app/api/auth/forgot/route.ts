import { randomToken, sha256 } from "@/lib/server/crypto";
import { normEmail, updateAccount, userByEmail } from "@/lib/server/account";
import { mailConfigured, sendMail } from "@/lib/server/mail";
import { sameOrigin } from "@/lib/server/session";
import { clientIp, limit } from "@/lib/server/rateLimit";
import { body, json, tooMany, guard } from "@/lib/server/http";

export const runtime = "nodejs";
const TTL = 15 * 60_000;

/**
 * Sends a one-time reset link to the account email. The response is the same
 * whether or not the email matches, so it can't be used to discover accounts.
 */
async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const ip = await limit(`forgot:ip:${clientIp(req)}`, 3, 60 * 60_000);
  if (!ip.ok) return tooMany(ip.retryAfter);
  const b = await body<{ email: string }>(req);
  const email = normEmail(b?.email);
  const acct = await limit(`forgot:acct:${email}`, 5, 60 * 60_000);
  if (!acct.ok) return tooMany(acct.retryAfter);
  // Checked before comparing emails so the reply never reveals whether an email has an account.
  if (!mailConfigured()) {
    return json({ error: "Email isn't configured on this server yet. Add SMTP settings to .env.local (see .env.example), then try again." }, 503);
  }
  const generic = { ok: true, message: "If that email has an account, a reset link has been sent. It expires in 15 minutes." };
  const user = await userByEmail(email);
  if (!user || user.disabled) return json(generic);

  const token = randomToken();
  await updateAccount(user.id, (d) => ({ ...d, reset: { tokenHash: sha256(token), expires: Date.now() + TTL } }));
  const base = (process.env.APP_URL || new URL(req.url).origin).replace(/\/$/, "");
  const link = `${base}/reset?token=${encodeURIComponent(`${user.id}.${token}`)}`;
  try {
    await sendMail(
      user.email,
      "Reset your DSA in Java password",
      `Someone asked to reset your password.\n\nOpen this link within 15 minutes to choose a new password:\n${link}\n\nIf this wasn't you, ignore this email — your password stays the same.`,
      `<p>Someone asked to reset your DSA in Java password.</p><p><a href="${link}">Choose a new password</a> (link expires in 15 minutes).</p><p>If this wasn't you, ignore this email — your password stays the same.</p>`,
    );
  } catch (e) {
    console.error("[forgot] email failed:", (e as Error).message);
    return json({ error: "Couldn't send the email. Check the SMTP settings on the server." }, 502);
  }
  return json(generic);
}
export const POST = guard(handlePOST);
