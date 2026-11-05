"use client";

import { CaretLeft, CaretRight, Clock } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { quietLink } from "@/components/rails/NextCallCard";
import { Avatar, Badge, Banner, Button, Card, EmptyState, IconButton, Meta, Pill, Segmented, TextButton, textActionClass, Tile, TileFooter, useConfirm, useTask } from "@/components/ui";
import { dateTime, day, fullName, plural } from "@/lib/format";
import { act, useMyManager, type Call } from "@/lib/mock";
import { dateKey, dayParts, slotKey, weeklyToDates } from "@/lib/slots";

const weekHeads = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** How far ahead a manager can open times: 8 weeks. */
const AHEAD = 56;
const DAY = 86_400_000;
const kind = { goals: "Goals call", strategy: "Strategy call", "check-in": "Check-in" };

const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const longDay = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;

/**
 * M10 open slots: pick a date on the calendar, then the times on that date.
 * Dates with open times carry a blue dot. Times sit in Morning, Afternoon and Evening rows.
 */
function OpenSlots({ slots, setSlots }: { slots: string[]; setSlots: React.Dispatch<React.SetStateAction<string[]>> }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const first = new Date(today.getTime() + DAY);
  const last = new Date(today.getTime() + AHEAD * DAY);
  const firstOpen = [...slots].sort()[0];
  const [selected, setSelected] = useState(() => (firstOpen ? firstOpen.slice(0, 10) : dateKey(first)));
  const [month, setMonth] = useState(() => {
    const d = fromKey(selected);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const openDays = new Set(slots.map((s) => s.slice(0, 10)));
  const selectedDate = fromKey(selected);
  const dayTimes = slots.filter((s) => s.startsWith(selected));
  const toggle = (k: string) => setSlots((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  // Calendar grid: weeks start on Monday; blanks before the 1st.
  const lead = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const canPrev = month.getTime() > new Date(first.getFullYear(), first.getMonth(), 1).getTime();
  const canNext = month.getTime() < new Date(last.getFullYear(), last.getMonth(), 1).getTime();
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  // Same times on this weekday for the rest of the 8 weeks.
  const repeatWeekly = () => {
    const hours = dayTimes.map((s) => Number(s.slice(11)));
    setSlots((s) => {
      const next = new Set(s);
      for (let d = new Date(selectedDate.getTime() + 7 * DAY); d <= last; d = new Date(d.getTime() + 7 * DAY)) {
        const k = dateKey(d);
        for (const x of [...next]) if (x.startsWith(k)) next.delete(x);
        for (const h of hours) next.add(slotKey(d, h));
      }
      return [...next];
    });
  };
  const weekday = selectedDate.toLocaleDateString("en-GB", { weekday: "long" });

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* 1. The date */}
      <section className="flex flex-col gap-3" aria-labelledby="slots-date">
        <div className="flex items-center justify-between gap-2">
          <h3 id="slots-date" className="text-body font-semibold text-primary">
            {month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </h3>
          <span className="flex items-center gap-1">
            <IconButton icon={CaretLeft} label="Previous month" disabled={!canPrev} onClick={() => shift(-1)} />
            <IconButton icon={CaretRight} label="Next month" disabled={!canNext} onClick={() => shift(1)} />
          </span>
        </div>
        <div className="rounded-md border border-border p-3">
          <div className="grid grid-cols-7 gap-1 pb-2">
            {weekHeads.map((w) => (
              <span key={w} className="text-center text-caption text-secondary">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={`b${i}`} />;
              const k = dateKey(d);
              const out = d < first || d > last;
              const isSel = k === selected;
              const open = openDays.has(k);
              return (
                <button
                  key={k}
                  type="button"
                  disabled={out}
                  aria-pressed={isSel}
                  aria-label={`${longDay(d)}${open ? ", has open times" : ""}`}
                  onClick={() => setSelected(k)}
                  className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md text-body-sm transition-colors focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-neutral-300 ${
                    isSel ? "bg-primary-600 font-semibold text-inverse" : "text-primary hover:bg-primary-50"
                  }`}
                >
                  {d.getDate()}
                  <span className={`size-1 rounded-full ${open ? (isSel ? "bg-card" : "bg-primary-600") : "bg-transparent"}`} aria-hidden />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. The times on that date */}
      <section className="flex flex-col gap-3" aria-labelledby="slots-times">
        <div className="flex min-h-9 items-center justify-between gap-2">
          <h3 id="slots-times" className="text-body font-semibold text-primary">
            {longDay(selectedDate)}
          </h3>
          <span className="text-body-sm text-secondary">{plural(dayTimes.length, "time")} open</span>
        </div>
        <div className="flex flex-col divide-y divide-border rounded-md border border-border">
          {dayParts.map((p) => (
            <div key={p.key} className="flex flex-col gap-2 p-3">
              <span className="text-body-sm font-medium text-primary">{p.label}</span>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {p.hours.map((h) => {
                  const k = slotKey(selectedDate, h);
                  const on = slots.includes(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${longDay(selectedDate)}, ${hourLabel(h)}`}
                      onClick={() => toggle(k)}
                      className={`min-h-10 rounded-md border px-2 text-body-sm font-medium transition-colors focus-visible:focus-ring ${
                        on ? "border-primary-600 bg-primary-600 text-inverse" : "border-border-strong bg-card text-primary-700 hover:border-primary-300 hover:bg-primary-50"
                      }`}
                    >
                      {hourLabel(h)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <TextButton disabled={!dayTimes.length} onClick={repeatWeekly}>
            Same times every {weekday}
          </TextButton>
          <TextButton disabled={!dayTimes.length} onClick={() => setSlots((s) => s.filter((x) => !x.startsWith(selected)))}>
            Clear this day
          </TextButton>
        </div>
      </section>
    </div>
  );
}

/** M10 Calls and availability: booked calls by day, open slots like a calendar, and rescheduling from your side. */
export default function CallsPage() {
  const { db, manager, user } = useMyManager();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  // Open times as calendar slots ("2026-11-12T10"). A weekly pattern from sign-up is spread over the next 8 weeks.
  const [saved, setSaved] = useState<string[]>(() => weeklyToDates(manager?.slots ?? [], Date.now(), AHEAD));
  const [slots, setSlots] = useState<string[]>(saved);
  const [view, setView] = useState<"booked" | "slots">("booked");
  const calls = db.calls.filter((c) => c.managerId === manager?.id && c.status === "booked").sort((a, b) => a.at.localeCompare(b.at));
  const byDay = calls.reduce<Record<string, Call[]>>((acc, c) => {
    (acc[day(c.at)] ??= []).push(c);
    return acc;
  }, {});
  const clientName = (c: Call) => fullName(db.users.find((u) => u.id === db.clients.find((x) => x.id === c.clientId)?.userId));

  return (
    <Columns {...rails.managerSettings}>
      {/* Same switch as the manager home (Feed / Board): one card at a time. */}
      <Card padding="sm">
        <div className="p-2">
          <Segmented
            label="Calls view"
            value={view}
            onChange={setView}
            options={[
              { value: "booked", label: "Booked" },
              { value: "slots", label: "Open slots" },
            ]}
          />
        </div>
      </Card>

      {view === "booked" ? (
      <Card title="Booked calls" action={calls.length > 0 && <Pill>{plural(calls.length, "call")}</Pill>}>
        {calls.length ? (
          <div className="flex flex-col gap-6">
            {Object.entries(byDay).map(([d, list]) => (
              <section key={d} className="flex flex-col gap-3">
                <h3 className="text-body font-medium text-primary">{d}</h3>
                <ul className="flex flex-col gap-3">
                  {list.map((c) => (
                    <li key={c.id}>
                      {/* As on the client's calls card: the whole tile opens the Meet link (a covering link); the footer actions sit above it. */}
                      <Tile className="group relative transition-colors hover:border-primary-300 hover:bg-primary-50">
                        <a
                          href={c.meetUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Join the ${kind[c.kind].toLowerCase()} with ${clientName(c)} on Google Meet`}
                          className="absolute inset-0 rounded-md focus-visible:focus-ring"
                        />
                        <div className="flex items-start gap-4">
                          <Avatar name={clientName(c)} size="md" />
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-body font-medium text-primary">
                                {kind[c.kind]} with {clientName(c)}
                              </span>
                              {c.recording ? (
                                <Badge status="info">
                                  Record<span className="sr-only">: recorded with the client&apos;s consent</span>
                                </Badge>
                              ) : (
                                <Badge>
                                  Don&apos;t record<span className="sr-only">: not recorded, take notes</span>
                                </Badge>
                              )}
                            </span>
                            <span className="text-body-sm text-secondary">{c.recording ? "Recorded with the client's consent." : "Not recorded. Take notes during the call."}</span>
                          </div>
                        </div>
                        <TileFooter>
                          <Meta icon={Clock}>{dateTime(c.at)} · {c.minutes} min</Meta>
                          <span className="relative z-10 flex flex-wrap items-center gap-4">
                            <a href={c.meetUrl} target="_blank" rel="noreferrer" className={textActionClass}>
                              Join call
                            </a>
                            <Link href={`/manager/clients/${c.clientId}/onboard`} className={quietLink}>
                              Prep notes
                            </Link>
                            <button
                              type="button"
                              className={quietLink}
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
                            </button>
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
      ) : (
      <Card title="Open call slots" info={`Clients can only book inside these times, in your time zone (${user?.timeZone.replace("_", " ")}). Once a client books, you attend or reschedule from your side.`}>
        <OpenSlots slots={slots} setSlots={setSlots} />
        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6">
          {!slots.length && <Banner tone="danger">Open at least one time, so clients can book their calls.</Banner>}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-body-sm text-secondary">
              {plural(slots.length, "open time")} on {plural(new Set(slots.map((s) => s.slice(0, 10))).size, "day")}
            </span>
            <Button
              disabled={!slots.length || [...slots].sort().join() === saved.join()}
              loading={pending("slots")}
              onClick={async () => {
                const next = [...slots].sort();
                if (manager && (await run("slots", () => act.setSlots(manager.id, next), "Slots saved. Clients see the new times now."))) setSaved(next);
              }}
            >
              {pending("slots") ? "Saving" : "Save slots"}
            </Button>
          </div>
        </div>
      </Card>
      )}
    </Columns>
  );
}
