import type { ReactNode } from "react";
import { BookOpen, FileCode2, Repeat } from "lucide-react";
import type { TaskId } from "@/types";
import { LeetIcon } from "@/components/shell/nav";

/** The four daily activities (minutes come from the user's schedule). */
export const TASKS: { id: TaskId; title: string; icon: ReactNode; tone: string }[] = [
  { id: "learn", title: "Learn New Topic", icon: <BookOpen className="h-[18px] w-[18px]" />, tone: "bg-primary-soft text-primary" },
  { id: "implement", title: "Java Implementation", icon: <FileCode2 className="h-[18px] w-[18px]" />, tone: "bg-[#e0f2fe] text-[#0284c7] dark:bg-[#0c2a3d] dark:text-[#7dd3fc]" },
  { id: "practice", title: "LeetCode Practice", icon: <LeetIcon className="h-[18px] w-[18px]" />, tone: "bg-[#111827] text-[#fbbf24] dark:bg-[#fbbf24] dark:text-[#111827]" },
  { id: "revise", title: "Revise Yesterday", icon: <Repeat className="h-[18px] w-[18px]" />, tone: "bg-amber-soft text-amber" },
];

