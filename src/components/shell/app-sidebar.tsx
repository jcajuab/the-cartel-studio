"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getActiveItem, NAV_GROUPS } from "@/components/shell/nav-items";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const activeHref = getActiveItem(pathname)?.href;
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Cart";

  return (
    <Sidebar collapsible="icon" variant="inset">
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
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map(({ label, href, icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={activeHref === href}
                      tooltip={label}
                      render={
                        <Link href={href}>
                          <HugeiconsIcon icon={icon} />
                          <span>{label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
