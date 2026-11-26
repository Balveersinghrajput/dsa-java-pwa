"use client";

import { Users } from "lucide-react";
import { useAccount } from "@/hooks/useAccount";
import { NAV, type NavItem } from "./nav";

const ADMIN_ITEM: NavItem = { href: "/admin", label: "Friends (Admin)", short: "Admin", icon: Users };

/** Menu items for the signed-in user: the admin also gets the Friends page. */
export function useNavItems(): NavItem[] {
  const account = useAccount();
  return account?.role === "admin" ? [...NAV.slice(0, -2), ADMIN_ITEM, ...NAV.slice(-2)] : NAV;
}
