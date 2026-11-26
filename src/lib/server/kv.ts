import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Tiny key-value store used for the account, sessions, rate limits and synced progress.
 *
 *  - Upstash Redis (REST) when UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN are set.
 *    Required on Vercel, where the filesystem is read-only and every route runs in its own instance.
 *  - Otherwise JSON files in .data/ (or ACCOUNT_DATA_DIR) for local / single-server use.
 */
const REDIS_URL = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "").replace(/\/+$/, "");
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
const PREFIX = process.env.KV_PREFIX || "dsa:";

export const usingRedis = () => Boolean(REDIS_URL && REDIS_TOKEN);

export class StorageNotConfigured extends Error {
  constructor() {
    super(
      "Server storage isn't configured. On Vercel add an Upstash Redis database (Storage → Marketplace → Upstash) so UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, then redeploy.",
    );
  }
}

/** Serverless hosts (Vercel, Netlify, Lambda) can't keep files: Redis is required there. */
const serverless = () => Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
function assertStorage() {
  if (!usingRedis() && serverless()) throw new StorageNotConfigured();
}

/* ---------------------------------- Redis ---------------------------------- */

type Cmd = (string | number)[];

async function redis<T = unknown>(cmd: Cmd): Promise<T> {
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${REDIS_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
  if (!res.ok || data.error) throw new Error(`Redis ${cmd[0]} failed: ${data.error ?? res.status}`);
  return data.result as T;
}

async function pipeline(cmds: Cmd[]): Promise<unknown[]> {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${REDIS_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => [])) as { result?: unknown; error?: string }[];
  if (!res.ok || !Array.isArray(data)) throw new Error(`Redis pipeline failed: ${res.status}`);
  const bad = data.find((d) => d.error);
  if (bad) throw new Error(`Redis pipeline failed: ${bad.error}`);
  return data.map((d) => d.result);
}

/* ---------------------------------- Files ---------------------------------- */

const DIR = process.env.ACCOUNT_DATA_DIR || process.env.ADMIN_DATA_DIR || path.join(process.cwd(), ".data");
const fileOf = (key: string) => path.join(DIR, `${key.replace(/[^a-z0-9_-]/gi, "_")}.json`);

/* ----------------------------------- API ----------------------------------- */

export async function kvGet<T>(key: string): Promise<T | null> {
  assertStorage();
  if (usingRedis()) {
    const raw = await redis<string | null>(["GET", PREFIX + key]);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  try {
    return JSON.parse(await readFile(fileOf(key), "utf8")) as T;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  assertStorage();
  const raw = JSON.stringify(value);
  if (usingRedis()) {
    await redis(["SET", PREFIX + key, raw]);
    return;
  }
  await mkdir(DIR, { recursive: true, mode: 0o700 });
  const tmp = `${fileOf(key)}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, raw, { mode: 0o600 });
  await rename(tmp, fileOf(key)); // atomic replace
}

// In-process queue per key so writes from one instance never interleave.
const queues = new Map<string, Promise<unknown>>();

/**
 * Read-modify-write under a lock. Within one process writes are queued; with Redis a
 * short SET NX lock also serialises writers running in other instances.
 */
export function kvUpdate<T>(key: string, fallback: () => T, fn: (cur: T) => T): Promise<T> {
  const prev = queues.get(key) ?? Promise.resolve();
  const run = prev.then(async () => {
    const release = await lock(key);
    try {
      const next = fn((await kvGet<T>(key)) ?? fallback());
      await kvSet(key, next);
      return next;
    } finally {
      await release();
    }
  });
  queues.set(key, run.catch(() => {}));
  return run;
}

async function lock(key: string): Promise<() => Promise<void>> {
  if (!usingRedis()) return async () => {};
  const k = `${PREFIX}lock:${key}`;
  const id = Math.random().toString(36).slice(2);
  for (let i = 0; i < 40; i++) {
    if ((await redis(["SET", k, id, "NX", "PX", 5000])) === "OK") {
      return async () => {
        // Only remove our own lock (it may have expired and been taken by someone else).
        await redis(["EVAL", "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end", 1, k, id]).catch(() => {});
      };
    }
    await new Promise((r) => setTimeout(r, 50 + i * 10));
  }
  throw new Error(`Timed out waiting for lock ${key}`);
}

/**
 * Fixed-window counter shared by every instance (Redis only).
 * Returns the hit count in the current window and the ms left in it.
 */
export async function kvHit(key: string, windowMs: number, cost: number): Promise<{ count: number; ttl: number }> {
  const k = `${PREFIX}rl:${key}`;
  const [count, , ttl] = (await pipeline([["INCRBY", k, cost], ["PEXPIRE", k, windowMs, "NX"], ["PTTL", k]])) as number[];
  return { count, ttl: ttl > 0 ? ttl : windowMs };
}

export async function kvDel(key: string) {
  if (usingRedis()) await redis(["DEL", `${PREFIX}rl:${key}`]);
}
