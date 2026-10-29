"use client";

import { useState } from "react";
import { Button, Dialog, Textarea } from "@/components/ui";

export type RepostChoice = "reshare" | "new";

/** What each way of posting again does on LinkedIn, in words both clients and managers see. */
export const repostOptions: { value: RepostChoice; label: string; help: string }[] = [
  { value: "reshare", label: "Share it again with a new comment", help: "The original stays up with its reactions. Your new comment shows above it." },
  { value: "new", label: "Post it again as a new post", help: "A fresh post with the same words, which can be refreshed first. It starts with no reactions." },
];

/**
 * Choose how a post goes out again, plus a note (the client's request, or the manager's new comment).
 * Used by the client to ask, and by the manager to prepare the draft.
 */
export function PostAgainDialog({
  open,
  onClose,
  title,
  intro,
  noteLabel,
  notePlaceholder,
  noteRequired,
  initial = "reshare",
  initialNote = "",
  onlyNew,
  busy,
  submitLabel,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  intro: string;
  noteLabel: (choice: RepostChoice) => string;
  notePlaceholder?: string;
  /** Whether the note is needed for this choice (a reshare needs its new comment). */
  noteRequired?: (choice: RepostChoice) => boolean;
  initial?: RepostChoice;
  initialNote?: string;
  /** A taken-down post can only be posted again as new: there is nothing left to reshare. */
  onlyNew?: boolean;
  busy?: boolean;
  submitLabel: string;
  onSubmit: (choice: RepostChoice, note: string) => void;
}) {
  const [choice, setChoice] = useState<RepostChoice>(onlyNew ? "new" : initial);
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string>();
  const options = onlyNew ? repostOptions.filter((o) => o.value === "new") : repostOptions;

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-body-sm text-secondary">{intro}</p>
      {options.length > 1 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">How to post it again</legend>
          {options.map((o) => (
            <label key={o.value} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${choice === o.value ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
              <input type="radio" name="repost" checked={choice === o.value} onChange={() => { setChoice(o.value); setError(undefined); }} className="mt-1 size-4 accent-primary-600" />
              <span className="flex flex-col gap-1">
                <span className="text-body font-medium text-primary">{o.label}</span>
                <span className="text-caption text-secondary">{o.help}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      <Textarea
        label={noteLabel(choice)}
        rows={3}
        placeholder={notePlaceholder}
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setError(undefined);
        }}
        error={error}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          loading={busy}
          onClick={() => {
            if (noteRequired?.(choice) && !note.trim()) return setError(choice === "reshare" ? "Write the new comment that goes above the original." : "Add the words for the post.");
            onSubmit(choice, note.trim());
          }}
        >
          {submitLabel}
        </Button>
      </div>
    </Dialog>
  );
}
