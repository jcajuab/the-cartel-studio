"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface TransactionFiltersProps {
  categories: Category[];
}

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

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-status"
          className="text-xs text-muted-foreground"
        >
          Status
        </label>
        <select
          id="filter-status"
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => push("status", e.target.value)}
        >
          <option value="">All</option>
          <option value="COMPLETED">Completed</option>
          <option value="VOIDED">Voided</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-category"
          className="text-xs text-muted-foreground"
        >
          Category
        </label>
        <select
          id="filter-category"
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          defaultValue={searchParams.get("categoryId") ?? ""}
          onChange={(e) => push("categoryId", e.target.value)}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="filter-date-from"
          className="text-xs text-muted-foreground"
        >
          Date from
        </label>
        <input
          id="filter-date-from"
          type="date"
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          defaultValue={searchParams.get("dateFrom") ?? ""}
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
        <input
          id="filter-date-to"
          type="date"
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          defaultValue={searchParams.get("dateTo") ?? ""}
          onChange={(e) => push("dateTo", e.target.value)}
        />
      </div>

      <button
        type="button"
        className="h-9 rounded-md border border-input bg-background px-4 text-sm shadow-sm hover:bg-accent hover:text-accent-foreground"
        onClick={() => router.replace("?")}
      >
        Reset
      </button>
    </div>
  );
}
