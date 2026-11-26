"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Segmented } from "@/components/ui";
import { Cell, Controls, NumberInput, TextInput, parseNums, useStepper } from "./common";

/* ---------------- complexity growth ---------------- */

export function ComplexityViz() {
  const [n, setN] = useState(32);
  const data = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const x = i + 1;
        const cap = (v: number) => Math.min(v, n * n);
        return { n: x, "O(1)": 1, "O(log n)": +Math.log2(x).toFixed(2), "O(n)": x, "O(n log n)": +(x * Math.log2(x)).toFixed(1), "O(n²)": x * x, "O(2ⁿ)": cap(2 ** x) };
      }),
    [n],
  );
  const colors = ["#c7cbf6", "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5", "#312e81"];
  const keys = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"];
  const last = data[data.length - 1];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex flex-1 items-center gap-3 text-[13px] font-semibold text-ink-2">
          n = {n}
          <input type="range" min={4} max={64} value={n} onChange={(e) => setN(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
        </label>
      </div>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
            <XAxis dataKey="n" tick={{ fontSize: 11, fill: "var(--muted)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} domain={[0, n * n]} allowDataOverflow />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={colors[i]} strokeWidth={2.2} dot={false} isAnimationActive />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {keys.map((k) => (
          <div key={k} className="rounded-xl border border-line bg-surface p-2 text-center">
            <p className="text-[11px] font-semibold text-muted">{k}</p>
            <p className="font-mono text-[13px] font-bold text-ink">{k === "O(2ⁿ)" ? (2 ** n > 1e12 ? `2^${n}` : (2 ** n).toLocaleString()) : Number(last[k as keyof typeof last]).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-muted">Operations needed at n = {n}. Drag the slider and watch O(n²) and O(2ⁿ) explode while O(log n) barely moves.</p>
    </div>
  );
}

/* ---------------- sorting ---------------- */

type SortFrame = { arr: number[]; a?: number; b?: number; sorted: number; note: string };

function sortFrames(input: number[], algo: "bubble" | "selection" | "insertion"): SortFrame[] {
  const a = [...input];
  const f: SortFrame[] = [{ arr: [...a], sorted: algo === "insertion" ? 1 : 0, note: "Start" }];
  const n = a.length;
  if (algo === "bubble") {
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        f.push({ arr: [...a], a: j, b: j + 1, sorted: i, note: `Compare ${a[j]} and ${a[j + 1]}` });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          swapped = true;
          f.push({ arr: [...a], a: j, b: j + 1, sorted: i, note: `Swap → ${a[j]} before ${a[j + 1]}` });
        }
      }
      f.push({ arr: [...a], sorted: i + 1, note: `Pass ${i + 1} done: ${a[n - 1 - i]} is in its final place` });
      if (!swapped) {
        f.push({ arr: [...a], sorted: n, note: "No swaps in this pass → already sorted (early exit)" });
        return f;
      }
    }
  } else if (algo === "selection") {
    for (let i = 0; i < n - 1; i++) {
      let min = i;
      for (let j = i + 1; j < n; j++) {
        f.push({ arr: [...a], a: min, b: j, sorted: i, note: `Smallest so far ${a[min]}, checking ${a[j]}` });
        if (a[j] < a[min]) min = j;
      }
      [a[i], a[min]] = [a[min], a[i]];
      f.push({ arr: [...a], a: i, sorted: i + 1, note: `Place the minimum ${a[i]} at index ${i}` });
    }
  } else {
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      f.push({ arr: [...a], a: i, sorted: i, note: `Insert ${key} into the sorted prefix` });
      while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        a[j] = key;
        f.push({ arr: [...a], a: j, b: j + 1, sorted: i, note: `${a[j + 1]} > ${key} → shift it right` });
        j--;
      }
      f.push({ arr: [...a], a: j + 1, sorted: i + 1, note: `${key} placed at index ${j + 1}` });
    }
  }
  f.push({ arr: [...a], sorted: n, note: "Sorted!" });
  return f;
}

