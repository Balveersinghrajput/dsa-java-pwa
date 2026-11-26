"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { plan } from "@/data/curriculum";
import { useAppState } from "@/lib/store";
import { useDerived } from "@/lib/derive";
import { Card, CardHeader, LinkMore, st } from "@/components/ui";
import { SearchButton, TopActions } from "@/components/shell/bits";
import HeroArt from "./HeroArt";
import Journey from "./Journey";
import { BottomStats, CalendarCard, ProblemsCard, QuickResources, Recommended, StatCards, StreakCard, TodayPlan, TodayTopic, UpNext } from "./Cards";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

export default function Dashboard() {
  const { state } = useAppState();
  const d = useDerived();
  const first = state.name.trim().split(/\s+/)[0] || "Learner";

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-6">
        {/* ---------------- main column ---------------- */}
        <div className="min-w-0 space-y-5">
          {/* header: search + greeting + illustration */}
          <div className="relative">
            <div className="hidden items-center gap-4 lg:flex">
              <div className="w-full max-w-[540px]"><SearchButton /></div>
              <div className="ml-auto xl:hidden"><TopActions /></div>
            </div>
            <div className="flex items-end justify-between gap-4 lg:mt-1">
              <div className="rise min-w-0 py-2 lg:pt-8 lg:pb-4" style={st(0)}>
                <h1 className="text-[24px] leading-tight font-extrabold tracking-[-0.02em] text-ink sm:text-[30px]">
                  {greeting()}, {first}! <span className="wave">👋</span>
                </h1>
                <p className="mt-1.5 text-[14px] text-ink-2 sm:text-[15px]">Consistency today, mastery tomorrow.</p>
              </div>
              <HeroArt className="rise hidden h-[120px] w-auto flex-none sm:block lg:-mt-14 lg:h-[160px] xl:mr-6" />
            </div>
          </div>

          {d.catchUp && (
            <Link href={`/lessons/${d.firstUndone}`} className="rise flex items-center gap-3 rounded-2xl border border-amber/30 bg-amber-soft p-4 text-[13.5px] hover:border-amber/60">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-amber text-white"><Lock className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <b className="block text-ink">Catch up first: {d.missed.length} days missed</b>
                <span className="text-ink-2">New lessons stay locked until you finish them. Next up is Day {d.firstUndone}: {plan[d.firstUndone - 1].topic.title}.</span>
              </span>
              <span className="hidden font-semibold text-amber sm:block">Continue →</span>
            </Link>
          )}

          <StatCards d={d} />

          <Card i={5} className="p-5">
            <CardHeader title={`Your ${plan.length}-Day Journey`} action={<LinkMore href="/roadmap">View Full Roadmap</LinkMore>} />
            <div className="no-scrollbar -mx-5 mt-2 overflow-x-auto px-5">
              <div className="min-w-[620px]">
                <Journey d={d} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TodayPlan d={d} />
            <TodayTopic d={d} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ProblemsCard d={d} />
            <Recommended d={d} />
          </div>
        </div>

        {/* ---------------- right rail ---------------- */}
        <aside className="min-w-0 space-y-5">
          <div className="hidden justify-end xl:flex"><TopActions /></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-1">
            <CalendarCard d={d} i={2} />
            <StreakCard d={d} i={3} />
            <UpNext d={d} i={4} />
            <QuickResources i={5} />
          </div>
        </aside>
      </div>

      <div className="mt-5">
        <BottomStats d={d} />
      </div>
    </div>
  );
}
