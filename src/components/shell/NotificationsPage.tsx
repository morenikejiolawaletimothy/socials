"use client";

import { EnvelopeSimple, Trash, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { Columns } from "@/components/layout/Columns";
import { rails, type RailSet } from "@/components/rails";
import { Button, Card, useTask, useToast } from "@/components/ui";
import { ago } from "@/lib/format";
import { act, useNotifications, useSession } from "@/lib/mock";

/** Notifications for every role: urgent first, then newest. Opening one marks it read. */
export function NotificationsPage({ layout }: { layout?: RailSet }) {
  const { user } = useSession();
  const all = useNotifications(user?.id);
  const items = [...all].sort((a, b) => Number(!!b.urgent && !b.read) - Number(!!a.urgent && !a.read) || b.createdAt.localeCompare(a.createdAt));
  const toast = useToast();
  const { run, pending } = useTask();
  const unread = items.filter((n) => !n.read).length;
  const read = items.length - unread;

  const actions =
    user && items.length > 0 ? (
      <span className="flex gap-1">
        {unread > 0 && (
          <Button variant="ghost" loading={pending("all")} onClick={() => run("all", () => act.markAllRead(user.id), "All notifications marked as read.")}>
            Mark all as read
          </Button>
        )}
        {read > 0 && (
          <Button variant="ghost" loading={pending("clear")} onClick={() => run("clear", () => act.clearRead(user.id), `Cleared ${read} read notification${read === 1 ? "" : "s"}.`)}>
            Clear read
          </Button>
        )}
      </span>
    ) : undefined;

  const list =
    items.length === 0 ? (
      <p className="px-4 py-8 text-center text-body-sm text-secondary">Nothing new. We will tell you here when something needs you.</p>
    ) : (
      <ul className="flex flex-col">
        {items.map((n) => (
          <li key={n.id} className="group flex items-start gap-1 rounded-md hover:bg-primary-50">
            <Link href={n.href} onClick={() => act.markRead(n.id)} className="flex flex-1 items-start gap-3 rounded-md px-4 py-3 focus-visible:focus-ring">
              <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : n.urgent ? "bg-danger" : "bg-primary-600"}`} />
              <span className="flex flex-col gap-1">
                <span className={`text-body-sm ${n.read ? "text-secondary" : "font-medium text-primary"}`}>
                  {n.urgent && !n.read && <WarningCircle className="mr-1 inline size-4 text-danger" aria-label="Urgent" />}
                  {n.text}
                  {!n.read && <span className="sr-only"> (new)</span>}
                </span>
                <span className="flex items-center gap-2 text-caption text-secondary">
                  {ago(n.createdAt)}
                  {n.email && (
                    <span className="inline-flex items-center gap-1">
                      <EnvelopeSimple className="size-3.5" aria-hidden /> Also emailed
                    </span>
                  )}
                </span>
              </span>
            </Link>
            <button
              type="button"
              aria-label="Remove notification"
              onClick={async () => {
                try {
                  await act.deleteNotification(n.id);
                  toast("Notification removed.", "success", { action: { label: "Undo", onClick: () => act.restoreNotification(n) } });
                } catch {
                  toast("That did not go through. Check your connection and try again.", "danger");
                }
              }}
              className="mr-2 mt-2 flex size-9 shrink-0 items-center justify-center rounded-full text-secondary opacity-100 hover:bg-card hover:text-danger focus-visible:focus-ring sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <Trash className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    );

  const card = (
    <Card title="Notifications" action={actions} padding="sm">
      {list}
    </Card>
  );

  if (!layout) return <div className="mx-auto flex max-w-2xl flex-col gap-6">{card}</div>;
  return <Columns {...rails[layout]}>{card}</Columns>;
}
