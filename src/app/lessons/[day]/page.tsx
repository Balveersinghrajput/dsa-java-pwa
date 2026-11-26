import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { plan } from "@/data/curriculum";
import LessonView from "@/components/lessons/LessonView";

// Built-in days are pre-rendered; days added by splitting or custom topics render on demand.
export function generateStaticParams() {
  return plan.map((d) => ({ day: String(d.day) }));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  return { title: `Day ${day}` };
}

export default async function LessonPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const n = Number(day);
  if (!Number.isInteger(n) || n < 1 || n > 2000) notFound();
  return (
    <Suspense>
      <LessonView day={n} />
    </Suspense>
  );
}
