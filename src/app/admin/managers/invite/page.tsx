"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banner, Button, Card, Input, PageHeader, useTask } from "@/components/ui";
import { act, useData } from "@/lib/mock";

/** A3: invite a manager, on its own page. */
export default function InviteManagerPage() {
  const router = useRouter();
  const db = useData();
  const { run, pending } = useTask();
  const [form, setForm] = useState({ first: "", last: "", email: "" });
  const [error, setError] = useState<string>();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Invite a manager" />
      <Card title="Their details">
        <div className="flex flex-col gap-4">
        <Banner tone="info">They get a link that works once, for 7 days, and set up their account. Then you book their 60-minute training call.</Banner>
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
        <div className="flex flex-wrap gap-3">
          <Button
            loading={pending("invite")}
            onClick={async () => {
              if (!form.first.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Add their first name and an email like name@company.com.");
              if (db.users.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase())) return setError("Someone already uses this email. Check it, or find them in the list.");
              if (await run("invite", () => act.inviteManager(form.first.trim(), form.last.trim(), form.email.trim()), `Invite sent to ${form.email.trim()}. The link works for 7 days.`)) {
                router.push("/admin/managers");
              }
            }}
          >
            {pending("invite") ? "Sending" : "Send invite"}
          </Button>
          <Button variant="cancel" onClick={() => router.push("/admin/managers")}>
            Cancel
          </Button>
        </div>
        </div>
      </Card>
    </div>
  );
}
