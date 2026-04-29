"use client";

import type { ReactNode } from "react";
import { useScrollFade } from "@/hooks/use-scroll-fade";
import { cn } from "@/lib/utils";

interface TransactionTableScrollFadeProps {
  children: ReactNode;
  className?: string;
}

export function TransactionTableScrollFade({
  children,
  className,
}: TransactionTableScrollFadeProps) {
  const fade = useScrollFade("vertical", "[data-transaction-table-scroll]");

  return (
    <div ref={fade.containerRef} className={cn("relative min-h-0", className)}>
      <div
        data-transaction-table-scroll
        className="h-full min-h-0 overflow-auto"
      >
        {children}
      </div>
      <div
        ref={fade.startRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-5 bg-gradient-to-b from-card/90 to-transparent transition-opacity duration-200"
      />
      <div
        ref={fade.endRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-5 bg-gradient-to-t from-card/90 to-transparent transition-opacity duration-200"
      />
    </div>
  );
}
