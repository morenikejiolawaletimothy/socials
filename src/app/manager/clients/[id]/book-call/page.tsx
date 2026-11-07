"use client";

import { Globe } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { availableTimes, takenTimes, TimePicker } from "@/components/calls/TimePicker";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Banner, Breadcrumbs, Button, buttonClass, Card, EmptyState, Input, Meta, Textarea, useTask } from "@/components/ui";
import { dayTimeIn, fullName } from "@/lib/format";
import { act, clientBundle, useMyManager } from "@/lib/mock";

/** Flow B: the manager books a call with a client after agreeing a time in messages, with the link ready. */
export default function BookCallForClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { db, manager, user } = useMyManager();
  const b = clientBundle(db, id);
  const { run, pending } = useTask();
  const [now] = useState(() => Date.now());
  const times = useMemo(
    () => (manager ? availableTimes(manager.slots ?? [], now, takenTimes(db.calls, manager.id)) : []),
    [manager, db.calls, now],
  );
  const [form, setForm] = useState({ title: "", agenda: "", link: "", record: true });
  const [at, setAt] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ title?: string; link?: string; at?: string }>({});

  if (!b.client || !b.user || !manager) {
    return <EmptyState title="Client not found" action={<Link href="/manager/clients" className={buttonClass("secondary")}>Go to Clients</Link>}>This client is not on your list.</EmptyState>;
  }
  const first = b.user.firstName;

  return (
    <Columns {...rails.managerMain}>
      <Card
        title={`Book a call with ${first}`}
        eyebrow={<Breadcrumbs items={[{ label: "Clients", href: "/manager/clients" }, { label: fullName(b.user), href: `/manager/clients/${id}` }, { label: "Book a call" }]} />}
        info="Agree a time with the client in messages first, then book it here with the Meet link. They accept to confirm."
      >
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const next: typeof errors = {};
            if (form.title.trim().length < 3) next.title = "Add a short purpose.";
            if (!/^https?:\/\/\S+$/.test(form.link.trim())) next.link = "Paste the meeting link (starts with https://).";
            if (!at) next.at = "Pick a time from your open slots.";
            setErrors(next);
            if (Object.keys(next).length) return;
            if (await run("book", () => act.createCallForClient(id, { title: form.title.trim(), agenda: form.agenda.trim() || undefined, at: at!, meetUrl: form.link.trim(), recording: form.record }), `Call sent to ${first} for ${dayTimeIn(at!)}. They accept to confirm.`)) {
              router.push(`/manager/clients/${id}`);
            }
          }}
        >
          <Input label="Purpose" value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: undefined }); }} placeholder="Monthly review" error={errors.title} />
          <Textarea label="What you will cover (optional)" value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} help={`${first} sees this with the invite.`} />

          {times.length ? (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-body-sm font-medium text-primary">Pick a time from your open slots</span>
                <Meta icon={Globe}>Times are in your time zone ({user?.timeZone.replace("_", " ")})</Meta>
              </div>
              <TimePicker times={times} value={at} onChange={(t) => { setAt(t); setErrors({ ...errors, at: undefined }); }} />
              {errors.at && <p className="text-body-sm text-danger">{errors.at}</p>}

              <Input label="Google Meet link" value={form.link} onChange={(e) => { setForm({ ...form, link: e.target.value }); setErrors({ ...errors, link: undefined }); }} placeholder="https://meet.google.com/..." error={errors.link} help="Create it in Google Calendar for this time, then paste it here." />

              <fieldset className="flex flex-col gap-2 border-t border-border pt-6">
                <legend className="mb-2 text-body font-medium text-primary">Will your notetaker bot join?</legend>
                {[
                  { v: true, label: "Yes, the bot joins" },
                  { v: false, label: "No, I take notes" },
                ].map((o) => (
                  <label key={o.label} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${form.record === o.v ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                    <input type="radio" name="record" checked={form.record === o.v} onChange={() => setForm({ ...form, record: o.v })} className="size-4 accent-primary-600" />
                    <span className="text-body text-primary">{o.label}</span>
                  </label>
                ))}
              </fieldset>

              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
                <Button type="submit" loading={pending("book")}>{pending("book") ? "Sending" : "Send to client"}</Button>
                <Button type="button" variant="cancel" onClick={() => router.push(`/manager/clients/${id}`)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <Banner tone="info">You have no open times in the next two weeks. Open more slots on your Calls page first.</Banner>
              <Button type="button" variant="secondary" className="self-start" onClick={() => router.push(`/manager/clients/${id}`)}>Back to client</Button>
            </>
          )}
        </form>
      </Card>
    </Columns>
  );
}
