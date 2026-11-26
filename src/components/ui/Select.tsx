"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

/**
 * Styled dropdown that replaces the browser's native <select> list.
 * Keyboard: ↑/↓ to move, Enter/Space to choose, Esc to close, type to jump.
 */
export default function Select<T extends string | number>({
  value,
  options,
  onChange,
  label,
  className = "",
  size = "md",
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  label: string; // accessible name
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value);

  // The list is rendered in a portal (on <body>) so no card or animation layer can cover it.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = root.current?.getBoundingClientRect();
      if (!r) return;
      const below = window.innerHeight - r.bottom;
      const up = below < 300 && r.top > below;
      const width = Math.max(r.width, 220);
      const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
      setPos(up ? { left, width, bottom: window.innerHeight - r.top + 8 } : { left, width, top: r.bottom + 8 });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (!root.current?.contains(t) && !list.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [open]);

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const choose = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setActive(Math.max(0, options.findIndex((o) => o.value === value)));
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, options.length - 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key.length === 1) {
      const i = options.findIndex((o) => o.label.toLowerCase().replace(/^phase \d+ · /, "").startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
    } else return;
    e.preventDefault();
  };

  const h = size === "sm" ? "h-9 text-[13px]" : "h-11 text-[13.5px]";
  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="listbox"
        onClick={() => {
          setActive(Math.max(0, options.findIndex((o) => o.value === value)));
          setOpen((o) => !o);
        }}
        onKeyDown={onKey}
        className={`press flex w-full items-center gap-2 rounded-xl border bg-surface px-3.5 text-left font-medium shadow-card ${h} ${open ? "border-primary ring-4 ring-primary-soft" : "border-line hover:border-primary-faint"}`}
      >
        <span className="min-w-0 flex-1 truncate">{current?.label ?? "Select…"}</span>
        <ChevronDown className={`h-4 w-4 flex-none text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && pos && createPortal(
        <ul
          ref={list}
          id={id}
          role="listbox"
          aria-label={label}
          style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
          className="scale-in thin-scroll z-[70] max-h-72 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-pop"
        >
          {options.map((o, i) => {
            const sel = o.value === value;
            return (
              <li
                key={String(o.value)}
                data-i={i}
                role="option"
                aria-selected={sel}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-[13.5px] ${i === active ? "bg-primary-soft" : ""} ${sel ? "font-semibold text-primary" : "text-ink"}`}
              >
                <span className="min-w-0 flex-1">{o.label}</span>
                {sel && <Check className="h-4 w-4 flex-none" />}
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </div>
  );
}
