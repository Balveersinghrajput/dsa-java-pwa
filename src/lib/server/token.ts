import { randomBytes } from "node:crypto";
import { safeEqual, sha256, sign, unsign } from "./crypto";
import { ADMIN_ID, readAccount, updateAccount, userById, type Role, type StoredSession } from "./account";

/**
 * Two-token sessions:
 *  - Access token: signed, short-lived (15 min), sent with every request (cookie path "/").
 *  - Refresh token: random, long-lived, only sent to /api/auth (cookie path "/api/auth").
 *    It is rotated on every use; reusing an old one revokes the whole session (theft detection).
 * Both cookies are HttpOnly, so page scripts can never read them.
 */
export const ACCESS_COOKIE = "dsa_at";
export const REFRESH_COOKIE = "dsa_rt";
export const ACCESS_TTL = 15 * 60; // seconds
const DAY = 24 * 60 * 60;
const GRACE_MS = 30_000; // previous refresh token stays valid this long after rotation

export interface AccessClaims {
  typ: "access";
  uid: string; // user id ("admin" for the owner)
  role: Role;
  sub: string; // email
  sid: string; // session id
  v: number; // password version
  exp: number; // ms
}

const secure = process.env.NODE_ENV === "production";

export const accessCookie = (token: string) => ({ name: ACCESS_COOKIE, value: token, httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: ACCESS_TTL });
export const refreshCookie = (token: string, s: StoredSession) => ({
  name: REFRESH_COOKIE,
  value: token,
  httpOnly: true,
  secure,
  sameSite: "strict" as const,
  path: "/api/auth",
  // "Remember me" off → browser-session cookie (cleared when the browser closes).
  ...(s.remember ? { maxAge: Math.floor((s.expires - Date.now()) / 1000) } : {}),
});
export const clearedCookies = [
  { name: ACCESS_COOKIE, value: "", path: "/", maxAge: 0 },
  { name: REFRESH_COOKIE, value: "", path: "/api/auth", maxAge: 0 },
];

function issueAccess(uid: string, role: Role, email: string, sid: string, v: number) {
  return sign({ typ: "access", uid, role, sub: email, sid, v, exp: Date.now() + ACCESS_TTL * 1000 } satisfies AccessClaims);
}

/** Valid access token → claims. Checks signature, expiry, user (exists, not disabled, same email), password version and session. */
export async function verifyAccess(token: string | undefined): Promise<AccessClaims | null> {
  let c: (Omit<AccessClaims, "uid" | "role"> & { uid?: string; role?: Role }) | null;
  try {
    c = unsign<AccessClaims>(token);
  } catch (e) {
    console.error("[auth]", (e as Error).message);
    return null;
  }
  if (!c || c.typ !== "access" || c.exp < Date.now()) return null;
  const uid = c.uid ?? ADMIN_ID; // tokens issued before multi-user support belong to the owner
  try {
    const user = await userById(uid);
    if (!user || user.disabled || user.email !== c.sub) return null;
    const acct = await readAccount(uid);
    if (c.v !== acct.passwordVersion) return null;
    if (!acct.sessions.some((s) => s.id === c.sid && s.expires > Date.now())) return null;
    return { ...c, uid, role: user.role } as AccessClaims;
  } catch (e) {
    console.error("[auth] session store unavailable:", (e as Error).message);
    return null;
  }
}

const newSecret = () => randomBytes(32).toString("base64url");

/** Refresh tokens look like "uid.sid.secret" (older owner tokens: "sid.secret"). */
export function parseRefresh(refresh: string | undefined): { uid: string; sid: string; secret: string } | null {
  const parts = (refresh ?? "").split(".");
  if (parts.length === 2 && parts[0] && parts[1]) return { uid: ADMIN_ID, sid: parts[0], secret: parts[1] };
  if (parts.length === 3 && parts.every(Boolean)) return { uid: parts[0], sid: parts[1], secret: parts[2] };
  return null;
}

/** Creates a session after a successful login. */
export async function createSession(uid: string, remember: boolean, ua: string, ip: string) {
  const user = await userById(uid);
  if (!user) throw new Error("Unknown user");
  const id = randomBytes(12).toString("base64url");
  const secret = newSecret();
  const now = Date.now();
  const session: StoredSession = {
    id,
    tokenHash: sha256(secret),
    rotatedAt: now,
    created: now,
    lastUsed: now,
    expires: now + (remember ? 30 : 1) * DAY * 1000,
    remember,
    ua: ua.slice(0, 200),
    ip,
  };
  const acct = await updateAccount(uid, (d) => ({ ...d, sessions: [...d.sessions, session].slice(-20) }));
  return { access: issueAccess(uid, user.role, user.email, id, acct.passwordVersion), refresh: `${uid}.${id}.${secret}`, session };
}

/**
 * Exchanges a refresh token for a new access token + a new refresh token.
 * Returns null if invalid. Reuse of an old token outside the grace window revokes the session.
 */
export async function rotate(refresh: string | undefined, ip: string) {
  const p = parseRefresh(refresh);
  if (!p) return null;
  const user = await userById(p.uid);
  if (!user || user.disabled) return null;
  const { uid, sid: id } = p;
  const hash = sha256(p.secret);
  const nextSecret = newSecret();
  let result: { access: string; refresh?: string; session: StoredSession } | null = null;

  await updateAccount(uid, (d) => {
    const s = d.sessions.find((x) => x.id === id);
    if (!s || s.expires < Date.now()) return d;
    const now = Date.now();
    if (safeEqual(hash, s.tokenHash)) {
      const updated = { ...s, prevHash: s.tokenHash, tokenHash: sha256(nextSecret), rotatedAt: now, lastUsed: now, ip };
      result = { access: issueAccess(uid, user.role, user.email, id, d.passwordVersion), refresh: `${uid}.${id}.${nextSecret}`, session: updated };
      return { ...d, sessions: d.sessions.map((x) => (x.id === id ? updated : x)) };
    }
    if (s.prevHash && safeEqual(hash, s.prevHash) && now - s.rotatedAt < GRACE_MS) {
      // A parallel request used the token we just rotated: give it an access token only.
      result = { access: issueAccess(uid, user.role, user.email, id, d.passwordVersion), session: s };
      return d;
    }
    // Old token replayed → assume it was stolen and end this session.
    console.warn(`[auth] refresh token reuse detected, revoking session ${id}`);
    return { ...d, sessions: d.sessions.filter((x) => x.id !== id) };
  });
  return result as { access: string; refresh?: string; session: StoredSession } | null;
}

export async function revokeSession(uid: string, id: string) {
  await updateAccount(uid, (d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));
}


/** Blocks cross-site requests: the Origin header (when present) must match this host. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
