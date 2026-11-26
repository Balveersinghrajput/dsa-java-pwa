import type { NextConfig } from "next";

// Server build (next build && next start, or deploy to Vercel).
// A server is needed for /api/run, which executes Java on a sandboxed
// execution service without exposing any credentials to the browser.
const nextConfig: NextConfig = {
  // Allows a separate build folder (e.g. NEXT_DIST_DIR=.next-build) while `next dev` uses .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: { unoptimized: true },
  // Hide the Next.js dev badge (it covered the Home tab on phones).
  devIndicators: false,
  async headers() {
    const security = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
};

export default nextConfig;
