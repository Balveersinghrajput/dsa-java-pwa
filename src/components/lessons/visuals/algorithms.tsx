"use client";

import { useMemo, useState } from "react";
import { Cell, Controls, NumberInput, TextInput, useStepper } from "./common";

/* ---------------- DP table (LCS) ---------------- */

export function DPTableViz() {
  const [a, setA] = useState("ABCBDA");
  const [b, setB] = useState("BDCAB");
  const A = a.toUpperCase().slice(0, 8);
  const Bs = b.toUpperCase().slice(0, 8);
  const frames = useMemo(() => {
    const m = A.length;
    const n = Bs.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const f: { i: number; j: number; dp: number[][]; note: string }[] = [];
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++) {
        const match = A[i - 1] === Bs[j - 1];
        dp[i][j] = match ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        f.push({ i, j, dp: dp.map((r) => [...r]), note: match ? `${A[i - 1]} = ${Bs[j - 1]} → diagonal + 1 = ${dp[i][j]}` : `${A[i - 1]} ≠ ${Bs[j - 1]} → max(top ${dp[i - 1][j]}, left ${dp[i][j - 1]}) = ${dp[i][j]}` });
      }
    if (!f.length) f.push({ i: 0, j: 0, dp, note: "Enter two strings" });
    return f;
  }, [A, Bs]);
  const s = useStepper(frames.length, 450);
  const fr = frames[s.i];
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <TextInput label="s" value={a} onChange={setA} width="w-28" />
        <TextInput label="t" value={b} onChange={setB} width="w-28" />
      </div>
      <div className="no-scrollbar mt-4 overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1 font-mono text-[12px]">
          <thead>
            <tr>
              <th />
              <th className="w-8 text-muted">∅</th>
              {Bs.split("").map((c, j) => <th key={j} className={`w-8 ${j + 1 === fr.j ? "text-primary" : "text-ink-2"}`}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {fr.dp.map((row, i) => (
              <tr key={i}>
                <th className={`w-8 ${i === fr.i ? "text-primary" : "text-ink-2"}`}>{i === 0 ? "∅" : A[i - 1]}</th>
                {row.map((v, j) => {
                  const cur = i === fr.i && j === fr.j;
                  const dep = (i === fr.i - 1 && (j === fr.j || j === fr.j - 1)) || (i === fr.i && j === fr.j - 1);
                  const filled = i < fr.i || (i === fr.i && j <= fr.j) || i === 0 || j === 0;
                  return (
                    <td key={j} className={`h-8 w-8 rounded-md text-center font-semibold transition-colors ${cur ? "bg-primary text-white" : dep ? "bg-amber-soft text-amber" : filled ? "bg-primary-soft/60 text-ink" : "bg-surface-2 text-transparent"}`}>{v}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Controls s={s} total={frames.length} note={<>{fr.note} {s.i === frames.length - 1 && <b>· LCS length = {fr.dp[A.length]?.[Bs.length]}</b>}</>} />
    </div>
  );
}

/* ---------------- recursion tree (fib) ---------------- */

type Call = { id: number; n: number; depth: number; parent: number; x: number; memo: boolean; value?: number };

export function RecursionViz() {
  const [n, setN] = useState(5);
  const [memo, setMemo] = useState(false);
  const { calls, events } = useMemo(() => {
    const calls: Call[] = [];
    const events: { id: number; type: "call" | "return"; note: string }[] = [];
    const cache = new Map<number, number>();
    let leaf = 0;
    const fib = (k: number, depth: number, parent: number): number => {
      const id = calls.length;
      const c: Call = { id, n: k, depth, parent, x: 0, memo: false };
      calls.push(c);
      events.push({ id, type: "call", note: `call fib(${k})` });
      let v: number;
      if (memo && cache.has(k)) {
        v = cache.get(k)!;
        c.memo = true;
        c.x = leaf++;
      } else if (k < 2) {
        v = k;
        c.x = leaf++;
      } else {
        const a = fib(k - 1, depth + 1, id);
        const b = fib(k - 2, depth + 1, id);
        v = a + b;
        const kids = calls.filter((x) => x.parent === id);
        c.x = (kids[0].x + kids[kids.length - 1].x) / 2;
        if (memo) cache.set(k, v);
      }
      c.value = v;
      events.push({ id, type: "return", note: c.memo ? `fib(${k}) read from memo = ${v}` : k < 2 ? `base case fib(${k}) = ${v}` : `fib(${k}) = fib(${k - 1}) + fib(${k - 2}) = ${v}` });
      return v;
    };
    fib(Math.min(Math.max(n, 1), 6), 0, -1);
    return { calls, events };
  }, [n, memo]);
  const s = useStepper(events.length, 500);
  const shown = new Set(events.slice(0, s.i + 1).filter((e) => e.type === "call").map((e) => e.id));
  const returned = new Set(events.slice(0, s.i + 1).filter((e) => e.type === "return").map((e) => e.id));
  const cur = events[s.i]?.id;
  const maxX = Math.max(...calls.map((c) => c.x), 0);
  const maxD = Math.max(...calls.map((c) => c.depth), 0);
  const W = (maxX + 1) * 46 + 20;
  const px = (c: Call) => c.x * 46 + 30;
  const py = (c: Call) => c.depth * 54 + 22;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <NumberInput label="n" value={n} onChange={setN} min={1} max={6} />
        <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-2">
          <input type="checkbox" checked={memo} onChange={(e) => setMemo(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" /> Memoization
        </label>
        <span className="text-[12.5px] text-muted">{calls.length} calls</span>
      </div>
      <div className="no-scrollbar mt-4 overflow-x-auto">
        <svg width={W} height={(maxD + 1) * 54 + 20} className="mx-auto block">
          {calls.filter((c) => c.parent >= 0 && shown.has(c.id)).map((c) => <line key={`e${c.id}`} x1={px(calls[c.parent])} y1={py(calls[c.parent])} x2={px(c)} y2={py(c)} stroke="var(--line)" strokeWidth="2" />)}
          {calls.filter((c) => shown.has(c.id)).map((c) => (
            <g key={c.id} className="pop" style={{ transformOrigin: `${px(c)}px ${py(c)}px` }}>
              <rect x={px(c) - 20} y={py(c) - 14} width="40" height="28" rx="8" fill={c.id === cur ? "var(--primary)" : c.memo ? "var(--green-soft)" : returned.has(c.id) ? "var(--primary-soft)" : "var(--surface)"} stroke={c.id === cur ? "var(--primary)" : c.memo ? "var(--green)" : "var(--line)"} strokeWidth="2" />
              <text x={px(c)} y={py(c) + 4} textAnchor="middle" className={`font-mono text-[11px] font-bold ${c.id === cur ? "fill-white" : "fill-ink"}`}>{returned.has(c.id) ? c.value : `f(${c.n})`}</text>
            </g>
          ))}
        </svg>
      </div>
      <Controls s={s} total={events.length} note={events[s.i]?.note} />
    </div>
  );
}

/* ---------------- bits ---------------- */

export function BitsViz() {
  const [n, setN] = useState(44);
  const [m, setM] = useState(13);
  const [i, setI] = useState(2);
  const BITS = 16;
  const bin = (x: number) => (x >>> 0).toString(2).padStart(32, "0").slice(-BITS).split("");
  const ops = [
    { label: "n & m", v: n & m },
    { label: "n | m", v: n | m },
    { label: "n ^ m", v: n ^ m },
    { label: "n << 1", v: n << 1 },
    { label: "n >> 1", v: n >> 1 },
    { label: "n & (n − 1)", v: n & (n - 1) },
    { label: `set bit ${i}`, v: n | (1 << i) },
    { label: `clear bit ${i}`, v: n & ~(1 << i) },
    { label: `toggle bit ${i}`, v: n ^ (1 << i) },
  ];
  const [sel, setSel] = useState(0);
  const row = (x: number, label: string, tone?: "primary") => (
    <div className="flex items-center gap-3">
      <span className="w-24 flex-none text-right font-mono text-[12px] font-semibold text-ink-2">{label}</span>
      <div className="flex gap-0.5">
        {bin(x).map((b, k) => (
          <span key={k} className={`grid h-7 w-6 place-items-center rounded font-mono text-[12px] font-bold transition-colors ${b === "1" ? (tone ? "bg-primary text-white" : "bg-primary-soft text-primary") : "bg-surface-2 text-muted"} ${BITS - 1 - k === i ? "ring-2 ring-amber" : ""}`}>{b}</span>
        ))}
      </div>
      <span className="font-mono text-[12px] text-muted">= {x}</span>
    </div>
  );
  return (
    <div>
      <div className="flex flex-wrap gap-4">
        <NumberInput label="n" value={n} onChange={setN} min={0} max={32767} />
        <NumberInput label="m" value={m} onChange={setM} min={0} max={32767} />
        <NumberInput label="bit i" value={i} onChange={setI} min={0} max={15} />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {ops.map((o, k) => (
          <button key={o.label} onClick={() => setSel(k)} className={`press rounded-lg px-2.5 py-1.5 font-mono text-[12px] font-semibold ${k === sel ? "bg-primary text-white" : "border border-line bg-surface text-ink-2 hover:border-primary-faint"}`}>{o.label}</button>
        ))}
      </div>
      <div className="no-scrollbar mt-4 space-y-1.5 overflow-x-auto pb-1">
        {row(n, "n")}
        {row(m, "m")}
        <div className="ml-28 h-px w-[400px] bg-line" />
        {row(ops[sel].v, ops[sel].label, "primary")}
      </div>
      <p className="mt-3 rounded-xl bg-primary-soft/60 px-3.5 py-2.5 text-[13px]">
        Amber ring = bit {i}. n has {bin(n).filter((b) => b === "1").length} set bits; n is {n > 0 && (n & (n - 1)) === 0 ? "" : "not "}a power of two.
      </p>
      <div className="mt-3 flex flex-wrap gap-1">{bin(n).map((b, k) => <Cell key={k} v={b} small tone={b === "1" ? "done" : "idle"} label={BITS - 1 - k} />)}</div>
    </div>
  );
}
