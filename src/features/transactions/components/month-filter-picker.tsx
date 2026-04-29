"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthFilterPickerProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  index,
  label: new Intl.DateTimeFormat("en-PH", { month: "short" }).format(
    new Date(2026, index, 1),
  ),
}));

export function MonthFilterPicker({
  selectedDate,
  onSelect,
}: MonthFilterPickerProps) {
  const [year, setYear] = useState(selectedDate.getFullYear());
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();

  return (
    <div className="w-72 p-3">
      <div className="mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setYear((value) => value - 1)}
          aria-label="Previous year"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
        <p className="text-sm font-medium tabular-nums">{year}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setYear((value) => value + 1)}
          aria-label="Next year"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {MONTHS.map((month) => {
          const isSelected =
            year === selectedYear && month.index === selectedMonth;
          return (
            <Button
              key={month.index}
              type="button"
              variant={isSelected ? "default" : "ghost"}
              className={cn(
                "h-9 justify-center text-sm",
                !isSelected && "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => onSelect(new Date(year, month.index, 1))}
            >
              {month.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
