import { randomBytes } from "node:crypto";
import { safeEqual, sha256, sign, unsign } from "./crypto";
import { accountEmail, readAccount, updateAccount, type StoredSession } from "./account";

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

function issueAccess(sid: string, v: number) {
  return sign({ typ: "access", sub: accountEmail(), sid, v, exp: Date.now() + ACCESS_TTL * 1000 } satisfies AccessClaims);
}

/** Valid access token → claims. Checks signature, expiry, account, password version and that the session still exists. */
export async function verifyAccess(token: string | undefined): Promise<AccessClaims | null> {
  const c = unsign<AccessClaims>(token);
  if (!c || c.typ !== "access" || c.exp < Date.now() || c.sub !== accountEmail()) return null;
  const acct = await readAccount().catch((e) => {
    console.error("[auth] session store unavailable:", (e as Error).message);
    return null;
  });
  if (!acct) return null;
  if (c.v !== acct.passwordVersion) return null;
  return acct.sessions.some((s) => s.id === c.sid && s.expires > Date.now()) ? c : null;
}

const newSecret = () => randomBytes(32).toString("base64url");

/** Creates a session after a successful login. */
export async function createSession(remember: boolean, ua: string, ip: string) {
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
  const acct = await updateAccount((d) => ({ ...d, sessions: [...d.sessions, session].slice(-20) }));
  return { access: issueAccess(id, acct.passwordVersion), refresh: `${id}.${secret}`, session };
}

/**
 * Exchanges a refresh token for a new access token + a new refresh token.
 * Returns null if invalid. Reuse of an old token outside the grace window revokes the session.
 */
export async function rotate(refresh: string | undefined, ip: string) {
  if (!refresh) return null;
  const [id, secret] = refresh.split(".");
  if (!id || !secret) return null;
  const hash = sha256(secret);
  const nextSecret = newSecret();
  let result: { access: string; refresh?: string; session: StoredSession } | null = null;

  await updateAccount((d) => {
    const s = d.sessions.find((x) => x.id === id);
    if (!s || s.expires < Date.now()) return d;
    const now = Date.now();
    if (safeEqual(hash, s.tokenHash)) {
      const updated = { ...s, prevHash: s.tokenHash, tokenHash: sha256(nextSecret), rotatedAt: now, lastUsed: now, ip };
      result = { access: issueAccess(id, d.passwordVersion), refresh: `${id}.${nextSecret}`, session: updated };
      return { ...d, sessions: d.sessions.map((x) => (x.id === id ? updated : x)) };
    }
    if (s.prevHash && safeEqual(hash, s.prevHash) && now - s.rotatedAt < GRACE_MS) {
      // A parallel request used the token we just rotated: give it an access token only.
      result = { access: issueAccess(id, d.passwordVersion), session: s };
      return d;
    }
    // Old token replayed → assume it was stolen and end this session.
    console.warn(`[auth] refresh token reuse detected, revoking session ${id}`);
    return { ...d, sessions: d.sessions.filter((x) => x.id !== id) };
  });
  return result as { access: string; refresh?: string; session: StoredSession } | null;
}

export async function revokeSession(id: string) {
  await updateAccount((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));
}

export const sessionIdFromRefresh = (refresh: string | undefined) => refresh?.split(".")[0] || null;

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
