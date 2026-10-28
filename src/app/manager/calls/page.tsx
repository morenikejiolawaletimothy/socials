"use client";

import { VideoCamera } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Button, Card, Dialog, useToast } from "@/components/ui";
import { day, fullName, time } from "@/lib/format";
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
  const toast = useToast();
  const [slots, setSlots] = useState<string[]>(manager?.slots ?? []);
  const [moving, setMoving] = useState<Call | null>(null);
  const calls = db.calls.filter((c) => c.managerId === manager?.id && c.status === "booked").sort((a, b) => a.at.localeCompare(b.at));
  const byDay = calls.reduce<Record<string, Call[]>>((acc, c) => {
    (acc[day(c.at)] ??= []).push(c);
    return acc;
  }, {});
  const toggle = (k: string) => setSlots((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const clientName = (c: Call) => fullName(db.users.find((u) => u.id === db.clients.find((x) => x.id === c.clientId)?.userId));

  return (
    <Columns {...rails.managerSettings}>
      <Card title="Booked calls">
        {calls.length ? (
          <div className="flex flex-col gap-6">
            {Object.entries(byDay).map(([d, list]) => (
              <section key={d} className="flex flex-col gap-3">
                <h3 className="text-body-sm font-medium text-secondary">{d}</h3>
                <ul className="flex flex-col gap-3">
                  {list.map((c) => (
                    <li key={c.id} className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center">
                      <Avatar name={clientName(c)} size="md" />
                      <span className="flex flex-1 flex-col">
                        <span className="text-body font-medium text-primary">
                          {time(c.at)}, {clientName(c)}
                        </span>
                        <span className="text-body-sm text-secondary">
                          {kind[c.kind]}, 30 minutes. {c.recording ? "Recorded." : "Not recorded: take notes."}
                        </span>
                      </span>
                      <span className="flex flex-wrap gap-4">
                        <Link href={`/manager/clients/${c.clientId}/onboard`} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                          Prep
                        </Link>
                        <a href={c.meetUrl} className="inline-flex items-center gap-1 rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                          <VideoCamera className="size-4" aria-hidden /> Join
                        </a>
                        <button type="button" onClick={() => setMoving(c)} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                          Reschedule
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-secondary">No calls booked.</p>
        )}
      </Card>

      <Card title="Open call slots">
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-secondary">
            Clients can only book inside these times, in your time zone ({user?.timeZone.replace("_", " ")}). Once a client books, you attend or reschedule from your side.
          </p>
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
            onClick={async () => {
              if (manager) await act.setSlots(manager.id, slots);
              toast("Slots saved. Clients see the new times now.");
            }}
          >
            Save slots
          </Button>
        </div>
      </Card>

      <Dialog open={!!moving} onClose={() => setMoving(null)} title="Reschedule this call?">
        <p className="text-body text-secondary">
          {moving && `${clientName(moving)} is told at once and picks a new time from your open slots. Only reschedule when you really have to: clients plan around these calls.`}
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setMoving(null)}>
            Keep the call
          </Button>
          <Button
            onClick={() => {
              setMoving(null);
              toast("The client has been asked to pick a new time.");
            }}
          >
            Ask client to pick a new time
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
