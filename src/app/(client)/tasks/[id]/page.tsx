"use client";

import { CalendarBlank, CalendarStar, Circle, Clock, Copy, GraduationCap, LinkedinLogo, LinkSimple, MapPin, PencilSimple } from "@phosphor-icons/react";
import Image from "next/image";
import { use, useState, type ReactNode } from "react";
import { eventLength } from "@/components/client/HomeCards";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { HandoffCard } from "@/components/client/Assistants";
import { VideoTask } from "@/components/client/VideoTask";
import { Avatar, Badge, Banner, Breadcrumbs, Button, Card, EmptyState, Meta, ProgressBar, Textarea, TextButton, textActionClass, useTask, useToast } from "@/components/ui";
import { agoIn, day, dayIn, time } from "@/lib/format";
import { act, useMyClient, type Person, type QuickTask } from "@/lib/mock";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard can be blocked. The note is on screen to copy by hand.
  }
}

/**
 * One person to connect with, as a tile like the Home tiles: who they are and why on top, the ready note
 * (editable), then a divider and the actions, with Mark as sent on the right.
 */
function PersonRow({ task, person }: { task: QuickTask; person: Person }) {
  const toast = useToast();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(person.note);

  const toggleSent = () =>
    run("sent", () => act.togglePersonSent(task.id, person.id), {
      text: person.done ? `${person.name} marked as not sent.` : `${person.name} marked as sent.`,
      action: { label: "Undo", onClick: () => act.togglePersonSent(task.id, person.id) },
    });

  return (
    <li className={`flex flex-col rounded-md border border-border p-4 ${person.done ? "bg-neutral-25" : "bg-card"}`}>
      {/* Who: avatar, name and role, with Sent or Mark as sent on the right. */}
      <div className="flex items-center gap-4 border-b border-border pb-3">
        <Avatar name={person.name} src={person.photo} size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-body font-medium text-primary">{person.name}</span>
          <span className="text-body-sm text-secondary">{person.role}</span>
        </div>
        {person.done ? (
          <span className="shrink-0">
            <Badge status="success">{person.doneBy ? `Sent by ${person.doneBy.split(" ")[0]}` : "Sent"}</Badge>
          </span>
        ) : (
          <Button size="sm" variant="secondary" className="shrink-0" loading={pending("sent")} onClick={toggleSent}>
            {!pending("sent") && <Circle className="size-4" aria-hidden />}
            Mark as sent
          </Button>
        )}
      </div>

      {/* Why this person. */}
      <Banner tone="info" className="mt-3">
        Why: {person.why}
      </Banner>

      {/* The ready note, plain text, or the editor. */}
      {editing ? (
        <div className="flex flex-col gap-3 py-4">
          <Textarea label="Your note" value={note} onChange={(e) => setNote(e.target.value)} help={`${note.length} of 300 characters. LinkedIn allows 300.`} maxLength={300} />
          <div className="flex gap-2">
            <Button
              loading={pending("note")}
              onClick={async () => {
                if (await run("note", () => act.editPersonNote(task.id, person.id, note), "Note saved.")) setEditing(false);
              }}
            >
              Save note
            </Button>
            <Button
              variant="cancel"
              onClick={() => {
                setNote(person.note);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="px-4 py-4 text-body-sm text-primary">{person.note}</p>
      )}

      {/* Actions in a row on the left. Edit only while the note is not sent yet. */}
      {!editing && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-3">
          <a href={person.profileUrl} target="_blank" rel="noreferrer" className={textActionClass}>
            <LinkedinLogo className="size-4" aria-hidden /> Open profile
          </a>
          <TextButton
            onClick={async () => {
              await copy(person.note);
              toast('Note copied. Paste it into LinkedIn\'s "Add a note".');
            }}
          >
            <Copy className="size-4" aria-hidden /> Copy note
          </TextButton>
          {!person.done && (
            <TextButton onClick={() => setEditing(true)}>
              <PencilSimple className="size-4" aria-hidden /> Edit
            </TextButton>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * A single quick task (profile update, event, program) in the same layout as a person tile: icon, title and
 * subtitle with the status tag or mark button on the right; a tinted note; the content; then the actions.
 */
function TaskTile({
  icon,
  title,
  subtitle,
  done,
  doneLabel,
  markLabel,
  busy,
  onMark,
  note,
  actions,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  done: boolean;
  doneLabel: string;
  markLabel: string;
  busy: boolean;
  onMark: () => void;
  note: ReactNode;
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col rounded-md border border-border p-4 ${done ? "bg-neutral-25" : "bg-card"}`}>
      <div className="flex items-center gap-4 border-b border-border pb-3">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-primary-700">{icon}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-body font-medium text-primary">{title}</span>
          <span className="text-body-sm text-secondary">{subtitle}</span>
        </div>
        {done ? (
          <span className="shrink-0">
            <Badge status="success">{doneLabel}</Badge>
          </span>
        ) : (
          <Button size="sm" variant="secondary" className="shrink-0" loading={busy} onClick={onMark}>
            {!busy && <Circle className="size-4" aria-hidden />}
            {markLabel}
          </Button>
        )}
      </div>

      <Banner tone="info" className="mt-3">
        {note}
      </Banner>

      <div className="px-4 py-4">{children}</div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-3">{actions}</div>
    </div>
  );
}

/** C17 Quick tasks: things LinkedIn only lets the client do, prepared so each takes 1 to 3 minutes. */
export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tasks, managerUser, client } = useMyClient();
  const toast = useToast();
  const { run, pending } = useTask();
  const task = tasks.find((t) => t.id === id);

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
        action={
          <Meta icon={CalendarBlank}>
            {task.kind === "event" && task.done && task.event ? `Starts ${dayIn(task.event.startsAt)}` : `${task.kind === "event" ? "Closing by" : "Due"} ${dayIn(task.dueAt)}`}
          </Meta>
        }
      >
        <div className="flex flex-col gap-4">
          <Banner tone="info" closeKey={`task-note-${task.kind}`}>
            {task.kind === "video"
              ? `${managerUser?.firstName ?? "Your manager"} would like a short video from you. Record it on your phone using the guide below, then upload it here. It goes to your manager and into Your brand.`
              : task.kind === "event"
                ? `${managerUser?.firstName ?? "Your manager"} picked this for you. Open the ${task.event?.type === "program" ? "program" : "event"} page, register, then mark it as registered here so we can plan posts around it.`
                : `LinkedIn only lets you do this yourself, so ${managerUser?.firstName ?? "your manager"} has prepared everything. `}
            {task.kind === "connect" && "Open each profile, press Connect, then \u201cAdd a note\u201d, paste the note and send. Then mark it as sent here. About 30 seconds a person."}
            {task.kind === "profile" && "Copy the text, paste it where shown, then mark it as done. About a minute."}
          </Banner>

          <div className="flex flex-col gap-2">
            <span className="text-body-sm text-secondary">
              {task.kind === "video"
                ? task.done
                  ? "Video sent"
                  : "Not recorded yet"
                : task.kind === "connect"
                  ? `${sent} of ${total} sent`
                  : task.kind === "event"
                    ? task.done
                      ? "Registered"
                      : "Not registered yet"
                    : task.done
                      ? "Done"
                      : "Copy and paste in a minute"}{" "}
              · Assigned {agoIn(task.sentAt)}
            </span>
            {task.kind === "connect" && (
              <span className="max-w-xs">
                <ProgressBar value={sent} max={total} />
              </span>
            )}
          </div>

          {task.kind === "video" && task.video && <VideoTask task={task} />}

          {task.kind === "connect" && (
            <ul className="flex flex-col gap-3">
              {task.people!.map((p) => (
                <PersonRow key={p.id} task={task} person={p} />
              ))}
            </ul>
          )}

          {task.kind === "profile" && (
            <TaskTile
              icon={<Image src="/brand/linkedin.svg" alt="" width={48} height={48} unoptimized className="size-full" />}
              title={task.title}
              subtitle="Profile update"
              done={task.done}
              doneLabel="Done"
              markLabel="Mark as done"
              busy={pending("done")}
              onMark={() =>
                run("done", () => act.markTaskDone(task.id, true), {
                  text: "Marked as done. Your manager can see it.",
                  action: { label: "Undo", onClick: () => act.markTaskDone(task.id, false) },
                })
              }
              note={<>Where: {task.where}</>}
              actions={
                <TextButton
                  onClick={async () => {
                    await copy(task.text ?? "");
                    toast("Copied. Paste it into LinkedIn.");
                  }}
                >
                  <Copy className="size-4" aria-hidden /> Copy text
                </TextButton>
              }
            >
              <p className="text-body-sm text-primary">{task.text}</p>
            </TaskTile>
          )}

          {task.kind === "event" && task.event && (
            <TaskTile
              icon={
                task.event.image ? (
                  <Avatar name={task.event.name} src={task.event.image} size="lg" className="size-full!" />
                ) : task.event.type === "program" ? (
                  <GraduationCap className="size-6" aria-hidden />
                ) : (
                  <CalendarStar className="size-6" aria-hidden />
                )
              }
              title={task.event.name}
              subtitle={`${task.event.type === "program" ? "Program" : "Event"} by ${task.event.host}`}
              done={task.done}
              doneLabel={task.event.type === "program" ? "Applied" : "Registered"}
              markLabel={task.event.type === "program" ? "Mark as applied" : "Mark as registered"}
              busy={pending("done")}
              onMark={() =>
                run("done", () => act.markTaskDone(task.id, true), {
                  text: `${task.event?.type === "program" ? "Applied" : "Registered"}. ${managerUser?.firstName ?? "Your manager"} can see it, and it shows in Coming up.`,
                  action: { label: "Undo", onClick: () => act.markTaskDone(task.id, false) },
                })
              }
              note={<>Why: {task.event.why}</>}
              actions={
                <a href={task.event.url} target="_blank" rel="noreferrer" className={textActionClass}>
                  <LinkSimple className="size-4" aria-hidden /> Open {task.event.type === "program" ? "program" : "event"} page
                </a>
              }
            >
              <ul className="flex flex-col gap-2 text-body-sm text-primary">
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
                  {task.event.type === "program" && task.event.endsAt
                    ? `${day(task.event.startsAt)} to ${day(task.event.endsAt)} · ${eventLength(task.event)}`
                    : `${day(task.event.startsAt)} · ${time(task.event.startsAt)}${task.event.endsAt ? ` to ${time(task.event.endsAt)}` : ""}`}
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
                  {task.event.place}
                </li>
              </ul>
            </TaskTile>
          )}
        </div>
      </Card>

      {client && <HandoffCard task={task} clientId={client.id} />}
    </Columns>
  );
}
