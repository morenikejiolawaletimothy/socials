"use client";

import { CalendarBlank, CheckCircle, Globe } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { AddToCalendar } from "@/components/calls/AddToCalendar";
import { openTimes, TimePicker } from "@/components/calls/TimePicker";
import { SetupFrame } from "@/components/client/SetupFrame";
import { Avatar, Banner, Button, Meta, Tile, TileFooter, useTask } from "@/components/ui";
import { dayTime, dayTimeIn, fullName } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";

const DAY = 86_400_000;

/** Buttons at the foot of a step: the main action first, Back beside it, under a divider. */
function StepFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">{children}</div>;
}

/** C3 Book your two calls: why each call matters, consent to record, two times at least 3 days apart. */
function BookCalls() {
  const router = useRouter();
  const startAt = useSearchParams().get("step") === "2" ? 2 : 0;
  const { client, user, manager, managerUser, calls } = useMyClient();
  const db = useData();
  // A client without a confirmed manager books into the suggested manager's open times (A2), but never sees their name:
  // the owner may still override the suggestion. The name shows once the owner confirms.
  const m = manager ?? db.managers.find((x) => x.id === "m-ada")!;
  const mu = managerUser;
  const goalsBooked = calls.find((c) => c.kind === "goals" && c.status !== "cancelled");
  const [step, setStep] = useState(startAt && goalsBooked ? 2 : 0);
  const [record, setRecord] = useState<boolean | null>(null);
  const [goals, setGoals] = useState<string | null>(goalsBooked?.at ?? null);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const { run, pending } = useTask();
  const [now] = useState(() => Date.now());
  const times = useMemo(() => openTimes(m.slots ?? [], now), [m.slots, now]);
  const gap = db.settings.daysBetweenCalls;
  const strategyTimes = goals ? times.filter((t) => new Date(t).getTime() >= new Date(goals).getTime() + gap * DAY) : [];
  if (!client || !user) return null;

  return (
    <SetupFrame
      title="Book your two calls"
      step="Book your calls"
      steps={["Your calls", "Goals call", "Strategy call", "Booked"]}
      current={step}
      info={`${mu && manager ? "" : "We are matching you with an account manager. You will see who it is before your goals call. "}We remind you by email the day before and 1 hour before each call.`}
    >
      {step === 0 && (
        <div className="flex flex-col gap-6">
          {mu && manager && (
            <div className="flex items-start gap-4 rounded-md bg-neutral-25 p-4">
              <Avatar name={fullName(mu)} size="lg" />
              <div className="flex flex-col gap-1">
                <span className="text-body font-medium text-primary">You will meet {fullName(mu)}</span>
                <span className="text-body-sm text-secondary">Your account manager, the expert who runs your account. {manager.intro}</span>
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
          <Meta icon={Globe}>Times are in your time zone ({user.timeZone.replace("_", " ")})</Meta>
          <TimePicker times={times} value={goals} onChange={(t) => { setGoals(t); setError(undefined); }} />
          {error && <p className="text-body-sm text-danger">{error}</p>}
          <StepFooter>
            <Button
              loading={pending("goals")}
              onClick={async () => {
                if (!goals) return setError("Pick a time for your goals call.");
                if (await run("goals", () => act.bookCall(client.id, "goals", goals, record ?? true), `Goals call booked: ${dayTimeIn(goals)}.`)) setStep(2);
              }}
            >
              {pending("goals") ? "Booking" : "Book goals call"}
            </Button>
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
          </StepFooter>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          {goals && <Banner tone="neutral">Goals call: {dayTimeIn(goals)}. These times are at least {gap} days later.</Banner>}
          {strategyTimes.length ? (
            <TimePicker times={strategyTimes} value={strategy} onChange={(t) => { setStrategy(t); setError(undefined); }} />
          ) : (
            <Banner tone="info">No times are open yet. Your manager will open more soon, and we will remind you.</Banner>
          )}
          {error && <p className="text-body-sm text-danger">{error}</p>}
          <StepFooter>
            <Button
              loading={pending("strategy")}
              onClick={async () => {
                if (!strategy) return setError("Pick a time for your strategy call.");
                if (await run("strategy", () => act.bookCall(client.id, "strategy", strategy, record ?? true), "Strategy call booked. Calendar invites are on their way.")) setStep(3);
              }}
            >
              {pending("strategy") ? "Booking" : "Book strategy call"}
            </Button>
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
          </StepFooter>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-3 text-center">
            <p className="font-display text-display-lg text-primary">Both calls are booked</p>
            <CheckCircle className="size-8 shrink-0 text-success" aria-hidden />
          </div>
          <ul className="flex flex-col gap-3">
            {[
              { name: "Goals call", at: goals },
              { name: "Strategy call", at: strategy },
            ].map((c) => (
              <li key={c.name}>
                <Tile>
                  <div className="flex flex-col gap-1">
                    <span className="text-body font-medium text-primary">{c.name}</span>
                    <span className="text-body-sm text-secondary">30 minutes · Google Meet link sent by email</span>
                  </div>
                  <TileFooter>
                    {c.at && <Meta icon={CalendarBlank}>{dayTime(c.at)}</Meta>}
                    {c.at && (
                      <AddToCalendar
                        align="end"
                        event={{ title: `${c.name} with ${mu ? fullName(mu) : "your manager"}`, start: c.at, minutes: 30, description: "Bluecut Socials. Your account manager shares the Google Meet link before the call, and we email it to you." }}
                      />
                    )}
                  </TileFooter>
                </Tile>
              </li>
            ))}
          </ul>
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
