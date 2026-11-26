"use client";

import { useState } from "react";
import { RotateCcw, History } from "lucide-react";
import { useAppState } from "@/lib/store";
import { clock, resumeAt } from "@/lib/resume";
import YouTubeEmbed from "./YouTubeEmbed";

/**
 * YouTube player that continues where you stopped (on any device, after signing in again).
 * The position is saved every 10 s, on pause and when you leave; it syncs with your progress.
 * Render it with key={videoId} so a new video gets its own resume point.
 */
export default function ResumablePlayer({ id, title, className = "", onFinished }: { id: string; title: string; className?: string; onFinished?: () => void }) {
  const { state, setVideoProgress, clearVideoTime } = useAppState();
  // Frozen when the player opens: changing the start later would reload the video.
  const [start, setStart] = useState(() => resumeAt(state, id));
  const [run, setRun] = useState(0); // bumps to restart the player

  const startOver = () => {
    clearVideoTime(id);
    setStart(0);
    setRun((r) => r + 1);
  };

  return (
    <>
      <div className={`relative aspect-video overflow-hidden bg-black ${className}`}>
        <YouTubeEmbed
          key={run}
          id={id}
          title={title}
          start={start}
          onProgress={(p, sec) => setVideoProgress(id, p, sec)}
          onEnd={() => {
            clearVideoTime(id); // finished: next time starts from the beginning
            onFinished?.();
          }}
        />
      </div>
      {start > 0 && (
        <div className="fade mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-[13px]">
          <History className="h-4 w-4 flex-none text-primary" />
          <span className="min-w-0 flex-1">Continuing where you stopped: <b className="tabular-nums">{clock(start + 3)}</b></span>
          <button onClick={startOver} className="press inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-primary hover:bg-surface">
            <RotateCcw className="h-3.5 w-3.5" /> Start over
          </button>
        </div>
      )}
    </>
  );
}
