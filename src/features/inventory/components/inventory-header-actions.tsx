"use client";

import { Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSearchParams } from "next/navigation";
import { DashboardHeaderActionSlot } from "@/components/shell/dashboard-header-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InventoryHeaderActions() {
  return (
    <DashboardHeaderActionSlot>
      <InventoryHeaderControls />
    </DashboardHeaderActionSlot>
  );
}

function InventoryHeaderControls() {
  const searchParams = useSearchParams();
  const exportParams = new URLSearchParams(searchParams.toString());
  exportParams.delete("page");

  const exportQuery = exportParams.toString();
  const exportHref = exportQuery
    ? `/api/inventory/export?${exportQuery}`
    : "/api/inventory/export";

  return (
    <a
      href={exportHref}
      className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
    >
      <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" />
      <span className="hidden sm:inline">Download CSV</span>
      <span className="sm:hidden">CSV</span>
    </a>
  );
}
