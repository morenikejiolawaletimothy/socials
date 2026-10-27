"use client";

import Link from "next/link";
import { Columns } from "@/components/layout/Columns";
import { rails, type RailSet } from "@/components/rails";
import { Button, Card, EmptyState, PageHeader, useToast } from "@/components/ui";
import { markAllRead, useNotifications, useSession } from "@/lib/mock";

function timeAgo(iso: string) {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h} hours ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

export function NotificationsPage({ layout }: { layout?: RailSet }) {
  const { user } = useSession();
  const items = useNotifications(user?.id);
  const toast = useToast();
  const unread = items.filter((n) => !n.read).length;

  const body = (
    <>
      <PageHeader
        title="Notifications"
        action={
          unread > 0 && user ? (
            <Button
              variant="secondary"
              onClick={async () => {
                await markAllRead(user.id);
                toast("All notifications marked as read.");
              }}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState title="Nothing new">We will tell you here when something needs you.</EmptyState>
      ) : (
        <Card padding="sm">
          <ul className="flex flex-col">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className="flex items-start gap-3 rounded-md px-4 py-3 hover:bg-primary-50 focus-visible:focus-ring"
                >
                  <span
                    aria-hidden
                    className={`mt-2 size-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-primary-600"}`}
                  />
                  <span className="flex flex-col gap-1">
                    <span className={`text-body-sm ${n.read ? "text-secondary" : "font-medium text-primary"}`}>
                      {n.text}
                      {!n.read && <span className="sr-only"> (new)</span>}
                    </span>
                    <span className="text-caption text-secondary">{timeAgo(n.createdAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
  if (!layout) return <div className="mx-auto flex max-w-2xl flex-col gap-6">{body}</div>;
  return <Columns {...rails[layout]}>{body}</Columns>;
}
