"use client";

import { Check, Copy, PencilSimple, PushPin, PushPinSlash, ThumbsDown, ThumbsUp, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { Button, useToast } from "@/components/ui";
import type { Message, Reaction } from "@/lib/mock";

/*
 * What sits under every chat message, for clients and account managers alike:
 * quick reactions, copy, pin, and edit (or delete) on your own messages.
 */

export const reactionKinds: { kind: Reaction; label: string; Icon: typeof ThumbsUp }[] = [
  { kind: "like", label: "Like", Icon: ThumbsUp },
  { kind: "dislike", label: "Dislike", Icon: ThumbsDown },
  { kind: "done", label: "Got it", Icon: Check },
];

/** Small round icon button in a message's action row; brand tint on hover and when on, as across the product. */
const actionClass = (on = false) =>
  `flex size-8 items-center justify-center rounded-full transition-colors focus-visible:focus-ring ${on ? "bg-primary-50 text-primary-700" : "text-secondary hover:bg-primary-50 hover:text-primary-700"}`;

/** "Edited" and "Pinned" markers that follow a message's time. */
export function MessageMarks({ m }: { m: Message }) {
  return (
    <>
      {m.editedAt && <span>· Edited</span>}
      {m.pinned && (
        <span className="flex items-center gap-1 text-primary-700">
          <PushPin className="size-3.5" aria-hidden /> Pinned
        </span>
      )}
    </>
  );
}

/** Reactions given so far, one chip per kind with its count. Pressing one adds or takes off your own. */
export function ReactionChips({ m, meId, nameOf, onReact, align = "start" }: { m: Message; meId: string; nameOf: (userId: string) => string; onReact: (kind: Reaction) => void; align?: "start" | "end" }) {
  const given = reactionKinds.filter((r) => m.reactions?.some((x) => x.kind === r.kind));
  if (!given.length) return null;
  const mine = m.reactions?.find((r) => r.userId === meId)?.kind;
  return (
    <div className={`flex flex-wrap gap-1 ${align === "end" ? "justify-end" : ""}`}>
      {given.map(({ kind, label, Icon }) => {
        const who = (m.reactions ?? []).filter((x) => x.kind === kind);
        const on = mine === kind;
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onReact(kind)}
            aria-pressed={on}
            title={`${label}: ${who.map((x) => (x.userId === meId ? "You" : nameOf(x.userId))).join(", ")}`}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption transition-colors focus-visible:focus-ring ${on ? "border-primary-300 bg-primary-50 text-primary-700" : "border-border bg-card text-secondary hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"}`}
          >
            <Icon className="size-3.5" aria-hidden />
            <span className="sr-only">{label}</span>
            {who.length}
          </button>
        );
      })}
    </div>
  );
}

/** The action row: react, copy, pin, and edit or delete when it is yours. Shows on hover or focus on desktop, always on phones. */
export function MessageActions({ m, meId, onReact, onPin, onEdit, onDelete }: { m: Message; meId: string; onReact: (kind: Reaction) => void; onPin: () => void; onEdit?: () => void; onDelete?: () => void }) {
  const toast = useToast();
  const mine = m.reactions?.find((r) => r.userId === meId)?.kind;
  const words = m.text ?? m.voice?.transcript;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(words ?? "");
      toast("Copied.");
    } catch {
      toast("Could not copy. Select the text and copy it instead.", "danger");
    }
  };

  return (
    <div role="toolbar" aria-label="Message actions" className="flex items-center gap-0.5 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
      {reactionKinds.map(({ kind, label, Icon }) => (
        <button key={kind} type="button" onClick={() => onReact(kind)} aria-pressed={mine === kind} aria-label={label} title={label} className={actionClass(mine === kind)}>
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
      <span className="mx-1 h-4 w-px bg-border" aria-hidden />
      {words && (
        <button type="button" onClick={copy} aria-label="Copy text" title="Copy text" className={actionClass()}>
          <Copy className="size-4" aria-hidden />
        </button>
      )}
      <button type="button" onClick={onPin} aria-pressed={!!m.pinned} aria-label={m.pinned ? "Unpin" : "Pin to the top"} title={m.pinned ? "Unpin" : "Pin to the top"} className={actionClass(m.pinned)}>
        {m.pinned ? <PushPinSlash className="size-4" aria-hidden /> : <PushPin className="size-4" aria-hidden />}
      </button>
      {onEdit && m.text && (
        <button type="button" onClick={onEdit} aria-label="Edit message" title="Edit message" className={actionClass()}>
          <PencilSimple className="size-4" aria-hidden />
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} aria-label="Delete message" title="Delete message" className="flex size-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-danger-bg hover:text-danger focus-visible:focus-ring">
          <Trash className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

/** Editing your own message in place. What was typed stays if saving fails. */
export function MessageEditor({ initial, saving, onSave, onCancel }: { initial: string; saving: boolean; onSave: (text: string) => Promise<boolean>; onCancel: () => void }) {
  const [draft, setDraft] = useState(initial);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (draft.trim() && (await onSave(draft.trim()))) onCancel();
      }}
      className="flex w-full max-w-md flex-col gap-2"
    >
      <label>
        <span className="sr-only">Edit your message</span>
        <textarea
          autoFocus
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onCancel()}
          className="block w-full resize-none rounded-lg border border-border-strong bg-card px-4 py-3 text-body-sm text-primary focus-visible:border-primary-600 focus-visible:focus-ring"
        />
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="cancel" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={saving} disabled={!draft.trim() || draft.trim() === initial}>
          Save
        </Button>
      </div>
    </form>
  );
}

/** Strip above a conversation with its pinned messages. Pressing it jumps to one, then the next. */
export function PinnedStrip({ messages }: { messages: Message[] }) {
  const pinned = messages.filter((m) => m.pinned);
  const [at, setAt] = useState(0);
  if (!pinned.length) return null;
  const i = at % pinned.length;
  const pin = pinned[i];
  return (
    <button
      type="button"
      onClick={() => {
        document.getElementById(`msg-${pin.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        setAt((n) => (n + 1) % pinned.length);
      }}
      className="flex w-full items-center gap-3 border-b border-border bg-neutral-25 px-4 py-2 text-left transition-colors hover:bg-primary-50 focus-visible:focus-ring sm:px-6"
    >
      <PushPin className="size-4 shrink-0 text-primary-700" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-caption font-medium text-primary-700">{pinned.length > 1 ? `Pinned ${i + 1} of ${pinned.length}` : "Pinned"}</span>
        <span className="truncate text-body-sm text-primary">{pin.text ?? pin.voice?.transcript ?? pin.file?.name}</span>
      </span>
    </button>
  );
}
