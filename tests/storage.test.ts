import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN", "VERCEL", "ACCOUNT_DATA_DIR"];
const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));

beforeEach(() => {
  vi.resetModules();
  for (const k of ENV_KEYS) delete process.env[k];
});
afterEach(() => {
  vi.unstubAllGlobals();
  for (const k of ENV_KEYS) if (saved[k] === undefined) delete process.env[k];
  else process.env[k] = saved[k];
});

/** Minimal in-memory Upstash REST server, enough for kv.ts. */
function fakeRedis() {
  const data = new Map<string, string>();
  const ttl = new Map<string, number>();
  const exec = (cmd: (string | number)[]): unknown => {
    const [op, key, ...a] = cmd.map(String);
    switch (op.toUpperCase()) {
      case "GET":
        return data.get(key) ?? null;
      case "SET": {
        if (a.includes("NX") && data.has(key)) return null;
        data.set(key, a[0]);
        return "OK";
      }
      case "DEL":
        return data.delete(key) ? 1 : 0;
      case "EVAL": {
        // lock release: del KEYS[1] if value == ARGV[1]
        const [, k, id] = [a[0], a[1], a[2]];
        if (data.get(k) === id) return data.delete(k) ? 1 : 0;
        return 0;
      }
      case "INCRBY": {
        const n = Number(data.get(key) ?? 0) + Number(a[0]);
        data.set(key, String(n));
        return n;
      }
      case "PEXPIRE":
        if (!ttl.has(key)) ttl.set(key, Number(a[0]));
        return 1;
      case "PTTL":
        return ttl.get(key) ?? -1;
    }
    throw new Error(`unsupported ${op}`);
  };
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer tok");
    const out = url.endsWith("/pipeline") ? body.map((c: (string | number)[]) => ({ result: exec(c) })) : { result: exec(body) };
    return new Response(JSON.stringify(out), { status: 200 });
  });
  return { data, fetchMock };
}

describe("file storage (local)", () => {
  it("stores the account, creates and rotates sessions, detects token reuse", async () => {
    process.env.ACCOUNT_DATA_DIR = mkdtempSync(path.join(tmpdir(), "dsa-test-"));
    const { createSession, rotate, verifyAccess } = await import("@/lib/server/token");
    const t = await createSession(true, "vitest", "1.2.3.4");
    expect(await verifyAccess(t.access)).toMatchObject({ sid: t.session.id });

    const r1 = await rotate(t.refresh, "1.2.3.4");
    expect(r1?.refresh).toBeTruthy();
    expect(r1!.refresh).not.toBe(t.refresh);

    // Parallel request with the old token inside the grace window: access only.
    const graced = await rotate(t.refresh, "1.2.3.4");
    expect(graced?.access).toBeTruthy();
    expect(graced?.refresh).toBeUndefined();

    // Old token replayed after the grace window → session revoked.
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now + 60_000);
    expect(await rotate(t.refresh, "1.2.3.4")).toBeNull();
    expect(await rotate(r1!.refresh, "1.2.3.4")).toBeNull();
    vi.restoreAllMocks();
  });

  it("rejects malformed refresh tokens", async () => {
    process.env.ACCOUNT_DATA_DIR = mkdtempSync(path.join(tmpdir(), "dsa-test-"));
    const { rotate } = await import("@/lib/server/token");
    expect(await rotate(undefined, "x")).toBeNull();
    expect(await rotate("nodot", "x")).toBeNull();
    expect(await rotate("unknown.secret", "x")).toBeNull();
  });
});

