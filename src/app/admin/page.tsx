"use client";

import { ClientCell, Stats, managerName } from "@/components/admin/parts";
import { Banner, Card, PageHeader, Pill, Tile, TileAction, TileFooter } from "@/components/ui";
import { AccessAlertsCard } from "@/components/admin/AccessAlertsCard";
import { daysFrom, fullName, money, plural } from "@/lib/format";
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

      <AccessAlertsCard />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Needs you today" action={<Pill>{plural(needs.length, "thing")}</Pill>}>
          {needs.length ? (
            <ul className="flex flex-col gap-3">
              {needs.map((n) => (
                <li key={n.text}>
                  <Tile href={n.href}>
                    <span className="text-body font-medium text-primary">{n.text}</span>
                    <TileFooter>
                      <span />
                      <TileAction>{n.action}</TileAction>
                    </TileFooter>
                  </Tile>
                </li>
              ))}
            </ul>
          ) : (
            <Banner tone="success">Nothing needs you right now.</Banner>
          )}
        </Card>

        <Card title="At risk" action={<Pill>{plural(db.clients.filter((c) => c.atRisk).length, "client")}</Pill>}>
          <ul className="flex flex-col gap-3">
            {db.clients
              .filter((c) => c.atRisk)
              .map((c) => (
                <li key={c.id}>
                  <Tile>
                    <ClientCell db={db} clientId={c.id} sub={`Manager: ${managerName(db, c.managerId) || "none"}`} />
                    <Banner tone="warning">{c.atRisk}</Banner>
                  </Tile>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
