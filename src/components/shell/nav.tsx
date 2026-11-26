import {
  BadgeCheck,
  BookOpenText,
  Bookmark,
  Boxes,
  ChartNoAxesColumn,
  House,
  Library,
  Network,
  NotebookPen,
  FileCode2,
  Printer,
  Settings,
  CircleUserRound,
  type LucideIcon,
} from "lucide-react";
import type { SVGProps } from "react";

/** LeetCode-style mark (simple geometric glyph, not the trademarked logo). */
export function LeetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 3 7 10.5a2.1 2.1 0 0 0 0 3L14.5 21" />
      <path d="M10 12h10" />
      <path d="M17.5 8.5 14.5 5.5" />
      <path d="M17.5 15.5l-3 3" />
    </svg>
  );
}

export function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="1.5" y="5" width="21" height="14" rx="4" fill="#ff0033" />
      <path d="M10 9v6l5.2-3z" fill="#fff" />
    </svg>
  );
}

export interface NavItem {
  href: string;
  label: string;
  short?: string;
  icon: LucideIcon | typeof LeetIcon;
}

export const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", short: "Home", icon: House },
  { href: "/roadmap", label: "Roadmap", icon: Network },
  { href: "/lessons", label: "All Lessons", short: "Lessons", icon: BookOpenText },
  { href: "/problems", label: "LeetCode Problems", short: "Problems", icon: LeetIcon },
  { href: "/practice", label: "Practice Arena", short: "Practice", icon: Boxes },
  { href: "/saved", label: "Saved Problems", short: "Saved", icon: FileCode2 },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumn },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/revision", label: "Revision Sheets", short: "Revision", icon: Printer },
  { href: "/mock-tests", label: "Mock Tests", icon: BadgeCheck },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/profile", label: "Profile", icon: CircleUserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Bottom navigation on phones/tablets (everything else is in the side menu). */
export const MOBILE_NAV = ["/", "/lessons", "/problems", "/practice", "/progress"];

export const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