describe("serverless without Redis (the Vercel ENOENT bug)", () => {
  it("fails with a clear message instead of trying to mkdir", async () => {
    process.env.VERCEL = "1";
    const kv = await import("@/lib/server/kv");
    await expect(kv.kvSet("account", {})).rejects.toBeInstanceOf(kv.StorageNotConfigured);
    const { guard } = await import("@/lib/server/http");
    const res = await guard(async () => {
      await kv.kvGet("account");
      return new Response("unreachable");
    })();
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe("config");
  });

  it("verifyAccess fails closed when storage is unavailable", async () => {
    process.env.VERCEL = "1";
    const { sign } = await import("@/lib/server/crypto");
    const { verifyAccess } = await import("@/lib/server/token");
    const token = sign({ typ: "access", sub: "tester@example.test", sid: "x", v: 1, exp: Date.now() + 60_000 });
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await verifyAccess(token)).toBeNull();
  });
});

describe("Upstash Redis storage", () => {
  it("keeps sessions in Redis (works across serverless instances)", async () => {
    process.env.VERCEL = "1";
    process.env.KV_REST_API_URL = "https://fake.upstash.io";
    process.env.KV_REST_API_TOKEN = "tok";
    const r = fakeRedis();
    vi.stubGlobal("fetch", r.fetchMock);

    const { createSession, verifyAccess, rotate } = await import("@/lib/server/token");
    const t = await createSession(false, "ua", "ip");
    expect(JSON.parse(r.data.get("dsa:account")!).sessions).toHaveLength(1);
    expect(r.data.has("dsa:lock:account")).toBe(false); // lock released

    // A "different instance": fresh modules, same Redis.
    vi.resetModules();
    const other = await import("@/lib/server/token");
    expect(await other.verifyAccess(t.access)).toMatchObject({ sid: t.session.id });
    expect(await rotate(t.refresh, "ip")).not.toBeNull();
    expect(await verifyAccess("bogus")).toBeNull();
  });

  it("shares rate limits through Redis", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io/";
    process.env.UPSTASH_REDIS_REST_TOKEN = "tok";
    vi.stubGlobal("fetch", fakeRedis().fetchMock);
    const { limit, clearLimit } = await import("@/lib/server/rateLimit");
    for (let i = 0; i < 5; i++) expect((await limit("login:ip:9", 5, 900_000)).ok).toBe(true);
    const blocked = await limit("login:ip:9", 5, 900_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBe(900);
    await clearLimit("login:ip:9");
    expect((await limit("login:ip:9", 5, 900_000)).ok).toBe(true);
  });
});

describe("progress sync API", () => {
  async function route() {
    process.env.ACCOUNT_DATA_DIR = mkdtempSync(path.join(tmpdir(), "dsa-test-"));
    vi.doMock("@/lib/server/session", () => ({ getUser: async () => ({ sid: "s1", sub: "tester@example.test" }), sameOrigin: () => true }));
    return import("@/app/api/progress/route");
  }
  const put = (body: unknown) => new Request("http://localhost/api/progress", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

  it("saves, returns and resolves conflicts (newest change wins)", async () => {
    const { GET, PUT } = await route();
    expect(await (await GET()).json()).toMatchObject({ state: null, updatedAt: 0 });

    expect((await PUT(put({ state: { doneDays: [1] }, updatedAt: 100 }))).status).toBe(200);
    expect(await (await GET()).json()).toMatchObject({ state: { doneDays: [1] }, updatedAt: 100 });

    // An older copy from another device is refused and the newer one returned.
    const stale = await PUT(put({ state: { doneDays: [] }, updatedAt: 50 }));
    expect(stale.status).toBe(409);
    expect(await stale.json()).toMatchObject({ state: { doneDays: [1] }, updatedAt: 100 });

    expect((await PUT(put({ state: { doneDays: [1, 2] }, updatedAt: 200 }))).status).toBe(200);
    expect((await (await GET()).json()).state.doneDays).toEqual([1, 2]);
  });

  it("validates input", async () => {
    const { PUT } = await route();
    expect((await PUT(put({ state: [1], updatedAt: 1 }))).status).toBe(400);
    expect((await PUT(put({ state: {}, updatedAt: -1 }))).status).toBe(400);
    expect((await PUT(put({ state: { big: "x".repeat(1_000_000) }, updatedAt: 1 }))).status).toBe(413);
  });
});
