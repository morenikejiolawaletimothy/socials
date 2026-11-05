"use client";

import type { Icon } from "@phosphor-icons/react";
import { ArrowCounterClockwise, ChatCircleText, CheckCircle, CurrencyCircleDollar, Gift, GraduationCap, PauseCircle, SignOut, UserPlus, Users, UserSwitch, WarningCircle } from "@phosphor-icons/react";
import { StatTile, managerName } from "@/components/admin/parts";
import { Avatar, Badge, Banner, Card, PageHeader, Pill, ProgressBar, Row, Rows, Tabs, TextLink } from "@/components/ui";
import { AccessAlertsCard } from "@/components/admin/AccessAlertsCard";
import { daysFrom, fullName, money, plural } from "@/lib/format";
import { useData } from "@/lib/mock";
import { useState } from "react";

type Section = "needs" | "risk" | "alerts" | "money";


/**
 * A1 Overview, as a dashboard: one hero card (delivery this week) with four small number cards beside it,
 * then the rest as tabs (needs you, at risk, access alerts, money), one card at a time. Flat white cards; colour only for status.
 */
export default function Overview() {
  const db = useData();
  const user = db.users.find((u) => u.id === db.session.userIds.owner);
  const count = (s: string) => db.clients.filter((c) => c.status === s).length;
  const paused = db.clients.filter((c) => c.status === "paused");
  const weeks = db.progress;
  const sum = (k: "posts" | "comments" | "connections") => ({ done: weeks.reduce((s, w) => s + w[k].done, 0), target: weeks.reduce((s, w) => s + w[k].target, 0) });
  const parts = [
    { label: "Posts", ...sum("posts") },
    { label: "Comments", ...sum("comments") },
    { label: "Connection requests", ...sum("connections") },
  ];
  const done = parts.reduce((s, p) => s + p.done, 0);
  const target = parts.reduce((s, p) => s + p.target, 0);
  const pct = Math.round((done / Math.max(target, 1)) * 100);
  const atRisk = db.clients.filter((c) => c.atRisk);
  const hasAlerts = (db.accessAlerts ?? []).filter((a) => !a.resolved).length;
  const paid = db.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amountCents, 0);
  const refundsWaiting = db.refunds.filter((r) => r.status === "waiting").length;
  const failed = db.invoices.filter((i) => i.status === "failed").length;
  const clientName = (clientId: string) => fullName(db.users.find((u) => u.id === db.clients.find((c) => c.id === clientId)?.userId));

  const needs: { text: string; href: string; action: string; icon: Icon }[] = [
    ...db.clients.filter((c) => !c.managerId && c.status !== "removed").map((c) => ({ text: `${fullName(db.users.find((u) => u.id === c.userId))} is waiting for a manager`, href: "/admin/clients?filter=unassigned", action: "Assign", icon: UserPlus })),
    ...db.managers.filter((m) => m.status === "waiting-for-training").map((m) => ({ text: `${managerName(db, m.id)} is waiting for training`, href: `/admin/managers/${m.id}`, action: "Open", icon: GraduationCap })),
    ...db.cancellations.filter((x) => daysFrom(x.at) >= -2).map((x) => ({ text: `${clientName(x.clientId)} pulled out: ${x.reason.toLowerCase()}`, href: `/admin/clients/${x.clientId}`, action: "Follow up", icon: SignOut })),
    ...db.refunds.filter((r) => r.status === "waiting").map((r) => ({ text: `Refund of ${money(r.amountCents)} needs your approval`, href: "/admin/money?tab=refunds", action: "Review", icon: ArrowCounterClockwise })),
    ...db.complaints.filter((c) => c.status !== "resolved").map((c) => ({ text: `Complaint from ${clientName(c.clientId)}: ${c.kind === "missed" ? "missed delivery" : c.kind}`, href: `/admin/complaints/${c.id}`, action: "Open", icon: ChatCircleText })),
    ...db.changeRequests.filter((r) => r.status === "open").map((r) => ({ text: `Manager change request from ${clientName(r.clientId)}`, href: "/admin/complaints", action: "Review", icon: UserSwitch })),
    ...db.managers.filter((m) => m.stats.missed >= 3).map((m) => ({ text: `${managerName(db, m.id)} has missed ${m.stats.missed} due times this month`, href: `/admin/managers/${m.id}`, action: "Open", icon: WarningCircle })),
  ];

  // Sections as tabs. Access alerts only show while there are open ones; if the open tab goes away, the first tab opens.
  const sections: { value: Section; label: string; count?: number }[] = [
    { value: "needs", label: "Needs you", count: needs.length },
    { value: "risk", label: "At risk", count: atRisk.length },
    ...(hasAlerts ? [{ value: "alerts" as const, label: "Access alerts", count: hasAlerts }] : []),
    { value: "money", label: "Money", count: refundsWaiting + failed },
  ];
  const [picked, setPicked] = useState<Section | null>(null);
  const section = sections.find((s) => s.value === picked)?.value ?? sections[0].value;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Good morning, ${user?.firstName ?? ""}`} />

      {/* Row 1: the hero card across two columns and two rows, four small number cards beside it (stacked two across on phones). */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <section aria-labelledby="ov-delivery" className="col-span-2 flex flex-col gap-6 rounded-lg border border-border bg-card p-6 lg:row-span-2">
          <div className="flex flex-col gap-2">
            <h2 id="ov-delivery" className="text-body-sm text-secondary">
              Delivery this week
            </h2>
            <p className="font-display text-display-3xl text-primary">{pct}%</p>
            <p className="text-body-sm text-secondary">
              {done} of {target} done against targets, all clients
            </p>
          </div>
          <ProgressBar value={done} max={Math.max(target, 1)} tone={pct >= 90 ? "success" : pct >= 60 ? "brand" : "warning"} />
          <ul className="flex flex-col gap-4 border-t border-border pt-6">
            {parts.map((p) => (
              <li key={p.label} className="flex flex-col gap-2">
                <span className="flex items-center justify-between gap-3 text-body-sm">
                  <span className="text-secondary">{p.label}</span>
                  <span className="font-medium text-primary">
                    {p.done} of {p.target}
                  </span>
                </span>
                <ProgressBar value={p.done} max={Math.max(p.target, 1)} tone={p.done >= p.target ? "success" : "brand"} />
              </li>
            ))}
          </ul>
        </section>

        <StatTile icon={Users} label="Active clients" value={count("active")} />
        <StatTile icon={Gift} label="In their free 2 weeks" value={count("free")} />
        <StatTile icon={PauseCircle} label="Paused" value={paused.length} note={paused.map((c) => `${-daysFrom(c.pausedAt ?? c.joinedAt)} days`).join(", ") || undefined} tone={paused.length ? "warning" : undefined} />
        <StatTile icon={CheckCircle} label="Approved first time" value="79%" note="posts, last 30 days" />
      </div>

      {/* Under the numbers: one card at a time, picked from this tab row (same tab card as the client and manager pages; scrolls sideways on phones). */}
      <div className="rounded-lg border border-border bg-card p-2">
        <Tabs<Section> label="Overview sections" value={section} onChange={setPicked} tabs={sections} className="max-w-none w-full bg-neutral-50!" />
      </div>

      {section === "alerts" && <AccessAlertsCard />}

      {section === "risk" && (
        <Card title="At risk" padding="none" action={<TextLink href="/admin/clients" className="text-body-sm">View clients</TextLink>}>
          {atRisk.length ? (
            // Edge to edge, one clickable row per client in two sides: who on the left (avatar, name, manager under it),
            // why on the right in amber. On phones the reason drops under the name.
            <Rows flush>
              {atRisk.map((c) => {
                const u = db.users.find((x) => x.id === c.userId);
                return (
                  <Row key={c.id} href={`/admin/clients/${c.id}`} className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar name={fullName(u)} src={u?.photo} size="lg" />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-body font-medium text-primary">{fullName(u)}</span>
                        <span className="truncate text-body-sm text-secondary">Manager: {managerName(db, c.managerId) || "none"}</span>
                      </span>
                    </span>
                    <span className="min-w-0 pl-17 text-body-sm text-secondary sm:max-w-sm sm:pl-0 sm:text-right">{c.atRisk}</span>
                  </Row>
                );
              })}
            </Rows>
          ) : (
            <div className="px-6 py-4">
              <Banner tone="success">No accounts at risk.</Banner>
            </div>
          )}
        </Card>
      )}

      {section === "needs" && (
        <Card title="Needs you today" action={<Pill>{plural(needs.length, "thing")}</Pill>}>
          {needs.length ? (
            <Rows>
              {needs.map((n) => (
                <Row key={n.text} href={n.href}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                    <n.icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-body-sm text-primary">{n.text}</span>
                  <span className="shrink-0 text-body-sm font-medium text-primary-600">{n.action}</span>
                </Row>
              ))}
            </Rows>
          ) : (
            <Banner tone="success">Nothing needs you right now.</Banner>
          )}
        </Card>
      )}

      {section === "money" && (
        <Card title="Money" action={<TextLink href="/admin/money" className="text-body-sm">View money</TextLink>}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-body-sm text-secondary">Paid this month</span>
              <span className="font-display text-display-2xl text-primary">{money(paid)}</span>
            </div>
            <Rows>
              <Row href="/admin/money?tab=refunds">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <ArrowCounterClockwise className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-body-sm text-primary">Refunds waiting</span>
                <Badge status={refundsWaiting ? "warning" : "neutral"}>{refundsWaiting}</Badge>
              </Row>
              <Row href="/admin/money?tab=payments">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <CurrencyCircleDollar className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-body-sm text-primary">Failed payments</span>
                <Badge status={failed ? "danger" : "neutral"}>{failed}</Badge>
              </Row>
            </Rows>
          </div>
        </Card>
      )}
    </div>
  );
}
