"use client";

import { Clock, VideoCamera } from "@phosphor-icons/react";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Banner, Button, buttonClass, Card, EmptyState, Meta, Pill, TextButton, TextLink, Tile, TileFooter, useConfirm, useTask } from "@/components/ui";
import { day, fullName, plural, time } from "@/lib/format";
import { act, useMyManager, type Call } from "@/lib/mock";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const parts = [
  { key: "morning", label: "Morning", time: "9am to 12pm" },
  { key: "afternoon", label: "Afternoon", time: "1pm to 5pm" },
  { key: "evening", label: "Evening", time: "5pm to 7pm" },
];
const kind = { goals: "Goals call", strategy: "Strategy call", "check-in": "Check-in" };

/** M10 Calls and availability: booked calls by day, open slots like a calendar, and rescheduling from your side. */
export default function CallsPage() {
  const { db, manager, user } = useMyManager();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [slots, setSlots] = useState<string[]>(manager?.slots ?? []);
  const calls = db.calls.filter((c) => c.managerId === manager?.id && c.status === "booked").sort((a, b) => a.at.localeCompare(b.at));
  const byDay = calls.reduce<Record<string, Call[]>>((acc, c) => {
    (acc[day(c.at)] ??= []).push(c);
    return acc;
  }, {});
  const toggle = (k: string) => setSlots((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const clientName = (c: Call) => fullName(db.users.find((u) => u.id === db.clients.find((x) => x.id === c.clientId)?.userId));

  return (
    <Columns {...rails.managerSettings}>
      <Card title="Booked calls" action={calls.length > 0 && <Pill>{plural(calls.length, "call")}</Pill>}>
        {calls.length ? (
          <div className="flex flex-col gap-6">
            {Object.entries(byDay).map(([d, list]) => (
              <section key={d} className="flex flex-col gap-3">
                <h3 className="text-body font-medium text-primary">{d}</h3>
                <ul className="flex flex-col gap-3">
                  {list.map((c) => (
                    <li key={c.id}>
                      <Tile>
                        <span className="flex items-start gap-3">
                          <Avatar name={clientName(c)} size="md" />
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="text-body font-medium text-primary">
                              {clientName(c)}, {kind[c.kind].toLowerCase()}
                            </span>
                            <span className="text-body-sm text-secondary">{c.recording ? "Recorded with consent." : "Not recorded: take notes."}</span>
                          </span>
                        </span>
                        <TileFooter>
                          <Meta icon={Clock}>{time(c.at)} · 30 min</Meta>
                          <span className="flex flex-wrap items-center gap-4">
                            <TextLink href={`/manager/clients/${c.clientId}/onboard`} className="text-body-sm">
                              Prep notes
                            </TextLink>
                            <TextButton
                              onClick={() =>
                                confirm({
                                  title: "Reschedule this call?",
                                  body: `${clientName(c)} is told at once and picks a new time from your open slots.`,
                                  warning: "Only reschedule when you really have to. Clients plan around these calls, and it counts on your record.",
                                  confirmLabel: "Ask client to pick a new time",
                                  action: () => act.rescheduleCall(c.id),
                                  success: `${clientName(c)} has been asked to pick a new time.`,
                                })
                              }
                            >
                              Reschedule
                            </TextButton>
                            <a href={c.meetUrl} className={buttonClass("secondary", "sm")}>
                              <VideoCamera className="size-4" aria-hidden /> Join
                            </a>
                          </span>
                        </TileFooter>
                      </Tile>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState title="No calls booked">Clients book inside your open slots. New bookings appear here.</EmptyState>
        )}
      </Card>

      <Card title="Open call slots">
        <div className="flex flex-col gap-4">
          <Banner tone="info" closeKey="manager-slots-note">
            Clients can only book inside these times, in your time zone ({user?.timeZone.replace("_", " ")}). Once a client books, you attend or reschedule from your side.
          </Banner>
          <div className="flex flex-col gap-2">
            {days.map((d) => (
              <div key={d} className="flex items-center gap-3">
                <span className="w-10 text-body-sm font-medium text-primary">{d}</span>
                <div className="grid flex-1 grid-cols-3 gap-2">
                  {parts.map((p) => {
                    const k = `${d.toLowerCase()}-${p.key}`;
                    const on = slots.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={on}
                        aria-label={`${d} ${p.label}, ${p.time}`}
                        onClick={() => toggle(k)}
                        className={`rounded-sm border px-2 py-2 text-caption focus-visible:focus-ring ${on ? "border-primary-600 bg-primary-50 text-primary-700" : "border-border-strong bg-card text-secondary hover:border-primary-300"}`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Button
            className="self-start"
            disabled={!slots.length || slots.join() === (manager?.slots ?? []).join()}
            loading={pending("slots")}
            onClick={() => manager && run("slots", () => act.setSlots(manager.id, slots), "Slots saved. Clients see the new times now.")}
          >
            {pending("slots") ? "Saving" : "Save slots"}
          </Button>
          {!slots.length && <Banner tone="danger">Open at least one slot, so clients can book their calls.</Banner>}
        </div>
      </Card>
    </Columns>
  );
}
