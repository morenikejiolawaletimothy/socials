"use client";

import { useState } from "react";
import { Banner, Button, Card, Input, PageHeader, useToast } from "@/components/ui";
import { money } from "@/lib/format";
import { act, useData } from "@/lib/mock";
import { plans } from "@/lib/pricing";

/** A7 Settings: prices and the rules the product runs on. Changes apply to new contracts only. */
export default function SettingsPage() {
  const db = useData();
  const toast = useToast();
  const [s, setS] = useState(db.settings);
  const num = (k: keyof typeof s) => (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [k]: Number(e.target.value) || 0 });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="The rules the product runs on." />
      <Banner tone="info" title="Changes apply to new contracts only">
        Clients already signed keep the terms they signed. Every change is recorded in the audit log.
      </Banner>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Plans and prices">
          <div className="flex flex-col gap-4">
            {plans.map((p) => (
              <Input key={p.id} label={`${p.label}, a month (USD)`} defaultValue={String(p.monthlyUsdCents / 100)} inputMode="numeric" />
            ))}
            <p className="text-caption text-secondary">Prices are in US dollars. Stripe shows each client their local currency.</p>
          </div>
        </Card>
        <Card title="Money">
          <div className="flex flex-col gap-4">
            <Input label="Approve refunds automatically below (USD)" value={String(s.autoRefundLimitCents / 100)} onChange={(e) => setS({ ...s, autoRefundLimitCents: (Number(e.target.value) || 0) * 100 })} help={`Now ${money(s.autoRefundLimitCents)}. Larger refunds wait for you.`} />
            <Input label="Free period (days)" value={String(s.freeDays)} onChange={num("freeDays")} />
            <Input label="Payment reminders (days before the free period ends)" value={s.reminderDays.join(", ")} onChange={(e) => setS({ ...s, reminderDays: e.target.value.split(",").map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x)) })} />
          </div>
        </Card>
        <Card title="Paused accounts">
          <div className="flex flex-col gap-4">
            <Input label="Warn after (days paused)" value={String(s.pauseWarningDays)} onChange={num("pauseWarningDays")} />
            <Input label="Remove and delete data after (days paused)" value={String(s.removalDays)} onChange={num("removalDays")} />
          </div>
        </Card>
        <Card title="Work rules">
          <div className="flex flex-col gap-4">
            <Input label='"Go ahead" wait (hours)' value={String(s.goAheadHours)} onChange={num("goAheadHours")} />
            <Input label="Most clients per manager" value={String(s.maxClientsPerManager)} onChange={num("maxClientsPerManager")} />
            <Input label="Days between the two calls" value={String(s.daysBetweenCalls)} onChange={num("daysBetweenCalls")} />
            <Input label="Staff sign-out after (minutes idle)" value={String(s.sessionTimeoutMinutes)} onChange={num("sessionTimeoutMinutes")} />
          </div>
        </Card>
      </div>
      <Button
        className="self-start"
        onClick={async () => {
          await act.saveSettings(s);
          toast("Settings saved. They apply to new contracts.");
        }}
      >
        Save settings
      </Button>
    </div>
  );
}
