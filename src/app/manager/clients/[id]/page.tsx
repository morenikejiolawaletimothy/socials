"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import {
  ActivityTab,
  BrandTab,
  CallsTab,
  ContentTab,
  EngagementTab,
  ListeningTab,
  OverviewTab,
  PlanTab,
  UpdatesTab,
} from "@/components/manager/ClientTabs";
import { Avatar, Badge, Breadcrumbs, Button, buttonClass, Card, EmptyState, ProgressBar, Tabs, useTask } from "@/components/ui";
import { fullName } from "@/lib/format";
import { act, clientBundle, useMyManager } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

/** #43: re-read the client's name/photo from their stored LinkedIn URL, on demand. */
function SyncProfileButton({ userId }: { userId: string }) {
  const { run, pending } = useTask();
  return (
    <Button variant="secondary" size="sm" loading={pending("sync")} onClick={() => run("sync", () => act.syncLinkedIn(userId), "Client profile updated from LinkedIn.")}>
      Update profile
    </Button>
  );
}

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "plan", label: "Plan" },
  { value: "content", label: "Content" },
  { value: "engagement", label: "Engagement" },
  { value: "listening", label: "Listening" },
  { value: "brand", label: "Brand" },
  { value: "calls", label: "Calls and notes" },
  { value: "updates", label: "Updates" },
  { value: "activity", label: "Activity" },
] as const;
type Tab = (typeof tabs)[number]["value"];

/** M2 Client page, like a LinkedIn profile: a header, then sections as tabs (a short menu on mobile). */
function ClientPage({ id }: { id: string }) {
  const router = useRouter();
  const tab = (useSearchParams().get("tab") as Tab) || "overview";
  const { db } = useMyManager();
  const b = clientBundle(db, id);

  if (!b.client || !b.user) {
    return (
      <Columns {...rails.managerMain}>
        <EmptyState title="Client not found" action={<Link href="/manager/clients" className={buttonClass("secondary")}>Go to Clients</Link>}>This client is not on your list.</EmptyState>
      </Columns>
    );
  }
  const badge = statusBadge[b.client.status];
  const newMoments = b.moments.filter((m) => m.status === "new").length;

  return (
    <Columns {...rails.managerMain}>
      <Breadcrumbs items={[{ label: "Clients", href: "/manager/clients", back: true }, { label: fullName(b.user) }]} />
      {/* Profile header, like LinkedIn: cover, photo, who they are, actions under a line, then the section tabs. */}
      <Card padding="none" className="overflow-hidden">
        <div aria-hidden className="h-16 bg-primary-100" />
        <div className="-mt-10 flex flex-col gap-4 px-6 pb-4">
          <Avatar name={fullName(b.user)} src={b.user.photo} size="xl" className="ring-4 ring-neutral-0" />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <h1 className="font-display text-display-xl text-primary">{fullName(b.user)}</h1>
              <span className="flex flex-wrap items-center gap-2">
                <Badge status={badge.tone}>{badge.label}</Badge>
              </span>
            </div>
            <span className="text-body text-primary">
              {b.user.title}
              {b.client.company ? ` at ${b.client.company}` : ""}
            </span>
            <span className="text-body-sm text-secondary">
              {b.client.industry} · {b.client.country}
            </span>
          </div>
          {b.client.status === "setting-up" && (
            <div className="flex flex-col gap-2">
              <span className="flex items-center justify-between gap-2 text-body-sm">
                <span className="text-secondary">Setup</span>
                <span className="font-medium text-primary">{b.client.setupProgress}% done</span>
              </span>
              <ProgressBar value={b.client.setupProgress} />
            </div>
          )}
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
            <Link href={`/manager/messages?client=${id}`} className={buttonClass("primary", "sm")}>
              Message {b.user.firstName}
            </Link>
            <Link href={`/manager/clients/${id}/onboard`} className={buttonClass("secondary", "sm")}>
              Onboarding and strategy
            </Link>
            {b.user.linkedinUrl && <SyncProfileButton userId={b.user.id} />}
          </div>
        </div>
      </Card>

      {/* Section tabs in their own card that stays under the top bar, as on the client's Home. */}
      <div className="sticky top-14 z-20 rounded-lg border border-border bg-card p-2">
        <Tabs
          label="Client sections"
          value={tab}
          onChange={(t) => router.replace(`/manager/clients/${id}?tab=${t}`, { scroll: false })}
          tabs={tabs.map((t) => ({ ...t, count: t.value === "brand" ? newMoments : undefined }))}
          className="max-w-none w-full bg-neutral-50!"
        />
      </div>

      {tab === "overview" && <OverviewTab b={b} />}
      {tab === "plan" && <PlanTab b={b} id={id} />}
      {tab === "content" && <ContentTab b={b} id={id} />}
      {tab === "engagement" && <EngagementTab b={b} />}
      {tab === "listening" && <ListeningTab b={b} />}
      {tab === "brand" && <BrandTab b={b} />}
      {tab === "calls" && <CallsTab b={b} />}
      {tab === "updates" && <UpdatesTab b={b} />}
      {tab === "activity" && <ActivityTab b={b} />}
    </Columns>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <ClientPage id={id} />
    </Suspense>
  );
}
