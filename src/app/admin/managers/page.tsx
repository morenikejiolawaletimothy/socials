"use client";

import Link from "next/link";
import { useState } from "react";
import { Table, managerName, managerStatus, td } from "@/components/admin/parts";
import { Avatar, Badge, Button, Card, Dialog, Input, PageHeader, useConfirm, useTask } from "@/components/ui";
import { dayIn, money } from "@/lib/format";
import { act, useData } from "@/lib/mock";

/** A3 Managers: status, load, delivery and quality. Invite, train, pay. */
export default function ManagersPage() {
  const db = useData();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ first: "", last: "", email: "" });
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Managers" description="Invite, train, assign and support your managers." action={<Button onClick={() => setInviting(true)}>Invite a manager</Button>} />

      <Card title="Your team">
        <Table head={["Manager", "Status", "Clients", "On time", "Approved first time", "Missed", "Complaints"]}>
          {db.managers.map((m) => {
            const s = managerStatus[m.status];
            const load = db.clients.filter((c) => c.managerId === m.id).length;
            const active = m.status === "active";
            return (
              <tr key={m.id}>
                <td className={td}>
                  <Link href={`/admin/managers/${m.id}`} className="flex items-center gap-3 rounded-sm hover:text-primary-700 focus-visible:focus-ring">
                    <Avatar name={managerName(db, m.id)} size="sm" />
                    <span className="font-medium text-primary">{managerName(db, m.id)}</span>
                  </Link>
                </td>
                <td className={td}>
                  <Badge status={s.tone}>{s.label}</Badge>
                </td>
                <td className={td}>
                  {load} of {m.maxClients}
                </td>
                <td className={td}>{active ? `${m.stats.onTime}%` : "None yet"}</td>
                <td className={td}>{active ? `${m.stats.firstTimeApproval}%` : "None yet"}</td>
                <td className={`${td} ${m.stats.missed >= 3 ? "font-medium text-danger" : ""}`}>{active ? m.stats.missed : "None yet"}</td>
                <td className={td}>{active ? m.stats.complaints : "None yet"}</td>
              </tr>
            );
          })}
        </Table>
      </Card>

      {db.managers.some((m) => m.status === "invited") && (
        <Card title="Invites waiting">
          <ul className="flex flex-col">
            {db.managers
              .filter((m) => m.status === "invited")
              .map((m) => {
                const u = db.users.find((x) => x.id === m.userId);
                return (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
                    <span className="flex min-w-0 flex-col">
                      <span className="text-body font-medium text-primary">{managerName(db, m.id)}</span>
                      <span className="truncate text-caption text-secondary">
                        {u?.email}
                        {m.inviteExpiresAt ? `, link works until ${dayIn(m.inviteExpiresAt)}` : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-4">
                      <Button
                        variant="secondary"
                        loading={pending(`resend-${m.id}`)}
                        onClick={() => run(`resend-${m.id}`, () => act.resendInvite(m.id), `New link sent to ${u?.email}. It works for 7 days.`)}
                      >
                        Resend
                      </Button>
                      <button
                        type="button"
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
                        className="rounded-sm text-body-sm font-medium text-danger hover:underline focus-visible:focus-ring"
                      >
                        Withdraw
                      </button>
                    </span>
                  </li>
                );
              })}
          </ul>
        </Card>
      )}

      <Card title="Payouts">
        <Table head={["Manager", "Period", "Active clients", "Amount", ""]}>
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

      <Dialog open={inviting} onClose={() => setInviting(false)} title="Invite a manager">
        <p className="text-body-sm text-secondary">They get a link that works once, for 7 days, and set up their account. Then you book their 60-minute training call.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" value={form.first} onChange={(e) => setForm({ ...form, first: e.target.value })} />
          <Input label="Last name" value={form.last} onChange={(e) => setForm({ ...form, last: e.target.value })} />
        </div>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            setError(undefined);
          }}
          error={error}
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setInviting(false)}>
            Cancel
          </Button>
          <Button
            loading={pending("invite")}
            onClick={async () => {
              if (!form.first.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Add their first name and an email like name@company.com.");
              if (db.users.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase())) return setError("Someone already uses this email. Check it, or find them in the list.");
              if (await run("invite", () => act.inviteManager(form.first.trim(), form.last.trim(), form.email.trim()), `Invite sent to ${form.email.trim()}. The link works for 7 days.`)) {
                setInviting(false);
                setForm({ first: "", last: "", email: "" });
              }
            }}
          >
            {pending("invite") ? "Sending" : "Send invite"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
