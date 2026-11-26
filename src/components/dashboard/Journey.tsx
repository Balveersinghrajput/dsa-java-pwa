"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type CSSProperties } from "react";
import { plan } from "@/data/curriculum";
import { fmtShort } from "@/lib/schedule";
import type { Derived } from "@/lib/derive";

const W = 860;
const H = 170;
const X0 = 26;
const X1 = W - 26;
const DAYS_PER_DOT = 4;

const yAt = (t: number) => 112 - 22 * Math.sin(2 * Math.PI * (t * 1.35 - 0.12)) - 6 * Math.sin(2 * Math.PI * t * 3.1);

/**
 * The 152-day journey: a single monochrome-indigo path with one dot per
 * four days. Solid = completed, ring = in progress, faint = not started.
 */
export default function Journey({ d, compact = false }: { d: Derived; compact?: boolean }) {
  const router = useRouter();
  const [hover, setHover] = useState<number | null>(null);

  const dots = useMemo(() => {
    const n = Math.ceil(plan.length / DAYS_PER_DOT);
    return Array.from({ length: n }, (_, i) => {
      const from = i * DAYS_PER_DOT + 1;
      const to = Math.min(plan.length, from + DAYS_PER_DOT - 1);
      const t = n === 1 ? 0 : i / (n - 1);
      let doneN = 0;
      for (let k = from; k <= to; k++) if (d.done.has(k)) doneN++;
      const containsToday = d.focus >= from && d.focus <= to;
      const status = doneN === to - from + 1 ? "done" : containsToday || doneN > 0 ? "progress" : "todo";
      return { i, from, to, x: X0 + t * (X1 - X0), y: yAt(t), status };
    });
  }, [d.done, d.focus, plan.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const xOfDay = (day: number) => X0 + ((day - 1) / (plan.length - 1)) * (X1 - X0);
  const yOfDay = (day: number) => yAt((day - 1) / (plan.length - 1));
  const todayX = xOfDay(d.focus);
  const todayY = yOfDay(d.focus);

  // Smooth curve through the dots (Catmull-Rom → cubic Bézier).
  const smooth = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return pts.length ? `M${pts[0].x},${pts[0].y}` : "";
    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  };
  const path = smooth(dots);
  const lastDone = dots.reduce((acc, p) => (p.status === "done" ? p.i : acc), -1);
  const progressIdx = dots.findIndex((p) => p.status === "progress");
  const reach = Math.max(lastDone, progressIdx);
  const donePath = reach >= 1 ? smooth(dots.slice(0, reach + 1)) : "";

  const milestones = [
    { day: 1, label: "Day 1", sub: "Start", icon: "rocket" },
    { day: 76, label: "Day 76", sub: "", icon: "flag" },
    { day: 114, label: "Day 114", sub: "", icon: "flag" },
    { day: plan.length, label: `Day ${plan.length}`, sub: "Finish", icon: "trophy" },
  ];

  const hv = hover !== null ? dots[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${compact ? "h-auto" : "h-auto"}`} role="img" aria-label={`Journey: ${d.done.size} of ${plan.length} days completed`}>
        <defs>
          <linearGradient id="journeyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#818cf8" />
            <stop offset="1" stopColor="var(--primary)" />
          </linearGradient>
          <filter id="journeyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {/* whole road draws in from Day 1 to the finish */}
        <path id="journeyAll" d={path} fill="none" stroke="var(--primary-faint)" strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" opacity=".55" className="journey-draw" />
        {/* the road ahead keeps flowing towards the finish */}
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 14" opacity=".35" className="journey-flow" />
        {/* completed path: soft glow + gradient line */}
        {donePath && (
          <>
            <path d={donePath} fill="none" stroke="var(--primary)" strokeWidth="7" opacity=".2" filter="url(#journeyGlow)" pathLength={1} strokeDasharray="1" className="journey-draw journey-draw-late" />
            <path id="journeyDone" d={donePath} fill="none" stroke="url(#journeyGrad)" strokeWidth="3.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" className="journey-draw journey-draw-late" />
          </>
        )}
        {/* a glowing light travelling along your progress (or the whole road if you're just starting) */}
        <g className="journey-comet">
          <circle r="9" fill="var(--primary)" opacity=".25" filter="url(#journeyGlow)" />
          <circle r="4.5" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
          <animateMotion dur={donePath ? "3.4s" : "7s"} begin="1.8s" repeatCount="indefinite" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines="0.45 0 0.25 1">
            <mpath href={donePath ? "#journeyDone" : "#journeyAll"} />
          </animateMotion>
        </g>

        {/* milestones */}
        {milestones.map((m) => {
          const x = xOfDay(m.day);
          const y = yOfDay(m.day);
          const anchor = m.day === 1 ? "start" : m.day === plan.length ? "end" : "middle";
          const tx = m.day === 1 ? x - 14 : m.day === plan.length ? x + 14 : x;
          return (
            <g key={m.day}>
              {!(d.today > 0 && Math.abs(x - todayX) < 70) && (
                <>
                  <text x={tx} y={18} textAnchor={anchor} className="fill-ink-2 text-[11px] font-medium">{m.label}</text>
                  {m.sub && <text x={tx} y={33} textAnchor={anchor} className="fill-ink text-[11px] font-semibold">{m.sub}</text>}
                </>
              )}
              <line x1={x} y1={m.sub ? 62 : 52} x2={x} y2={y - 6} stroke="var(--line)" strokeWidth="1.5" strokeDasharray="3 3" />
              <g transform={`translate(${x - 9} ${m.sub ? 40 : 32})`} className="text-ink">
                <g className="journey-icon" style={{ animationDelay: `${0.2 + ((x - X0) / (X1 - X0)) * 1.4}s` } as CSSProperties}>
                {m.icon === "flag" && <path d="M3 18V2M3 3h11l-3 4 3 4H3" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />}
                {m.icon === "rocket" && (
                  <path d="M9 1c3 2 5 6 4 11l-2 3H7l-2-3C4 7 6 3 9 1zM9 6a1.6 1.6 0 1 0 0 .1M5 12l-3 3 3 1M13 12l3 3-3 1M8 16l1 3 1-3" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                )}
                {m.icon === "trophy" && <path d="M4 2h10v4a5 5 0 0 1-10 0zM4 4H1v1a3 3 0 0 0 3 3M14 4h3v1a3 3 0 0 1-3 3M9 11v4M5 18h8l-1-3H6z" fill="currentColor" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />}
                </g>
              </g>
            </g>
          );
        })}

        {/* today marker */}
        {d.today > 0 && (
          <g>
            <line x1={todayX} y1={58} x2={todayX} y2={todayY - 7} stroke="var(--primary)" strokeWidth="1.5" pathLength={1} strokeDasharray="1" className="journey-draw journey-draw-late" />
            <circle cx={todayX} cy={58} r="3.5" fill="var(--primary)" />
            <g transform={`translate(${Math.min(Math.max(todayX - 26, 4), W - 56)} 6)`}>
              <g className="journey-badge">
              <rect width="52" height="36" rx="8" fill="var(--primary-soft)" stroke="var(--primary-faint)" />
              <text x="26" y="15" textAnchor="middle" className="fill-ink text-[10.5px] font-bold">Day {d.focus}</text>
              <text x="26" y="28" textAnchor="middle" className="fill-muted text-[10px]">Today</text>
              </g>
            </g>
          </g>
        )}

        {/* dots */}
        {dots.map((p) => (
          <g key={p.i} className="cursor-pointer" onMouseEnter={() => setHover(p.i)} onMouseLeave={() => setHover(null)} onClick={() => {
              const target = p.status === "done" ? p.from : Math.max(p.from, Math.min(p.to, d.focus));
              router.push(`/lessons/${target}`);
            }}>
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            {p.status === "progress" && <circle cx={p.x} cy={p.y} r="7" fill="var(--primary)" className="journey-pulse" />}
            <circle
              cx={p.x}
              cy={p.y}
              r={p.status === "progress" ? 7 : 6}
              fill={p.status === "done" ? "var(--primary)" : p.status === "progress" ? "var(--surface)" : "var(--surface)"}
              stroke={p.status === "todo" ? "var(--primary-faint)" : "var(--primary)"}
              strokeWidth={p.status === "progress" ? 3 : 2}
              className="journey-dot"
              style={{ animationDelay: `${0.15 + (p.i / Math.max(dots.length - 1, 1)) * 1.4}s`, transformOrigin: `${p.x}px ${p.y}px`, transformBox: "view-box", transform: hover === p.i ? "scale(1.35)" : undefined, transition: "transform .2s var(--ease-out)" } as CSSProperties}
            />
          </g>
        ))}
      </svg>

      {hv && (
        <div
          className="fade pointer-events-none absolute z-10 w-52 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 text-[12px] shadow-pop"
          style={{ left: `${(hv.x / W) * 100}%`, top: `${(hv.y / H) * 100 + 10}%` }}
        >
          <p className="font-bold text-ink">Days {hv.from}–{hv.to}</p>
          <p className="mt-0.5 line-clamp-2 text-muted">{plan[hv.from - 1].topic.title}</p>
          <p className="mt-1 text-muted">{fmtShort(d.calendar[hv.from - 1])} – {fmtShort(d.calendar[hv.to - 1])}</p>
          <p className={`mt-1 font-semibold ${hv.status === "done" ? "text-primary" : "text-muted"}`}>{hv.status === "done" ? "Completed" : hv.status === "progress" ? "In progress" : "Not started"}</p>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[12px] text-ink-2">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-primary" />Completed</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-surface" />In Progress</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full border-2 border-primary-faint bg-surface" />Not Started</span>
        {!compact && <Link href="/roadmap" className="sr-only">Open roadmap</Link>}
      </div>
    </div>
  );
}
