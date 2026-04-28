"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  Fragment,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

import { getActiveItem } from "@/components/shell/nav-items";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useIsMobile } from "@/hooks/use-mobile";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDynamicSegment(value: string): string {
  if (UUID_RE.test(value)) return `#${value.slice(0, 8).toUpperCase()}`;
  return value;
}

interface BreadcrumbBadgeContextValue {
  badge: ReactNode | null;
  setBadge: (b: ReactNode | null) => void;
}

const BreadcrumbBadgeContext =
  createContext<BreadcrumbBadgeContextValue | null>(null);

export function BreadcrumbBadgeProvider({ children }: { children: ReactNode }) {
  const [badge, setBadge] = useState<ReactNode | null>(null);
  const value = useMemo(() => ({ badge, setBadge }), [badge]);
  return (
    <BreadcrumbBadgeContext.Provider value={value}>
      {children}
    </BreadcrumbBadgeContext.Provider>
  );
}

export function useBreadcrumbBadge() {
  return useContext(BreadcrumbBadgeContext);
}

interface Segment {
  label: string;
  href: string | null;
}

function buildSegments(pathname: string): Segment[] {
  const active = getActiveItem(pathname);
  if (!active) return [];

  if (pathname === active.href) {
    return [{ label: active.label, href: null }];
  }

  const tail = pathname.slice(active.href.length).split("/").filter(Boolean);
  const segments: Segment[] = [{ label: active.label, href: active.href }];
  let acc = active.href;
  for (let i = 0; i < tail.length; i++) {
    const part = tail[i] ?? "";
    acc = `${acc}/${part}`;
    const isLast = i === tail.length - 1;
    segments.push({
      label: formatDynamicSegment(part),
      href: isLast ? null : acc,
    });
  }
  return segments;
}

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const ctx = useContext(BreadcrumbBadgeContext);
  const badge = ctx?.badge ?? null;

  const segments = buildSegments(pathname);
  if (segments.length === 0) return null;

  const displayed: (Segment | "ellipsis")[] =
    isMobile && segments.length > 2
      ? [
          segments[0] as Segment,
          "ellipsis",
          segments[segments.length - 1] as Segment,
        ]
      : segments;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {displayed.map((seg, i) => {
          const isLast = i === displayed.length - 1;
          if (seg === "ellipsis") {
            return (
              <Fragment key="ellipsis">
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          }
          const key = seg.href ?? `leaf:${seg.label}`;
          return (
            <Fragment key={key}>
              <BreadcrumbItem>
                {seg.href ? (
                  <BreadcrumbLink
                    render={<Link href={seg.href}>{seg.label}</Link>}
                  />
                ) : (
                  <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                )}
                {isLast && badge ? (
                  <span className="ml-2 inline-flex items-center">{badge}</span>
                ) : null}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
