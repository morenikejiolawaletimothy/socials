"use client";

import Link from "next/link";
import { useState } from "react";
import { Table, managerName, managerStatus, td } from "@/components/admin/parts";
import { Avatar, Badge, Button, Card, Dialog, Input, PageHeader, useToast } from "@/components/ui";
import { money } from "@/lib/format";
import { act, useData } from "@/lib/mock";


/** A3 Managers: status, load, delivery and quality. Invite, train, pay. */
export default function ManagersPage() {
  const db = useData();
  const toast = useToast();
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
                    onClick={async () => {
                      await act.approvePayout(p.id);
                      toast("Payout approved. It is paid on Friday.");
                    }}
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
        <Input label="Email" type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(undefined); }} error={error} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setInviting(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!form.first.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Add their first name and an email like name@company.com.");
              await act.inviteManager(form.first.trim(), form.last.trim(), form.email.trim());
              setInviting(false);
              setForm({ first: "", last: "", email: "" });
              toast("Invite sent.");
            }}
          >
            Send invite
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
