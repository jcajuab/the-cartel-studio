"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface TransactionFiltersProps {
  categories: Category[];
}

const ALL = "all";
const STATUS_LABELS: Record<string, string> = {
  all: "All",
  COMPLETED: "Completed",
  VOIDED: "Voided",
};

export default function TransactionFilters({
  categories,
}: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function push(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`);
  }

  const status = searchParams.get("status") ?? ALL;
  const categoryId = searchParams.get("categoryId") ?? ALL;
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const categoryLabel =
    categoryId === ALL
      ? "All"
      : (categories.find((c) => c.id === categoryId)?.name ?? "All");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-status"
          className="text-xs text-muted-foreground"
        >
          Status
        </label>
        <Select
          value={status}
          onValueChange={(v) => push("status", !v || v === ALL ? "" : v)}
        >
          <SelectTrigger id="filter-status" className="w-[140px]">
            <SelectValue placeholder="All">
              {STATUS_LABELS[status] ?? "All"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="VOIDED">Voided</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-category"
          className="text-xs text-muted-foreground"
        >
          Category
        </label>
        <Select
          value={categoryId}
          onValueChange={(v) => push("categoryId", !v || v === ALL ? "" : v)}
        >
          <SelectTrigger id="filter-category" className="w-[160px]">
            <SelectValue placeholder="All">{categoryLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-date-from"
          className="text-xs text-muted-foreground"
        >
          Date from
        </label>
        <Input
          id="filter-date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => push("dateFrom", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-date-to"
          className="text-xs text-muted-foreground"
        >
          Date to
        </label>
        <Input
          id="filter-date-to"
          type="date"
          value={dateTo}
          onChange={(e) => push("dateTo", e.target.value)}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => router.replace("?")}
      >
        Reset
      </Button>
    </div>
  );
}
