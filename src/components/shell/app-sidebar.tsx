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
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import RoleSwitcher from "@/components/shell/role-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Metrics", href: "/metrics", icon: Analytics01Icon },
  { label: "POS", href: "/pos", icon: ShoppingCart01Icon },
  { label: "Transactions", href: "/transactions", icon: Invoice01Icon },
  { label: "Inventory", href: "/inventory", icon: Archive02Icon },
  { label: "Ledger", href: "/ledger", icon: Book04Icon },
  { label: "Journal", href: "/journal", icon: NoteIcon },
  { label: "Payroll", href: "/payroll", icon: Coins01Icon },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Cart";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Image
            src="/logo.jpg"
            alt="The Cartel Studio"
            width={28}
            height={28}
            className="shrink-0 rounded-sm"
          />
          <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            {brandName}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="gap-1 px-2 py-1">
          {navItems.map(({ label, href, icon }) => {
            const active =
              href === "/metrics"
                ? pathname === "/metrics"
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={label}
                  render={
                    <Link href={href}>
                      <HugeiconsIcon icon={icon} />
                      <span>{label}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
          <RoleSwitcher />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
