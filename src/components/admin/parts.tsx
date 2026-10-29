"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui";
import { fullName } from "@/lib/format";
import type { Complaint, Db, Manager } from "@/lib/mock";

/** A few clear numbers at the top of an owner page. */
export function Stats({
  items,
}: {
  items: {
    label: string;
    value: string | number;
    note?: string;
    tone?: "danger" | "warning" | "success";
  }[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {items.map((s) => (
        <li key={s.label} className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-caption text-secondary">{s.label}</span>
          <span
            className={`font-display ${typeof s.value === "string" && /[a-z]/i.test(s.value) && !/^\$/.test(s.value) ? "text-display-lg" : "text-display-2xl"} ${s.tone === "danger" ? "text-danger" : s.tone === "warning" ? "text-warning" : "text-primary"}`}
          >
            {s.value}
          </span>
          {s.note && <span className="text-caption text-secondary">{s.note}</span>}
        </li>
      ))}
    </ul>
  );
}

/** Tables scroll inside their card on small screens, never the page. */
export function Table({ head, label = "Table", children }: { head: string[]; label?: string; children: React.ReactNode }) {
  return (
    // Focusable so keyboard users can scroll a wide table sideways.
    <div role="region" aria-label={label} tabIndex={0} className="relative -mx-6 overflow-x-auto px-6 focus-visible:focus-ring">
      <table className="w-full min-w-xl text-left text-body-sm">
        <thead>
          <tr className="text-caption text-secondary">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2 font-medium first:pl-0 last:pr-0">
                {h || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const td = "border-t border-border px-3 py-3 align-middle first:pl-0 last:pr-0";

/** A client's name with avatar, linking to their page. */
export function ClientCell({ db, clientId, sub }: { db: Db; clientId: string; sub?: string }) {
  const c = db.clients.find((x) => x.id === clientId);
  const u = db.users.find((x) => x.id === c?.userId);
  return (
    <Link href={`/admin/clients/${clientId}`} className="flex items-center gap-3 rounded-sm hover:text-primary-700 focus-visible:focus-ring">
      <Avatar name={fullName(u)} size="sm" />
      <span className="flex flex-col">
        <span className="font-medium text-primary">{fullName(u)}</span>
        <span className="text-caption text-secondary">{sub ?? c?.company}</span>
      </span>
    </Link>
  );
}

export function managerName(db: Db, managerId: string | null | undefined) {
  const m = db.managers.find((x) => x.id === managerId);
  return fullName(db.users.find((u) => u.id === m?.userId));
}

export const clientName = (db: Db, clientId: string) => fullName(db.users.find((u) => u.id === db.clients.find((c) => c.id === clientId)?.userId));

export const linkClass = "rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring";

export const managerStatus: Record<Manager["status"], { label: string; tone: "success" | "info" | "warning" | "danger" }> = {
  invited: { label: "Invited", tone: "info" },
  "waiting-for-training": { label: "Waiting for training", tone: "warning" },
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspended", tone: "danger" },
};

export const complaintKind: Record<Complaint["kind"], string> = {
  missed: "Missed delivery",
  quality: "Quality",
  "not-allowed": "Action not allowed",
  billing: "Billing",
  manager: "Manager",
  other: "Other",
};
