"use client";

import { AddToCalendar } from "@/components/calls/AddToCalendar";
import { Columns } from "@/components/layout/Columns";
import { ManagerCard } from "@/components/rails/ManagerCard";
import { CallRow, callTitle, upcomingCalls } from "@/components/rails/NextCallCard";
import { Card, Tile } from "@/components/ui";
import { date, time } from "@/lib/format";
import { useMyClient } from "@/lib/mock";

/** Client Calls: every call with the account manager. Upcoming ones to join or move, then past ones with their notes. */
export default function CallsPage() {
  const { calls } = useMyClient();
  const upcoming = upcomingCalls(calls);
  const past = calls.filter((c) => !upcoming.includes(c)).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <Columns right={<ManagerCard />} rightLabel="Your manager">
      <Card title="Upcoming calls">
        {upcoming.length ? (
          <ul className="flex flex-col gap-3">
            {upcoming.map((c) => (
              <li key={c.id}>
                <Tile>
                  <CallRow call={c} />
                  <div className="mt-3 border-t border-border pt-3">
                    <AddToCalendar event={{ title: callTitle(c), start: c.at, minutes: c.minutes, url: c.meetUrl, description: "Bluecut Socials." }} />
                  </div>
                </Tile>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">No calls booked. When your account manager books a call with you, it shows here.</p>
        )}
      </Card>

      {past.length > 0 && (
        <Card title="Past calls">
          <ul className="flex flex-col divide-y divide-border">
            {past.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-body font-medium text-primary">{callTitle(c)}</span>
                  <span className="text-caption text-secondary">{c.status === "cancelled" ? "Cancelled" : `${date(c.at)}, ${time(c.at)}`}</span>
                </span>
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
        </Card>
      )}
    </Columns>
  );
}
