"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { X } from "lucide-react";
import type { Difficulty } from "@/types";

export const st = (i: number, extra?: CSSProperties) => ({ "--i": i, ...extra }) as CSSProperties;

export const cardCls = "rounded-2xl border border-line bg-surface shadow-card";

export function Card({ children, className = "", i, as: As = "section" }: { children: ReactNode; className?: string; i?: number; as?: "section" | "div" | "article" }) {
  return (
    <As className={`${cardCls} ${i !== undefined ? "rise" : ""} ${className}`} style={i !== undefined ? st(i) : undefined}>
      {children}
    </As>
  );
}

export function CardHeader({ title, action, className = "" }: { title: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 className="text-[16px] font-bold tracking-tight text-ink">{title}</h2>
      {action}
    </div>
  );
}

export function LinkMore({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-strong">
      {children}
      <span className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

export const diffCls: Record<Difficulty, string> = {
  Easy: "bg-green-soft text-green",
  Medium: "bg-amber-soft text-amber",
  Hard: "bg-rose-soft text-rose",
};

export function DiffBadge({ d, className = "" }: { d: Difficulty; className?: string }) {
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${diffCls[d]} ${className}`}>{d}</span>;
}

export function Badge({ children, tone = "primary", className = "" }: { children: ReactNode; tone?: "primary" | "muted" | "green" | "amber" | "rose"; className?: string }) {
  const t = {
    primary: "bg-primary-soft text-primary",
    muted: "bg-surface-2 text-muted border border-line",
    green: "bg-green-soft text-green",
    amber: "bg-amber-soft text-amber",
    rose: "bg-rose-soft text-rose",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${t} ${className}`}>{children}</span>;
}

type BtnProps = {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "danger" | "soft";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
  "aria-label"?: string;
};

export function Button({ children, variant = "primary", size = "md", className = "", href, external, ...rest }: BtnProps) {
  const v = {
    primary: "bg-primary text-white hover:bg-primary-strong shadow-[0_6px_16px_-6px_rgb(79_70_229/0.6)]",
    outline: "border border-line bg-surface text-ink hover:border-primary-faint hover:bg-primary-soft/40",
    ghost: "text-ink-2 hover:bg-surface-2",
    danger: "bg-rose text-white hover:opacity-90",
    soft: "bg-primary-soft text-primary hover:bg-primary-faint/40",
  }[variant];
  const s = { sm: "h-8 px-3 text-[12.5px] rounded-lg gap-1.5", md: "h-10 px-4 text-[13.5px] rounded-xl gap-2", lg: "h-12 px-5 text-[14.5px] rounded-xl gap-2" }[size];
  const cls = `press inline-flex items-center justify-center font-semibold whitespace-nowrap disabled:opacity-50 ${v} ${s} ${className}`;
  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} title={rest.title} aria-label={rest["aria-label"]}>{children}</a>
    ) : (
      <Link href={href} className={cls} title={rest.title} aria-label={rest["aria-label"]}>{children}</Link>
    );
  }
  return (
    <button type={rest.type ?? "button"} className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Ring({ pct, size = 72, stroke = 7, color = "var(--primary)", track = "var(--primary-soft)", children }: { pct: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, Math.max(0, pct)) / 100)}
          style={{ "--len": c, animation: "draw 1.3s var(--ease-out) both", transition: "stroke-dashoffset .8s var(--ease-out)" } as CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function Bar({ pct, className = "", color = "bg-primary" }: { pct: number; className?: string; color?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-primary-soft ${className}`}>
      <div className={`grow-x h-full rounded-full ${color} transition-[width] duration-700`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className = "" }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (t: T) => void; className?: string }) {
  return (
    <div className={`no-scrollbar flex gap-1 overflow-x-auto border-b border-line ${className}`} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={t.id === value}
          onClick={() => onChange(t.id)}
          className={`relative shrink-0 px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${t.id === value ? "text-primary" : "text-muted hover:text-ink"}`}
        >
          {t.label}
          <span className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary transition-transform duration-300 ${t.id === value ? "scale-x-100" : "scale-x-0"}`} />
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const idx = Math.max(0, options.findIndex((o) => o.id === value));
  return (
    <div className="no-scrollbar max-w-full overflow-x-auto">
    <div className="relative inline-grid rounded-xl bg-surface-2 p-1 text-[12.5px] font-semibold ring-1 ring-line" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(76px,1fr))` }}>
      <span className="absolute top-1 bottom-1 left-1 rounded-lg bg-surface shadow-card transition-transform duration-400 ease-[cubic-bezier(.34,1.56,.64,1)]" style={{ width: `calc((100% - .5rem) / ${options.length})`, transform: `translateX(${idx * 100}%)` }} />
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)} className={`relative z-10 rounded-lg px-3 py-1.5 whitespace-nowrap ${o.id === value ? "text-ink" : "text-muted hover:text-ink"}`}>
          {o.label}
        </button>
      ))}
    </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <header className="rise mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6 sm:gap-4" style={st(0)}>
      <div className="min-w-0">
        <h1 className="text-[24px] leading-tight font-extrabold tracking-[-0.02em] text-ink sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-muted sm:text-[14px]">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rise flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span>
      <h3 className="mt-4 text-[15px] font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-[13.5px] text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", on);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fade fixed inset-0 z-50 flex items-end justify-center bg-[#0b1437]/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`scale-in max-h-[90dvh] w-full overflow-hidden rounded-t-3xl bg-surface shadow-pop sm:rounded-3xl ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[16px] font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="press grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="thin-scroll max-h-[calc(90dvh-62px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/** Animates a number from 0 to target. */
export function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function Confetti({ burst }: { burst: number }) {
  if (!burst) return null;
  const colors = ["#4f46e5", "#818cf8", "#16a34a", "#f59e0b", "#e11d48", "#c7cbf6"];
  return (
    <span key={burst} className="pointer-events-none absolute top-1/2 left-1/2 z-10" aria-hidden>
      {Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const dist = 70 + ((i * 37) % 70);
        return (
          <span
            key={i}
            className="absolute block h-2 w-1.5 rounded-sm"
            style={{
              background: colors[i % colors.length],
              "--x": `${Math.cos(a) * dist}px`,
              "--y": `${Math.sin(a) * dist - 30}px`,
              "--r": `${(i % 2 ? 1 : -1) * (180 + i * 20)}deg`,
              animation: `confetti 0.9s var(--ease-out) ${i * 8}ms both`,
            } as CSSProperties}
          />
        );
      })}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
