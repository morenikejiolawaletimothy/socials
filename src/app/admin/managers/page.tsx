"use client";

import { Timer } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Table, managerName, managerStatus, td } from "@/components/admin/parts";
import { Avatar, Badge, Button, buttonClass, Card, Meta, PageHeader, Pill, Tabs, Tile, TileFooter, useConfirm, useTask } from "@/components/ui";
import { dayTimeIn, money, plural } from "@/lib/format";
import { act, useData } from "@/lib/mock";

type Section = "team" | "invites" | "payouts";

/** A3 Managers: status, load, delivery and quality. Invite, train, pay. */
export default function ManagersPage() {
  const db = useData();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const invited = db.managers.filter((m) => m.status === "invited");
  const toApprove = db.payouts.filter((p) => p.status === "to-approve").length;
  // Sections as tabs. If the open tab goes away, the first tab opens.
  const sections: { value: Section; label: string; count?: number }[] = [
    { value: "team", label: "Your team", count: db.managers.length },
    { value: "invites", label: "Invites", count: invited.length },
    { value: "payouts", label: "Payouts", count: toApprove },
  ];
  const [picked, setPicked] = useState<Section | null>(null);
  const section = sections.find((s) => s.value === picked)?.value ?? sections[0].value;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Managers" />

      {/* One card at a time, picked from this tab row (same tab card as the Overview; scrolls sideways on phones). */}
      <div className="rounded-lg border border-border bg-card p-2">
        <Tabs<Section> label="Managers sections" value={section} onChange={setPicked} tabs={sections} className="max-w-none w-full bg-neutral-50!" />
      </div>

      {section === "team" && (
      <Card title="Your team" action={<Pill>{plural(db.managers.length, "manager")}</Pill>}>
        <Table label="Your team" head={["Manager", "Clients", "On time", "Approved first time", "Missed", "Complaints", "Status"]}>
          {db.managers.map((m) => {
            const s = managerStatus[m.status];
            const load = db.clients.filter((c) => c.managerId === m.id).length;
            const active = m.status === "active";
            return (
              <tr key={m.id}>
                <td className={td}>
                  <Link href={`/admin/managers/${m.id}`} className="flex items-center gap-3 rounded-sm hover:text-primary-700 focus-visible:focus-ring">
                    <Avatar name={managerName(db, m.id)} size="md" />
                    <span className="font-medium text-primary">{managerName(db, m.id)}</span>
                  </Link>
                </td>
                <td className={td}>
                  {load} of {m.maxClients}
                </td>
                <td className={td}>{active ? `${m.stats.onTime}%` : "None yet"}</td>
                <td className={td}>{active ? `${m.stats.firstTimeApproval}%` : "None yet"}</td>
                <td className={`${td} ${m.stats.missed >= 3 ? "font-medium text-danger" : ""}`}>{active ? m.stats.missed : "None yet"}</td>
                <td className={td}>{active ? m.stats.complaints : "None yet"}</td>
                <td className={td}>
                  <Badge status={s.tone}>{s.label}</Badge>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
      )}

      {section === "invites" && (
        <Card>
          {/* Its own card above the waiting invites: what it does on the left, the button on the right (stacked on phones). */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <span className="font-display text-display-lg text-primary">Invite a manager</span>
            <Link href="/admin/managers/invite" className={`${buttonClass("primary")} self-start sm:self-auto`}>
              Invite
            </Link>
          </div>
        </Card>
      )}

      {section === "invites" && invited.length > 0 && (
        <Card title="Invites waiting" action={<Pill>{plural(invited.length, "invite")}</Pill>}>
          <ul className="flex flex-col gap-3">
            {db.managers
              .filter((m) => m.status === "invited")
              .map((m) => {
                const u = db.users.find((x) => x.id === m.userId);
                return (
                  <li key={m.id}>
                    <Tile>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-body font-medium text-primary">{managerName(db, m.id)}</span>
                      <span className="truncate text-body-sm text-secondary">{u?.email}</span>
                    </span>
                    <TileFooter>
                    <Meta icon={Timer}>{m.inviteExpiresAt ? `Link works until ${dayTimeIn(m.inviteExpiresAt)}` : "Link sent"}</Meta>
                    <span className="flex items-center gap-2">
                      <Button
                        variant="remove"
                        size="sm"
                        onClick={() =>
                          confirm({
                            title: `Withdraw the invite for ${managerName(db, m.id)}?`,
                            body: "Their link stops working at once. You can invite them again later.",
                            confirmLabel: "Withdraw invite",
                            tone: "danger",
                            action: () => act.revokeInvite(m.id),
                            success: "Invite withdrawn.",
                          })
                        }
                      >
                        Withdraw
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={pending(`resend-${m.id}`)}
                        onClick={() => run(`resend-${m.id}`, () => act.resendInvite(m.id), `New link sent to ${u?.email}. It works for 7 days.`)}
                      >
                        Resend
                      </Button>
                    </span>
                    </TileFooter>
                    </Tile>
                  </li>
                );
              })}
          </ul>
        </Card>
      )}

      {section === "payouts" && (
      <Card title="Payouts" action={<Pill>{toApprove} to approve</Pill>}>
        <Table label="Payouts" head={["Manager", "Period", "Active clients", "Amount", ""]}>
          {db.payouts.map((p) => (
            <tr key={p.id}>
              <td className={td}>{managerName(db, p.managerId)}</td>
              <td className={td}>{p.period}</td>
              <td className={td}>{p.clients}</td>
              <td className={td}>{money(p.amountCents)}</td>
              <td className={`${td} text-right`}>
                {p.status === "to-approve" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      confirm({
                        title: `Approve ${money(p.amountCents)} for ${managerName(db, p.managerId)}?`,
                        body: `${p.period}, ${p.clients} active clients. It is paid on Friday.`,
                        warning: "Once paid, a payout cannot be taken back.",
                        confirmLabel: "Approve payout",
                        action: () => act.approvePayout(p.id),
                        success: "Payout approved. It is paid on Friday.",
                      })
                    }
                  >
                    Approve
                  </Button>
                ) : (
                  <Badge status={p.status === "paid" ? "success" : "info"}>{p.status === "paid" ? "Paid" : "Approved"}</Badge>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
      )}

    </div>
  );
}
