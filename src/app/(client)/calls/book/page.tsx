"use client";

import { Globe } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { openTimes, TimePicker } from "@/components/calls/TimePicker";
import { Columns } from "@/components/layout/Columns";
import { ManagerCard } from "@/components/rails/ManagerCard";
import { Banner, Breadcrumbs, Button, Card, Meta, useTask } from "@/components/ui";
import { dayTimeIn, fullName } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

/** Client: book an ongoing check-in call into the account manager's open times. Self-serve, unlimited. */
export default function BookCallPage() {
  const router = useRouter();
  const { client, user, manager, managerUser } = useMyClient();
  const { run, pending } = useTask();
  const [now] = useState(() => Date.now());
  const times = useMemo(() => openTimes(manager?.slots ?? [], now), [manager?.slots, now]);
  const [at, setAt] = useState<string | null>(null);
  const [record, setRecord] = useState(true);
  const [error, setError] = useState<string>();
  if (!client || !user) return null;

  const mgrName = managerUser ? fullName(managerUser) : "your account manager";

  return (
    <Columns right={<ManagerCard />} rightLabel="Your manager">
      <Card
        title="Book a call"
        eyebrow={<Breadcrumbs items={[{ label: "Calls", href: "/calls" }, { label: "Book a call" }]} />}
        info="A 30-minute call with your account manager. Pick any open time; we remind you by email the day before and 1 hour before."
      >
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!at) return setError("Pick a time for your call.");
            if (await run("book", () => act.bookCall(client.id, "check-in", at, record), `Call booked: ${dayTimeIn(at)}.`)) {
              router.push("/calls");
            }
          }}
        >
          <p className="text-body-sm text-secondary">Book a check-in with {mgrName} to talk through your strategy, results or anything on your mind.</p>

          {times.length ? (
            <>
              <Meta icon={Globe}>Times are in your time zone ({user.timeZone.replace("_", " ")})</Meta>
              <TimePicker times={times} value={at} onChange={(t) => { setAt(t); setError(undefined); }} />
              {error && <p className="text-body-sm text-danger">{error}</p>}

              <fieldset className="flex flex-col gap-2 border-t border-border pt-6">
                <legend className="mb-2 text-body font-medium text-primary">Can we record the call?</legend>
                <p className="mb-2 text-body-sm text-secondary">A notetaker joins and records, so nothing is missed. Saying no is fine: your manager takes notes instead.</p>
                {[
                  { v: true, label: "Yes, record the call" },
                  { v: false, label: "No, do not record" },
                ].map((o) => (
                  <label key={o.label} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${record === o.v ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                    <input type="radio" name="record" checked={record === o.v} onChange={() => setRecord(o.v)} className="size-4 accent-primary-600" />
                    <span className="text-body text-primary">{o.label}</span>
                  </label>
                ))}
              </fieldset>

              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
                <Button type="submit" loading={pending("book")}>
                  {pending("book") ? "Booking" : "Book call"}
                </Button>
                <Button type="button" variant="cancel" onClick={() => router.push("/calls")}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <Banner tone="info">No open times right now. {managerUser ? managerUser.firstName : "Your manager"} opens more each week, so check back soon. You can also message them to ask for a time.</Banner>
              <Button type="button" variant="secondary" className="self-start" onClick={() => router.push("/calls")}>
                Back to calls
              </Button>
            </>
          )}
        </form>
      </Card>
    </Columns>
  );
}
