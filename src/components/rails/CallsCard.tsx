"use client";

import { VideoCamera } from "@phosphor-icons/react";
import Link from "next/link";
import { Avatar, Card } from "@/components/ui";
import { day, fullName, time } from "@/lib/format";
import { useMyManager } from "@/lib/mock";

const kind = { goals: "Goals call", strategy: "Strategy call", "check-in": "Check-in" };

/** Right-column card on manager pages: today's calls with Join and prep. */
export function CallsCard() {
  const { db, manager } = useMyManager();
  const today = db.calls.filter((c) => c.managerId === manager?.id && c.status === "booked" && day(c.at) === "Today").sort((a, b) => a.at.localeCompare(b.at));

  return (
    <Card title="Calls today" action={<Link href="/manager/calls" className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">All calls</Link>}>
      {today.length ? (
        <ul className="flex flex-col gap-4">
          {today.map((c) => {
            const cl = db.clients.find((x) => x.id === c.clientId);
            const u = db.users.find((x) => x.id === cl?.userId);
            return (
              <li key={c.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Avatar name={fullName(u)} size="md" />
                  <span className="flex flex-col">
                    <span className="text-body font-medium text-primary">{fullName(u)}</span>
                    <span className="text-caption text-secondary">
                      {kind[c.kind]}, {time(c.at)}
                    </span>
                  </span>
                </div>
                <div className="flex gap-4 pl-13">
                  <a href={c.meetUrl} className="inline-flex items-center gap-1 rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                    <VideoCamera className="size-4" aria-hidden /> Join
                  </a>
                  <Link href={`/manager/clients/${c.clientId}/onboard`} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                    Prep notes
                  </Link>
                </div>
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
