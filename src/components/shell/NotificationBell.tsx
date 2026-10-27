"use client";

import { Bell } from "@phosphor-icons/react";
import Link from "next/link";
import { useNotifications, useSession } from "@/lib/mock";

export function NotificationBell({ href }: { href: string }) {
  const { user } = useSession();
  const unread = useNotifications(user?.id).filter((n) => !n.read).length;

  return (
    <Link
      href={href}
      aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
      className="relative flex size-10 items-center justify-center rounded-full text-secondary hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring"
    >
      <Bell className="size-5" aria-hidden />
      {unread > 0 && (
        <span className="absolute right-1 top-1 flex min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-caption leading-5 text-inverse">
          {unread}
        </span>
      )}
    </Link>
  );
}
