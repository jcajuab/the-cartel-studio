"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  className?: string;
}

export function TransactionPrintButton({ children, className }: Props) {
  return (
    <Button type="button" className={className} onClick={() => window.print()}>
      {children}
    </Button>
  );
}
