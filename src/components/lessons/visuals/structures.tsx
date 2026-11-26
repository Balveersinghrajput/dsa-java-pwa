"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Segmented } from "@/components/ui";
import { Cell, Controls, NumberInput, TextInput, parseNums, useStepper } from "./common";

const btn = "press h-8 rounded-lg border border-line bg-surface px-3 text-[12.5px] font-semibold text-ink-2 hover:border-primary-faint hover:text-primary disabled:opacity-40";

/* ---------------- linked list ---------------- */

export function LinkedListViz() {
  const [list, setList] = useState([3, 7, 1, 9]);
  const [val, setVal] = useState(5);
  const [log, setLog] = useState("Use the buttons to change the list. Each node points to the next one.");
  const [rev, setRev] = useState<null | { frames: { prev: number; cur: number; arrows: boolean[] }[] }>(null);

  const reverseFrames = useMemo(() => {
    const n = list.length;
    const frames: { prev: number; cur: number; arrows: boolean[] }[] = [];
    const flipped = Array(n).fill(false);
    frames.push({ prev: -1, cur: 0, arrows: [...flipped] });
    for (let i = 0; i < n; i++) {
      flipped[i] = true;
      frames.push({ prev: i, cur: i + 1, arrows: [...flipped] });
    }
    return frames;
  }, [list]);
  const s = useStepper(reverseFrames.length, 800);
  const fr = rev ? reverseFrames[s.i] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <NumberInput label="Value" value={val} onChange={setVal} />
        <button className={btn} disabled={list.length >= 8} onClick={() => { setRev(null); setList([val, ...list]); setLog(`insertAtHead(${val}): new node points to the old head — O(1)`); }}>Insert head</button>
        <button className={btn} disabled={list.length >= 8} onClick={() => { setRev(null); setList([...list, val]); setLog(`insertAtTail(${val}): walk to the last node, link it — O(n) (O(1) with a tail pointer)`); }}>Insert tail</button>
        <button className={btn} disabled={!list.length} onClick={() => { setRev(null); setLog(`deleteHead(): head = head.next (removed ${list[0]}) — O(1)`); setList(list.slice(1)); }}>Delete head</button>
        <button className={btn} disabled={list.length < 2} onClick={() => { setRev({ frames: reverseFrames }); s.reset(); setLog("Reverse: flip one arrow at a time using prev, cur and next"); }}>Reverse ▶</button>
      </div>
      <div className="no-scrollbar mt-5 flex items-center gap-1 overflow-x-auto pb-2">
        <span className="mr-1 text-[11px] font-bold text-muted">head</span>
        {list.map((v, i) => {
          const flipped = fr?.arrows[i];
          return (
            <div key={`${i}-${v}`} className="pop flex items-center gap-1" style={{ ["--i" as string]: i }}>
              <div className={`flex overflow-hidden rounded-lg border transition-all duration-300 ${fr && i === fr.cur ? "border-primary ring-2 ring-primary-faint" : fr && i === fr.prev ? "border-green" : "border-line"}`}>
                <span className="grid h-10 w-10 place-items-center bg-surface font-mono text-[13px] font-semibold">{v}</span>
                <span className="grid h-10 w-5 place-items-center border-l border-line bg-surface-2 text-[9px] text-muted">•</span>
              </div>
              <ArrowRight className={`h-4 w-4 flex-none transition-transform duration-300 ${flipped ? "rotate-180 text-green" : "text-muted"}`} />
            </div>
          );
        })}
        <span className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted">null</span>
      </div>
      {rev ? <Controls s={s} total={reverseFrames.length} note={fr && fr.cur >= list.length ? "Done: prev is the new head; every arrow now points backwards." : `prev = ${fr && fr.prev >= 0 ? list[fr.prev] : "null"}, cur = ${fr ? list[fr.cur] : ""}: save next, point cur back to prev, advance`} /> : <p className="mt-3 rounded-xl bg-primary-soft/60 px-3.5 py-2.5 text-[13px]">{log}</p>}
    </div>
  );
}

