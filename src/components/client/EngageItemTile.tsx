"use client";

import { Circle, Copy, HandHeart, HandsClapping, Heart, Lightbulb, LinkedinLogo, LinkSimple, PencilSimple, Smiley, ThumbsUp } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useState } from "react";
import { Avatar, Badge, Banner, Button, Textarea, TextButton, textActionClass, Tile, TileFooter, useTask, useToast } from "@/components/ui";
import { engageKinds, isEngage, reactions } from "@/lib/engage";
import { act, type EngageItem, type LinkedInReaction, type QuickTask } from "@/lib/mock";

const reactionIcons: Record<LinkedInReaction, Icon> = { like: ThumbsUp, celebrate: HandsClapping, support: HandHeart, love: Heart, insightful: Lightbulb, funny: Smiley };

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard can be blocked. The text is on screen to copy by hand.
  }
}

/** The reaction to pick on LinkedIn, with LinkedIn's name for it. */
export function ReactionLabel({ reaction }: { reaction: LinkedInReaction }) {
  const I = reactionIcons[reaction];
  return (
    <span className="inline-flex items-center gap-2 text-body-sm font-medium text-primary">
      <I className="size-5 text-primary-600" aria-hidden /> React with {reactions[reaction]}
    </span>
  );
}

/**
 * One post or person in an engagement task, in at most three steps: open it, copy the ready text (if any),
 * mark it done. `by` is the assistant's name when they work from their link (C19).
 */
export function EngageItemTile({ task, item, by, showWhy = true }: { task: QuickTask; item: EngageItem; by?: string; showWhy?: boolean }) {
  const toast = useToast();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text ?? "");
  if (!isEngage(task.kind)) return null;
  const k = engageKinds[task.kind];

  const toggle = () =>
    run("done", () => act.toggleItemDone(task.id, item.id, by), {
      text: item.done ? `${item.name}: marked as not done.` : `${item.name}: ${k.doneLabel.toLowerCase()}. It counts in this week's update.`,
      action: { label: "Undo", onClick: () => act.toggleItemDone(task.id, item.id, by) },
    });

  return (
    <li>
      <Tile done={item.done}>
        <span className={`flex gap-4 ${item.role ? "items-start" : "items-center"}`}>
          <Avatar name={item.name} src={item.photo} size="lg" />
          <span className={`flex min-w-0 flex-1 flex-col gap-1 ${item.role ? "pt-1" : ""}`}>
            <span className="text-body font-medium text-primary">{item.name}</span>
            <span className="text-body-sm text-secondary">{item.role}</span>
          </span>
          {item.done && (
            <span className="shrink-0">
              <Badge status="success">{item.doneBy ? `${k.doneLabel} by ${item.doneBy.split(" ")[0]}` : k.doneLabel}</Badge>
            </span>
          )}
        </span>

        {item.post && <blockquote className="rounded-md bg-neutral-25 px-4 py-3 text-body-sm text-secondary">&ldquo;{item.post}&rdquo;</blockquote>}
        {showWhy && <Banner tone="info">Why: {item.why}</Banner>}
        {item.reaction && <ReactionLabel reaction={item.reaction} />}

        {k.text &&
          (editing ? (
            <div className="flex flex-col gap-3">
              <Textarea label={k.text.label} value={text} onChange={(e) => setText(e.target.value)} maxLength={k.text.max} help={`${text.length} of ${k.text.max} characters.`} />
              <span className="flex gap-2">
                <Button
                  size="sm"
                  loading={pending("save")}
                  onClick={async () => {
                    if (!text.trim()) return toast(`${k.text!.label} cannot be empty. Write something, or cancel to keep the one we prepared.`, "danger");
                    if (await run("save", () => act.editItemText(task.id, item.id, text.trim()), "Saved.")) setEditing(false);
                  }}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="cancel"
                  onClick={() => {
                    setText(item.text ?? "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </span>
            </div>
          ) : (
            item.text && <p className="text-body-sm text-primary">{item.text}</p>
          ))}

        {!editing && (
          <TileFooter>
            <span className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a href={item.url} target="_blank" rel="noreferrer" className={textActionClass}>
                {k.target === "post" ? <LinkSimple className="size-4" aria-hidden /> : <LinkedinLogo className="size-4" aria-hidden />}
                {k.target === "post" ? "Open post" : "Open profile"}
              </a>
              {k.text && item.text && (
                <TextButton
                  onClick={async () => {
                    await copy(item.text ?? "");
                    toast(k.text!.copied);
                  }}
                >
                  <Copy className="size-4" aria-hidden /> {k.text.copy}
                </TextButton>
              )}
              {k.text && !item.done && (
                <TextButton onClick={() => setEditing(true)}>
                  <PencilSimple className="size-4" aria-hidden /> Edit
                </TextButton>
              )}
            </span>
            {item.done ? (
              <TextButton onClick={toggle}>Not done yet</TextButton>
            ) : (
              <Button size="sm" variant="secondary" loading={pending("done")} onClick={toggle}>
                {!pending("done") && <Circle className="size-4" aria-hidden />}
                {k.mark}
              </Button>
            )}
          </TileFooter>
        )}
      </Tile>
    </li>
  );
}
