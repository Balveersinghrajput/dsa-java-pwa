import { kvGet, kvSet, usingRedis } from "@/lib/server/kv";
import { safeEqual } from "@/lib/server/crypto";
import { guard, json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Called once a day by Vercel Cron (see vercel.json). Writes and reads a key so the
 * Upstash free database always counts as active and is never archived for inactivity.
 * If CRON_SECRET is set in Vercel, only Vercel's cron (which sends it) can call this.
 */
async function handleGET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && !safeEqual(req.headers.get("authorization") ?? "", `Bearer ${secret}`)) return json({ error: "Unauthorized" }, 401);
  const at = new Date().toISOString();
  await kvSet("keepalive", { at });
  const back = await kvGet<{ at: string }>("keepalive");
  return json({ ok: back?.at === at, storage: usingRedis() ? "redis" : "files", at });
}

export const GET = guard(handleGET);
