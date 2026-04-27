"use client";

import { useRoleContext } from "@/components/shell/role-switcher";

export function useRole() {
  return useRoleContext();
}
