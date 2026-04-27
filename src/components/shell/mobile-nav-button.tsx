"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { DashboardNav } from "./dashboard-nav";

export function MobileNavButton() {
  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open navigation menu"
      >
        <HugeiconsIcon icon={Menu01Icon} size={18} />
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0">
        <DashboardNav />
      </SheetContent>
    </Sheet>
  );
}
