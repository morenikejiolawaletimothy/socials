"use client";

import { Avatar, Badge, Card } from "@/components/ui";
import { useDb, useSession } from "@/lib/mock";
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

  return (
    <Card padding="none" className="overflow-hidden">
      <div aria-hidden className="h-14 bg-primary-100" />
      <div className="-mt-8 flex flex-col gap-1 px-6 pb-4">
        <Avatar name={name} src={user.photo} size="lg" className="ring-4 ring-neutral-0" />
        <p className="mt-2 font-display text-display-lg text-primary">{name}</p>
        <p className="text-body-sm text-secondary">{user.title}</p>
        <div className="absolute items-center justify-start ml-36 mt-3.5 w-auto">
          {badge ? (
            <Badge status={badge.tone} live={client?.status === "active"}>{badge.label}</Badge>
          ) : (
            <span className="text-body-sm text-secondary">{clientCount} clients</span>
          )}
        </div>
      </div>
    </Card>
  );
}
