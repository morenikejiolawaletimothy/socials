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
import { Avatar, Badge, Breadcrumbs, Card, EmptyState, ProgressBar, Tabs, buttonClass } from "@/components/ui";
import { fullName } from "@/lib/format";
import { clientBundle, useMyManager } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

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
      <Card padding="none" className="overflow-hidden">
        <div aria-hidden className="h-16 bg-primary-100" />
        <div className="-mt-10 flex flex-col gap-4 px-6 pb-2">
          <Avatar name={fullName(b.user)} size="xl" className="ring-4 ring-neutral-0" />
          <Breadcrumbs items={[{ label: "Clients", href: "/manager/clients" }, { label: fullName(b.user) }]} />
          <div className="flex flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-display-xl text-primary">{fullName(b.user)}</h1>
              <Badge status={badge.tone}>{badge.label}</Badge>
            </span>
            <span className="text-body-sm text-secondary">
              {b.user.title}. {b.client.industry}, {b.client.country}.
            </span>
          </div>
          {b.client.status === "setting-up" && (
            <div className="flex flex-col gap-2">
              <span className="text-caption text-secondary">Setup {b.client.setupProgress}% done</span>
              <ProgressBar value={b.client.setupProgress} />
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            <Link href={`/manager/clients/${id}/content`} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
              Content
            </Link>
            <Link href={`/manager/clients/${id}/onboard`} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
              Onboarding and strategy
            </Link>
            <Link href={`/manager/messages?client=${id}`} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
              Message
            </Link>
          </div>
        </div>
        <div className="px-6">
          <Tabs
            label="Client sections"
            value={tab}
            onChange={(t) => router.replace(`/manager/clients/${id}?tab=${t}`, { scroll: false })}
            tabs={tabs.map((t) => ({ ...t, count: t.value === "brand" ? newMoments : undefined }))}
          />
        </div>
      </Card>

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
