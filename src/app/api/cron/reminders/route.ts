import { kvGet } from "@/lib/server/kv";
import { progressKey, userById } from "@/lib/server/account";
import { safeEqual } from "@/lib/server/crypto";
import { readPush, reminderDue, updatePush } from "@/lib/server/reminders";
import { nextLesson, sendPush } from "@/lib/server/push";
import { guard, json } from "@/lib/server/http";
import type { StoredProgress } from "@/app/api/progress/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Run every 15 minutes by an external scheduler (e.g. cron-job.org) with
 * "Authorization: Bearer <CRON_SECRET>" (or ?key=<CRON_SECRET>). Sends each
 * learner's daily reminder at their chosen time, in their own time zone.
 */
async function handleGET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ error: "Set CRON_SECRET first." }, 503);
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? new URL(req.url).searchParams.get("key") ?? "";
  if (!safeEqual(given, secret)) return json({ error: "Unauthorized" }, 401);

  const users = await readPush();
  const results: Record<string, string> = {};
  const sentDates: Record<string, string> = {};
  const goneAll: Record<string, string[]> = {};

  for (const [uid, entry] of Object.entries(users)) {
    if (!entry.subs.length) continue;
    const user = await userById(uid);
    if (!user || user.disabled) continue;
    const p = await kvGet<StoredProgress>(progressKey(uid));
    const s = (p?.state ?? {}) as Record<string, unknown>;
    const reminder = (s.reminder ?? {}) as { enabled?: boolean; time?: string };
    const due = reminderDue({
      enabled: !!reminder.enabled,
      time: String(reminder.time ?? "19:00"),
      tz: entry.tz,
      lastSent: entry.lastSent,
      doneDates: Object.values((s.doneAt ?? {}) as Record<string, string>),
      restDays: Array.isArray(s.restDays) ? (s.restDays as number[]) : [0],
      leaves: Array.isArray(s.leaves) ? (s.leaves as string[]) : [],
    });
    results[uid] = due.reason;
    if (!due.send) continue;

    const next = nextLesson(s);
    const r = await sendPush(entry.subs, {
      title: "Time to study DSA 📚",
      body: next ? `Day ${next.day} is waiting: ${next.title}` : "Keep your streak going!",
      url: next ? `/lessons/${next.day}` : "/",
      tag: "daily",
    });
    results[uid] = `sent to ${r.sent}/${entry.subs.length}`;
    if (r.sent) sentDates[uid] = due.date;
    if (r.gone.length) goneAll[uid] = r.gone;
  }

  if (Object.keys(sentDates).length || Object.keys(goneAll).length) {
    await updatePush((all) => {
      const next = { ...all };
      for (const [uid, e] of Object.entries(next)) {
        next[uid] = { ...e, lastSent: sentDates[uid] ?? e.lastSent, subs: e.subs.filter((x) => !goneAll[uid]?.includes(x.endpoint)) };
      }
      return next;
    });
  }
  return json({ ok: true, checked: Object.keys(results).length, sent: Object.keys(sentDates).length, results });
}

export const GET = guard(handleGET);
export const POST = guard(handleGET);
