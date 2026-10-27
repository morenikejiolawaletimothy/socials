"use client";

import { update, useDb } from "./store";
import type { Role } from "./types";

export function useSession() {
  const session = useDb((db) => db.session);
  const user = useDb((db) => db.users.find((u) => u.id === db.session.userIds[db.session.role]));
  return { role: session.role, user };
}

export function setDemoRole(role: Role) {
  update((db) => ({ ...db, session: { ...db.session, role } }));
}