export function SortingViz() {
  const [algo, setAlgo] = useState<"bubble" | "selection" | "insertion">("insertion");
  const [text, setText] = useState("38 27 43 3 9 82 10");
  const nums = parseNums(text, 10);
  const frames = useMemo(() => sortFrames(nums.length ? nums : [5, 3, 1], algo), [text, algo]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useStepper(frames.length, 600);
  const fr = frames[s.i];
  const max = Math.max(...fr.arr.map(Math.abs), 1);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented options={[{ id: "bubble", label: "Bubble" }, { id: "selection", label: "Selection" }, { id: "insertion", label: "Insertion" }]} value={algo} onChange={setAlgo} />
        <TextInput label="Array" value={text} onChange={setText} width="w-52" />
      </div>
      <div className="mt-5 flex h-48 items-end justify-center gap-2">
        {fr.arr.map((v, k) => {
          const active = k === fr.a || k === fr.b;
          const done = algo === "insertion" ? k < fr.sorted && !active : algo === "bubble" ? k >= fr.arr.length - fr.sorted : k < fr.sorted;
          return (
            <div key={k} className="flex w-9 flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${active ? "bg-primary" : done ? "bg-primary-faint" : "bg-surface-2 ring-1 ring-line"}`}
                style={{ height: `${Math.max(8, (Math.abs(v) / max) * 160)}px` }}
              />
              <span className={`font-mono text-[12px] font-semibold ${active ? "text-primary" : "text-ink-2"}`}>{v}</span>
            </div>
          );
        })}
      </div>
      <Controls s={s} total={frames.length} note={fr.note} />
    </div>
  );
}

/* ---------------- binary search ---------------- */

