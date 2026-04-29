"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";
import { Input } from "@/components/ui/input";

export function InventoryToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  function replaceSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const nextValue = value.trim();

    if (nextValue) {
      params.set("q", nextValue);
    } else {
      params.delete("q");
    }
    params.delete("page");

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/inventory?${query}` : "/inventory");
    });
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <label htmlFor="inventory-search" className="sr-only">
          Search product or SKU
        </label>
        <HugeiconsIcon
          icon={Search01Icon}
          size={14}
          className="-translate-y-1/2 absolute top-1/2 left-2 text-muted-foreground"
        />
        <Input
          id="inventory-search"
          aria-label="Search product or SKU"
          placeholder="Search product or SKU"
          value={q}
          onChange={(event) => replaceSearch(event.target.value)}
          className="pl-7"
        />
      </div>
    </div>
  );
}
