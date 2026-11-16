"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Breadcrumbs, Button, buttonClass, Card, EmptyState, Input, Textarea, useTask } from "@/components/ui";
import { fullName } from "@/lib/format";
import { act, clientBundle, useMyManager } from "@/lib/mock";

const DAY = 86_400_000;
const toLocal = (iso: string) => new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

/**
 * Send a Figma task card to a client (or, for Premium, a notice of what you are about to do):
 * title, what to do with steps, an optional resource link, and when it is due. Edit with ?task=.
 */
function TaskForm({ id }: { id: string }) {
  const router = useRouter();
  const taskId = useSearchParams().get("task");
  const { db } = useMyManager();
  const b = clientBundle(db, id);
  const existing = b.tasks.find((t) => t.id === taskId);
  const [now] = useState(() => Date.now());
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [link, setLink] = useState(existing?.resource?.href ?? "");
  const [due, setDue] = useState(toLocal(existing?.dueAt ?? new Date(now + 3 * DAY).toISOString()));
  const [errors, setErrors] = useState<{ title?: string; body?: string; link?: string }>({});
  const { run, pending } = useTask();

  if (!b.client || !b.user) return <EmptyState title="Client not found" action={<Link href="/manager/clients" className={buttonClass("secondary")}>Go to Clients</Link>}>This client is not on your list.</EmptyState>;
  const premium = b.client.service === "full-service";
  const first = b.user.firstName;
  const back = `/manager/clients/${id}`;

  return (
    <Card
      title={existing ? "Edit task" : premium ? "Add a notice" : "Send a task"}
      info={premium ? `${first} is on Premium, so you do the work. Tell them what you are about to do; it shows in their feed with no action for them.` : `${first} is on Regular, so they do it themselves. Say what to do in short numbered steps. They can share it with their assistant.`}
      eyebrow={<Breadcrumbs items={[{ label: "Clients", href: "/manager/clients" }, { label: fullName(b.user), href: back }, { label: existing ? "Edit task" : "Task" }]} />}
      padding="none"
    >
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          const errs = {
            title: title.trim().length < 3 ? "Add a short title, like Profile management." : undefined,
            body: body.trim().length < 10 ? (premium ? "Say what you are about to do." : "Say what to do, with steps if it helps.") : undefined,
            link: link.trim() && !/^https?:\/\/\S+$/.test(link.trim()) ? "Paste a full link that starts with https://." : undefined,
          };
          setErrors(errs);
          if (errs.title || errs.body || errs.link) return;
          const ok = await run(
            "save",
            () => act.saveClientTask(id, { id: existing?.id, title: title.trim(), body: body.trim(), resource: link.trim() ? { label: link.trim(), href: link.trim() } : undefined, dueAt: new Date(due).toISOString() }),
            existing ? "Saved. The client sees the update." : `Sent to ${first}'s feed.`,
          );
          if (ok) router.push(back);
        }}
      >
        <div className="flex flex-col gap-4 px-6 py-4">
          <Input label="Title" value={title} onChange={(e) => { setTitle(e.target.value); setErrors((x) => ({ ...x, title: undefined })); }} placeholder="Profile management" error={errors.title} />
          <Textarea
            label={premium ? "What you are about to do" : "What to do"}
            rows={8}
            value={body}
            onChange={(e) => { setBody(e.target.value); setErrors((x) => ({ ...x, body: undefined })); }}
            placeholder={premium ? "We are about to update your profile picture and banner…" : "Please update your profile picture and banner.\n\nSteps:\n1. Open the link below…"}
            error={errors.body}
          />
          <Input label="Task resource (optional)" type="url" value={link} onChange={(e) => { setLink(e.target.value); setErrors((x) => ({ ...x, link: undefined })); }} placeholder="https://drive.google.com/…" help="A file or folder they need, like the new photos." error={errors.link} />
          <Input label="Due" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="submit" loading={pending("save")}>
            {pending("save") ? "Saving" : existing ? "Save" : "Send"}
          </Button>
          <Button variant="cancel" onClick={() => router.push(back)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Columns {...rails.managerMain}>
      <Suspense>
        <TaskForm id={id} />
      </Suspense>
    </Columns>
  );
}
