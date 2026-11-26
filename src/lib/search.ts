import { plan, planVersion } from "@/data/curriculum";
import { videos } from "@/data/videos";
import { guides } from "@/data/articles";
import { templates } from "@/data/templates";
import { NAV } from "@/components/shell/nav";

export interface SearchHit {
  kind: "lesson" | "problem" | "video" | "article" | "template" | "page";
  title: string;
  sub: string;
  href: string;
  external?: boolean;
  hay: string;
}

let index: SearchHit[] | null = null;
let builtFor = -1;

function build(): SearchHit[] {
  const hits: SearchHit[] = [];
  for (const n of NAV) hits.push({ kind: "page", title: n.label, sub: "Go to page", href: n.href, hay: n.label.toLowerCase() });
  for (const d of plan) {
    hits.push({
      kind: "lesson",
      title: `Day ${d.day}: ${d.topic.title}${d.topic.days > 1 ? ` (part ${d.part})` : ""}`,
      sub: `${d.phase.title} · ${d.concepts.join(", ")}`,
      href: `/lessons/${d.day}`,
      hay: `day ${d.day} ${d.topic.title} ${d.phase.title} ${d.concepts.join(" ")}`.toLowerCase(),
    });
  }
  const seen = new Set<string>();
  for (const d of plan)
    for (const p of d.problems) {
      if (seen.has(p.slug)) continue;
      seen.add(p.slug);
      hits.push({ kind: "problem", title: p.title, sub: `${p.difficulty} · ${d.topic.title} · Day ${d.day}`, href: `/problems?q=${encodeURIComponent(p.title)}`, hay: `${p.title} ${p.difficulty} ${d.topic.title}`.toLowerCase() });
    }
  for (const v of videos) hits.push({ kind: "video", title: v.title, sub: `${v.channel} · ${v.duration}`, href: `/resources/videos/${v.id}`, hay: `${v.title} ${v.channel}`.toLowerCase() });
  for (const g of guides) hits.push({ kind: "article", title: `${g.title} — guide`, sub: `${g.phase.title} · ${g.minutes} min read`, href: `/resources/articles/${g.id}`, hay: `${g.title} ${g.phase.title} guide article`.toLowerCase() });
  for (const t of templates) hits.push({ kind: "template", title: t.title, sub: `Template · ${t.category}`, href: `/resources?tab=templates&t=${t.id}`, hay: `${t.title} ${t.description} template`.toLowerCase() });
  return hits;
}

/** Simple multi-word search: every word must appear; earlier/shorter matches rank higher. */
export function searchAll(q: string, limit = 30): SearchHit[] {
  if (!index || builtFor !== planVersion()) {
    index = build();
    builtFor = planVersion();
  }
  const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return index.filter((h) => h.kind === "page");
  const order: Record<SearchHit["kind"], number> = { page: 0, lesson: 1, problem: 2, article: 3, video: 4, template: 5 };
  return index
    .filter((h) => words.every((w) => h.hay.includes(w)))
    .map((h) => ({ h, score: h.hay.indexOf(words[0]) + order[h.kind] * 5 + h.title.length / 50 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.h);
}
