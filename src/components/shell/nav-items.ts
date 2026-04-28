import {
  Analytics01Icon,
  Archive02Icon,
  Book04Icon,
  Coins01Icon,
  Invoice01Icon,
  NoteIcon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";

type IconRef = typeof Analytics01Icon;

export interface NavItem {
  label: string;
  href: string;
  icon: IconRef;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Metrics", href: "/metrics", icon: Analytics01Icon },
  { label: "POS", href: "/pos", icon: ShoppingCart01Icon },
  { label: "Transactions", href: "/transactions", icon: Invoice01Icon },
  { label: "Inventory", href: "/inventory", icon: Archive02Icon },
  { label: "Ledger", href: "/ledger", icon: Book04Icon },
  { label: "Journal", href: "/journal", icon: NoteIcon },
  { label: "Payroll", href: "/payroll", icon: Coins01Icon },
] as const;

export function getActiveItem(pathname: string): NavItem | null {
  for (const item of NAV_ITEMS) {
    if (item.href === "/metrics") {
      if (pathname === "/metrics") return item;
    } else if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item;
    }
  }
  return null;
}
