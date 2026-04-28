"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { Button } from "@/components/ui/button";

type Role = "Bartender" | "Manager";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Bartender");
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRoleContext must be used within a RoleProvider");
  }
  return ctx;
}

export default function RoleSwitcher() {
  const { role, setRole } = useRoleContext();

  function toggle() {
    setRole(role === "Bartender" ? "Manager" : "Bartender");
  }

  return (
    <Button
      type="button"
      variant={role === "Manager" ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      aria-label={`Current role: ${role}. Click to switch.`}
    >
      {role}
    </Button>
  );
}
