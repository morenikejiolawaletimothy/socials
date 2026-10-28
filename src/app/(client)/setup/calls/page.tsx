"use client";

import { CalendarPlus, CheckCircle, VideoCamera } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SetupFrame } from "@/components/client/SetupFrame";
import { Avatar, Button } from "@/components/ui";
import { day, dayTime, fullName, time } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";

const DAY = 86_400_000;
const hours: Record<string, number[]> = { morning: [9, 10, 11], afternoon: [13, 14, 15, 16], evening: [17, 18] };
const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Bookable times for the next two weeks, from the manager's open slots (M10). */
function openTimes(slots: string[], from: number) {
  const out: string[] = [];
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  for (let d = 1; d <= 14; d++) {
    const date = new Date(start.getTime() + d * DAY);
    const wd = weekdays[date.getDay()];
    for (const s of slots.filter((x) => x.startsWith(wd))) {
      for (const h of hours[s.split("-")[1]] ?? []) {
        const t = new Date(date);
        t.setHours(h, 0, 0, 0);
        out.push(t.toISOString());
      }
    }
  }
  return out;
}

/** Times grouped by day, as a simple list of day rows with time buttons. */
function TimePicker({ times, value, onChange }: { times: string[]; value: string | null; onChange: (t: string) => void }) {
  const days = times.reduce<Record<string, string[]>>((acc, t) => {
    const k = day(t);
    (acc[k] ??= []).push(t);
    return acc;
  }, {});
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(days)
        .slice(0, 6)
        .map(([d, ts]) => (
          <div key={d} className="flex flex-col gap-2">
            <span className="text-body-sm font-medium text-primary">{d}</span>
            <div className="flex flex-wrap gap-2">
              {ts.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={value === t}
                  onClick={() => onChange(t)}
                  className={`min-h-11 rounded-md border px-4 text-body-sm font-medium transition-colors focus-visible:focus-ring ${
                    value === t ? "border-primary-600 bg-primary-600 text-inverse" : "border-border-strong bg-card text-primary-700 hover:border-primary-300 hover:bg-primary-50"
                  }`}
                >
                  {time(t)}
                </button>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

/** C3 Book your two calls: why each call matters, consent to record, two times at least 3 days apart. */
function BookCalls() {
  const router = useRouter();
  const startAt = useSearchParams().get("step") === "2" ? 2 : 0;
  const { client, user, manager, managerUser, calls } = useMyClient();
  const db = useData();
  // A client without a confirmed manager books with the manager the platform suggests (A2).
  const m = manager ?? db.managers.find((x) => x.id === "m-ada")!;
  const mu = managerUser ?? db.users.find((u) => u.id === m.userId);
  const goalsBooked = calls.find((c) => c.kind === "goals" && c.status !== "cancelled");
  const [step, setStep] = useState(startAt && goalsBooked ? 2 : 0);
  const [record, setRecord] = useState<boolean | null>(null);
  const [goals, setGoals] = useState<string | null>(goalsBooked?.at ?? null);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());
  const times = useMemo(() => openTimes(m.slots ?? [], now), [m.slots, now]);
  const gap = db.settings.daysBetweenCalls;
  const strategyTimes = goals ? times.filter((t) => new Date(t).getTime() >= new Date(goals).getTime() + gap * DAY) : [];
  if (!client || !user) return null;

  return (
    <SetupFrame title="Book your two calls" step="Book your calls" steps={["Your calls", "Goals call", "Strategy call", "Booked"]} current={step}>
      {step === 0 && (
        <div className="flex flex-col gap-6">
          {mu && (
            <div className="flex items-start gap-4 rounded-md bg-neutral-25 p-4">
              <Avatar name={fullName(mu)} size="lg" />
              <div className="flex flex-col gap-1">
                <span className="text-body font-medium text-primary">You will meet {fullName(mu)}</span>
                <span className="text-body-sm text-secondary">Your account manager, the expert who runs your account. {m.intro}</span>
              </div>
            </div>
          )}
          <ul className="flex flex-col gap-4">
            <li className="flex flex-col gap-1">
              <span className="text-body font-medium text-primary">1. Goals call, 30 minutes</span>
              <span className="text-body-sm text-secondary">We agree what you want from LinkedIn. We will ask who you want to reach, what you want to be known for, and what is off limits, so you can think ahead.</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="text-body font-medium text-primary">2. Strategy call, 30 minutes</span>
              <span className="text-body-sm text-secondary">We walk you through your strategy and content plan, and agree it. At least {gap} days after the first call, so your manager has time to prepare.</span>
            </li>
          </ul>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-body font-medium text-primary">Can we record both calls?</legend>
            <p className="mb-2 text-body-sm text-secondary">A notetaker joins and records, so nothing you say is missed. Saying no is fine: your manager takes notes instead.</p>
            {[
              { v: true, label: "Yes, record the calls" },
              { v: false, label: "No, do not record" },
            ].map((o) => (
              <label key={o.label} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${record === o.v ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                <input type="radio" name="record" checked={record === o.v} onChange={() => { setRecord(o.v); setError(undefined); }} className="size-4 accent-primary-600" />
                <span className="text-body text-primary">{o.label}</span>
              </label>
            ))}
            {error && <p className="text-body-sm text-danger">{error}</p>}
          </fieldset>
          <Button className="self-start" onClick={() => (record === null ? setError("Choose yes or no. Either is fine.") : setStep(1))}>
            Pick a time
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <p className="text-body-sm text-secondary">Times are in your time zone ({user.timeZone.replace("_", " ")}).</p>
          <TimePicker times={times} value={goals} onChange={(t) => { setGoals(t); setError(undefined); }} />
          {error && <p className="text-body-sm text-danger">{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              disabled={busy}
              onClick={async () => {
                if (!goals) return setError("Pick a time for your goals call.");
                setBusy(true);
                await act.bookCall(client.id, "goals", goals, record ?? true);
                setBusy(false);
                setStep(2);
              }}
            >
              {busy ? "Booking" : "Book goals call"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          {goals && <p className="text-body-sm text-secondary">Goals call: {dayTime(goals)}. These times are at least {gap} days later.</p>}
          {strategyTimes.length ? (
            <TimePicker times={strategyTimes} value={strategy} onChange={(t) => { setStrategy(t); setError(undefined); }} />
          ) : (
            <p className="text-body-sm text-secondary">No times are open yet. Your manager will open more soon, and we will remind you.</p>
          )}
          {error && <p className="text-body-sm text-danger">{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              disabled={busy}
              onClick={async () => {
                if (!strategy) return setError("Pick a time for your strategy call.");
                setBusy(true);
                await act.bookCall(client.id, "strategy", strategy, record ?? true);
                setBusy(false);
                setStep(3);
              }}
            >
              {busy ? "Booking" : "Book strategy call"}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-8 text-success" aria-hidden />
            <p className="font-display text-display-lg text-primary">Both calls are booked</p>
          </div>
          <ul className="flex flex-col gap-3">
            {[
              { name: "Goals call", at: goals },
              { name: "Strategy call", at: strategy },
            ].map((c) => (
              <li key={c.name} className="flex flex-col gap-2 rounded-md border border-border p-4">
                <span className="text-body font-medium text-primary">{c.name}</span>
                <span className="text-body-sm text-primary">{c.at && dayTime(c.at)}, 30 minutes</span>
                <span className="flex flex-wrap gap-4 text-body-sm">
                  <span className="inline-flex items-center gap-1 text-secondary">
                    <VideoCamera className="size-4" aria-hidden /> Google Meet link sent by email
                  </span>
                  <button type="button" className="inline-flex items-center gap-1 rounded-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                    <CalendarPlus className="size-4" aria-hidden /> Add to calendar
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-body-sm text-secondary">We remind you by email the day before and 1 hour before each call.</p>
          <Button className="self-start" onClick={() => router.push("/home")}>
            Continue setup
          </Button>
        </div>
      )}
    </SetupFrame>
  );
}

export default function Page() {
  return (
    <Suspense>
      <BookCalls />
    </Suspense>
  );
}
