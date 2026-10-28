"use client";

import { useEffect } from "react";
import { setDemoRole, useData, type Role } from "@/lib/mock";

/**
 * Opening a page of another role (for example from a shared link) switches the demo view to that role.
 * The owner covering for a manager stays the owner while working in the manager's workspace (A2).
 */
export function useRoleSync(role: Role) {
  const { session } = useData();
  const covering = role === "manager" && session.role === "owner" && Boolean(session.coveringManagerId);
  useEffect(() => {
    if (session.role !== role && !covering) setDemoRole(role);
  }, [session.role, role, covering]);
}
