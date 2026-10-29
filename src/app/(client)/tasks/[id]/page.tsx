"use client";

import { CheckCircle, Circle, CircleNotch, Copy, LinkedinLogo, PencilSimple } from "@phosphor-icons/react";
import { use, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Banner, Breadcrumbs, Button, Card, Dialog, EmptyState, Input, ProgressBar, Textarea, useTask, useToast } from "@/components/ui";
import { dayIn } from "@/lib/format";
import { act, useMyClient, type Person, type QuickTask } from "@/lib/mock";

const smallButton =
  "inline-flex min-h-10 items-center gap-2 rounded-md border border-border-strong bg-card px-3 py-2 text-body-sm font-medium text-primary-700 transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:focus-ring";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard can be blocked. The note is on screen to copy by hand.
  }
}

/** One person to connect with: why they matter, a ready note (editable), and the three buttons. */
function PersonRow({ task, person }: { task: QuickTask; person: Person }) {
  const toast = useToast();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(person.note);

  return (
    <li className={`flex flex-col gap-3 border-b border-border py-5 last:border-b-0 ${person.done ? "bg-neutral-25" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-body font-medium text-primary">{person.name}</span>
          <span className="text-body-sm text-secondary">{person.role}</span>
        </div>
        {person.done && (
          <span className="flex shrink-0 items-center gap-1 text-caption text-success">
            <CheckCircle className="size-4" aria-hidden /> Sent
          </span>
        )}
      </div>
      <p className="text-body-sm text-primary">
        <span className="font-medium">Why: </span>
        {person.why}
      </p>
      {editing ? (
        <div className="flex flex-col gap-3">
          <Textarea label="Your note" value={note} onChange={(e) => setNote(e.target.value)} help={`${note.length} of 300 characters. LinkedIn allows 300.`} maxLength={300} />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              loading={pending("note")}
              onClick={async () => {
                if (await run("note", () => act.editPersonNote(task.id, person.id, note), "Note saved.")) setEditing(false);
              }}
            >
              Save note
            </Button>
            <Button variant="ghost" onClick={() => { setNote(person.note); setEditing(false); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <blockquote className="rounded-md bg-neutral-25 px-4 py-3 text-body-sm text-primary">{person.note}</blockquote>
      )}
      {!editing && (
        <div className="flex flex-wrap gap-2">
          <a href={person.profileUrl} target="_blank" rel="noreferrer" className={smallButton}>
            <LinkedinLogo className="size-4" aria-hidden /> Open profile
          </a>
          <button
            type="button"
            className={smallButton}
            onClick={async () => {
              await copy(person.note);
              toast("Note copied. Paste it into LinkedIn's \"Add a note\".");
            }}
          >
            <Copy className="size-4" aria-hidden /> Copy note
          </button>
          <button type="button" className={smallButton} onClick={() => setEditing(true)}>
            <PencilSimple className="size-4" aria-hidden /> Edit
          </button>
          <button
            type="button"
            className={smallButton}
            aria-pressed={person.done}
            disabled={pending("sent")}
            onClick={() =>
              run("sent", () => act.togglePersonSent(task.id, person.id), {
                text: person.done ? `${person.name} marked as not sent.` : `${person.name} marked as sent.`,
                action: { label: "Undo", onClick: () => act.togglePersonSent(task.id, person.id) },
              })
            }
          >
            {pending("sent") ? <CircleNotch className="size-4 animate-spin" aria-hidden /> : person.done ? <CheckCircle className="size-4 text-success" aria-hidden /> : <Circle className="size-4" aria-hidden />}
            {person.done ? "Sent" : "Mark as sent"}
          </button>
        </div>
      )}
    </li>
  );
}

/** C17 Quick tasks: things LinkedIn only lets the client do, prepared so each takes 1 to 3 minutes. */
export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tasks, managerUser } = useMyClient();
  const toast = useToast();
  const { run, pending } = useTask();
  const task = tasks.find((t) => t.id === id);
  const [assistant, setAssistant] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();

  if (!task) {
    return (
      <Columns {...rails.clientMain}>
        <EmptyState title="This task is no longer here">It may be done already. Your open tasks are on Home.</EmptyState>
      </Columns>
    );
  }

  const sent = task.people?.filter((p) => p.done).length ?? 0;
  const total = task.people?.length ?? 0;

  return (
    <Columns {...rails.clientMain}>
      <Card
        title={task.title}
        eyebrow={<Breadcrumbs items={[{ label: "Home", href: "/home" }, { label: "Quick tasks" }]} />}
        action={<span className="text-caption text-secondary">Due {dayIn(task.dueAt)}</span>}
      >
        <div className="flex flex-col gap-6">
          <p className="text-body-sm text-secondary">
            LinkedIn only lets you do this yourself, so {managerUser?.firstName ?? "your manager"} has prepared everything. {task.kind === "connect" ? "About 30 seconds a person." : "About 1 minute."}
          </p>

          {task.kind === "connect" && (
            <>
              <div className="flex flex-col gap-2">
                <span className="flex justify-between text-body-sm">
                  <span className="text-primary">{sent} of {total} sent</span>
                  {sent === total && <span className="text-success">All done</span>}
                </span>
                <ProgressBar value={sent} max={total} tone={sent === total ? "success" : "brand"} />
              </div>
              <Banner tone="info" title="How to send each one">
                Open the profile, press Connect, then &ldquo;Add a note&rdquo;, paste the note and send. Then mark it as sent here.
              </Banner>
              <ul className="flex flex-col">
                {task.people!.map((p) => (
                  <PersonRow key={p.id} task={task} person={p} />
                ))}
              </ul>
            </>
          )}

          {task.kind === "profile" && (
            <div className="flex flex-col gap-4">
              <blockquote className="rounded-md bg-neutral-25 px-4 py-4 text-body text-primary">{task.text}</blockquote>
              <p className="text-body-sm text-secondary">
                <span className="font-medium text-primary">Where: </span>
                {task.where}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={smallButton}
                  onClick={async () => {
                    await copy(task.text ?? "");
                    toast("Copied. Paste it into LinkedIn.");
                  }}
                >
                  <Copy className="size-4" aria-hidden /> Copy text
                </button>
                <button
                  type="button"
                  className={smallButton}
                  aria-pressed={task.done}
                  disabled={pending("done")}
                  onClick={() => run("done", () => act.markTaskDone(task.id, !task.done), task.done ? "Marked as not done." : "Done. Your manager can see it.")}
                >
                  {pending("done") ? <CircleNotch className="size-4 animate-spin" aria-hidden /> : task.done ? <CheckCircle className="size-4 text-success" aria-hidden /> : <Circle className="size-4" aria-hidden />}
                  {task.done ? "Done" : "Mark as done"}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-border pt-6">
            <p className="text-body font-semibold text-primary">Someone does this for you?</p>
            <p className="text-body-sm text-secondary">Send the list and notes to your assistant. They do not need an account.</p>
            <Button variant="secondary" className="self-start" onClick={() => setAssistant(true)}>
              Send to my assistant
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={assistant} onClose={() => setAssistant(false)} title="Send to your assistant">
        <Banner tone="info">We email them the list, the notes and how to send each one. You still mark them as sent here, or they reply to us.</Banner>
        <Input label="Their email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(undefined); }} error={emailError} placeholder="name@company.com" />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setAssistant(false)}>
            Cancel
          </Button>
          <Button
            loading={pending("assistant")}
            onClick={async () => {
              if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setEmailError("Enter an email address like name@company.com.");
              if (await run("assistant", () => act.sendToAssistant(task.id, email.trim()), `Sent to ${email.trim()}. They will get it in a minute.`)) setAssistant(false);
            }}
          >
            {pending("assistant") ? "Sending" : "Send"}
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
