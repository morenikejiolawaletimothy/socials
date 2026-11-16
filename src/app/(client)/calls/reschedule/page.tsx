"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { availableTimes, takenTimes, TimePicker } from "@/components/calls/TimePicker";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { callTitle } from "@/components/rails/NextCallCard";
import { Breadcrumbs, Button, Card, EmptyState, Textarea, useTask } from "@/components/ui";
import { act, useData, useMyClient } from "@/lib/mock";

/** Figma "Calls / Reschedule": a note and one or more new times from the manager's open slots. Back · Send. */
function Reschedule() {
  const router = useRouter();
  const id = useSearchParams().get("call");
  const { calls, manager, managerUser } = useMyClient();
  const all = useData().calls;
  const call = calls.find((c) => c.id === id);
  const [now] = useState(() => Date.now());
  const times = useMemo(() => (manager ? availableTimes(manager.slots ?? [], now, takenTimes(all, manager.id, id ?? undefined)) : []), [manager, all, now, id]);
  const [note, setNote] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ note?: string; times?: string }>({});
  const { run, pending } = useTask();
  const first = managerUser?.firstName ?? "your account manager";

  if (!call) return <EmptyState title="We could not find that call">It may have been moved already. Go back to your calls.</EmptyState>;

  return (
    <Card
      title="Reschedule"
      info={`Say why, and pick one or more times that suit you. ${first} accepts one or suggests another. The call is booked once you both agree.`}
      eyebrow={<Breadcrumbs items={[{ label: "Calls", href: "/home" }, { label: "Reschedule" }]} />}
      padding="none"
    >
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          const errs = { note: note.trim() ? undefined : "Say why, so we can find a better time.", times: picks.length ? undefined : "Pick at least one time." };
          setErrors(errs);
          if (errs.note || errs.times) return;
          if (await run("send", () => act.proposeTimes(call.id, "client", [...picks].sort(), note.trim()), `Sent. ${first} will reply.`)) router.push("/home");
        }}
      >
        <div className="flex flex-col gap-6 px-6 py-4">
          <p className="text-body-sm text-secondary">
            Call: <span className="font-medium text-primary">{callTitle(call)}</span>
          </p>
          <Textarea label="Note" rows={3} value={note} onChange={(e) => { setNote(e.target.value); setErrors((x) => ({ ...x, note: undefined })); }} error={errors.note} />
          <div className="flex flex-col gap-2">
            <span className="text-body-sm font-medium text-primary">Time slots</span>
            {times.length ? <TimePicker times={times} selected={picks} onChange={(t) => { setPicks((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t])); setErrors((x) => ({ ...x, times: undefined })); }} /> : <p className="text-body-sm text-secondary">{first} has no open times in the next two weeks. Send a message to agree one.</p>}
            {errors.times && <p className="text-body-sm text-danger">{errors.times}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit" loading={pending("send")}>
            {pending("send") ? "Sending" : "Send"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function ReschedulePage() {
  return (
    <Columns {...rails.clientMain}>
      <Suspense>
        <Reschedule />
      </Suspense>
    </Columns>
  );
}
