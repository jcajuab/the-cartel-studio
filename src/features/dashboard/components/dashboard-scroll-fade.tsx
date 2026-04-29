"use client";

import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollFade } from "@/hooks/use-scroll-fade";
import { cn } from "@/lib/utils";

interface DashboardScrollFadeProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardScrollFade({
  children,
  className,
  contentClassName,
}: DashboardScrollFadeProps) {
  const fade = useScrollFade("vertical", '[data-slot="scroll-area-viewport"]');

  return (
    <div ref={fade.containerRef} className={cn("relative min-h-0", className)}>
      <ScrollArea className="h-full rounded-xl">
        <div className={contentClassName}>{children}</div>
      </ScrollArea>
      <div
        ref={fade.startRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-card/80 to-transparent transition-opacity duration-200"
      />
      <div
        ref={fade.endRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-card/80 to-transparent transition-opacity duration-200"
      />
    </div>
  );
}
