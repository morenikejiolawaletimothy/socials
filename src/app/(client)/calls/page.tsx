"use client";

import { Robot, Timer } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { AddToCalendar } from "@/components/calls/AddToCalendar";
import { CallDetails } from "@/components/calls/CallDetails";
import { ClientCallActions } from "@/components/calls/ClientCallActions";
import { availableTimes, takenTimes } from "@/components/calls/TimePicker";
import { Columns } from "@/components/layout/Columns";
import { ManagerCard } from "@/components/rails/ManagerCard";
import { callTitle, upcomingCalls } from "@/components/rails/NextCallCard";
import { Badge, Card, Meta, Segmented, TextLink, textActionClass, Tile } from "@/components/ui";
import { date, dayTimeIn, time } from "@/lib/format";
import { useData, useMyClient, type Call } from "@/lib/mock";

type Tab = "upcoming" | "requests" | "past";

export default function CallsPage() {
  const { calls, manager, managerUser } = useMyClient();
  const allCalls = useData().calls;
  const [now] = useState(() => Date.now());
  const mgrFirst = managerUser?.firstName ?? "your manager";
  const times = useMemo(
    () => (manager ? availableTimes(manager.slots ?? [], now, takenTimes(allCalls, manager.id)) : []),
    [manager, allCalls, now],
  );

  const needsReply = calls.filter((c) => c.status === "pending" && c.pending?.awaiting === "client");
  const waiting = calls.filter((c) => c.status === "pending" && c.pending?.awaiting === "manager");
  const upcoming = upcomingCalls(calls).filter((c) => c.status === "booked");
  const past = calls.filter((c) => c.status === "done" || c.status === "cancelled").sort((a, b) => b.at.localeCompare(a.at));
  const requests = [...needsReply, ...waiting].sort((a, b) => a.at.localeCompare(b.at));

  const [picked, setPicked] = useState<Tab | null>(null);
  const tab = picked ?? (needsReply.length ? "requests" : "upcoming");
  const botLine = (c: Call) => <Meta icon={Robot}>{c.recording ? "Notetaker bot will join" : "No bot: your manager takes notes"}</Meta>;

  return (
    <Columns right={<ManagerCard />} rightLabel="Your manager">
      <Card padding="sm">
        <div className="p-2">
          <Segmented<Tab>
            label="Calls"
            value={tab}
            onChange={setPicked}
            options={[
              { value: "upcoming", label: "Upcoming" },
              { value: "requests", label: requests.length ? `Requests (${requests.length})` : "Requests" },
              { value: "past", label: "Past" },
            ]}
          />
        </div>
      </Card>

      {tab === "upcoming" && (
        <Card title="Upcoming calls" action={<TextLink href="/calls/book">Book a call</TextLink>}>
          {upcoming.length ? (
            <ul className="flex flex-col gap-3">
              {upcoming.map((c) => (
                <li key={c.id}>
                  <Tile>
                    <div className="flex flex-col gap-2">
                      <span className="text-body font-medium text-primary">{callTitle(c)}</span>
                      <Meta icon={Timer}>{dayTimeIn(c.at)} · {c.minutes} min</Meta>
                      {c.agenda && <p className="line-clamp-1 text-body-sm text-secondary">{c.agenda}</p>}
                      {botLine(c)}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                      <AddToCalendar event={{ title: callTitle(c), start: c.at, minutes: c.minutes, url: c.meetUrl, description: "Bluecut Socials." }} />
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {c.meetUrl && <a href={c.meetUrl} target="_blank" rel="noreferrer" className={textActionClass}>Join call</a>}
                        <ClientCallActions call={c} times={times} managerName={mgrFirst} />
                      </span>
                    </div>
                  </Tile>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">No calls booked yet. Book a check-in with your account manager whenever you need one.</p>
          )}
        </Card>
      )}

      {tab === "requests" && (
        <Card title="Requests" action={<TextLink href="/calls/book">Book a call</TextLink>}>
          {requests.length ? (
            <ul className="flex flex-col gap-3">
              {requests.map((c) => (
                <li key={c.id}>
                  <Tile>
                    <div className="flex flex-col gap-1">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-body font-medium text-primary">{callTitle(c)}</span>
                        <Badge status={c.pending?.awaiting === "client" ? "warning" : "info"}>{c.pending?.awaiting === "client" ? "Your reply" : `Waiting for ${mgrFirst}`}</Badge>
                      </span>
                      {c.agenda && <span className="line-clamp-1 text-body-sm text-secondary">{c.agenda}</span>}
                    </div>
                    <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                      <Meta icon={Timer}>{(c.pending?.options ?? [c.at]).map(dayTimeIn).join(" · ")}</Meta>
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <ClientCallActions call={c} times={times} managerName={mgrFirst} />
                        <CallDetails call={c} who={c.openedBy === "manager" ? mgrFirst : "You"} />
                      </span>
                    </div>
                  </Tile>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">No requests in flight. Book a call and it shows here until you and your manager agree a time.</p>
          )}
        </Card>
      )}

      {tab === "past" && (
        <Card title="Past calls">
          {past.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {past.map((c) => (
                <li key={c.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-body font-medium text-primary">{callTitle(c)}</span>
                    <span className="text-caption text-secondary">{c.status === "cancelled" ? "Cancelled" : `${date(c.at)}, ${time(c.at)}`}</span>
                  </span>
                  {c.outcome === "missed" && <p className="text-body-sm text-secondary">Did not hold{c.outcomeNote ? `: ${c.outcomeNote}` : "."}</p>}
                  {c.sharedAt && c.insights && (
                    <div className="flex flex-col gap-2">
                      <p className="text-body-sm text-secondary">{c.insights}</p>
                      {c.transcript && (
                        <details className="text-body-sm">
                          <summary className="cursor-pointer font-medium text-primary-700 hover:underline focus-visible:focus-ring">Read transcript</summary>
                          <p className="mt-2 whitespace-pre-line rounded-md bg-neutral-25 p-3 text-secondary">{c.transcript}</p>
                        </details>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">No past calls yet.</p>
          )}
        </Card>
      )}
    </Columns>
  );
}
