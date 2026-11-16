"use client";

import { Avatar, Badge, Card, Pill, ProgressBar } from "@/components/ui";
import { useDb, useSession } from "@/lib/mock";
import { plural } from "@/lib/format";
import { statusBadge } from "@/lib/status";

/** Left-column card with the signed-in person, like LinkedIn's profile card. */
export function ProfileCard() {
  const { user } = useSession();
  const client = useDb((db) => db.clients.find((c) => c.userId === user?.id));
  const manager = useDb((db) => db.managers.find((m) => m.userId === user?.id));
  const clientCount = useDb((db) => db.clients).filter((c) => manager && c.managerId === manager.id).length;
  if (!user) return null;
  const name = `${user.firstName} ${user.lastName}`;
  const badge = client ? statusBadge[client.status] : null;

  const settingUp = client?.stage === "setup";
  const badgeEl = badge ? (
    <Badge status={client?.status === "setting-up" ? "neutral" : badge.tone} live={client?.status === "active"}>
      {client?.status === "free" ? "Free" : client?.status === "setting-up" ? "Setup" : badge.label}
    </Badge>
  ) : (
    <Pill>{plural(clientCount, "client")}</Pill>
  );

  // Figma profile card: light blue band, avatar overlapping it, status badge top right; during setup, progress under the name.
  return (
    <Card padding="none" className="relative overflow-hidden">
      <div aria-hidden className="h-12 bg-primary-100" />
      <div className="absolute right-4 top-4">{badgeEl}</div>
      <div className="-mt-8 flex flex-col gap-1 px-4 pb-4">
        <Avatar name={name} src={user.photo} size="lg" className="ring-4 ring-neutral-0" />
        <p className="mt-2 font-display text-display-lg text-primary">{name}</p>
        {settingUp ? (
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
            <span className="text-body-sm text-primary">{client?.setupProgress ?? 0}% completed</span>
            <ProgressBar value={client?.setupProgress ?? 0} />
          </div>
        ) : (
          user.title && <p className="text-body-sm text-secondary">{user.title}</p>
        )}
      </div>
    </Card>
  );
}
