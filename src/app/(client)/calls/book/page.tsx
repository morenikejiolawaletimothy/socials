"use client";

import { Globe } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { availableTimes, takenTimes, TimePicker } from "@/components/calls/TimePicker";
import { Columns } from "@/components/layout/Columns";
import { ManagerCard } from "@/components/rails/ManagerCard";
import { Banner, Breadcrumbs, Button, Card, Input, Meta, Textarea, useTask } from "@/components/ui";
import { dayTimeIn, fullName } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";

/** Client: ask for an ad-hoc check-in call. State the purpose, pick an open time; the manager confirms and adds the link. */
export default function BookCallPage() {
  const router = useRouter();
  const { client, user, manager, managerUser } = useMyClient();
  const allCalls = useData().calls;
  const { run, pending } = useTask();
  const [now] = useState(() => Date.now());
  const times = useMemo(
    () => (manager ? availableTimes(manager.slots ?? [], now, takenTimes(allCalls, manager.id)) : []),
    [manager, allCalls, now],
  );
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [at, setAt] = useState<string | null>(null);
  const [record, setRecord] = useState(true);
  const [errors, setErrors] = useState<{ title?: string; agenda?: string; at?: string }>({});
  if (!client || !user) return null;

  const mgrName = managerUser ? fullName(managerUser) : "your account manager";

  return (
    <Columns right={<ManagerCard />} rightLabel="Your manager">
      <Card
        title="Book a call"
        eyebrow={<Breadcrumbs items={[{ label: "Calls", href: "/calls" }, { label: "Book a call" }]} />}
        info="Ask for a 30-minute call with your account manager. You pick an open time; they confirm it and share the meeting link."
      >
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const next: typeof errors = {};
            if (title.trim().length < 3) next.title = "Add a short purpose, so your manager can prepare.";
            if (agenda.trim().length < 10) next.agenda = "Say a little more about what you want to discuss.";
            if (!at) next.at = "Pick a time for your call.";
            setErrors(next);
            if (Object.keys(next).length) return;
            if (await run("book", () => act.requestCall(client.id, { title: title.trim(), agenda: agenda.trim(), at: at!, recording: record }), `Call requested for ${dayTimeIn(at!)}. ${managerUser ? managerUser.firstName : "Your manager"} will confirm and add the link.`)) {
              router.push("/calls");
            }
          }}
        >
          <Input
            label="Purpose"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: undefined }); }}
            placeholder="A quick catch-up on this month's results"
            error={errors.title}
          />
          <Textarea
            label="What would you like to discuss?"
            value={agenda}
            onChange={(e) => { setAgenda(e.target.value); setErrors({ ...errors, agenda: undefined }); }}
            placeholder="I'd like to talk through the engagement dip and plan next month's topics."
            help="Your manager sees this before the call, so they come prepared."
            error={errors.agenda}
          />

          {times.length ? (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-body-sm font-medium text-primary">Pick a time</span>
                <Meta icon={Globe}>Times are in your time zone ({user.timeZone.replace("_", " ")})</Meta>
              </div>
              <TimePicker times={times} value={at} onChange={(t) => { setAt(t); setErrors({ ...errors, at: undefined }); }} />
              {errors.at && <p className="text-body-sm text-danger">{errors.at}</p>}

              <fieldset className="flex flex-col gap-2 border-t border-border pt-6">
                <legend className="mb-2 text-body font-medium text-primary">Should the notetaker bot join?</legend>
                <p className="mb-2 text-body-sm text-secondary">Your manager&apos;s bot joins and takes notes, so nothing is missed. Saying no is fine: they take notes themselves.</p>
                {[
                  { v: true, label: "Yes, let the bot join" },
                  { v: false, label: "No, do not add the bot" },
                ].map((o) => (
                  <label key={o.label} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${record === o.v ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                    <input type="radio" name="record" checked={record === o.v} onChange={() => setRecord(o.v)} className="size-4 accent-primary-600" />
                    <span className="text-body text-primary">{o.label}</span>
                  </label>
                ))}
              </fieldset>

              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
                <Button type="submit" loading={pending("book")}>
                  {pending("book") ? "Requesting" : "Request call"}
                </Button>
                <Button type="button" variant="cancel" onClick={() => router.push("/calls")}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <Banner tone="info">No open times right now. {mgrName} opens more each week, so check back soon. You can also message them to ask for a time.</Banner>
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
