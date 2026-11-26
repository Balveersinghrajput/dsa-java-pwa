import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/** One signed-in device. Only a SHA-256 hash of its refresh token is stored. */
export interface StoredSession {
  id: string;
  tokenHash: string; // current refresh token
  prevHash?: string; // previous token, accepted briefly after rotation (parallel requests)
  rotatedAt: number;
  created: number;
  lastUsed: number;
  expires: number;
  remember: boolean;
  ua: string;
  ip: string;
}

/** Server-side account data (the password itself is only ever stored as a hash). */
interface AccountData {
  passwordHash?: string; // set after a reset/change; overrides ACCOUNT_PASSWORD_HASH
  passwordVersion: number;
  reset?: { tokenHash: string; expires: number };
  sessions: StoredSession[];
}

const DIR = process.env.ACCOUNT_DATA_DIR || process.env.ADMIN_DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "account.json");
const LEGACY = path.join(DIR, "admin.json");
const empty = (): AccountData => ({ passwordVersion: 1, sessions: [] });

// Tiny read cache: middleware checks the session on every request.
let cache: { at: number; data: AccountData } | null = null;

export async function readAccount(): Promise<AccountData> {
  if (cache && Date.now() - cache.at < 1500) return cache.data;
  let data = empty();
  for (const f of [FILE, LEGACY]) {
    try {
      const raw = JSON.parse(await readFile(f, "utf8"));
      data = { passwordHash: raw.passwordHash, passwordVersion: raw.passwordVersion ?? 1, reset: raw.reset, sessions: Array.isArray(raw.sessions) ? raw.sessions : [] };
      break;
    } catch {
      /* try next */
    }
  }
  cache = { at: Date.now(), data };
  return data;
}

// Serialise writes so two requests never overwrite each other's changes.
let queue: Promise<unknown> = Promise.resolve();

/** Atomic write (temp file + rename). Expired sessions are pruned on every write. */
export function updateAccount(fn: (d: AccountData) => AccountData): Promise<AccountData> {
  const run = queue.then(async () => {
    cache = null;
    const now = Date.now();
    const cur = await readAccount();
    const next = fn({ ...cur, sessions: cur.sessions.filter((s) => s.expires > now) });
    await mkdir(DIR, { recursive: true, mode: 0o700 });
    const tmp = `${FILE}.${process.pid}.${now}.tmp`;
    await writeFile(tmp, JSON.stringify(next, null, 2), { mode: 0o600 });
    await rename(tmp, FILE);
    cache = { at: Date.now(), data: next };
    return next;
  });
  queue = run.catch(() => {});
  return run;
}

export const accountEmail = () => (process.env.ACCOUNT_EMAIL || process.env.ADMIN_EMAIL || "").trim().toLowerCase();

export async function currentPasswordHash() {
  const d = await readAccount();
  return d.passwordHash || process.env.ACCOUNT_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH || "";
}
