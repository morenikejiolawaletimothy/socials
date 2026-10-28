"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { managerName } from "@/components/admin/parts";
import { ActivityTab, BrandTab, CallsTab, ContentTab, EngagementTab, OverviewTab, PlanTab, UpdatesTab } from "@/components/manager/ClientTabs";
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, Tabs } from "@/components/ui";
import { date, fullName, money } from "@/lib/format";
import { act, clientBundle, useData } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "plan", label: "Plan" },
  { value: "content", label: "Content" },
  { value: "engagement", label: "Engagement" },
  { value: "brand", label: "Brand" },
  { value: "calls", label: "Calls" },
  { value: "updates", label: "Updates" },
  { value: "messages", label: "Messages" },
  { value: "activity", label: "Activity" },
] as const;

/** A2 Client view: the same client page the manager sees, plus contract details and Step in. */
export default function OwnerClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useData();
  const b = clientBundle(db, id);
  const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("overview");
  if (!b.client || !b.user) return <EmptyState title="Client not found">Go back to Clients.</EmptyState>;
  const badge = statusBadge[b.client.status];
  const mName = managerName(db, b.client.managerId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={fullName(b.user)}
        description={`${b.user.title}. ${b.client.industry}, ${b.client.country}.`}
        crumbs={[{ label: "Clients", href: "/admin/clients" }, { label: fullName(b.user) }]}
        action={
          b.client.managerId && (
            <Button
              variant="secondary"
              onClick={() => {
                act.setCovering(b.client!.managerId);
                router.push(`/manager/clients/${id}`);
              }}
            >
              Step in for {mName.split(" ")[0]}
            </Button>
          )
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card padding="none">
            <div className="px-6 pt-2">
              <Tabs label="Client sections" value={tab} onChange={setTab} tabs={[...tabs]} />
            </div>
          </Card>
          {tab === "overview" && <OverviewTab b={b} />}
          {tab === "plan" && <PlanTab b={b} id={id} />}
          {tab === "content" && <ContentTab b={b} id={id} />}
          {tab === "engagement" && <EngagementTab b={b} />}
          {tab === "brand" && <BrandTab b={b} />}
          {tab === "calls" && <CallsTab b={b} />}
          {tab === "updates" && <UpdatesTab b={b} />}
          {tab === "activity" && <ActivityTab b={b} />}
          {tab === "messages" && (
            <Card title="Messages">
              <ul className="flex flex-col gap-3">
                {b.messages.map((m) => (
                  <li key={m.id} className="flex flex-col gap-1">
                    <span className="text-caption text-secondary">{fullName(db.users.find((u) => u.id === m.fromUserId))}</span>
                    <span className="text-body-sm text-primary">{m.text ?? (m.voice ? `Voice note: "${m.voice.transcript}"` : m.file?.name)}</span>
                  </li>
                ))}
                {!b.messages.length && <li className="text-body-sm text-secondary">No messages yet.</li>}
              </ul>
            </Card>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Card title="Account">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={fullName(b.user)} size="md" />
                <Badge status={badge.tone}>{badge.label}</Badge>
              </div>
              <dl className="flex flex-col gap-3 text-body-sm">
                <div>
                  <dt className="text-caption text-secondary">Manager</dt>
                  <dd className="text-primary">{mName || "Not assigned"}</dd>
                </div>
                {b.contract && (
                  <>
                    <div>
                      <dt className="text-caption text-secondary">Contract</dt>
                      <dd className="text-primary">
                        {b.contract.months} months, {money(b.contract.monthlyCents)} a month, {b.contract.paid ? "paid" : "not paid"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-caption text-secondary">Dates</dt>
                      <dd className="text-primary">
                        {date(b.contract.startsAt)} to {date(b.contract.endsAt)}
                      </dd>
                    </div>
                  </>
                )}
                <div>
                  <dt className="text-caption text-secondary">Email</dt>
                  <dd className="text-primary">{b.user.email}</dd>
                </div>
              </dl>
              <Link href="/admin/money" className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                Contract and payments
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
