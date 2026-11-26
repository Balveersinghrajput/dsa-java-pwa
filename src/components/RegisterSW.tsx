"use client";

import { useEffect } from "react";

/** Registers the service worker so the app installs and works offline. */
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* unsupported or blocked: the app still works online */
    });
  }, []);
  return null;
}
