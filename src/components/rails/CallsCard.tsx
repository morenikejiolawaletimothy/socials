"use client";

import { Clock, VideoCamera } from "@phosphor-icons/react";
import { Avatar, Card, Meta, TextLink, textActionClass } from "@/components/ui";
import { day, fullName, time } from "@/lib/format";
import { useMyManager } from "@/lib/mock";

const kind = { goals: "Goals call", strategy: "Strategy call", "check-in": "Check-in" };

/** Right-column card on manager pages: today's calls with Join and prep. */
export function CallsCard() {
  const { db, manager } = useMyManager();
  const today = db.calls.filter((c) => c.managerId === manager?.id && c.status === "booked" && day(c.at) === "Today").sort((a, b) => a.at.localeCompare(b.at));

  return (
    <Card title="Calls today" action={<TextLink href="/manager/calls" className="text-body-sm">All calls</TextLink>}>
      {today.length ? (
        <ul className="flex flex-col divide-y divide-border">
          {today.map((c) => {
            const cl = db.clients.find((x) => x.id === c.clientId);
            const u = db.users.find((x) => x.id === cl?.userId);
            return (
              <li key={c.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                <span className="flex items-center gap-3">
                  <Avatar name={fullName(u)} src={u?.photo} size="md" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-body font-medium text-primary">{fullName(u)}</span>
                    <span className="text-body-sm text-secondary">{kind[c.kind]}</span>
                  </span>
                </span>
                <Meta icon={Clock}>
                  {time(c.at)} · {c.minutes} min
                </Meta>
                <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a href={c.meetUrl} target="_blank" rel="noreferrer" className={textActionClass}>
                    <VideoCamera className="size-4" aria-hidden /> Join call
                  </a>
                  <TextLink href={`/manager/clients/${c.clientId}/onboard`} className="text-body-sm">
                    Prep notes
                  </TextLink>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-body-sm text-secondary">No calls today.</p>
      )}
    </Card>
  );
}
