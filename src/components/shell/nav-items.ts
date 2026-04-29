import {
  Archive02Icon,
  Book04Icon,
  Coins01Icon,
  DashboardSquare01Icon,
  Invoice01Icon,
  NoteIcon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";

type IconRef = typeof DashboardSquare01Icon;

export interface NavItem {
  label: string;
  href: string;
  icon: IconRef;
}

export interface NavGroup {
  label: string;
  items: readonly NavItem[];
}

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "POS", href: "/pos", icon: ShoppingCart01Icon },
      { label: "Transactions", href: "/transactions", icon: Invoice01Icon },
      { label: "Inventory", href: "/inventory", icon: Archive02Icon },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Ledger", href: "/ledger", icon: Book04Icon },
      { label: "Journal", href: "/journal", icon: NoteIcon },
      { label: "Payroll", href: "/payroll", icon: Coins01Icon },
    ],
  },
] as const;

export const NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap(
  (group) => group.items,
);

export function getActiveItem(pathname: string): NavItem | null {
  for (const item of NAV_ITEMS) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item;
    }
  }
  return null;
}
