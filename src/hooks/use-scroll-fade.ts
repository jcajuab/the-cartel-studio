"use client";

import { useEffect, useRef } from "react";

type Orientation = "horizontal" | "vertical";

/**
 * Hook that fades in/out two overlay elements (start and end) when a scrollable
 * container has hidden content in that direction. Uses direct DOM mutation so
 * scroll events don't trigger React re-renders. Updates are throttled to one per
 * animation frame.
 *
 * Returns three refs to attach to the structural elements:
 *   - containerRef → relative-positioned wrapper around the ScrollArea
 *   - startRef     → fade overlay at the start edge (top or left)
 *   - endRef       → fade overlay at the end edge (bottom or right)
 *
 * If `viewportSelector` is given, the hook queries inside the container for the
 * actual scrolling element (e.g. base-ui ScrollArea's data-slot viewport).
 */
export function useScrollFade(
  orientation: Orientation = "vertical",
  viewportSelector?: string,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const target =
      (viewportSelector
        ? (root.querySelector(viewportSelector) as HTMLElement | null)
        : root) ?? root;

    let scheduled = false;
    let lastStart = false;
    let lastEnd = false;

    const apply = () => {
      scheduled = false;
      const isVertical = orientation === "vertical";
      const scroll = isVertical ? target.scrollTop : target.scrollLeft;
      const visible = isVertical ? target.clientHeight : target.clientWidth;
      const total = isVertical ? target.scrollHeight : target.scrollWidth;
      const overflows = total - visible > 1;
      const showStart = overflows && scroll > 1;
      const showEnd = overflows && scroll + visible < total - 1;

      if (showStart !== lastStart) {
        lastStart = showStart;
        if (startRef.current) {
          startRef.current.style.opacity = showStart ? "1" : "0";
        }
      }
      if (showEnd !== lastEnd) {
        lastEnd = showEnd;
        if (endRef.current) {
          endRef.current.style.opacity = showEnd ? "1" : "0";
        }
      }
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(apply);
    };

    apply();
    target.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(target);
    const child = target.firstElementChild;
    if (child) ro.observe(child);

    return () => {
      target.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [orientation, viewportSelector]);

  return { containerRef, startRef, endRef };
}
