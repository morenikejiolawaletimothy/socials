"use client";

import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { Avatar, textActionClass } from "@/components/ui";
import { fullName } from "@/lib/format";
import type { Complaint, Db, Manager } from "@/lib/mock";

/**
 * A few clear numbers at the top of an owner page: one bordered card split into even cells by hairlines
 * (2 across on phones, all in one row on desktop). Each cell: the icon on the left and the number, big, on the right;
 * under them the label, with any note joined on in the same text ("Paused · 12 days").
 * A warning or danger stat tints its icon square and number.
 */
export function Stats({
  items,
}: {
  items: {
    label: string;
    value: string | number;
    note?: string;
    tone?: "danger" | "warning" | "success";
    /** Phosphor icon shown in a tinted square at the top left of the cell. */
    icon?: Icon;
  }[];
}) {
  const cols = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" }[items.length] ?? "lg:grid-cols-4";
  const tones = {
    danger: { text: "text-danger", tile: "bg-danger-bg text-danger" },
    warning: { text: "text-warning", tile: "bg-warning-bg text-warning" },
    success: { text: "text-success", tile: "bg-success-bg text-success" },
    none: { text: "text-primary", tile: "bg-primary-50 text-primary-700" },
  };
  return (
    // The 1px gap over a border-coloured backing draws the lines between cells; an odd last cell spans the row on phones.
    <ul className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border ${cols}`}>
      {items.map((s) => {
        const t = tones[s.tone ?? "none"];
        const words = typeof s.value === "string" && /[a-z]/i.test(s.value) && !/^\$/.test(s.value);
        return (
          <li key={s.label} className="flex flex-col gap-4 bg-card p-6 odd:last:col-span-2 lg:odd:last:col-span-1">
            <span className="flex items-start justify-between gap-3">
              {s.icon && (
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${t.tile}`}>
                  <s.icon className="size-5" aria-hidden />
                </span>
              )}
              <span className={`ml-auto min-w-0 text-right font-display ${words ? "text-display-lg" : "text-display-3xl"} ${t.text}`}>{s.value}</span>
            </span>
            <span className="text-body-sm text-secondary">
              {s.label}
              {s.note && ` · ${s.note}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** A small number card (as on the Overview): icon left, number right, label (and any note) under it in one line. */
export function StatTile({ icon: I, label, value, note, tone }: { icon: Icon; label: string; value: string | number; note?: string; tone?: "warning" | "danger" }) {
  const tile = tone === "danger" ? "bg-danger-bg text-danger" : tone === "warning" ? "bg-warning-bg text-warning" : "bg-primary-50 text-primary-700";
  const text = tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-lg border border-border bg-card p-6">
      <span className="flex items-start justify-between gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${tile}`}>
          <I className="size-5" aria-hidden />
        </span>
        <span className={`font-display text-display-3xl ${text}`}>{value}</span>
      </span>
      <span className="text-body-sm text-secondary">
        {label}
        {note && ` · ${note}`}
      </span>
    </div>
  );
}

/** Tables scroll inside their card on small screens, never the page. `flush` fills a `padding="none"` card edge to edge. */
export function Table({ head, label = "Table", flush = false, children }: { head: string[]; label?: string; flush?: boolean; children: React.ReactNode }) {
  return (
    // Focusable so keyboard users can scroll a wide table sideways.
    // A bordered group, like Rows: the same frame as every compact list in the product (no frame when flush).
    <div role="region" aria-label={label} tabIndex={0} className={`relative overflow-x-auto focus-visible:focus-ring ${flush ? "" : "rounded-md border border-border"}`}>
      <table className="w-full min-w-xl text-left text-body-sm">
        <thead>
          <tr className="bg-neutral-25 text-body-sm text-secondary">
            {head.map((h) => (
              <th key={h} className={`whitespace-nowrap py-3 font-medium ${flush ? "px-6" : "px-4"}`}>
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

export const td = "border-t border-border px-4 py-3 align-middle";
/** Cell style for a `flush` table: the same 24px sides as the card. */
export const tdFlush = "border-t border-border px-6 py-4 align-middle";

/** A client's name with avatar, linking to their page. */
export function ClientCell({ db, clientId, sub }: { db: Db; clientId: string; sub?: string }) {
  const c = db.clients.find((x) => x.id === clientId);
  const u = db.users.find((x) => x.id === c?.userId);
  return (
    <Link href={`/admin/clients/${clientId}`} className="flex items-center gap-3 rounded-sm hover:text-primary-700 focus-visible:focus-ring">
      <Avatar name={fullName(u)} src={u?.photo} size="md" />
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

/** The one blue text-action style, shared with the client and manager views. */
export const linkClass = textActionClass;

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
