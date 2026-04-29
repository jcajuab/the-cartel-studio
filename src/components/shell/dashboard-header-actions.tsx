"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface DashboardHeaderActionsContextValue {
  actions: ReactNode | null;
  setActions: (actions: ReactNode | null) => void;
}

const DashboardHeaderActionsContext =
  createContext<DashboardHeaderActionsContextValue | null>(null);

export function DashboardHeaderActionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [actions, setActions] = useState<ReactNode | null>(null);
  const value = useMemo(() => ({ actions, setActions }), [actions]);

  return (
    <DashboardHeaderActionsContext.Provider value={value}>
      {children}
    </DashboardHeaderActionsContext.Provider>
  );
}

export function DashboardHeaderActions() {
  const ctx = useContext(DashboardHeaderActionsContext);

  if (!ctx?.actions) return null;

  return (
    <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
      {ctx.actions}
    </div>
  );
}

export function DashboardHeaderActionSlot({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = useContext(DashboardHeaderActionsContext);
  const setActions = ctx?.setActions;

  useEffect(() => {
    if (!setActions) return;
    setActions(children);
    return () => setActions(null);
  }, [setActions, children]);

  return null;
}