export function BinarySearchViz() {
  const [target, setTarget] = useState(23);
  const arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
  const frames = useMemo(() => {
    const f: { lo: number; hi: number; mid: number; note: string; found?: number }[] = [];
    let lo = 0;
    let hi = arr.length - 1;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (arr[mid] === target) {
        f.push({ lo, hi, mid, found: mid, note: `a[${mid}] = ${arr[mid]} equals the target → found at index ${mid}` });
        return f;
      }
      f.push({ lo, hi, mid, note: `mid = ${mid}, a[mid] = ${arr[mid]} ${arr[mid] < target ? "<" : ">"} ${target} → search the ${arr[mid] < target ? "right" : "left"} half` });
      if (arr[mid] < target) lo = mid + 1;
      else hi = mid - 1;
    }
    f.push({ lo, hi, mid: -1, note: `lo (${lo}) > hi (${hi}) → ${target} is not in the array` });
    return f;
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useStepper(frames.length, 1100);
  const fr = frames[s.i];
  return (
    <div>
      <NumberInput label="Target" value={target} onChange={setTarget} />
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {arr.map((v, k) => (
          <Cell key={k} v={v} tone={k === fr.found ? "range" : k === fr.mid ? "active" : k < fr.lo || k > fr.hi ? "dim" : "idle"} label={[k === fr.lo && "lo", k === fr.mid && "mid", k === fr.hi && "hi"].filter(Boolean).join("/") || k} />
        ))}
      </div>
      <Controls s={s} total={frames.length} note={fr.note} />
    </div>
  );
}

/* ---------------- two pointers ---------------- */

export function TwoPointersViz() {
  const [target, setTarget] = useState(17);
  const arr = [1, 3, 4, 6, 8, 10, 13, 15];
  const frames = useMemo(() => {
    const f: { l: number; r: number; note: string; hit?: boolean }[] = [];
    let l = 0;
    let r = arr.length - 1;
    while (l < r) {
      const sum = arr[l] + arr[r];
      if (sum === target) {
        f.push({ l, r, hit: true, note: `${arr[l]} + ${arr[r]} = ${target} → pair found` });
        return f;
      }
      f.push({ l, r, note: `${arr[l]} + ${arr[r]} = ${sum} ${sum < target ? `< ${target} → move l right` : `> ${target} → move r left`}` });
      if (sum < target) l++;
      else r--;
    }
    f.push({ l, r, note: "Pointers met → no pair adds up to the target" });
    return f;
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useStepper(frames.length, 1000);
  const fr = frames[s.i];
  return (
    <div>
      <NumberInput label="Target sum" value={target} onChange={setTarget} />
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {arr.map((v, k) => (
          <Cell key={k} v={v} tone={(k === fr.l || k === fr.r) && fr.hit ? "range" : k === fr.l || k === fr.r ? "active" : k < fr.l || k > fr.r ? "dim" : "idle"} label={k === fr.l ? "l" : k === fr.r ? "r" : ""} />
        ))}
      </div>
      <Controls s={s} total={frames.length} note={fr.note} />
    </div>
  );
}

/* ---------------- sliding window ---------------- */

export function SlidingWindowViz() {
  const [k, setK] = useState(3);
  const arr = [2, 1, 5, 1, 3, 2, 6, 1];
  const frames = useMemo(() => {
    const kk = Math.min(Math.max(1, k), arr.length);
    const f: { l: number; r: number; sum: number; best: number; note: string }[] = [];
    let sum = 0;
    for (let i = 0; i < kk; i++) sum += arr[i];
    let best = sum;
    f.push({ l: 0, r: kk - 1, sum, best, note: `First window [0..${kk - 1}] sum = ${sum}` });
    for (let r = kk; r < arr.length; r++) {
      sum += arr[r] - arr[r - kk];
      best = Math.max(best, sum);
      f.push({ l: r - kk + 1, r, sum, best, note: `Slide: add ${arr[r]}, remove ${arr[r - kk]} → sum ${sum}, best ${best}` });
    }
    return f;
  }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useStepper(frames.length, 900);
  const fr = frames[s.i];
  return (
    <div>
      <NumberInput label="Window size k" value={k} onChange={setK} min={1} max={8} />
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {arr.map((v, i) => <Cell key={i} v={v} tone={i >= fr.l && i <= fr.r ? "active" : "idle"} label={i} />)}
      </div>
      <div className="mt-3 flex justify-center gap-6 text-[13px]">
        <span>Window sum: <b className="font-mono text-primary">{fr.sum}</b></span>
        <span>Best: <b className="font-mono text-green">{fr.best}</b></span>
      </div>
      <Controls s={s} total={frames.length} note={fr.note} />
    </div>
  );
}

/* ---------------- prefix sum ---------------- */

export function PrefixSumViz() {
  const arr = [3, 1, 4, 1, 5, 9, 2];
  const [l, setL] = useState(2);
  const [r, setR] = useState(4);
  const pre = arr.reduce<number[]>((acc, v, i) => [...acc, acc[i] + v], [0]);
  const frames = useMemo(() => {
    const f: { built: number; q: boolean; note: string }[] = [{ built: 0, q: false, note: "pre[0] = 0" }];
    for (let i = 0; i < arr.length; i++) f.push({ built: i + 1, q: false, note: `pre[${i + 1}] = pre[${i}] + a[${i}] = ${pre[i]} + ${arr[i]} = ${pre[i + 1]}` });
    const ll = Math.min(l, r);
    const rr = Math.max(l, r);
    f.push({ built: arr.length, q: true, note: `sum(a[${ll}..${rr}]) = pre[${rr + 1}] − pre[${ll}] = ${pre[rr + 1]} − ${pre[ll]} = ${pre[rr + 1] - pre[ll]} in O(1)` });
    return f;
  }, [l, r]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useStepper(frames.length, 800);
  const fr = frames[s.i];
  const ll = Math.min(l, r);
  const rr = Math.max(l, r);
  return (
    <div>
      <div className="flex flex-wrap gap-4">
        <NumberInput label="l" value={l} onChange={setL} min={0} max={arr.length - 1} />
        <NumberInput label="r" value={r} onChange={setR} min={0} max={arr.length - 1} />
      </div>
      <p className="mt-4 text-[12px] font-semibold text-muted">a</p>
      <div className="flex flex-wrap gap-1.5">{arr.map((v, i) => <Cell key={i} v={v} tone={fr.q && i >= ll && i <= rr ? "range" : i === fr.built - 1 && !fr.q ? "active" : "idle"} label={i} />)}</div>
      <p className="mt-3 text-[12px] font-semibold text-muted">pre</p>
      <div className="flex flex-wrap gap-1.5">{pre.map((v, i) => <Cell key={i} v={i <= fr.built ? v : "·"} tone={fr.q && (i === rr + 1 || i === ll) ? "active" : i === fr.built && !fr.q ? "done" : "idle"} label={i} />)}</div>
      <Controls s={s} total={frames.length} note={fr.note} />
    </div>
  );
}

/* ---------------- Kadane ---------------- */

export function KadaneViz() {
  const arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
  const frames = useMemo(() => {
    const f: { i: number; cur: number; best: number; start: number; bl: number; br: number; note: string }[] = [];
    let cur = arr[0];
    let best = arr[0];
    let start = 0;
    let bl = 0;
    let br = 0;
    f.push({ i: 0, cur, best, start, bl, br, note: `Start with cur = best = ${arr[0]}` });
    for (let i = 1; i < arr.length; i++) {
      const restart = cur + arr[i] < arr[i];
      if (restart) {
        cur = arr[i];
        start = i;
      } else cur += arr[i];
      if (cur > best) {
        best = cur;
        bl = start;
        br = i;
      }
      f.push({ i, cur, best, start, bl, br, note: restart ? `${arr[i]} alone beats extending → restart here (cur = ${cur})` : `Extend: cur = ${cur}${cur === best ? ` → new best ${best}` : ""}` });
    }
    return f;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useStepper(frames.length, 900);
  const fr = frames[s.i];
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {arr.map((v, i) => <Cell key={i} v={v} tone={i === fr.i ? "active" : i >= fr.bl && i <= fr.br ? "range" : i >= fr.start && i < fr.i ? "done" : "idle"} label={i} />)}
      </div>
      <div className="mt-3 flex justify-center gap-6 text-[13px]">
        <span>cur: <b className="font-mono text-primary">{fr.cur}</b></span>
        <span>best: <b className="font-mono text-green">{fr.best}</b> (green = best subarray)</span>
      </div>
      <Controls s={s} total={frames.length} note={fr.note} />
    </div>
  );
}

/* ---------------- matrix spiral ---------------- */

export function MatrixViz() {
  const R = 4;
  const C = 5;
  const m = Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => r * C + c + 1));
  const order = useMemo(() => {
    const out: [number, number][] = [];
    let top = 0;
    let bottom = R - 1;
    let left = 0;
    let right = C - 1;
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) out.push([top, c]);
      top++;
      for (let r = top; r <= bottom; r++) out.push([r, right]);
      right--;
      if (top <= bottom) {
        for (let c = right; c >= left; c--) out.push([bottom, c]);
        bottom--;
      }
      if (left <= right) {
        for (let r = bottom; r >= top; r--) out.push([r, left]);
        left++;
      }
    }
    return out;
  }, []);
  const s = useStepper(order.length, 350);
  const visited = new Set(order.slice(0, s.i + 1).map(([r, c]) => `${r},${c}`));
  const [cr, cc] = order[s.i];
  return (
    <div>
      <div className="mx-auto grid w-fit gap-1.5" style={{ gridTemplateColumns: `repeat(${C}, minmax(0, 1fr))` }}>
        {m.flat().map((v, k) => {
          const r = Math.floor(k / C);
          const c = k % C;
          return <Cell key={k} v={v} tone={r === cr && c === cc ? "active" : visited.has(`${r},${c}`) ? "done" : "idle"} />;
        })}
      </div>
      <Controls s={s} total={order.length} note={`Spiral order so far: ${order.slice(0, s.i + 1).map(([r, c]) => m[r][c]).join(", ")}`} />
    </div>
  );
}
