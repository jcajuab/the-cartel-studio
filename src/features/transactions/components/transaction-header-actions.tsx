"use client";

import { Calendar03Icon, Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DashboardHeaderActionSlot } from "@/components/shell/dashboard-header-actions";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MonthFilterPicker } from "@/features/transactions/components/month-filter-picker";
import { cn } from "@/lib/utils";

interface TransactionHeaderActionsProps {
  defaultMonth: string;
}

export function TransactionHeaderActions({
  defaultMonth,
}: TransactionHeaderActionsProps) {
  return (
    <DashboardHeaderActionSlot>
      <TransactionHeaderControls defaultMonth={defaultMonth} />
    </DashboardHeaderActionSlot>
  );
}

function TransactionHeaderControls({
  defaultMonth,
}: TransactionHeaderActionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? defaultMonth;
  const [open, setOpen] = useState(false);

  function setMonth(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== defaultMonth) {
      params.set("month", value);
    } else {
      params.delete("month");
    }
    params.delete("transactionId");
    params.delete("page");
    router.replace(`/transactions?${params.toString()}`);
  }

  function setMonthFromDate(date?: Date) {
    if (!date) return;
    setMonth(formatMonthKey(date));
    setOpen(false);
  }

  const selectedDate = dateFromMonthKey(month);
  const exportParams = new URLSearchParams(searchParams.toString());
  exportParams.set("month", month);
  exportParams.delete("transactionId");

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
        <span>Filter by month</span>
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label="Filter transactions by month"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-[9.25rem] justify-start",
          )}
        >
          <HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" />
          <span>{formatMonthLabel(selectedDate)}</span>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-auto p-0">
          <MonthFilterPicker
            key={month}
            selectedDate={selectedDate}
            onSelect={setMonthFromDate}
          />
        </PopoverContent>
      </Popover>
      <a
        href={`/api/transactions/export?${exportParams.toString()}`}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
      >
        <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" />
        <span className="hidden sm:inline">Download CSV</span>
        <span className="sm:hidden">CSV</span>
      </a>
    </div>
  );
}

function dateFromMonthKey(month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) return new Date();

  const [year = "", monthNumber = ""] = month.split("-");
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    year: "numeric",
  }).format(date);
}
