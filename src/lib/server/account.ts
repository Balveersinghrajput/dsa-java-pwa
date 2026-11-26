import { kvGet, kvRemove, kvUpdate } from "./kv";

/**
 * Accounts.
 *  - The owner ("admin") signs in with ADMIN_EMAIL / ADMIN_PASSWORD_HASH from the environment.
 *    Their records keep the original keys ("account", "progress"), so nothing needs migrating.
 *  - Friends join with an invite link. Each gets a user id ("u_…") and separate records
 *    ("account:<id>", "progress:<id>"), so nobody can read or change anyone else's data.
 */
export const ADMIN_ID = "admin";
export type Role = "admin" | "user";

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

/** Per-user security data (the password itself is only ever stored as a hash). */
export interface AccountData {
  passwordHash?: string; // admin: overrides ADMIN_PASSWORD_HASH after a change; friends: their hash
  passwordVersion: number;
  reset?: { tokenHash: string; expires: number };
  sessions: StoredSession[];
}

/** A friend's entry in the user directory. */
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  created: number;
  disabled?: boolean;
  invitedBy?: string; // invite id
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: Role;
  disabled: boolean;
}

export const accountKey = (uid: string) => (uid === ADMIN_ID ? "account" : `account:${uid}`);
export const progressKey = (uid: string) => (uid === ADMIN_ID ? "progress" : `progress:${uid}`);

export const accountEmail = () => (process.env.ACCOUNT_EMAIL || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
export const normEmail = (e: unknown) => String(e ?? "").trim().toLowerCase().slice(0, 254);

const empty = (): AccountData => ({ passwordVersion: 1, sessions: [] });
function clean(raw: Partial<AccountData> | null): AccountData | null {
  if (!raw || typeof raw !== "object") return null;
  return { passwordHash: raw.passwordHash, passwordVersion: raw.passwordVersion ?? 1, reset: raw.reset, sessions: Array.isArray(raw.sessions) ? raw.sessions : [] };
}

/* ------------------------------ account records ------------------------------ */

// Tiny read cache: middleware checks the session on every request.
const cache = new Map<string, { at: number; data: AccountData }>();

export async function readAccount(uid: string = ADMIN_ID): Promise<AccountData> {
  const hit = cache.get(uid);
  if (hit && Date.now() - hit.at < 1500) return hit.data;
  let data = clean(await kvGet<AccountData>(accountKey(uid)));
  // "admin" is the older record name for the owner's account.
  if (!data && uid === ADMIN_ID) data = clean(await kvGet<AccountData>("admin"));
  data ??= empty();
  cache.set(uid, { at: Date.now(), data });
  return data;
}

/** Locked read-modify-write. Expired sessions are pruned on every write. */
export async function updateAccount(uid: string, fn: (d: AccountData) => AccountData): Promise<AccountData> {
  cache.delete(uid);
  const legacy = uid === ADMIN_ID && !clean(await kvGet<AccountData>("account")) ? clean(await kvGet<AccountData>("admin")) : null;
  const next = await kvUpdate<AccountData>(accountKey(uid), () => legacy ?? empty(), (cur) => {
    const now = Date.now();
    const c = clean(cur) ?? empty();
    return fn({ ...c, sessions: c.sessions.filter((s) => s.expires > now) });
  });
  cache.set(uid, { at: Date.now(), data: next });
  return next;
}

export async function passwordHashFor(uid: string) {
  const d = await readAccount(uid);
  if (uid === ADMIN_ID) return d.passwordHash || process.env.ACCOUNT_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH || "";
  return d.passwordHash || "";
}

/** @deprecated kept for the owner account */
export const currentPasswordHash = () => passwordHashFor(ADMIN_ID);

/* -------------------------------- directory -------------------------------- */

let dirCache: { at: number; users: UserRecord[] } | null = null;

export async function listUsers(): Promise<UserRecord[]> {
  if (dirCache && Date.now() - dirCache.at < 1500) return dirCache.users;
  const users = (await kvGet<{ users: UserRecord[] }>("users"))?.users ?? [];
  dirCache = { at: Date.now(), users };
  return users;
}

export async function updateUsers(fn: (users: UserRecord[]) => UserRecord[]): Promise<UserRecord[]> {
  dirCache = null;
  const next = await kvUpdate<{ users: UserRecord[] }>("users", () => ({ users: [] }), (cur) => ({ users: fn(cur.users ?? []) }));
  dirCache = { at: Date.now(), users: next.users };
  return next.users;
}

const adminInfo = (): UserInfo => ({ id: ADMIN_ID, email: accountEmail(), name: "Admin", role: "admin", disabled: false });
const toInfo = (u: UserRecord): UserInfo => ({ id: u.id, email: u.email, name: u.name, role: "user", disabled: !!u.disabled });

export async function userById(uid: string): Promise<UserInfo | null> {
  if (uid === ADMIN_ID) return accountEmail() ? adminInfo() : null;
  const u = (await listUsers()).find((x) => x.id === uid);
  return u ? toInfo(u) : null;
}

export async function userByEmail(email: string): Promise<UserInfo | null> {
  const e = normEmail(email);
  if (!e) return null;
  if (e === accountEmail()) return adminInfo();
  const u = (await listUsers()).find((x) => x.email === e);
  return u ? toInfo(u) : null;
}

/** Removes a friend and everything stored for them. */
export async function deleteUser(uid: string) {
  if (uid === ADMIN_ID) throw new Error("The admin account can't be deleted.");
  await updateUsers((users) => users.filter((u) => u.id !== uid));
  await kvRemove(accountKey(uid));
  await kvRemove(progressKey(uid));
  cache.delete(uid);
}

/* --------------------------------- invites --------------------------------- */

export interface Invite {
  id: string;
  codeHash: string; // only the hash of the invite code is stored
  note: string;
  created: number;
  expires: number;
  usedBy?: string;
  usedAt?: number;
}

export const listInvites = async () => (await kvGet<{ invites: Invite[] }>("invites"))?.invites ?? [];
export const updateInvites = (fn: (list: Invite[]) => Invite[]) =>
  kvUpdate<{ invites: Invite[] }>("invites", () => ({ invites: [] }), (cur) => ({ invites: fn(cur.invites ?? []) })).then((r) => r.invites);
