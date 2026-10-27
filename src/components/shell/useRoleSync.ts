"use client";

import { useEffect } from "react";
import { setDemoRole, useSession, type Role } from "@/lib/mock";

/** Opening a page of another role (for example from a shared link) switches the demo view to that role. */
export function useRoleSync(role: Role) {
  const { role: current } = useSession();
  useEffect(() => {
    if (current !== role) setDemoRole(role);
  }, [current, role]);
}
