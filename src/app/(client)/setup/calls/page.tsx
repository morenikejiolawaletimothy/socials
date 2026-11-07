"use client";

import { CheckCircle, Globe, Timer } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { availableTimes, takenTimes, TimePicker } from "@/components/calls/TimePicker";
import { SetupFrame } from "@/components/client/SetupFrame";
import { Avatar, Banner, Button, Meta, Tile, useTask } from "@/components/ui";
import { dayTimeIn, fullName } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";

const DAY = 86_400_000;

/** Buttons at the foot of a step: the main action first, Back beside it, under a divider. */
function StepFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">{children}</div>;
}

/** C3 Book your two calls: offer times for each; your manager confirms the time and sends the link. */
function BookCalls() {
  const router = useRouter();
  const startAt = useSearchParams().get("step") === "2" ? 2 : 0;
  const { client, user, manager, managerUser, calls } = useMyClient();
  const db = useData();
  const m = manager ?? db.managers.find((x) => x.id === "m-ada")!;
  const mu = managerUser;
  const discoveryCall = calls.find((c) => c.kind === "discovery" && c.status !== "cancelled");
  const [step, setStep] = useState(startAt && discoveryCall ? 2 : 0);
  const [record, setRecord] = useState<boolean | null>(null);
  const [discovery, setDiscovery] = useState<string[]>(discoveryCall ? (discoveryCall.pending?.options ?? [discoveryCall.at]) : []);
  const [strategy, setStrategy] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const { run, pending } = useTask();
  const [now] = useState(() => Date.now());
  const open = useMemo(() => availableTimes(m.slots ?? [], now, takenTimes(db.calls, m.id)), [m, db.calls, now]);
  const gap = db.settings.daysBetweenCalls;
  // Strategy times must be at least the gap after the earliest time the client offered for discovery.
  const earliestDiscovery = discovery.length ? Math.min(...discovery.map((t) => new Date(t).getTime())) : now;
  const strategyOpen = discovery.length ? open.filter((t) => new Date(t).getTime() >= earliestDiscovery + gap * DAY) : [];
  const toggle = (list: string[], set: (v: string[]) => void, t: string) => set(list.includes(t) ? list.filter((x) => x !== t) : [...list, t]);
  if (!client || !user) return null;

  return (
    <SetupFrame
      title="Book your two calls"
      step="Book your calls"
      steps={["Your calls", "Discovery call", "Strategy call", "Requested"]}
      current={step}
      info={`${mu && manager ? "" : "We are matching you with an account manager. You will see who it is before your discovery call. "}Offer a few times that suit you. Your manager confirms one and sends the Google Meet link.`}
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
              <span className="text-body font-medium text-primary">1. Discovery call, 30 minutes</span>
              <span className="text-body-sm text-secondary">We get to know you and your goals: who you want to reach, what you want to be known for, and what is off limits.</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="text-body font-medium text-primary">2. Strategy call, 30 minutes</span>
              <span className="text-body-sm text-secondary">We present your strategy and content plan and agree it. At least {gap} days after the first call, so your manager can prepare.</span>
            </li>
          </ul>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-body font-medium text-primary">Can the notetaker bot join both calls?</legend>
            <p className="mb-2 text-body-sm text-secondary">The bot joins and takes notes, so nothing you say is missed. Saying no is fine: your manager takes notes instead.</p>
            {[
              { v: true, label: "Yes, let the bot join" },
              { v: false, label: "No, do not add the bot" },
            ].map((o) => (
              <label key={o.label} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${record === o.v ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                <input type="radio" name="record" checked={record === o.v} onChange={() => { setRecord(o.v); setError(undefined); }} className="size-4 accent-primary-600" />
                <span className="text-body text-primary">{o.label}</span>
              </label>
            ))}
            {error && <p className="text-body-sm text-danger">{error}</p>}
          </fieldset>
          <Button className="self-start" onClick={() => (record === null ? setError("Choose yes or no. Either is fine.") : setStep(1))}>
            Pick times
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <Meta icon={Globe}>Offer one or more times, in your time zone ({user.timeZone.replace("_", " ")})</Meta>
          <TimePicker times={open} selected={discovery} onChange={(t) => { toggle(discovery, setDiscovery, t); setError(undefined); }} />
          {error && <p className="text-body-sm text-danger">{error}</p>}
          <StepFooter>
            <Button
              loading={pending("discovery")}
              onClick={async () => {
                if (!discovery.length) return setError("Offer at least one time for your discovery call.");
                if (await run("discovery", () => act.requestCall(client.id, { kind: "discovery", times: discovery, recording: record ?? true }), "Discovery call requested.")) setStep(2);
              }}
            >
              {pending("discovery") ? "Requesting" : "Request discovery call"}
            </Button>
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
          </StepFooter>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <Banner tone="neutral">Discovery call requested. These times are at least {gap} days later, so your manager has time to prepare.</Banner>
          {strategyOpen.length ? (
            <TimePicker times={strategyOpen} selected={strategy} onChange={(t) => { toggle(strategy, setStrategy, t); setError(undefined); }} />
          ) : (
            <Banner tone="info">No times are open yet. Your manager will open more soon, and we will remind you.</Banner>
          )}
          {error && <p className="text-body-sm text-danger">{error}</p>}
          <StepFooter>
            <Button
              loading={pending("strategy")}
              onClick={async () => {
                if (!strategy.length) return setError("Offer at least one time for your strategy call.");
                if (await run("strategy", () => act.requestCall(client.id, { kind: "strategy", times: strategy, recording: record ?? true }), "Strategy call requested.")) setStep(3);
              }}
            >
              {pending("strategy") ? "Requesting" : "Request strategy call"}
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
            <p className="font-display text-display-lg text-primary">Both calls requested</p>
            <CheckCircle className="size-8 shrink-0 text-success" aria-hidden />
          </div>
          <Banner tone="info">{mu ? mu.firstName : "Your manager"} confirms a time for each and sends the Google Meet link. You will see it on your Calls page, and you can change the times there any time.</Banner>
          <ul className="flex flex-col gap-3">
            {[
              { name: "Discovery call", times: discovery },
              { name: "Strategy call", times: strategy },
            ].map((c) => (
              <li key={c.name}>
                <Tile>
                  <div className="flex flex-col gap-1">
                    <span className="text-body font-medium text-primary">{c.name}</span>
                    <Meta icon={Timer}>{c.times.map(dayTimeIn).join(" · ")}</Meta>
                  </div>
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
