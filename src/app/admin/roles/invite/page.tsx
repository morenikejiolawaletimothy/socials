"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, PageHeader, useTask } from "@/components/ui";
import { act, useData } from "@/lib/mock";

export default function InviteAdminPage() {
  const router = useRouter();
  const db = useData();
  const { run, pending } = useTask();
  const roles = db.adminRoles ?? [];
  const [form, setForm] = useState({ first: "", last: "", email: "" });
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Invite an admin" crumbs={[{ label: "Roles & team", href: "/admin/roles" }, { label: "Invite an admin" }]} />
      <Card title="Their details" info="They get an invite link and set up their account. Pick their roles now; you can change them any time.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" value={form.first} onChange={(e) => setForm({ ...form, first: e.target.value })} />
            <Input label="Last name" value={form.last} onChange={(e) => setForm({ ...form, last: e.target.value })} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(undefined); }} error={error} />
          <div className="flex flex-col gap-2">
            <span className="text-body font-medium text-primary">Roles</span>
            {roles.map((r) => (
              <label key={r.id} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${roleIds.includes(r.id) ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                <input
                  type="checkbox"
                  checked={roleIds.includes(r.id)}
                  onChange={(e) => setRoleIds((d) => (e.target.checked ? [...d, r.id] : d.filter((x) => x !== r.id)))}
                  className="mt-1 size-4 shrink-0 accent-primary-600 focus-visible:focus-ring"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="text-body-sm font-medium text-primary">{r.name}</span>
                  {r.description && <span className="text-caption text-secondary">{r.description}</span>}
                </span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <Button
              loading={pending("invite")}
              onClick={async () => {
                if (!form.first.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Add their first name and an email like name@company.com.");
                if (db.users.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase())) return setError("Someone already uses this email.");
                if (!roleIds.length) return setError("Give them at least one role.");
                if (await run("invite", () => act.inviteAdmin(form.first.trim(), form.last.trim(), form.email.trim(), roleIds), `Invite sent to ${form.email.trim()}.`)) router.push("/admin/roles");
              }}
            >
              {pending("invite") ? "Sending" : "Send invite"}
            </Button>
            <Button variant="cancel" onClick={() => router.push("/admin/roles")}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
