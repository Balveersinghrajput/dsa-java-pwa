"use client";

import { useEffect, useState } from "react";
import { Clock, Pause, Play, Square } from "lucide-react";
import { useAppState } from "@/lib/store";
import { hm } from "@/lib/derive";
import { st } from "@/components/ui";

/** Live elapsed time of the study timer (ticks locally, so the app doesn't re-render every second). */
export function useElapsed() {
  const { state } = useAppState();
  const { startedAt, elapsedMs } = state.timer;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return elapsedMs + (startedAt ? Math.max(0, now - startedAt) : 0);
}

export const clock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** Dashboard tile: Start → Stop (pause) → Start again … → End day (logs the time). */
export function StudyTimeCard({ i, totalMinutes }: { i: number; totalMinutes: number }) {
  const { state, startTimer, stopTimer, endDay } = useAppState();
  const elapsed = useElapsed();
  const running = !!state.timer.startedAt;
  const [flash, setFlash] = useState<string | null>(null);

  const end = () => {
    const mins = Math.round(elapsed / 60000);
    endDay();
    setFlash(mins > 0 ? `Logged ${hm(mins)} ✓` : "Nothing to log yet");
    setTimeout(() => setFlash(null), 2500);
  };

  const btn = "press inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2.5 text-[12px] font-bold transition-colors";
  return (
    <div className="rise lift relative overflow-hidden rounded-2xl border border-rose/15 bg-rose-soft p-4 2xl:p-5" style={st(i)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12.5px] leading-tight font-semibold text-rose sm:text-[13px]">Study Time</p>
          <div className="mt-2.5 text-[24px] leading-none font-extrabold tracking-tight whitespace-nowrap text-ink tabular-nums 2xl:text-[26px]">{hm(totalMinutes + Math.floor(elapsed / 60000))}</div>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] whitespace-nowrap text-ink-2" aria-live="off">
            {flash ?? (
              <>
                {running && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose" />}
                <span className="font-mono tabular-nums">{clock(elapsed)}</span> {running ? "running" : elapsed > 0 ? "paused" : "today"}
              </>
            )}
          </p>
        </div>
        <span className={`relative grid h-10 w-10 flex-none place-items-center rounded-full bg-rose text-white 2xl:h-11 2xl:w-11 ${running ? "pulse-dot" : ""}`}>
          <Clock className="h-5 w-5" strokeWidth={2.4} />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {running ? (
          <button onClick={stopTimer} className={`${btn} bg-ink text-surface hover:opacity-90`} aria-label="Stop timer"><Pause className="h-3.5 w-3.5" /> Stop</button>
        ) : (
          <button onClick={startTimer} className={`${btn} bg-rose text-white hover:opacity-90`} aria-label="Start timer"><Play className="h-3.5 w-3.5 fill-current" /> {elapsed > 0 ? "Resume" : "Start"}</button>
        )}
        <button onClick={end} disabled={elapsed === 0} className={`${btn} border border-rose/30 bg-surface text-rose hover:bg-rose hover:text-white disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-rose`} aria-label="End the study day">
          <Square className="h-3 w-3 fill-current" /> End day
        </button>
      </div>
    </div>
  );
}

/** Compact timer for the top bar; visible while a session is running or paused. */
export function TimerPill({ compact = false }: { compact?: boolean }) {
  const { state, startTimer, stopTimer } = useAppState();
  const elapsed = useElapsed();
  const running = !!state.timer.startedAt;
  if (!running && elapsed === 0) return null;
  return (
    <button
      onClick={running ? stopTimer : startTimer}
      className={compact
        ? `press flex h-8 flex-none items-center gap-1.5 rounded-lg px-2 font-mono text-[11.5px] font-bold tabular-nums ${running ? "bg-rose text-white" : "bg-white/10 text-white"}`
        : `press flex h-11 items-center gap-2 rounded-xl border px-3 font-mono text-[13.5px] font-bold shadow-card ${running ? "border-rose/30 bg-rose-soft text-rose" : "border-line bg-surface text-ink-2"}`}
      aria-label={running ? "Stop study timer" : "Resume study timer"}
      title={running ? "Stop timer" : "Resume timer"}
    >
      {running ? <span className={`h-2 w-2 animate-pulse rounded-full ${compact ? "bg-white" : "bg-rose"}`} /> : <Play className="h-3.5 w-3.5 fill-current" />}
      {clock(elapsed)}
    </button>
  );
}
