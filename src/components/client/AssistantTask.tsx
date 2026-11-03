"use client";

import { CalendarBlank, Circle, Copy, LinkedinLogo, LinkSimple } from "@phosphor-icons/react";
import { useEffect } from "react";
import { EngageItemTile } from "@/components/client/EngageItemTile";
import { VideoTask } from "@/components/client/VideoTask";
import { engageKinds, isEngage, progressWord, taskProgress } from "@/lib/engage";
import { Avatar, Badge, Banner, Button, Card, EmptyState, Logo, Meta, ProgressBar, TextButton, textActionClass, Tile, TileFooter, useTask, useToast } from "@/components/ui";
import { dayIn } from "@/lib/format";
import { act, useData, type Assistant, type QuickTask } from "@/lib/mock";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard can be blocked. The text is on screen to copy by hand.
  }
}

/** The page frame for an assistant: logo only, no app menus, since they have no account. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-page">
      <title>Task from Bluecut Socials</title>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Logo size={32} />
          <span className="font-display text-display-lg text-primary">Bluecut Socials</span>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">{children}</main>
    </div>
  );
}

function Person({ task, p, by }: { task: QuickTask; p: NonNullable<QuickTask["people"]>[number]; by: string }) {
  const toast = useToast();
  const { run, pending } = useTask();
  return (
    <li>
      <Tile done={p.done}>
        <span className="flex items-start gap-4">
          <Avatar name={p.name} src={p.photo} size="md" />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-body font-medium text-primary">{p.name}</span>
            <span className="text-body-sm text-secondary">{p.role}</span>
          </span>
          {p.done && <Badge status="success">Sent</Badge>}
        </span>
        <p className="text-body-sm text-primary">{p.note}</p>
        <TileFooter>
          <span className="flex flex-wrap gap-x-6 gap-y-2">
            <a href={p.profileUrl} target="_blank" rel="noreferrer" className={textActionClass}>
              <LinkedinLogo className="size-4" aria-hidden /> Open profile
            </a>
            <TextButton
              onClick={async () => {
                await copy(p.note);
                toast('Note copied. Paste it into LinkedIn\'s "Add a note".');
              }}
            >
              <Copy className="size-4" aria-hidden /> Copy note
            </TextButton>
          </span>
          {!p.done && (
            <Button
              size="sm"
              variant="secondary"
              loading={pending("sent")}
              onClick={() =>
                run("sent", () => act.togglePersonSent(task.id, p.id, by), {
                  text: `${p.name} marked as sent.`,
                  action: { label: "Undo", onClick: () => act.togglePersonSent(task.id, p.id, by) },
                })
              }
            >
              {!pending("sent") && <Circle className="size-4" aria-hidden />}
              Mark as sent
            </Button>
          )}
        </TileFooter>
      </Tile>
    </li>
  );
}

/**
 * C19: what an assistant sees from their private link. One task, the same actions the client has, nothing else.
 * Expired, taken-back and finished links say so and offer to ask for a new one.
 */
