"use client";

import { Clock, VideoCamera } from "@phosphor-icons/react";
import Link from "next/link";
import { Meta, textActionClass } from "@/components/ui";
import { day, fullName, time } from "@/lib/format";
import { useMyManager, type Call } from "@/lib/mock";
import { CallsCarousel, callTitle, quietLink, upcomingCalls } from "./NextCallCard";

/** Right-column card on manager pages: the same Upcoming calls carousel as the client's, with Join call and Prep notes. */
export function CallsCard() {
  const { db, manager } = useMyManager();
  const upcoming = upcomingCalls(db.calls.filter((c) => c.managerId === manager?.id));
  const clientName = (c: Call) => {
    const cl = db.clients.find((x) => x.id === c.clientId);
    return fullName(db.users.find((x) => x.id === cl?.userId));
  };

  return (
    <CallsCarousel
      calls={upcoming}
      viewAllHref="/manager/calls"
      renderCall={(c) => (
        <div className="flex flex-col gap-2">
          <span className="text-body font-medium text-primary">
            {callTitle(c)} with {clientName(c)}
          </span>
          <Meta icon={Clock}>
            {day(c.at)} · {time(c.at)} · {c.minutes} min
          </Meta>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href={c.meetUrl} target="_blank" rel="noreferrer" className={textActionClass}>
              <VideoCamera className="size-4" aria-hidden />
              Join call
            </a>
            <Link href={`/manager/clients/${c.clientId}/onboard`} className={quietLink}>
              Prep notes
            </Link>
          </span>
        </div>
      )}
    />
  );
}