/* ---------------- stack & queue ---------------- */

export function StackQueueViz() {
  const [mode, setMode] = useState<"stack" | "queue">("stack");
  const [items, setItems] = useState([4, 8, 15]);
  const [val, setVal] = useState(16);
  const [log, setLog] = useState("Stack: last in, first out. Queue: first in, first out.");
  const removeIdx = mode === "stack" ? items.length - 1 : 0;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Segmented options={[{ id: "stack", label: "Stack (LIFO)" }, { id: "queue", label: "Queue (FIFO)" }]} value={mode} onChange={(m) => { setMode(m); setLog(m === "stack" ? "push/pop happen at the top" : "offer at the back, poll from the front"); }} />
        <NumberInput label="Value" value={val} onChange={setVal} />
        <button className={btn} disabled={items.length >= 8} onClick={() => { setItems([...items, val]); setLog(`${mode === "stack" ? "push" : "offer"}(${val}) — O(1)`); setVal(val + 7); }}>{mode === "stack" ? "push" : "offer"}</button>
        <button className={btn} disabled={!items.length} onClick={() => { setLog(`${mode === "stack" ? "pop" : "poll"}() → ${items[removeIdx]} — O(1)`); setItems(mode === "stack" ? items.slice(0, -1) : items.slice(1)); }}>{mode === "stack" ? "pop" : "poll"}</button>
      </div>
      <div className="mt-5 flex min-h-[220px] items-end justify-center">
        {mode === "stack" ? (
          <div className="flex w-32 flex-col-reverse gap-1.5 rounded-b-2xl border-x-2 border-b-2 border-ink-2/40 p-2">
            {items.map((v, i) => (
              <div key={`${i}-${v}`} className={`pop grid h-9 place-items-center rounded-lg border font-mono text-[13px] font-semibold ${i === items.length - 1 ? "border-primary bg-primary text-white" : "border-line bg-surface"}`}>{v}</div>
            ))}
            {!items.length && <p className="py-6 text-center text-[12px] text-muted">empty</p>}
          </div>
        ) : (
          <div className="flex items-center gap-2 self-center">
            <span className="text-[11px] font-bold text-muted">front</span>
            <div className="flex gap-1.5 rounded-2xl border-y-2 border-ink-2/40 px-2 py-2">
              {items.map((v, i) => (
                <div key={`${i}-${v}`} className={`pop grid h-10 w-10 place-items-center rounded-lg border font-mono text-[13px] font-semibold ${i === 0 ? "border-primary bg-primary text-white" : "border-line bg-surface"}`}>{v}</div>
              ))}
              {!items.length && <p className="px-6 text-[12px] text-muted">empty</p>}
            </div>
            <span className="text-[11px] font-bold text-muted">back</span>
          </div>
        )}
      </div>
      <p className="mt-3 rounded-xl bg-primary-soft/60 px-3.5 py-2.5 text-[13px]">{log}</p>
    </div>
  );
}

/* ---------------- binary search tree + traversals ---------------- */

type TNode = { v: number; l?: TNode; r?: TNode; x: number; y: number };

function buildBST(vals: number[]) {
  let root: TNode | undefined;
  const ins = (n: TNode | undefined, v: number): TNode => {
    if (!n) return { v, x: 0, y: 0 };
    if (v < n.v) n.l = ins(n.l, v);
    else if (v > n.v) n.r = ins(n.r, v);
    return n;
  };
  for (const v of vals) root = ins(root, v);
  // layout: inorder index for x, depth for y
  let idx = 0;
  const lay = (n: TNode | undefined, d: number) => {
    if (!n) return;
    lay(n.l, d + 1);
    n.x = idx++;
    n.y = d;
    lay(n.r, d + 1);
  };
  lay(root, 0);
  return { root, count: idx };
}

