import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, verifyAccess } from "@/lib/server/token";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";

// Node.js runtime: lets us check the session list and password version on every request.
export const config = {
  runtime: "nodejs",
  // Everything except Next.js build assets and static public files.
  matcher: ["/((?!_next/static|_next/image|icons/|favicon.ico|manifest.webmanifest|sw.js|robots.txt).*)"],
};

const PUBLIC_PAGES = ["/login", "/forgot", "/reset", "/signup"];
const PUBLIC_API = ["/api/auth/login", "/api/auth/refresh", "/api/auth/forgot", "/api/auth/reset", "/api/auth/logout", "/api/auth/signup", "/api/health", "/api/cron/keepalive"];

const tooMany = (retry: number, api: boolean) =>
  api
    ? NextResponse.json({ error: "Too many requests. Slow down and try again shortly." }, { status: 429, headers: { "Retry-After": String(retry) } })
    : new NextResponse("Too many requests. Please wait a moment and reload.", { status: 429, headers: { "Retry-After": String(retry), "Content-Type": "text/plain" } });

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const ip = clientIp(req);

  // Flood protection for every page and API call, per client IP:
  // short burst limit + per-minute limit.
  // Generous enough for fast clicking plus Next.js link prefetching; low enough to stop floods.
  const burst = rateLimit(`mw:burst:${ip}`, 150, 10_000);
  if (!burst.ok) return tooMany(burst.retryAfter, isApi);
  const minute = rateLimit(`mw:min:${ip}`, 600, 60_000);
  if (!minute.ok) return tooMany(minute.retryAfter, isApi);
  // Site-wide ceiling: even if an attacker fakes many IPs, the server can't be overloaded.
  const global = rateLimit("mw:global", Number(process.env.GLOBAL_RPM || 6000), 60_000);
  if (!global.ok) return tooMany(global.retryAfter, isApi);

  const user = await verifyAccess(req.cookies.get(ACCESS_COOKIE)?.value);

  if (PUBLIC_PAGES.includes(pathname)) {
    if (user && (pathname === "/login" || pathname === "/signup")) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }
  if (PUBLIC_API.includes(pathname)) return NextResponse.next();
  // The admin area is only for the owner; friends are sent back to their dashboard.
  if (user && (pathname === "/admin" || pathname.startsWith("/admin/")) && user.uid !== "admin") return NextResponse.redirect(new URL("/", req.url));
  if (user) return NextResponse.next();

  // Not signed in (or access token expired).
  if (isApi) return NextResponse.json({ error: "Please sign in.", code: "unauthenticated" }, { status: 401 });
  // Pages: try a silent refresh first; the refresh route sends to /login if that fails.
  const refresh = new URL("/api/auth/refresh", req.url);
  refresh.searchParams.set("next", pathname + search);
  return NextResponse.redirect(refresh);
}
