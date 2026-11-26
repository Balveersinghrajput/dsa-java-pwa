"use client";

import { useEffect, useRef, useState } from "react";

/**
 * YouTube's standard embed with YouTube's own controls (play, pause, seek,
 * volume, captions, fullscreen) on every device. We never control the player;
 * watch progress is read passively from the updates the player broadcasts.
 */
export default function YouTubeEmbed({
  id,
  title,
  start = 0,
  onProgress,
  onEnd,
}: {
  id: string;
  title: string;
  start?: number; // seconds to resume from
  onProgress: (p: number, seconds: number) => void;
  onEnd: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const cb = useRef({ onProgress, onEnd });
  cb.current = { onProgress, onEnd };
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    let duration = 0;
    let time = 0;
    let lastSave = 0;
    // Bound to this video: switching videos must never save the old position under the new id.
    const report = cb.current.onProgress;
    const save = () => {
      if (duration > 0 && time > 0) report(Math.min(1, time / duration), time);
    };
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube.com" || e.source !== frame.current?.contentWindow || typeof e.data !== "string") return;
      try {
        const info = JSON.parse(e.data)?.info;
        if (!info) return;
        if (typeof info.duration === "number" && info.duration > 0) duration = info.duration;
        if (typeof info.currentTime === "number") time = info.currentTime;
        // Remember the position every 10 s while playing, and right away on pause.
        if (time > 0 && duration > 0 && Date.now() - lastSave > 10_000) {
          lastSave = Date.now();
          save();
        }
        if (info.playerState === 2) save(); // paused
        if (info.playerState === 0) cb.current.onEnd(); // ended
      } catch {
        /* not a player message */
      }
    };
    window.addEventListener("message", onMsg);
    // Leaving the page or closing the app: keep the latest position.
    const onHide = () => document.visibilityState === "hidden" && save();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      save();
      window.removeEventListener("message", onMsg);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [id]);

  if (!origin) return <div className="skeleton absolute inset-0 rounded-none" />;
  return (
    <iframe
      ref={frame}
      key={id}
      className="absolute inset-0 h-full w-full"
      src={`https://www.youtube.com/embed/${id}?rel=0&playsinline=1&enablejsapi=1${start > 0 ? `&start=${Math.floor(start)}` : ""}&origin=${encodeURIComponent(origin)}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      // Ask the player to send its progress updates (read-only — no commands are sent).
      onLoad={() => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id, channel: "widget" }), "https://www.youtube.com")}
    />
  );
}