export function TreeViz() {
  const [text, setText] = useState("50 30 70 20 40 60 80");
  const [order, setOrder] = useState<"pre" | "in" | "post" | "level">("in");
  const vals = parseNums(text, 15);
  const { root, count } = useMemo(() => buildBST(vals), [text]); // eslint-disable-line react-hooks/exhaustive-deps
  const seq = useMemo(() => {
    const out: number[] = [];
    const go = (n?: TNode) => {
      if (!n) return;
      if (order === "pre") out.push(n.v);
      go(n.l);
      if (order === "in") out.push(n.v);
      go(n.r);
      if (order === "post") out.push(n.v);
    };
    if (order === "level") {
      const q: TNode[] = root ? [root] : [];
      while (q.length) {
        const n = q.shift()!;
        out.push(n.v);
        if (n.l) q.push(n.l);
        if (n.r) q.push(n.r);
      }
    } else go(root);
    return out;
  }, [root, order]);
  const s = useStepper(Math.max(seq.length, 1), 700);
  const visited = new Set(seq.slice(0, s.i + 1));
  const W = Math.max(count, 1) * 52;
  const nodes: TNode[] = [];
  const edges: [TNode, TNode][] = [];
  const walk = (n?: TNode) => {
    if (!n) return;
    nodes.push(n);
    if (n.l) edges.push([n, n.l]);
    if (n.r) edges.push([n, n.r]);
    walk(n.l);
    walk(n.r);
  };
  walk(root);
  const depth = Math.max(0, ...nodes.map((n) => n.y));
  const px = (n: TNode) => n.x * 52 + 26;
  const py = (n: TNode) => n.y * 62 + 26;
  const names = { pre: "Preorder (N L R)", in: "Inorder (L N R) — sorted for a BST", post: "Postorder (L R N)", level: "Level order (BFS)" };
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <TextInput label="Insert keys" value={text} onChange={setText} width="w-52" />
        <Segmented options={[{ id: "pre", label: "Pre" }, { id: "in", label: "In" }, { id: "post", label: "Post" }, { id: "level", label: "Level" }]} value={order} onChange={setOrder} />
      </div>
      <div className="no-scrollbar mt-4 overflow-x-auto">
        <svg width={W} height={(depth + 1) * 62 + 10} className="mx-auto block">
          {edges.map(([a, b], k) => <line key={k} x1={px(a)} y1={py(a)} x2={px(b)} y2={py(b)} stroke="var(--line)" strokeWidth="2" />)}
          {nodes.map((n) => {
            const cur = seq[s.i] === n.v;
            const done = visited.has(n.v);
            return (
              <g key={n.v} className="transition-all">
                <circle cx={px(n)} cy={py(n)} r="19" fill={cur ? "var(--primary)" : done ? "var(--primary-soft)" : "var(--surface)"} stroke={cur || done ? "var(--primary)" : "var(--line)"} strokeWidth="2" style={{ transition: "all .3s" }} />
                <text x={px(n)} y={py(n) + 4} textAnchor="middle" className={`font-mono text-[12px] font-bold ${cur ? "fill-white" : "fill-ink"}`}>{n.v}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <Controls s={s} total={Math.max(seq.length, 1)} note={<><b>{names[order]}:</b> {seq.slice(0, s.i + 1).join(" → ")}</>} />
    </div>
  );
}

/* ---------------- graph BFS / DFS ---------------- */

const G_NODES = [
  { x: 60, y: 60 }, { x: 180, y: 30 }, { x: 180, y: 120 }, { x: 300, y: 60 }, { x: 300, y: 160 }, { x: 420, y: 100 }, { x: 60, y: 170 },
];
const G_EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [0, 6]];

export function GraphViz() {
  const [algo, setAlgo] = useState<"bfs" | "dfs">("bfs");
  const adj = G_NODES.map((_, i) => G_EDGES.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : [])).sort());
  const frames = useMemo(() => {
    const f: { visited: number[]; cur: number; frontier: number[]; note: string }[] = [];
    if (algo === "bfs") {
      const seen = new Set([0]);
      const q = [0];
      const order: number[] = [];
      while (q.length) {
        const u = q.shift()!;
        order.push(u);
        for (const v of adj[u]) if (!seen.has(v)) { seen.add(v); q.push(v); }
        f.push({ visited: [...order], cur: u, frontier: [...q], note: `Visit ${u}; enqueue unvisited neighbours → queue [${q.join(", ")}]` });
      }
    } else {
      const seen = new Set<number>();
      const order: number[] = [];
      const stack: number[] = [];
      const dfs = (u: number) => {
        seen.add(u);
        order.push(u);
        stack.push(u);
        f.push({ visited: [...order], cur: u, frontier: [...stack], note: `Visit ${u}; go deeper (call stack [${stack.join(", ")}])` });
        for (const v of adj[u]) if (!seen.has(v)) dfs(v);
        stack.pop();
      };
      dfs(0);
    }
    return f;
  }, [algo]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useStepper(frames.length, 900);
  const fr = frames[s.i];
  const vis = new Set(fr.visited);
  return (
    <div>
      <Segmented options={[{ id: "bfs", label: "BFS (queue)" }, { id: "dfs", label: "DFS (stack)" }]} value={algo} onChange={setAlgo} />
      <div className="no-scrollbar mt-4 overflow-x-auto">
        <svg viewBox="0 0 480 200" className="mx-auto block w-full max-w-[520px] min-w-[360px]">
          {G_EDGES.map(([a, b], k) => (
            <line key={k} x1={G_NODES[a].x} y1={G_NODES[a].y} x2={G_NODES[b].x} y2={G_NODES[b].y} stroke={vis.has(a) && vis.has(b) ? "var(--primary-faint)" : "var(--line)"} strokeWidth="2.5" />
          ))}
          {G_NODES.map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r="18" fill={i === fr.cur ? "var(--primary)" : vis.has(i) ? "var(--primary-soft)" : fr.frontier.includes(i) ? "var(--amber-soft)" : "var(--surface)"} stroke={i === fr.cur || vis.has(i) ? "var(--primary)" : fr.frontier.includes(i) ? "var(--amber)" : "var(--line)"} strokeWidth="2" style={{ transition: "all .3s" }} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" className={`font-mono text-[13px] font-bold ${i === fr.cur ? "fill-white" : "fill-ink"}`}>{i}</text>
            </g>
          ))}
        </svg>
      </div>
      <Controls s={s} total={frames.length} note={<><b>Order:</b> {fr.visited.join(" → ")} · {fr.note}</>} />
    </div>
  );
}

