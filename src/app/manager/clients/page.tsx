"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Badge, Banner, Card, Meta, Pill, ProgressBar, Tile, TileAction, TileFooter } from "@/components/ui";
import { dayTimeIn, fullName } from "@/lib/format";
import { useMyManager } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

/** M2 Clients: one card per client with status and the next thing that needs doing. */
export default function ClientsPage() {
  const { db, clients, manager } = useMyManager();

  return (
    <Columns {...rails.managerMain}>
      <Card title="Your clients" action={<Pill label={`${clients.length} of ${manager?.maxClients ?? 10} places used`}>{clients.length} of {manager?.maxClients ?? 10}</Pill>}>
        <ul className="flex flex-col gap-3">
          {clients.map((c) => {
            const u = db.users.find((x) => x.id === c.userId);
            const b = statusBadge[c.status];
            const next = db.managerTasks.filter((t) => t.clientId === c.id && t.column !== "done" && t.group !== "waiting").sort((a, z) => a.dueAt.localeCompare(z.dueAt))[0];
            const week = db.progress.find((p) => p.clientId === c.id);
            const done = week ? week.posts.done + week.comments.done + week.connections.done : 0;
            const target = week ? week.posts.target + week.comments.target + week.connections.target : 0;
            return (
              <li key={c.id}>
                <Tile href={`/manager/clients/${c.id}`}>
                  <span className="flex items-start gap-3">
                    <Avatar name={fullName(u)} src={u?.photo} size="lg" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-body font-medium text-primary">{fullName(u)}</span>
                        <Badge status={b.tone}>{b.label}</Badge>
                      </span>
                      <span className="text-body-sm text-secondary">{u?.title}</span>
                      {week && (
                        <span className="flex max-w-xs flex-col gap-1 pt-1">
                          <span className="text-caption text-secondary">
                            This week: {done} of {target}
                          </span>
                          <ProgressBar value={done} max={target} />
                        </span>
                      )}
                    </span>
                  </span>
                  {c.atRisk && <Banner tone="warning">{c.atRisk}</Banner>}
                  <TileFooter>
                    <Meta icon={CalendarBlank}>{next ? `${next.title}, due ${dayTimeIn(next.dueAt)}` : "Nothing due from you"}</Meta>
                    <TileAction>Open</TileAction>
                  </TileFooter>
                </Tile>
              </li>
            );
          })}
        </ul>
      </Card>
    </Columns>
  );
}
