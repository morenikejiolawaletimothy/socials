"use client";

import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Badge, Card, Pill, ProgressBar, Tile } from "@/components/ui";
import { fullName } from "@/lib/format";
import { useMyManager } from "@/lib/mock";
import { statusBadge } from "@/lib/status";

/**
 * How this week is going. Compares what is done with what should be done by today (the week runs Monday
 * to Sunday), so 10 of 20 on a Wednesday is on track and on a Sunday is behind. Sets the bar colour.
 */
function pace(done: number, target: number) {
  const day = (new Date().getDay() + 6) % 7; // Monday 0 … Sunday 6
  const expected = (target * (day + 1)) / 7;
  const ratio = expected > 0 ? done / expected : 1;
  return ratio >= 0.9 ? { label: "On track", tone: "success" as const } : { label: "Behind", tone: "warning" as const };
}

/** M2 Clients: one card per client with status and how this week is going. Tasks live on Home. */
export default function ClientsPage() {
  const { db, clients, manager } = useMyManager();

  return (
    <Columns {...rails.managerMain}>
      <Card title="Your clients" action={<Pill label={`${clients.length} of ${manager?.maxClients ?? 10} places used`}>{clients.length} of {manager?.maxClients ?? 10}</Pill>}>
        <ul className="flex flex-col gap-3">
          {clients.map((c) => {
            const u = db.users.find((x) => x.id === c.userId);
            const b = statusBadge[c.status];
            const week = db.progress.find((p) => p.clientId === c.id);
            const done = week ? week.posts.done + week.comments.done + week.connections.done : 0;
            const target = week ? week.posts.target + week.comments.target + week.connections.target : 0;
            const p = pace(done, target);
            return (
              <li key={c.id}>
                {/* The whole tile opens the client: photo, name and title with status on the right, then how this week is going under a line. */}
                <Tile href={`/manager/clients/${c.id}`}>
                  <div className="flex items-center gap-4">
                    <Avatar name={fullName(u)} src={u?.photo} size="lg" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-body font-medium text-primary">{fullName(u)}</span>
                      {u?.title && <span className="truncate text-body-sm text-secondary">{u.title}</span>}
                    </div>
                    <Badge status={b.tone}>{b.label}</Badge>
                  </div>
                  {week && target > 0 && (
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-body-sm group-hover:border-primary-200">
                      <span className="text-secondary">This week</span>
                      <span className="flex items-center gap-3">
                        <span className="w-20 sm:w-28">
                          <ProgressBar value={done} max={target} tone={p.tone} />
                        </span>
                        <span className="font-medium text-primary">
                          {done} of {target}
                          <span className="sr-only"> done, {p.label.toLowerCase()}</span>
                        </span>
                      </span>
                    </div>
                  )}
                </Tile>
              </li>
            );
          })}
        </ul>
      </Card>
    </Columns>
  );
}
