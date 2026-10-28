"use client";

import Link from "next/link";
import { ClientCell, Stats, linkClass, managerName } from "@/components/admin/parts";
import { Badge, Card, PageHeader } from "@/components/ui";
import { daysFrom, fullName, money } from "@/lib/format";
import { useData } from "@/lib/mock";

/** A1 Overview: in one look, what needs the owner today and which accounts are at risk. */
export default function Overview() {
  const db = useData();
  const user = db.users.find((u) => u.id === db.session.userIds.owner);
  const count = (s: string) => db.clients.filter((c) => c.status === s).length;
  const paused = db.clients.filter((c) => c.status === "paused");
  const weeks = db.progress;
  const done = weeks.reduce((s, w) => s + w.posts.done + w.comments.done + w.connections.done, 0);
  const target = weeks.reduce((s, w) => s + w.posts.target + w.comments.target + w.connections.target, 0);

  const needs: { text: string; href: string; action: string }[] = [
    ...db.clients.filter((c) => !c.managerId && c.status !== "removed").map((c) => ({ text: `${fullName(db.users.find((u) => u.id === c.userId))} is waiting for a manager`, href: "/admin/clients?filter=unassigned", action: "Assign" })),
    ...db.managers.filter((m) => m.status === "waiting-for-training").map((m) => ({ text: `${managerName(db, m.id)} is waiting for training`, href: `/admin/managers/${m.id}`, action: "Open" })),
    ...db.cancellations.filter((x) => daysFrom(x.at) >= -2).map((x) => ({ text: `${fullName(db.users.find((u) => u.id === db.clients.find((c) => c.id === x.clientId)?.userId))} pulled out: ${x.reason.toLowerCase()}`, href: `/admin/clients/${x.clientId}`, action: "Follow up" })),
    ...db.refunds.filter((r) => r.status === "waiting").map((r) => ({ text: `Refund of ${money(r.amountCents)} needs your approval`, href: "/admin/money?tab=refunds", action: "Review" })),
    ...db.complaints.filter((c) => c.status !== "resolved").map((c) => ({ text: `Complaint from ${fullName(db.users.find((u) => u.id === db.clients.find((x) => x.id === c.clientId)?.userId))}: ${c.kind === "missed" ? "missed delivery" : c.kind}`, href: `/admin/complaints/${c.id}`, action: "Open" })),
    ...db.changeRequests.filter((r) => r.status === "open").map((r) => ({ text: `Manager change request from ${fullName(db.users.find((u) => u.id === db.clients.find((c) => c.id === r.clientId)?.userId))}`, href: "/admin/complaints", action: "Review" })),
    ...db.managers.filter((m) => m.stats.missed >= 3).map((m) => ({ text: `${managerName(db, m.id)} has missed ${m.stats.missed} due times this month`, href: `/admin/managers/${m.id}`, action: "Open" })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Good morning, ${user?.firstName ?? ""}`} description="What needs you today, and which accounts are at risk." />

      <Stats
        items={[
          { label: "Active clients", value: count("active") },
          { label: "In their free 2 weeks", value: count("free") },
          { label: "Paused", value: paused.length, note: paused.map((c) => `${-daysFrom(c.pausedAt ?? c.joinedAt)} days`).join(", ") || "None", tone: paused.length ? "warning" : undefined },
          { label: "Approved first time", value: "79%", note: "Posts, last 30 days" },
          { label: "Delivery this week", value: `${Math.round((done / Math.max(target, 1)) * 100)}%`, note: `${done} of ${target} against targets` },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Needs you today" action={<Badge status={needs.length ? "warning" : "success"}>{needs.length}</Badge>}>
          <ul className="flex flex-col">
            {needs.map((n) => (
              <li key={n.text} className="flex items-center justify-between gap-4 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-body-sm text-primary">{n.text}</span>
                <Link href={n.href} className={`${linkClass} shrink-0`}>
                  {n.action}
                </Link>
              </li>
            ))}
            {!needs.length && <li className="text-body-sm text-secondary">Nothing needs you right now.</li>}
          </ul>
        </Card>

        <Card title="At risk">
          <ul className="flex flex-col">
            {db.clients
              .filter((c) => c.atRisk)
              .map((c) => (
                <li key={c.id} className="flex flex-col gap-2 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <ClientCell db={db} clientId={c.id} sub={`Manager: ${managerName(db, c.managerId) || "none"}`} />
                  <span className="text-body-sm text-danger">{c.atRisk}</span>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
