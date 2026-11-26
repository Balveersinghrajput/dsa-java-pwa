import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { guides } from "@/data/articles";
import ArticleView from "@/components/resources/ArticleView";

export function generateStaticParams() {
  return guides.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const g = guides.find((x) => x.id === id);
  return { title: g ? `${g.title} — guide` : "Article" };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!guides.some((g) => g.id === id)) notFound();
  return <ArticleView id={id} />;
}
