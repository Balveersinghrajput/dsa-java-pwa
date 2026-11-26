import { kvGet, kvUpdate } from "./kv";

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
export interface AccountData {
  passwordHash?: string; // set after a reset/change; overrides ACCOUNT_PASSWORD_HASH
  passwordVersion: number;
  reset?: { tokenHash: string; expires: number };
  sessions: StoredSession[];
}

const KEY = "account";
const empty = (): AccountData => ({ passwordVersion: 1, sessions: [] });

function clean(raw: Partial<AccountData> | null): AccountData | null {
  if (!raw || typeof raw !== "object") return null;
  return { passwordHash: raw.passwordHash, passwordVersion: raw.passwordVersion ?? 1, reset: raw.reset, sessions: Array.isArray(raw.sessions) ? raw.sessions : [] };
}

// Tiny read cache: middleware checks the session on every request.
let cache: { at: number; data: AccountData } | null = null;

export async function readAccount(): Promise<AccountData> {
  if (cache && Date.now() - cache.at < 1500) return cache.data;
  // "admin" is the older file name; read it if the new record doesn't exist yet.
  const data = clean(await kvGet<AccountData>(KEY)) ?? clean(await kvGet<AccountData>("admin")) ?? empty();
  cache = { at: Date.now(), data };
  return data;
}

/** Locked read-modify-write. Expired sessions are pruned on every write. */
export async function updateAccount(fn: (d: AccountData) => AccountData): Promise<AccountData> {
  cache = null;
  const legacy = clean(await kvGet<AccountData>(KEY)) ? null : clean(await kvGet<AccountData>("admin"));
  const next = await kvUpdate<AccountData>(KEY, () => legacy ?? empty(), (cur) => {
    const now = Date.now();
    const c = clean(cur) ?? empty();
    return fn({ ...c, sessions: c.sessions.filter((s) => s.expires > now) });
  });
  cache = { at: Date.now(), data: next };
  return next;
}

export const accountEmail = () => (process.env.ACCOUNT_EMAIL || process.env.ADMIN_EMAIL || "").trim().toLowerCase();

export async function currentPasswordHash() {
  const d = await readAccount();
  return d.passwordHash || process.env.ACCOUNT_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH || "";
}
