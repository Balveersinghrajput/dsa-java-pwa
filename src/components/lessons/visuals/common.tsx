"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

/** Frame player: play/pause, step and reset over a list of frames. */
export function useStepper(total: number, speed = 750) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [total]);

  useEffect(() => {
    if (!playing) return;
    if (i >= total - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setI((x) => Math.min(x + 1, total - 1)), speed);
    return () => clearTimeout(id);
  }, [playing, i, total, speed]);

  const reset = useCallback(() => {
    setI(0);
    setPlaying(false);
  }, []);

  return {
    i,
    playing,
    toggle: () => {
      if (i >= total - 1) setI(0);
      setPlaying((p) => !p);
    },
    next: () => setI((x) => Math.min(x + 1, total - 1)),
    prev: () => setI((x) => Math.max(x - 1, 0)),
    reset,
    set: setI,
  };
}

export function Controls({ s, total, note }: { s: ReturnType<typeof useStepper>; total: number; note?: ReactNode }) {
  const btn = "press grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-ink-2 hover:border-primary-faint hover:text-primary disabled:opacity-40";
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className={btn} onClick={s.reset} aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
        <button className={btn} onClick={s.prev} disabled={s.i === 0} aria-label="Previous step"><SkipBack className="h-4 w-4" /></button>
        <button onClick={s.toggle} className="press inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white hover:bg-primary-strong" aria-label={s.playing ? "Pause" : "Play"}>
          {s.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />} {s.playing ? "Pause" : s.i >= total - 1 ? "Replay" : "Play"}
        </button>
        <button className={btn} onClick={s.next} disabled={s.i >= total - 1} aria-label="Next step"><SkipForward className="h-4 w-4" /></button>
        <span className="ml-auto text-[12px] font-semibold text-muted tabular-nums">Step {s.i + 1} / {total}</span>
      </div>
      <input type="range" min={0} max={Math.max(0, total - 1)} value={s.i} onChange={(e) => s.set(Number(e.target.value))} className="w-full accent-[var(--primary)]" aria-label="Scrub steps" />
      {note && <p className="min-h-[40px] rounded-xl bg-primary-soft/60 px-3.5 py-2.5 text-[13px] text-ink">{note}</p>}
    </div>
  );
}

export function Cell({ v, tone = "idle", label, small }: { v: ReactNode; tone?: "idle" | "active" | "done" | "dim" | "warn" | "range"; label?: ReactNode; small?: boolean }) {
  const t = {
    idle: "bg-surface border-line text-ink",
    active: "bg-primary border-primary text-white scale-110 shadow-[0_8px_18px_-8px_rgb(79_70_229/0.8)]",
    done: "bg-primary-soft border-primary-faint text-primary",
    dim: "bg-surface-2 border-line text-muted opacity-50",
    warn: "bg-amber-soft border-amber/40 text-amber",
    range: "bg-green-soft border-green/30 text-green",
  }[tone];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`grid place-items-center rounded-lg border font-mono font-semibold transition-all duration-300 ${small ? "h-8 min-w-8 px-1 text-[12px]" : "h-10 min-w-10 px-1.5 text-[13px]"} ${t}`}>{v}</div>
      {label !== undefined && <span className="h-4 text-[10px] font-semibold text-muted">{label}</span>}
    </div>
  );
}

export function NumberInput({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-2">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(Math.max(min ?? -1e9, Math.min(max ?? 1e9, n)));
        }}
        className="h-8 w-20 rounded-lg border border-line bg-surface px-2 text-[13px] outline-none focus:border-primary"
      />
    </label>
  );
}

export function TextInput({ label, value, onChange, width = "w-40" }: { label: string; value: string; onChange: (s: string) => void; width?: string }) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-2">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className={`h-8 ${width} rounded-lg border border-line bg-surface px-2 text-[13px] outline-none focus:border-primary`} />
    </label>
  );
}

export function parseNums(s: string, max = 14) {
  return s
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .slice(0, max)
    .map((n) => Math.trunc(n));
}