/* ---------------- heap ---------------- */

export function HeapViz() {
  const [heap, setHeap] = useState([1, 3, 5, 7, 9, 8]);
  const [val, setVal] = useState(2);
  const [hl, setHl] = useState<number[]>([]);
  const [log, setLog] = useState("Min-heap: every parent ≤ its children. Children of i are 2i+1 and 2i+2.");

  const insert = () => {
    const h = [...heap, val];
    let i = h.length - 1;
    const path = [i];
    while (i > 0 && h[(i - 1) >> 1] > h[i]) {
      const p = (i - 1) >> 1;
      [h[p], h[i]] = [h[i], h[p]];
      i = p;
      path.push(i);
    }
    setHeap(h);
    setHl(path);
    setLog(`push(${val}): added at index ${h.length - 1}, sifted up ${path.length - 1} level(s) — O(log n)`);
    setVal(val + 4);
  };
  const extract = () => {
    if (!heap.length) return;
    const h = [...heap];
    const top = h[0];
    h[0] = h[h.length - 1];
    h.pop();
    let i = 0;
    const path = [0];
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < h.length && h[l] < h[m]) m = l;
      if (r < h.length && h[r] < h[m]) m = r;
      if (m === i) break;
      [h[i], h[m]] = [h[m], h[i]];
      i = m;
      path.push(i);
    }
    setHeap(h);
    setHl(path);
    setLog(`poll() → ${top}: last element moved to the root and sifted down — O(log n)`);
  };

  const pos = (i: number) => {
    const d = Math.floor(Math.log2(i + 1));
    const first = 2 ** d - 1;
    const slots = 2 ** d;
    return { x: ((i - first + 0.5) / slots) * 440 + 10, y: d * 56 + 24 };
  };
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <NumberInput label="Value" value={val} onChange={setVal} />
        <button className={btn} disabled={heap.length >= 15} onClick={insert}>push</button>
        <button className={btn} disabled={!heap.length} onClick={extract}>poll (extract min)</button>
      </div>
      <div className="no-scrollbar mt-4 overflow-x-auto">
        <svg viewBox="0 0 460 230" className="mx-auto block w-full max-w-[520px] min-w-[360px]">
          {heap.map((_, i) => (i > 0 ? <line key={`e${i}`} x1={pos(i).x} y1={pos(i).y} x2={pos((i - 1) >> 1).x} y2={pos((i - 1) >> 1).y} stroke="var(--line)" strokeWidth="2" /> : null))}
          {heap.map((v, i) => (
            <g key={i}>
              <circle cx={pos(i).x} cy={pos(i).y} r="17" fill={hl.includes(i) ? "var(--primary)" : "var(--surface)"} stroke={hl.includes(i) ? "var(--primary)" : "var(--line)"} strokeWidth="2" style={{ transition: "all .3s" }} />
              <text x={pos(i).x} y={pos(i).y + 4} textAnchor="middle" className={`font-mono text-[12px] font-bold ${hl.includes(i) ? "fill-white" : "fill-ink"}`}>{v}</text>
            </g>
          ))}
        </svg>
      </div>
      <p className="text-[12px] font-semibold text-muted">Array view</p>
      <div className="mt-1 flex flex-wrap gap-1.5">{heap.map((v, i) => <Cell key={i} v={v} small tone={hl.includes(i) ? "active" : "idle"} label={i} />)}</div>
      <p className="mt-3 rounded-xl bg-primary-soft/60 px-3.5 py-2.5 text-[13px]">{log}</p>
    </div>
  );
}

