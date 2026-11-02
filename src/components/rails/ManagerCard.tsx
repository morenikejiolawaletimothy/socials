"use client";

import Link from "next/link";
import { Avatar, Banner, Card, buttonClass } from "@/components/ui";
import { fullName } from "@/lib/format";
import { useMyClient } from "@/lib/mock";

/** Right-column card on client pages: the person who runs their account. The next call has its own card (NextCallCard). */
export function ManagerCard() {
  const { manager, managerUser } = useMyClient();

  return (
    <Card title="Account manager">
      {manager && managerUser ? (
        <div className="flex flex-col gap-4">
          <Link href="/account-manager" className="group flex items-center gap-3 rounded-md focus-visible:focus-ring" aria-label={`See ${fullName(managerUser)}'s profile`}>
            <Avatar name={fullName(managerUser)} src={managerUser.photo} size="lg" />
            <div className="flex min-w-0 flex-col">
              <span className="text-body font-medium text-primary group-hover:underline">{fullName(managerUser)}</span>
              <span className="text-body-sm text-secondary">Account manager</span>
            </div>
          </Link>
          <p className="text-body-sm text-secondary">{manager.intro}</p>
          <Link href="/messages" className={`self-start ${buttonClass("primary", "sm")}`}>
            Message {managerUser.firstName}
          </Link>
        </div>
      ) : (
        <Banner tone="info">We are choosing the right manager for you. You will see them here soon.</Banner>
      )}
    </Card>
  );
}
