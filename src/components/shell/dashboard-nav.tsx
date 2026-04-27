"use client";

import {
  Analytics01Icon,
  Archive02Icon,
  Book04Icon,
  Coins01Icon,
  Invoice01Icon,
  NoteIcon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const navItems = [
  { label: "Metrics", href: "/metrics", icon: Analytics01Icon },
  { label: "POS", href: "/pos", icon: ShoppingCart01Icon },
  { label: "Transactions", href: "/transactions", icon: Invoice01Icon },
  { label: "Inventory", href: "/inventory", icon: Archive02Icon },
  { label: "Ledger", href: "/ledger", icon: Book04Icon },
  { label: "Journal", href: "/journal", icon: NoteIcon },
  { label: "Payroll", href: "/payroll", icon: Coins01Icon },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ label, href, icon }) => {
        const active =
          href === "/metrics"
            ? pathname === "/metrics"
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors border-l-2",
              active
                ? "border-l-[#F5F5F4] text-foreground bg-accent/40"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <HugeiconsIcon icon={icon} size={16} className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