/* ---------------- hash table ---------------- */

export function HashViz() {
  const B = 7;
  const [buckets, setBuckets] = useState<string[][]>(() => {
    const b: string[][] = Array.from({ length: 7 }, () => []);
    for (const k of ["cat", "dog", "owl"]) b[hash(k) % 7].push(k);
    return b;
  });
  const [key, setKey] = useState("fox");
  const [hit, setHit] = useState<number | null>(null);
  const [log, setLog] = useState("index = hash(key) % 7. Keys that land in the same bucket are chained in a list.");
  function hash(s: string) {
    let h = 0;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  }
  const idx = key ? hash(key) % B : 0;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <TextInput label="Key" value={key} onChange={(v) => setKey(v.slice(0, 10))} width="w-28" />
        <button className={btn} disabled={!key} onClick={() => {
          setHit(idx);
          if (buckets[idx].includes(key)) { setLog(`"${key}" already exists in bucket ${idx}`); return; }
          const b = buckets.map((x) => [...x]);
          b[idx].push(key);
          setBuckets(b);
          setLog(`put("${key}"): hash = ${hash(key)}, ${hash(key)} % 7 = ${idx}${buckets[idx].length ? ` → collision, chained after ${buckets[idx].join(", ")}` : ""}`);
        }}>put</button>
        <button className={btn} disabled={!key} onClick={() => { setHit(idx); setLog(buckets[idx].includes(key) ? `get("${key}"): bucket ${idx} → found after ${buckets[idx].indexOf(key) + 1} comparison(s)` : `get("${key}"): bucket ${idx} → not found`); }}>get</button>
      </div>
      <div className="mt-5 space-y-1.5">
        {buckets.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`grid h-9 w-9 flex-none place-items-center rounded-lg border font-mono text-[12px] font-bold transition-colors ${hit === i ? "border-primary bg-primary text-white" : "border-line bg-surface-2 text-ink-2"}`}>{i}</span>
            <div className="flex flex-wrap items-center gap-1">
              {b.map((k) => (
                <span key={k} className="pop flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5 text-muted" />
                  <span className={`rounded-lg border px-2.5 py-1.5 font-mono text-[12px] ${k === key && hit === i ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface"}`}>{k}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-xl bg-primary-soft/60 px-3.5 py-2.5 text-[13px]">{log}</p>
    </div>
  );
}

/* ---------------- trie ---------------- */

type TrieNode = { c: string; end: boolean; kids: Map<string, TrieNode>; x: number; y: number };

export function TrieViz() {
  const [words, setWords] = useState(["cat", "car", "cart", "dog"]);
  const [w, setW] = useState("care");
  const [hl, setHl] = useState<string>("");
  const root = useMemo(() => {
    const r: TrieNode = { c: "", end: false, kids: new Map(), x: 0, y: 0 };
    for (const word of words) {
      let n = r;
      for (const ch of word) {
        if (!n.kids.has(ch)) n.kids.set(ch, { c: ch, end: false, kids: new Map(), x: 0, y: 0 });
        n = n.kids.get(ch)!;
      }
      n.end = true;
    }
    let leaf = 0;
    const lay = (n: TrieNode, d: number): number => {
      n.y = d;
      const ks = [...n.kids.values()].sort((a, b) => a.c.localeCompare(b.c));
      if (!ks.length) return (n.x = leaf++);
      const xs = ks.map((k) => lay(k, d + 1));
      return (n.x = (xs[0] + xs[xs.length - 1]) / 2);
    };
    lay(r, 0);
    return { r, leaves: leaf };
  }, [words]);
  const nodes: { n: TrieNode; path: string; parent?: TrieNode }[] = [];
  const walk = (n: TrieNode, path: string, parent?: TrieNode) => {
    nodes.push({ n, path, parent });
    for (const k of n.kids.values()) walk(k, path + k.c, n);
  };
  walk(root.r, "");
  const W = Math.max(root.leaves, 1) * 46 + 20;
  const px = (n: TrieNode) => n.x * 46 + 30;
  const py = (n: TrieNode) => n.y * 46 + 22;
  const search = (word: string) => {
    let n = root.r;
    for (const ch of word) {
      const k = n.kids.get(ch);
      if (!k) return "missing";
      n = k;
    }
    return n.end ? "word" : "prefix";
  };
  const result = hl ? search(hl) : null;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <TextInput label="Word" value={w} onChange={(v) => setW(v.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8))} width="w-28" />
        <button className={btn} disabled={!w || words.includes(w) || words.length >= 8} onClick={() => { setWords([...words, w]); setHl(w); }}>insert</button>
        <button className={btn} disabled={!w} onClick={() => setHl(w)}>search</button>
      </div>
      <div className="no-scrollbar mt-4 overflow-x-auto">
        <svg width={W} height={Math.max(...nodes.map((x) => x.n.y)) * 46 + 44} className="mx-auto block">
          {nodes.map(({ n, parent, path }) => parent && <line key={`e${path}`} x1={px(parent)} y1={py(parent)} x2={px(n)} y2={py(n)} stroke={hl.startsWith(path) ? "var(--primary)" : "var(--line)"} strokeWidth="2" />)}
          {nodes.map(({ n, path }) => {
            const on = path && hl.startsWith(path);
            return (
              <g key={path || "root"}>
                <circle cx={px(n)} cy={py(n)} r="15" fill={on ? "var(--primary)" : "var(--surface)"} stroke={n.end ? "var(--green)" : on ? "var(--primary)" : "var(--line)"} strokeWidth={n.end ? 3 : 2} />
                <text x={px(n)} y={py(n) + 4} textAnchor="middle" className={`font-mono text-[12px] font-bold ${on ? "fill-white" : "fill-ink"}`}>{n.c || "•"}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 rounded-xl bg-primary-soft/60 px-3.5 py-2.5 text-[13px]">
        Words: {words.join(", ")}. Green ring = end of a word.
        {result && <> search(&quot;{hl}&quot;) → <b>{result === "word" ? "found as a word" : result === "prefix" ? "only a prefix (startsWith = true)" : "not found"}</b>.</>}
      </p>
    </div>
  );
}
