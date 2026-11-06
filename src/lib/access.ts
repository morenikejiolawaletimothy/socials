import type { AdminAccess, AdminArea, AdminRole } from "@/lib/mock";

/** #49: the admin areas access is scoped to, in menu order. */
export const ADMIN_AREAS: { key: AdminArea; label: string }[] = [
  { key: "clients", label: "Clients" },
  { key: "managers", label: "Managers" },
  { key: "framework", label: "Framework" },
  { key: "services", label: "Services" },
  { key: "money", label: "Money" },
  { key: "complaints", label: "Complaints" },
  { key: "settings", label: "Settings" },
  { key: "audit", label: "Audit log" },
  { key: "roles", label: "Roles & team" },
];

export const accessLabel: Record<AdminAccess, string> = { none: "No access", view: "View", manage: "Manage" };

const RANK: Record<AdminAccess, number> = { none: 0, view: 1, manage: 2 };

/** A role with no access anywhere, as a starting point for a new role. */
export function emptyAccess(): Record<AdminArea, AdminAccess> {
  return Object.fromEntries(ADMIN_AREAS.map((a) => [a.key, "none" as AdminAccess])) as Record<AdminArea, AdminAccess>;
}

/** The most permissive access across an admin's roles (manage > view > none). */
export function effectiveAccess(roles: AdminRole[]): Record<AdminArea, AdminAccess> {
  const out = emptyAccess();
  for (const r of roles) for (const a of ADMIN_AREAS) if (RANK[r.access[a.key] ?? "none"] > RANK[out[a.key]]) out[a.key] = r.access[a.key];
  return out;
}

/** Can an admin with these roles do `need` (view or manage) in `area`? */
export function can(roles: AdminRole[], area: AdminArea, need: Exclude<AdminAccess, "none"> = "view"): boolean {
  return RANK[effectiveAccess(roles)[area]] >= RANK[need];
}
