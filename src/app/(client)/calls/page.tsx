"use client";

import { Robot, Timer } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { AddToCalendar } from "@/components/calls/AddToCalendar";
import { availableTimes, takenTimes } from "@/components/calls/TimePicker";
import { TimeDialog } from "@/components/calls/TimeDialog";
import { Columns } from "@/components/layout/Columns";
import { ManagerCard } from "@/components/rails/ManagerCard";
import { CallRow, callTitle, upcomingCalls } from "@/components/rails/NextCallCard";
import { Badge, Banner, Button, Card, Meta, TextButton, TextLink, textActionClass, Tile, TileFooter, useConfirm, useTask } from "@/components/ui";
import { date, dayTimeIn, time } from "@/lib/format";
import { act, useData, useMyClient, type Call } from "@/lib/mock";

export default function CallsPage() {
  const { calls, manager, managerUser } = useMyClient();
  const allCalls = useData().calls;
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [now] = useState(() => Date.now());
  const [reschedule, setReschedule] = useState<Call | null>(null);

  const mgrFirst = managerUser?.firstName ?? "your manager";
  const times = useMemo(
    () => (manager ? availableTimes(manager.slots ?? [], now, takenTimes(allCalls, manager.id, reschedule?.id)) : []),
    [manager, allCalls, now, reschedule],
  );

  // Lifecycle buckets.
  const needsReply = calls.filter((c) => c.status === "pending" && c.pending?.awaiting === "client");
  const waiting = calls.filter((c) => c.status === "pending" && c.pending?.awaiting === "manager");
  const upcoming = upcomingCalls(calls).filter((c) => c.status === "booked");
  const past = calls.filter((c) => c.status === "done" || c.status === "cancelled").sort((a, b) => b.at.localeCompare(a.at));

  const botLine = (c: Call) => (
    <Meta icon={Robot}>{c.recording ? "Notetaker bot will join" : "No bot: your manager takes notes"}</Meta>
  );

  return (
    <Columns right={<ManagerCard />} rightLabel="Your manager">
      {needsReply.length > 0 && (
        <Card title="Needs your reply" action={<Badge status="warning">{needsReply.length}</Badge>}>
          <ul className="flex flex-col gap-3">
            {needsReply.map((c) => (
              <li key={c.id}>
                <Tile>
                  <div className="flex flex-col gap-1">
                    <span className="text-body font-medium text-primary">{callTitle(c)}</span>
                    {c.agenda && <span className="text-body-sm text-secondary">{c.agenda}</span>}
                  </div>
                  <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                    <Meta icon={Timer}>{c.openedBy === "manager" ? `${mgrFirst} proposed ${dayTimeIn(c.at)}` : `New time: ${dayTimeIn(c.at)}`}</Meta>
                    {botLine(c)}
                    {c.pending?.note && <Banner tone="neutral">{mgrFirst}: {c.pending.note}</Banner>}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" loading={pending(`accept-${c.id}`)} onClick={() => run(`accept-${c.id}`, () => act.acceptCall(c.id), "Call accepted.")}>
                        Accept {dayTimeIn(c.at)}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setReschedule(c)}>
                        Suggest another time
                      </Button>
                      <Button
                        size="sm"
                        variant="remove"
                        onClick={() =>
                          confirm({
                            title: `Decline “${callTitle(c)}”?`,
                            body: `${mgrFirst} will be told you turned down this call. You can book another any time.`,
                            confirmLabel: "Decline call",
                            tone: "danger",
                            action: () => act.declineCall(c.id, "client", ""),
                            success: "Call declined.",
                          })
                        }
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </Tile>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Upcoming calls" action={<TextLink href="/calls/book">Book a call</TextLink>}>
        {upcoming.length ? (
          <ul className="flex flex-col gap-3">
            {upcoming.map((c) => (
              <li key={c.id}>
                <Tile>
                  {c.kind === "check-in" ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-body font-medium text-primary">{callTitle(c)}</span>
                      <Meta icon={Timer}>{dayTimeIn(c.at)} · {c.minutes} min</Meta>
                      {c.agenda && <p className="text-body-sm text-secondary">{c.agenda}</p>}
                      {botLine(c)}
                    </div>
                  ) : (
                    <CallRow call={c} />
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <AddToCalendar event={{ title: callTitle(c), start: c.at, minutes: c.minutes, url: c.meetUrl, description: "Bluecut Socials." }} />
                    {c.kind === "check-in" && (
                      <span className="flex items-center gap-3">
                        {c.meetUrl && (
                          <a href={c.meetUrl} target="_blank" rel="noreferrer" className={textActionClass}>Join call</a>
                        )}
                        <TextButton onClick={() => setReschedule(c)}>Change time</TextButton>
                        <TextButton
                          onClick={() =>
                            confirm({
                              title: `Cancel “${callTitle(c)}”?`,
                              body: `${mgrFirst} will be told. You can book another any time.`,
                              confirmLabel: "Cancel call",
                              tone: "danger",
                              action: () => act.declineCall(c.id, "client", ""),
                              success: "Call cancelled.",
                            })
                          }
                        >
                          Cancel
                        </TextButton>
                      </span>
                    )}
                  </div>
                </Tile>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">No calls booked yet. Book a check-in with your account manager whenever you need one.</p>
        )}
      </Card>

      {waiting.length > 0 && (
        <Card title="Waiting to confirm">
          <ul className="flex flex-col gap-3">
            {waiting.map((c) => (
              <li key={c.id}>
                <Tile>
                  <div className="flex flex-col gap-1">
                    <span className="text-body font-medium text-primary">{callTitle(c)}</span>
                    {c.agenda && <span className="text-body-sm text-secondary">{c.agenda}</span>}
                  </div>
                  <TileFooter>
                    <Meta icon={Timer}>{dayTimeIn(c.at)}</Meta>
                    <Badge status="info">Waiting for {mgrFirst}</Badge>
                  </TileFooter>
                  <div className="mt-3 border-t border-border pt-3">
                    <TextButton
                      onClick={() =>
                        confirm({
                          title: `Cancel “${callTitle(c)}”?`,
                          body: `${mgrFirst} will be told you withdrew this request.`,
                          confirmLabel: "Cancel request",
                          tone: "danger",
                          action: () => act.declineCall(c.id, "client", ""),
                          success: "Request cancelled.",
                        })
                      }
                    >
                      Cancel request
                    </TextButton>
                  </div>
                </Tile>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {past.length > 0 && (
        <Card title="Past calls">
          <ul className="flex flex-col divide-y divide-border">
            {past.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-body font-medium text-primary">{callTitle(c)}</span>
                  <span className="text-caption text-secondary">{c.status === "cancelled" ? "Cancelled" : `${date(c.at)}, ${time(c.at)}`}</span>
                </span>
                {c.status === "cancelled" && c.cancelReason && <p className="text-body-sm text-secondary">{c.cancelReason}</p>}
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

      <TimeDialog
        open={!!reschedule}
        onClose={() => setReschedule(null)}
        times={times}
        pending={pending("suggest")}
        noteLabel="Add a note (optional)"
        onPick={async (at, note) => {
          if (!reschedule) return;
          const ok = await run("suggest", () => act.proposeCallTime(reschedule.id, "client", at, { note }), `New time suggested: ${dayTimeIn(at)}. ${mgrFirst} will confirm.`);
          if (ok) setReschedule(null);
        }}
      />
    </Columns>
  );
}
