"use client";

import Link from "next/link";
import { useEffect, useMemo, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Flame, LayoutDashboard, X } from "lucide-react";
import { plan } from "@/data/curriculum";

const CHEERS = [
  "Another brick in the wall 🧱",
  "Consistency beats intensity 💪",
  "You're getting sharper every day ⚡",
  "One step closer to cracking interviews 🚀",
  "Future you says thanks 🙌",
];
const COLORS = ["#4f46e5", "#818cf8", "#22c55e", "#f59e0b", "#e11d48", "#06b6d4", "#a855f7"];

/**
 * Full-screen celebration shown when a day is marked complete:
 * confetti rain, an animated check, streak and progress, and what's next.
 */
export default function Celebration({
  day,
  streak,
  doneCount,
  onClose,
}: {
  day: number;
  streak: number;
  doneCount: number;
  onClose: () => void;
}) {
  const pct = Math.round((doneCount / plan.length) * 100);
  const next = day < plan.length ? plan[day] : null;
  const milestone = [7, 30, 50, 76, 100, 114, 152].includes(doneCount) ? doneCount : null;
  const cheer = useMemo(() => CHEERS[day % CHEERS.length], [day]);

  // Confetti pieces with deterministic variety (no Math.random during render).
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i % 14) * 0.09,
        dur: 2.2 + ((i * 13) % 10) / 6,
        size: 6 + (i % 4) * 2,
        drift: ((i * 29) % 80) - 40,
        spin: (i % 2 ? 1 : -1) * (360 + ((i * 47) % 540)),
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [],
  );

  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    navigator.vibrate?.([30, 40, 60]); // a little buzz on phones that support it
    return () => {
      window.removeEventListener("keydown", on);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const r = 52;
  const c = 2 * Math.PI * r;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Day ${day} complete`}>
      <div className="celebrate-backdrop absolute inset-0 bg-[#060b20]/70 backdrop-blur-sm" onClick={onClose} />

      {/* confetti rain */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {pieces.map((p, i) => (
          <span
            key={i}
            className="confetti-fall absolute -top-6 block"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 1.6,
              borderRadius: p.round ? 999 : 2,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              "--drift": `${p.drift}vw`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="celebrate-card relative w-full max-w-sm overflow-hidden rounded-[28px] bg-surface p-6 text-center shadow-pop sm:p-8">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
        <button onClick={onClose} aria-label="Close" className="press absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink">
          <X className="h-5 w-5" />
        </button>

        {/* animated progress ring + check */}
        <div className="relative mx-auto h-32 w-32">
          <span className="celebrate-burst absolute inset-0 rounded-full bg-primary/20" />
          <svg viewBox="0 0 120 120" className="relative h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--primary-soft)" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="url(#celebrateGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - pct / 100)}
              className="celebrate-ring"
              style={{ "--len": c } as CSSProperties}
            />
            <defs>
              <linearGradient id="celebrateGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#818cf8" />
                <stop offset="1" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 grid place-items-center">
            <svg viewBox="0 0 52 52" className="h-14 w-14">
              <circle cx="26" cy="26" r="24" fill="var(--primary)" className="celebrate-pop" />
              <path d="M15 27l7 7 15-16" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="celebrate-check" />
            </svg>
          </span>
        </div>

        <p className="celebrate-rise mt-4 text-[13px] font-bold tracking-wide text-primary uppercase" style={{ animationDelay: ".35s" }}>
          {milestone ? `Milestone · ${milestone} days!` : "Lesson complete"}
        </p>
        <h2 className="celebrate-rise mt-1 text-[26px] leading-tight font-extrabold tracking-tight" style={{ animationDelay: ".45s" }}>
          Day {day} done! 🎉
        </h2>
        <p className="celebrate-rise mt-1.5 text-[14px] text-ink-2" style={{ animationDelay: ".55s" }}>{cheer}</p>

        <div className="celebrate-rise mt-5 grid grid-cols-2 gap-2" style={{ animationDelay: ".65s" }}>
          <div className="rounded-2xl bg-amber-soft px-3 py-3">
            <p className="flex items-center justify-center gap-1.5 text-[22px] font-extrabold text-ink">
              <Flame className="flicker h-6 w-6 fill-[#fb923c] text-[#ea580c]" /> {streak}
            </p>
            <p className="text-[11.5px] font-semibold text-amber">day streak</p>
          </div>
          <div className="rounded-2xl bg-primary-soft px-3 py-3">
            <p className="text-[22px] font-extrabold text-ink">{pct}%</p>
            <p className="text-[11.5px] font-semibold text-primary">{doneCount} of {plan.length} days</p>
          </div>
        </div>

        <div className="celebrate-rise mt-5 space-y-2" style={{ animationDelay: ".75s" }}>
          {next ? (
            <Link href={`/lessons/${day + 1}`} onClick={onClose} className="press flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14.5px] font-semibold text-white shadow-[0_10px_24px_-10px_rgb(79_70_229/0.8)] hover:bg-primary-strong">
              Next: Day {day + 1} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <p className="rounded-xl bg-green-soft p-3 text-[14px] font-semibold text-green">You finished the whole course! 🏆</p>
          )}
          {next && <p className="truncate text-[12px] text-muted">{next.topic.title}</p>}
          <Link href="/" onClick={onClose} className="press flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-[13.5px] font-semibold hover:bg-surface-2">
            <LayoutDashboard className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
