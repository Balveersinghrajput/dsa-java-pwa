import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { localNow, reminderDue } from "@/lib/server/reminders";

// 2026-11-26 13:40 UTC = 19:10 in India (UTC+5:30), a Thursday.
const NOW = new Date("2026-11-26T13:40:00Z");
const base = { enabled: true, time: "19:00", tz: "Asia/Kolkata", doneDates: [], restDays: [0], leaves: [], now: NOW };

describe("reminder timing", () => {
  it("uses the learner's own time zone", () => {
    expect(localNow("Asia/Kolkata", NOW)).toEqual({ date: "2026-11-26", weekday: 4, minutes: 19 * 60 + 10 });
    expect(localNow("UTC", NOW).minutes).toBe(13 * 60 + 40);
  });

  it("sends once the time has come", () => {
    expect(reminderDue(base)).toMatchObject({ send: true, date: "2026-11-26" });
  });

  it("does not send early, twice, or hours late", () => {
    expect(reminderDue({ ...base, time: "19:30" }).reason).toBe("too early");
    expect(reminderDue({ ...base, lastSent: "2026-11-26" }).reason).toBe("already sent today");
    expect(reminderDue({ ...base, time: "09:00" }).reason).toBe("window passed");
  });

  it("skips when off, on holidays, on leave and after studying", () => {
    expect(reminderDue({ ...base, enabled: false }).send).toBe(false);
    expect(reminderDue({ ...base, restDays: [4] }).reason).toBe("holiday");
    expect(reminderDue({ ...base, leaves: ["2026-11-26"] }).reason).toBe("leave");
    expect(reminderDue({ ...base, doneDates: ["2026-11-26"] }).reason).toBe("studied today");
  });
});

describe("reminder scheduler endpoint", () => {
  const sent: { endpoint: string; payload: { title: string; body: string; url: string } }[] = [];

  beforeEach(() => {
    vi.resetModules();
    sent.length = 0;
    for (const k of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN", "VERCEL"]) delete process.env[k];
    process.env.ACCOUNT_DATA_DIR = mkdtempSync(path.join(tmpdir(), "dsa-push-"));
    process.env.CRON_SECRET = "cron-secret-for-tests";
    process.env.VAPID_PUBLIC_KEY = "pub";
    process.env.VAPID_PRIVATE_KEY = "priv";
    vi.doMock("web-push", () => ({
      default: {
        setVapidDetails: () => {},
        sendNotification: async (sub: { endpoint: string }, body: string) => {
          if (sub.endpoint.includes("gone")) throw Object.assign(new Error("gone"), { statusCode: 410 });
          sent.push({ endpoint: sub.endpoint, payload: JSON.parse(body) });
        },
      },
    }));
  });

  async function seed(time: string) {
    const { kvSet } = await import("@/lib/server/kv");
    const { localNow: ln } = await import("@/lib/server/reminders");
    const nowMin = ln("UTC").minutes;
    const hhmm = time === "now" ? `${String(Math.floor(nowMin / 60)).padStart(2, "0")}:${String(nowMin % 60).padStart(2, "0")}` : time;
    await kvSet("progress", { state: { reminder: { enabled: true, time: hhmm }, doneDays: [1, 2], planKeys: [], restDays: [], leaves: [], doneAt: {} }, updatedAt: 1, savedAt: 1 });
    const sub = (endpoint: string) => ({ endpoint, keys: { p256dh: "k", auth: "a" }, ua: "t", created: 1 });
    await kvSet("push", { users: { admin: { tz: "UTC", subs: [sub("https://push.example/ok"), sub("https://push.example/gone")] } } });
  }
  const call = async (key?: string) => {
    const { GET } = await import("@/app/api/cron/reminders/route");
    return GET(new Request(`http://localhost/api/cron/reminders${key ? `?key=${key}` : ""}`));
  };

  it("requires the cron secret", async () => {
    expect((await call()).status).toBe(401);
    expect((await call("wrong")).status).toBe(401);
  });

  it("sends the next lesson once, and drops dead devices", async () => {
    await seed("now");
    const r = await (await call("cron-secret-for-tests")).json();
    expect(r.sent).toBe(1);
    expect(sent).toHaveLength(1);
    expect(sent[0].payload.url).toBe("/lessons/3");
    expect(sent[0].payload.body).toContain("Day 3");

    const { readPush } = await import("@/lib/server/reminders");
    const entry = (await readPush()).admin;
    expect(entry.subs.map((s) => s.endpoint)).toEqual(["https://push.example/ok"]);
    expect(entry.lastSent).toBeTruthy();

    // Second run the same day: nothing more.
    await call("cron-secret-for-tests");
    expect(sent).toHaveLength(1);
  });

  it("waits until the chosen time", async () => {
    const { localNow: ln } = await import("@/lib/server/reminders");
    const later = (ln("UTC").minutes + 120) % 1440;
    if (later < 120) return; // too close to midnight to test "later today"
    await seed(`${String(Math.floor(later / 60)).padStart(2, "0")}:${String(later % 60).padStart(2, "0")}`);
    await call("cron-secret-for-tests");
    expect(sent).toHaveLength(0);
  });
});
