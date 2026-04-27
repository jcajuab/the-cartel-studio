"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollFadeState {
  start: boolean;
  end: boolean;
}

export function useScrollFade<T extends HTMLElement = HTMLDivElement>(
  orientation: "horizontal" | "vertical" = "vertical",
  viewportSelector?: string,
) {
  const ref = useRef<T | null>(null);
  const [state, setState] = useState<ScrollFadeState>({
    start: false,
    end: false,
  });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const target =
      (viewportSelector
        ? (root.querySelector(viewportSelector) as HTMLElement | null)
        : root) ?? root;

    const update = () => {
      const isVertical = orientation === "vertical";
      const scroll = isVertical ? target.scrollTop : target.scrollLeft;
      const visible = isVertical ? target.clientHeight : target.clientWidth;
      const total = isVertical ? target.scrollHeight : target.scrollWidth;
      const overflows = total - visible > 1;
      setState({
        start: overflows && scroll > 1,
        end: overflows && scroll + visible < total - 1,
      });
    };

    update();
    target.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(target);
    const child = target.firstElementChild;
    if (child) ro.observe(child);

    return () => {
      target.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [orientation, viewportSelector]);

  return { ref, start: state.start, end: state.end };
}
