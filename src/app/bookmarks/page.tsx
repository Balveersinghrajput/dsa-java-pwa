"use client";

import Link from "next/link";
import { Bookmark, BookOpenText, FileText, LayoutTemplate, PlayCircle, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { plan } from "@/data/curriculum";
import { videos, thumb } from "@/data/videos";
import { guideById } from "@/data/articles";
import { templates } from "@/data/templates";
import { useAppState } from "@/lib/store";
import { DiffBadge, EmptyState, PageHeader, cardCls, st } from "@/components/ui";
import { LeetIcon } from "@/components/shell/nav";

const problemIndexNow = () => new Map(plan.flatMap((d) => d.problems.map((p) => [p.slug, { p, day: d.day }] as const)));

export default function BookmarksPage() {
  const { state, toggleBookmark } = useAppState();
  const groups: { title: string; icon: ReactNode; items: { key: string; node: ReactNode }[] }[] = [
    { title: "Lessons", icon: <BookOpenText className="h-4 w-4" />, items: [] },
    { title: "Problems", icon: <LeetIcon className="h-4 w-4" />, items: [] },
    { title: "Videos", icon: <PlayCircle className="h-4 w-4" />, items: [] },
    { title: "Articles", icon: <FileText className="h-4 w-4" />, items: [] },
    { title: "Templates", icon: <LayoutTemplate className="h-4 w-4" />, items: [] },
  ];

  for (const key of state.bookmarks) {
    const [kind, id] = [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
    if (kind === "lesson") {
      const d = plan[Number(id) - 1];
      if (d) groups[0].items.push({ key, node: <Link href={`/lessons/${d.day}`} className="min-w-0 flex-1"><span className="block text-[12px] font-semibold text-primary">Day {d.day}</span><span className="block truncate text-[14px] font-semibold">{d.topic.title}</span></Link> });
    } else if (kind === "problem") {
      const e = problemIndexNow().get(id);
      if (e) groups[1].items.push({ key, node: <a href={e.p.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 items-center gap-2"><DiffBadge d={e.p.difficulty} /><span className="truncate text-[14px] font-semibold">{e.p.title}</span><span className="text-[12px] text-muted">Day {e.day}</span></a> });
    } else if (kind === "video") {
      const v = videos.find((x) => x.id === id);
      // eslint-disable-next-line @next/next/no-img-element
      if (v) groups[2].items.push({ key, node: <Link href={`/resources/videos/${v.id}`} className="flex min-w-0 flex-1 items-center gap-3"><img src={thumb(v.id)} alt="" className="h-12 w-20 flex-none rounded-lg object-cover" /><span className="min-w-0"><span className="block truncate text-[14px] font-semibold">{v.title}</span><span className="block text-[12px] text-muted">{v.channel} · {v.duration}</span></span></Link> });
    } else if (kind === "article") {
      const g = guideById(id);
      if (g) groups[3].items.push({ key, node: <Link href={`/resources/articles/${g.id}`} className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold">{g.title} — guide</span><span className="block text-[12px] text-muted">{g.minutes} min read</span></Link> });
    } else if (kind === "template") {
      const t = templates.find((x) => x.id === id);
      if (t) groups[4].items.push({ key, node: <Link href={`/resources?tab=templates&t=${t.id}`} className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold">{t.title}</span><span className="block text-[12px] text-muted">{t.category}</span></Link> });
    }
  }

  const count = groups.reduce((a, g) => a + g.items.length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Bookmarks" subtitle={`${count} saved item${count === 1 ? "" : "s"}`} />
      {count === 0 ? (
        <EmptyState icon={<Bookmark className="h-5 w-5" />} title="No bookmarks yet" text="Tap the bookmark icon on any lesson, problem, video, article or template to save it here." />
      ) : (
        <div className="space-y-6">
          {groups.filter((g) => g.items.length).map((g, gi) => (
            <section key={g.title} className="rise" style={st(gi + 1)}>
              <h2 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">{g.icon}</span>{g.title} · {g.items.length}</h2>
              <ul className="space-y-2">
                {g.items.map((it) => (
                  <li key={it.key} className={`flex items-center gap-3 p-3 ${cardCls}`}>
                    {it.node}
                    <button onClick={() => toggleBookmark(it.key)} aria-label="Remove bookmark" className="press grid h-9 w-9 flex-none place-items-center rounded-lg text-muted hover:bg-rose-soft hover:text-rose"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
