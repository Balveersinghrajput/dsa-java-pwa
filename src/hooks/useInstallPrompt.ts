"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Real install flow: captures the browser's beforeinstallprompt event.
 * Browsers without it (iOS Safari) need the manual "Add to Home Screen" steps.
 */
export function useInstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!evt) return false;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    setEvt(null);
    return outcome === "accepted";
  }, [evt]);

  return { canPrompt: !!evt, installed, isIOS, install };
}
