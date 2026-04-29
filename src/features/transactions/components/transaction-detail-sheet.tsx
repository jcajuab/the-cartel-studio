"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface TransactionDetailSheetProps {
  children: ReactNode;
  closeHref: string;
  open: boolean;
}

export function TransactionDetailSheet({
  children,
  closeHref,
  open,
}: TransactionDetailSheetProps) {
  const router = useRouter();

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) router.replace(closeHref, { scroll: false });
      }}
    >
      <SheetContent className="h-dvh p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md data-[side=right]:md:max-w-lg">
        <SheetHeader className="shrink-0 border-b border-border/60 px-5 py-4 pr-14">
          <SheetTitle>Transaction Details</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
