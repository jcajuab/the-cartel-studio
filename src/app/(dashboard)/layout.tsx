import { DashboardNav } from "@/components/shell/dashboard-nav";
import { MobileNavButton } from "@/components/shell/mobile-nav-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="hidden md:block w-56 shrink-0 border-r border-border min-h-[calc(100vh-3rem)]">
        <DashboardNav />
      </aside>
      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center px-4 py-2 border-b border-border">
          <MobileNavButton />
        </div>
        {children}
      </div>
    </div>
  );
}
