// Offline-first service worker for DSA in Java.
// Bump VERSION on each deploy so clients pick up the new build.
const VERSION = "v3";
const PAGES = `dsa-pages-${VERSION}`;
const STATIC = `dsa-static-${VERSION}`;
const MEDIA = `dsa-media-${VERSION}`;
// Pages need a signed-in session, so they're cached as you visit them (never pre-fetched while signed out).
const CORE = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = [PAGES, STATIC, MEDIA];
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

// "Download all lessons for offline" from Settings.
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;
  const port = event.ports && event.ports[0];
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES);
      let done = 0;
      for (const url of data.urls) {
        try {
          const hit = await cache.match(url);
          if (!hit) {
            const res = await fetch(url, { credentials: "same-origin" });
            if (res.ok && !res.redirected) await cache.put(url, res);
          }
        } catch {
          /* skip failures */
        }
        done++;
        if (port && done % 10 === 0) port.postMessage({ done, total: data.urls.length });
      }
      if (port) port.postMessage({ done, total: data.urls.length, finished: true });
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return; // never cache code execution

  // Pages: network first, fall back to cache, then to the dashboard shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Only cache real app pages: not redirects (e.g. to /login) and not the auth screens.
          if (res.ok && !res.redirected && res.type === "basic" && !["/login", "/forgot", "/reset"].includes(url.pathname)) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(url.pathname, { ignoreSearch: true })) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  // Next.js build assets, fonts and icons: cache first (they are content-hashed).
  if ((url.origin === self.location.origin && (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/icons/"))) || url.hostname.endsWith("gstatic.com") || url.hostname === "fonts.googleapis.com") {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok || res.type === "opaque") {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Video thumbnails: stale-while-revalidate.
  if (url.hostname === "i.ytimg.com") {
    event.respondWith(
      caches.open(MEDIA).then(async (c) => {
        const hit = await c.match(request);
        const net = fetch(request)
          .then((res) => {
            if (res.ok || res.type === "opaque") c.put(request, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || net;
      }),
    );
  }
});
