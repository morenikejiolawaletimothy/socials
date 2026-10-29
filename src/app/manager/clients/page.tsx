"use client";

import Link from "next/link";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Badge, Card, ProgressBar } from "@/components/ui";
import { dayTimeIn, fullName } from "@/lib/format";
import { useMyManager } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

/** M2 Clients: one card per client with status and the next thing that needs doing. */
export default function ClientsPage() {
  const { db, clients, manager } = useMyManager();

  return (
    <Columns {...rails.managerMain}>
      <Card
        title="Your clients"
        action={
          <span className="text-caption text-secondary">
            {clients.length} of {manager?.maxClients ?? 10}
          </span>
        }
        padding="none"
      >
        <ul className="flex flex-col">
          {clients.map((c) => {
            const u = db.users.find((x) => x.id === c.userId);
            const b = statusBadge[c.status];
            const next = db.managerTasks.filter((t) => t.clientId === c.id && t.column !== "done" && t.group !== "waiting").sort((a, z) => a.dueAt.localeCompare(z.dueAt))[0];
            const week = db.progress.find((p) => p.clientId === c.id);
            return (
              <li key={c.id} className="border-b border-border last:border-b-0">
                <Link href={`/manager/clients/${c.id}`} className="flex flex-col gap-3 px-6 py-5 hover:bg-neutral-25 focus-visible:focus-ring sm:flex-row sm:items-start">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Avatar name={fullName(u)} size="lg" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-body font-medium text-primary">{fullName(u)}</span>
                        <Badge status={b.tone}>{b.label}</Badge>
                      </span>
                      <span className="text-body-sm text-secondary">{u?.title}</span>
                      {next ? (
                        <span className="text-body-sm text-primary">
                          Next: {next.title}, due {dayTimeIn(next.dueAt)}
                        </span>
                      ) : (
                        <span className="text-body-sm text-secondary">Nothing due from you.</span>
                      )}
                      {c.atRisk && <span className="text-caption text-danger">{c.atRisk}</span>}
                    </div>
                  </div>
                  {week && (
                    <div className="flex w-full flex-col gap-1 pl-17 sm:w-40 sm:self-center sm:pl-0">
                      <span className="text-caption text-secondary">
                        This week: {week.posts.done + week.comments.done + week.connections.done} of {week.posts.target + week.comments.target + week.connections.target}
                      </span>
                      <ProgressBar value={week.posts.done + week.comments.done + week.connections.done} max={week.posts.target + week.comments.target + week.connections.target} />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </Columns>
  );
}
