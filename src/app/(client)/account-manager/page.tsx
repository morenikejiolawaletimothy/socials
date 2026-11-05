"use client";

import { Briefcase, CheckCircle, GlobeHemisphereWest, MapPin } from "@phosphor-icons/react";
import Link from "next/link";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Breadcrumbs, buttonClass, Card, EmptyState } from "@/components/ui";
import { fullName } from "@/lib/format";
import { useMyClient } from "@/lib/mock";

/**
 * The client's account manager, as a short profile: who they are, what they have done and how they work.
 * Name, photo and work only. Clients never see the manager's own accounts or contact details.
 */
export default function AccountManagerPage() {
  const { manager, managerUser } = useMyClient();

  if (!manager || !managerUser) {
    return (
      <Columns {...rails.clientManagerProfile}>
        <EmptyState title="No manager yet">We are choosing the right manager for you. You will see their profile here soon.</EmptyState>
      </Columns>
    );
  }

  const name = fullName(managerUser);
  const p = manager.profile;
  const stats = [
    { value: `${manager.stats.onTime}%`, label: "Posts out on time" },
    { value: `${manager.stats.firstTimeApproval}%`, label: "Approved the first time" },
    ...(p ? [{ value: `${p.yearsExperience} years`, label: "In communications" }] : []),
  ];

  return (
    <Columns {...rails.clientManagerProfile}>
      <Breadcrumbs items={[{ label: "Messages", href: "/messages", back: true }, { label: name }]} />

      <Card padding="none" className="overflow-hidden">
        <div aria-hidden className="h-20 bg-primary-100" />
        <div className="-mt-10 flex flex-col gap-4 px-6 pb-6">
          <Avatar name={name} src={managerUser.photo} size="xl" className="ring-4 ring-neutral-0" />
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-display-xl text-primary">{name}</h1>
            <p className="text-body text-primary">{managerUser.title ?? "Account manager"} at Bluecut, and your account manager</p>
            {p && (
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-secondary">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" aria-hidden /> {p.location}
                </span>
                <span className="flex items-center gap-1">
                  <GlobeHemisphereWest className="size-4" aria-hidden /> {p.languages.join(", ")}
                </span>
              </p>
            )}
          </div>
          <p className="text-body-sm text-secondary">{manager.intro}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/messages" className={buttonClass("primary")}>
              Message {managerUser.firstName}
            </Link>
            <Link href="/calls" className={buttonClass("secondary")}>
              Book a call
            </Link>
          </div>
        </div>
      </Card>

      <Card title="Track record">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 rounded-md border border-border p-4">
              <dt className="order-2 text-body-sm text-secondary">{s.label}</dt>
              <dd className="order-1 font-display text-display-xl text-primary">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {p && p.highlights.length > 0 && (
        <Card title="Highlights">
          <ul className="flex flex-col gap-3">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-body text-primary">
                <CheckCircle className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {p && (
        <Card title="How I work">
          <p className="text-body text-primary">{p.approach}</p>
        </Card>
      )}

      {p && p.background.length > 0 && (
        <Card title="Experience">
          <ul className="flex flex-col">
            {p.background.map((b) => (
              <li key={`${b.role}-${b.place}`} className="flex items-start gap-4 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <Briefcase className="size-5" aria-hidden />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-body font-medium text-primary">{b.role}</span>
                  <span className="text-body-sm text-secondary">
                    {b.place} · {b.years}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {manager.industries.length > 0 && (
        <Card title="Industries">
          <ul className="flex flex-wrap gap-2">
            {manager.industries.map((i) => (
              <li key={i} className="rounded-full border border-border px-3 py-1 text-body-sm text-primary">
                {i}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Columns>
  );
}
