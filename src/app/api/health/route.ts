import { kvPing, usingRedis } from "@/lib/server/kv";
import { accountEmail } from "@/lib/server/account";
import { mailConfigured } from "@/lib/server/mail";
import { json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Setup check: which settings are present (yes/no only, never the values).
 * Open /api/health after deploying to see what's missing.
 */
export async function GET() {
  const storage = await kvPing();
  const checks = {
    sessionSecret: (process.env.SESSION_SECRET ?? "").length >= 32,
    accountEmail: !!accountEmail(),
    passwordHash: !!(process.env.ACCOUNT_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH),
    storage: usingRedis() ? "redis" : "files",
    storageOk: storage === "ok",
    email: mailConfigured(),
    appUrl: !!process.env.APP_URL,
    trustProxy: process.env.TRUST_PROXY === "1",
    pushKeys: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    cronSecret: !!process.env.CRON_SECRET,
  };
  const problems = [
    !checks.sessionSecret && "SESSION_SECRET is missing or shorter than 32 characters.",
    !checks.accountEmail && "ADMIN_EMAIL is missing.",
    !checks.passwordHash && "ADMIN_PASSWORD_HASH is missing.",
    !checks.storageOk && storage,
    !checks.email && "SMTP settings are missing (forgot password won't work).",
    !checks.pushKeys && "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are missing (phone reminders won't work).",
    !checks.cronSecret && "CRON_SECRET is missing (the reminder scheduler can't run).",
  ].filter(Boolean);
  return json({ ok: problems.length === 0, checks, problems });
}
