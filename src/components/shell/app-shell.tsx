import { cookies } from "next/headers";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { RoleProvider } from "@/components/shell/role-switcher";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <RoleProvider>
      <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </RoleProvider>
  );
}
