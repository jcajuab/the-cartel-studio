import { DashboardBreadcrumb } from "@/components/shell/dashboard-breadcrumb";
import {
  DashboardHeaderActions,
  DashboardHeaderActionsProvider,
} from "@/components/shell/dashboard-header-actions";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardHeaderActionsProvider>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2" />
        <DashboardBreadcrumb />
        <DashboardHeaderActions />
      </header>
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </DashboardHeaderActionsProvider>
  );
}
