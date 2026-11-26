"use client";

/**
 * Shows a system notification that opens `url` when tapped.
 * Uses the service worker when available (needed on Android and for installed apps);
 * the worker's "notificationclick" handler focuses the app and navigates there.
 */
export async function notify(title: string, body: string, url: string, tag = "daily") {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  const opts: NotificationOptions = { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag, data: { url } };
  try {
    if (navigator.serviceWorker?.controller) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, opts);
      return true;
    }
  } catch {
    /* fall back to a page notification below */
  }
  const n = new Notification(title, opts);
  n.onclick = () => {
    window.focus();
    location.assign(url);
    n.close();
  };
  return true;
}
