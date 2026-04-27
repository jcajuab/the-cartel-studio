import Image from "next/image";
import RoleSwitcher, { RoleProvider } from "@/components/shell/role-switcher";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Cart";

  return (
    <RoleProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 h-12 w-full border-b border-border bg-background">
          <div className="flex h-full items-center gap-3 px-4">
            <Image
              src="/logo.jpg"
              alt="The Cartel Studio"
              width={32}
              height={32}
              className="rounded-sm"
            />
            <span className="text-sm font-semibold tracking-tight">
              {brandName}
            </span>
            <nav className="flex-1" aria-label="Main navigation">
              {/* Navigation links will be added in US-009/US-011 */}
            </nav>
            <RoleSwitcher />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </RoleProvider>
  );
}
