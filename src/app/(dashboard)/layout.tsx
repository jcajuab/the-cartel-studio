import {
  Analytics01Icon,
  Archive02Icon,
  Book04Icon,
  Coins01Icon,
  Invoice01Icon,
  NoteIcon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

const navItems = [
  { label: "Metrics", href: "/metrics", icon: Analytics01Icon },
  { label: "POS", href: "/pos", icon: ShoppingCart01Icon },
  { label: "Transactions", href: "/transactions", icon: Invoice01Icon },
  { label: "Inventory", href: "/inventory", icon: Archive02Icon },
  { label: "Ledger", href: "/ledger", icon: Book04Icon },
  { label: "Journal", href: "/journal", icon: NoteIcon },
  { label: "Payroll", href: "/payroll", icon: Coins01Icon },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="w-56 shrink-0 border-r border-border min-h-[calc(100vh-3rem)]">
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map(({ label, href, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <HugeiconsIcon icon={icon} size={16} className="shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
