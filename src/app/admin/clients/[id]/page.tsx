"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { managerName } from "@/components/admin/parts";
import { ActivityTab, BrandTab, CallsTab, ContentTab, EngagementTab, OverviewTab, PlanTab, UpdatesTab } from "@/components/manager/ClientTabs";
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, Pill, Row, Rows, RowText, Tabs, TextLink, buttonClass, useConfirm, useToast } from "@/components/ui";
import { ago, date, fullName, money, plural } from "@/lib/format";
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
  const confirm = useConfirm();
  const toast = useToast();
  const db = useData();
  const b = clientBundle(db, id);
  const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("overview");
  if (!b.client || !b.user) return <EmptyState title="Client not found" action={<Link href="/admin/clients" className={buttonClass("secondary")}>Go to Clients</Link>}>They may have been removed, or the link is wrong.</EmptyState>;
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
              onClick={async () => {
                const ok = await confirm({
                  title: `Step in for ${mName.split(" ")[0]}?`,
                  body: `You work in ${mName}'s workspace and can act for all their clients. ${b.user?.firstName} sees "Your account team", not your name.`,
                  warning: "Everything you do is recorded in the audit log.",
                  confirmLabel: "Step in",
                });
                if (!ok) return;
                act.setCovering(b.client!.managerId);
                toast(`You are covering for ${mName.split(" ")[0]}. Use the banner to stop.`, "info");
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
            <Card title="Messages" padding="none" action={<Pill>{plural(b.messages.length, "message")}</Pill>}>
              {b.messages.length ? (
                <Rows flush>
                  {b.messages.map((m) => (
                    <Row key={m.id} className="items-start justify-between">
                      <RowText title={m.text ?? (m.voice ? `Voice note: “${m.voice.transcript}”` : m.file?.name)} sub={m.asTeam ? "Account team" : fullName(db.users.find((u) => u.id === m.fromUserId))} />
                      <span className="shrink-0 text-caption text-secondary">{ago(m.at)}</span>
                    </Row>
                  ))}
                </Rows>
              ) : (
                <p className="px-6 py-4 text-body-sm text-secondary">No messages yet.</p>
              )}
            </Card>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Card title="Account" action={<Badge status={badge.tone}>{badge.label}</Badge>}>
            <div className="flex flex-col gap-4">
              <span className="flex items-center gap-3">
                <Avatar name={fullName(b.user)} src={b.user.photo} size="md" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-body font-medium text-primary">{fullName(b.user)}</span>
                  <span className="truncate text-body-sm text-secondary">{b.user.email}</span>
                </span>
              </span>
              <Rows>
                <Row>
                  <RowText title="Manager" sub={mName || "Not assigned"} />
                </Row>
                {b.contract && (
                  <>
                    <Row>
                      <RowText title="Contract" sub={`${b.contract.months} months, ${money(b.contract.monthlyCents)} a month, ${b.contract.paid ? "paid" : "not paid"}`} />
                    </Row>
                    <Row>
                      <RowText
                        title="Video add-on"
                        sub={
                          b.contract.videoAddon
                            ? { client: `On, ${money(db.settings.videoAddonCents)} a month. Client supplies the videos`, bluecut: "On. Bluecut makes the videos: production quoted separately", both: `On, ${money(db.settings.videoAddonCents)} a month, plus production quoted separately` }[b.contract.videoAddon.maker]
                            : "Off"
                        }
                      />
                    </Row>
                    <Row>
                      <RowText title="Dates" sub={`${date(b.contract.startsAt)} to ${date(b.contract.endsAt)}`} />
                    </Row>
                  </>
                )}
              </Rows>
              <TextLink href="/admin/money" className="self-start text-body-sm">
                Contract and payments
              </TextLink>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
