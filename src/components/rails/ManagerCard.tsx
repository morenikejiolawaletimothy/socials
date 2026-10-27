"use client";

import Link from "next/link";
import { Avatar, Card } from "@/components/ui";
import { useDb, useSession } from "@/lib/mock";

/** Right-column card on client pages: the person who runs their account. */
export function ManagerCard() {
  const { user } = useSession();
  const client = useDb((db) => db.clients.find((c) => c.userId === user?.id));
  const manager = useDb((db) => db.managers.find((m) => m.id === client?.managerId));
  const mUser = useDb((db) => db.users.find((u) => u.id === manager?.userId));

  return (
    <Card className="flex flex-col gap-4">
      <p className="font-display text-display-lg text-primary">Your account manager</p>
      {manager && mUser ? (
        <>
          <div className="flex items-center gap-3">
            <Avatar name={`${mUser.firstName} ${mUser.lastName}`} size="lg" />
            <div className="flex min-w-0 flex-col">
              <span className="text-body font-medium text-primary">
                {mUser.firstName} {mUser.lastName}
              </span>
              <span className="text-body-sm text-secondary">Account manager</span>
            </div>
          </div>
          <p className="text-body-sm text-secondary">{manager.intro}</p>
          <Link
            href="/messages"
            className="self-start rounded-md border border-border-strong px-4 py-2 text-body-sm font-medium text-primary-700 hover:bg-primary-50 focus-visible:focus-ring"
          >
            Message
          </Link>
        </>
      ) : (
        <p className="text-body-sm text-secondary">We are choosing the right manager for you. You will see them here soon.</p>
      )}
    </Card>
  );
}