export function AssistantTask({ token }: { token: string }) {
  const db = useData();
  const { run, pending } = useTask();
  const toast = useToast();
  const task = db.tasks.find((t) => t.handoff?.token === token);
  const h = task?.handoff;
  const assistant: Assistant | undefined = (db.assistants ?? []).find((a) => a.id === h?.assistantId);
  const owner = db.users.find((u) => u.id === db.clients.find((c) => c.id === task?.clientId)?.userId);
  const ended = !h || !assistant || !!h.endedAt || new Date(h.expiresAt) < new Date();

  useEffect(() => {
    if (task && !ended) act.openHandoff(token);
  }, [task, ended, token]);

  if (!task || !h || !assistant || !owner) {
    return (
      <Frame>
        <Card>
          <EmptyState title="This link does not work">Check you opened the latest message from Bluecut Socials, or ask the person who sent it for a new link.</EmptyState>
        </Card>
      </Frame>
    );
  }

  const first = assistant.name.split(" ")[0];
  const by = assistant.name;

  if (ended) {
    const why = task.done ? `This task is done${task.doneBy ? `, by ${task.doneBy.split(" ")[0]}` : ""}. Thank you.` : h.endedReason === "taken-back" ? `${owner.firstName} took this task back, so this link no longer works.` : "This link has expired.";
    return (
      <Frame>
        <Card title={task.title}>
          <div className="flex flex-col gap-4">
            <Banner tone={task.done ? "success" : "warning"}>{why}</Banner>
            {!task.done && (
              <Button
                className="self-start"
                loading={pending("ask")}
                onClick={() => run("ask", () => act.askForNewLink(token), `We told ${owner.firstName} you need a new link.`)}
              >
                {pending("ask") ? "Asking" : `Ask ${owner.firstName} for a new link`}
              </Button>
            )}
          </div>
        </Card>
      </Frame>
    );
  }

  const engage = isEngage(task.kind) ? engageKinds[task.kind] : undefined;
  const sent = task.people?.filter((p) => p.done).length ?? 0;
  const total = task.people?.length ?? 0;

  return (
    <Frame>
      <Card title={task.title} action={<Meta icon={CalendarBlank}>Due {dayIn(task.dueAt)}</Meta>}>
        <div className="flex flex-col gap-4">
          <Banner tone="info" title={`${first}, ${owner.firstName} asked you to do this`}>
            {h.note ? <>&ldquo;{h.note}&rdquo; </> : null}
            {task.kind === "connect" && `Sign in to ${owner.firstName}'s LinkedIn, open each profile, press Connect, then "Add a note", paste the note and send. Then mark it as sent here.`}
            {task.kind === "profile" && `On ${owner.firstName}'s LinkedIn, paste the text where shown, then mark it as done here.`}
            {task.kind === "event" && `Register ${owner.firstName} on the ${task.event?.type === "program" ? "program" : "event"} page, then mark it as done here.`}
            {task.kind === "video" && `Help ${owner.firstName} record a short video using the guide below, then upload it here.`}
            {engage && `Sign in to ${owner.firstName}'s LinkedIn. ${engage.steps}`}
          </Banner>
          <Banner tone="neutral">{owner.firstName} and their Bluecut manager see what you mark here. This link only opens this task.</Banner>

          {task.kind === "connect" && (
            <>
              <span className="flex flex-col gap-2">
                <span className="text-body-sm text-secondary">
                  {sent} of {total} sent
                </span>
                <span className="max-w-xs">
                  <ProgressBar value={sent} max={total} />
                </span>
              </span>
              <ul className="flex flex-col gap-3">
                {task.people!.map((p) => (
                  <Person key={p.id} task={task} p={p} by={by} />
                ))}
              </ul>
            </>
          )}

          {(task.kind === "profile" || task.kind === "event") && (
            <Tile>
              {task.kind === "profile" ? (
                <>
                  <Banner>Where: {task.where}</Banner>
                  <p className="text-body-sm text-primary">{task.text}</p>
                </>
              ) : (
                task.event && (
                  <span className="flex flex-col gap-1">
                    <span className="text-body font-medium text-primary">{task.event.name}</span>
                    <span className="text-body-sm text-secondary">
                      {task.event.host} · {dayIn(task.event.startsAt)} · {task.event.place}
                    </span>
                  </span>
                )
              )}
              <TileFooter>
                {task.kind === "profile" ? (
                  <TextButton
                    onClick={async () => {
                      await copy(task.text ?? "");
                      toast("Copied. Paste it into LinkedIn.");
                    }}
                  >
                    <Copy className="size-4" aria-hidden /> Copy text
                  </TextButton>
                ) : (
                  <a href={task.event?.url} target="_blank" rel="noreferrer" className={textActionClass}>
                    <LinkSimple className="size-4" aria-hidden /> Open {task.event?.type === "program" ? "program" : "event"} page
                  </a>
                )}
                <Button size="sm" loading={pending("done")} onClick={() => run("done", () => act.markTaskDone(task.id, true, by), `Done. We told ${owner.firstName}.`)}>
                  {task.kind === "profile" ? "Mark as done" : task.event?.type === "program" ? "Mark as applied" : "Mark as registered"}
                </Button>
              </TileFooter>
            </Tile>
          )}

          {task.kind === "video" && task.video && <VideoTask task={task} />}

          {engage && (
            <>
              <span className="flex flex-col gap-2">
                <span className="text-body-sm text-secondary">
                  {taskProgress(task).done} of {taskProgress(task).total} {progressWord(task)}
                </span>
                <span className="max-w-xs">
                  <ProgressBar value={taskProgress(task).done} max={taskProgress(task).total} />
                </span>
              </span>
              <ul className="flex flex-col gap-3">
                {task.items?.map((i) => (
                  <EngageItemTile key={i.id} task={task} item={i} by={by} showWhy={false} />
                ))}
              </ul>
            </>
          )}
        </div>
      </Card>
    </Frame>
  );
}
