"use client";

import { useEffect, useRef, useState } from "react";

/**
 * YouTube's standard embed with YouTube's own controls (play, pause, seek,
 * volume, captions, fullscreen) on every device. We never control the player;
 * watch progress is read passively from the updates the player broadcasts.
 */
export default function YouTubeEmbed({ id, title, onProgress, onEnd }: { id: string; title: string; onProgress: (p: number) => void; onEnd: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const cb = useRef({ onProgress, onEnd });
  cb.current = { onProgress, onEnd };
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    let duration = 0;
    let lastSave = 0;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube.com" || e.source !== frame.current?.contentWindow || typeof e.data !== "string") return;
      try {
        const info = JSON.parse(e.data)?.info;
        if (!info) return;
        if (typeof info.duration === "number" && info.duration > 0) duration = info.duration;
        if (typeof info.currentTime === "number" && duration > 0 && Date.now() - lastSave > 5000) {
          lastSave = Date.now();
          cb.current.onProgress(Math.min(1, info.currentTime / duration));
        }
        if (info.playerState === 0) cb.current.onEnd(); // ended
      } catch {
        /* not a player message */
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [id]);

  if (!origin) return <div className="skeleton absolute inset-0 rounded-none" />;
  return (
    <iframe
      ref={frame}
      key={id}
      className="absolute inset-0 h-full w-full"
      src={`https://www.youtube.com/embed/${id}?rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      // Ask the player to send its progress updates (read-only — no commands are sent).
      onLoad={() => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id, channel: "widget" }), "https://www.youtube.com")}
    />
  );
}

