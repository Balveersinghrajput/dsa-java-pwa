import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { videos } from "@/data/videos";
import VideoView from "@/components/resources/VideoView";

export function generateStaticParams() {
  return videos.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const v = videos.find((x) => x.id === id);
  return { title: v ? v.title : "Video" };
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!videos.some((v) => v.id === id)) notFound();
  return <VideoView id={id} />;
}
