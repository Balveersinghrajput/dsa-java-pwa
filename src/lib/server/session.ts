import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookie, clearedCookies, refreshCookie, verifyAccess } from "./token";
import type { StoredSession } from "./account";

export { sameOrigin } from "./token";

/** Claims of the signed-in user for this request (null if not signed in). */
export async function getUser() {
  return verifyAccess((await cookies()).get(ACCESS_COOKIE)?.value);
}

export async function refreshTokenFromCookie() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export function setAuthCookies(res: NextResponse, t: { access: string; refresh?: string; session: StoredSession }) {
  res.cookies.set(accessCookie(t.access));
  if (t.refresh) res.cookies.set(refreshCookie(t.refresh, t.session));
  return res;
}

export function clearAuthCookies(res: NextResponse) {
  for (const c of clearedCookies) res.cookies.set(c);
  return res;
}
