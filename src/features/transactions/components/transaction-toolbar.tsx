"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
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

interface TransactionToolbarProps {
  categories: Category[];
}

const ALL = "all";

export function TransactionToolbar({ categories }: TransactionToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") ?? ALL;
  const q = searchParams.get("q") ?? "";

  function replaceParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.replace(`/transactions?${params.toString()}`);
  }

  const categoryLabel =
    categoryId === ALL
      ? "All categories"
      : (categories.find((category) => category.id === categoryId)?.name ??
        "All categories");

  return (
    <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <label htmlFor="transaction-reference-search" className="sr-only">
          Search reference ID
        </label>
        <HugeiconsIcon
          icon={Search01Icon}
          size={14}
          className="-translate-y-1/2 absolute top-1/2 left-2 text-muted-foreground"
        />
        <Input
          id="transaction-reference-search"
          aria-label="Search reference ID"
          placeholder="Search Reference ID"
          value={q}
          onChange={(event) => replaceParam("q", event.target.value.trim())}
          className="pl-7"
        />
      </div>

      <Select
        value={categoryId}
        onValueChange={(value) => replaceParam("categoryId", value ?? "")}
      >
        <SelectTrigger className="w-full sm:w-[12rem]">
          <SelectValue>{categoryLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
