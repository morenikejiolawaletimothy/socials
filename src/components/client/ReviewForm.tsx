"use client";

import { useState } from "react";
import { Button, Switch, useTask } from "@/components/ui";
import type { ReviewSettings } from "@/lib/mock";

const freq: { value: ReviewSettings["frequency"]; label: string; help: string }[] = [
  { value: "weekly", label: "Once a week", help: "All of next week's posts in one go. Most people choose this." },
  { value: "twice-weekly", label: "Twice a week", help: "Smaller batches, more often." },
  { value: "every-post", label: "Every post", help: "Each post on its own, as it is ready." },
];

const kinds: { key: keyof ReviewSettings["approval"]; label: string }[] = [
  { key: "posts", label: "Posts" },
  { key: "comments", label: "Routine likes and comments" },
  { key: "connectionNotes", label: "Connection notes" },
];

function Choice({ name, checked, onChange, label, help }: { name: string; checked: boolean; onChange: () => void; label: string; help?: string }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${checked ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-1 size-4 accent-primary-600 focus-visible:focus-ring" />
      <span className="flex flex-col gap-1">
        <span className="text-body font-medium text-primary">{label}</span>
        {help && <span className="text-body-sm text-secondary">{help}</span>}
      </span>
    </label>
  );
}

function Question({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 flex items-center gap-2 font-display text-display-lg text-primary">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary-50 text-caption text-primary-700">{n}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

/** C5 How you review: how often, where we tell you, what needs approval, and what happens if you do not reply. */
export function ReviewForm({
  initial,
  onSave,
  onSaved,
  onCancel,
  success,
  saveLabel = "Save",
}: {
  initial: ReviewSettings;
  onSave: (r: ReviewSettings) => Promise<unknown>;
  onSaved?: () => void;
  onCancel?: () => void;
  success: string;
  saveLabel?: string;
}) {
  const [r, setR] = useState(initial);
  const { run, pending } = useTask();
  const [error, setError] = useState<string>();

  const summary = [
    freq.find((f) => f.value === r.frequency)?.label,
    `by ${[r.channels.email && "email", r.channels.app && "in the app"].filter(Boolean).join(" and ")}`,
    r.ifNoReply === "wait" ? "nothing goes out until you approve" : "your manager posts after 24 hours without a reply",
  ].join(", ");

  return (
    <div className="flex flex-col gap-8">
      <Question n={1} title="How often do you want to review?">
        {freq.map((f) => (
          <Choice key={f.value} name="frequency" checked={r.frequency === f.value} onChange={() => setR({ ...r, frequency: f.value })} label={f.label} help={f.help} />
        ))}
      </Question>

      <Question n={2} title="Where should we tell you?">
        <div className="flex flex-col gap-4 rounded-md border border-border p-4">
          <Switch label="Email" checked={r.channels.email} onChange={(v) => { setR({ ...r, channels: { ...r.channels, email: v } }); setError(undefined); }} />
          <Switch label="In the app" checked={r.channels.app} onChange={(v) => { setR({ ...r, channels: { ...r.channels, app: v } }); setError(undefined); }} />
        </div>
        {error && <p className="text-body-sm text-danger">{error}</p>}
      </Question>

      <Question n={3} title="What needs your approval?">
        <ul className="flex flex-col rounded-md border border-border">
          {kinds.map((k) => (
            <li key={k.key} className="flex flex-col gap-2 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-body text-primary">{k.label}</span>
              <span role="radiogroup" aria-label={k.label} className="flex rounded-md border border-border-strong p-0.5">
                {(["ask", "go"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={r.approval[k.key] === v}
                    onClick={() => setR({ ...r, approval: { ...r.approval, [k.key]: v } })}
                    className={`rounded-sm px-3 py-1.5 text-body-sm font-medium focus-visible:focus-ring ${r.approval[k.key] === v ? "bg-primary-600 text-inverse" : "text-secondary hover:text-primary"}`}
                  >
                    {v === "ask" ? "Ask me first" : "Go ahead"}
                  </button>
                ))}
              </span>
            </li>
          ))}
          <li className="p-4 text-body-sm text-secondary">Profile changes and sensitive topics always ask you first.</li>
        </ul>
      </Question>

      <Question n={4} title="If you do not reply by the due time">
        <Choice
          name="noreply"
          checked={r.ifNoReply === "wait"}
          onChange={() => setR({ ...r, ifNoReply: "wait" })}
          label="Wait for me"
          help="Nothing goes out until you approve. We remind you, but we cannot post without you. Posts not approved in time are held, and your weekly update shows what was held and why."
        />
        <Choice
          name="noreply"
          checked={r.ifNoReply === "go"}
          onChange={() => setR({ ...r, ifNoReply: "go" })}
          label="Go ahead if I have not replied within 24 hours"
          help="Your manager posts the reviewed drafts. You can still take any post down."
        />
      </Question>

      <div className="flex flex-col gap-4 rounded-md bg-neutral-25 p-4">
        <p className="text-body-sm text-primary">
          <span className="font-medium">Your choice: </span>
          {summary}.
        </p>
        <p className="text-caption text-secondary">Changes apply to new posts. Posts already sent to you keep their path. Change this any time in Control.</p>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          loading={pending("save")}
          onClick={async () => {
            if (!r.channels.email && !r.channels.app) return setError("Choose at least one, so you know when posts are ready.");
            if (await run("save", () => onSave(r), success)) onSaved?.();
          }}
        >
          {pending("save") ? "Saving" : saveLabel}
        </Button>
      </div>
    </div>
  );
}

export function reviewSummary(r: ReviewSettings) {
  return {
    frequency: freq.find((f) => f.value === r.frequency)?.label ?? "",
    channels: [r.channels.email && "Email", r.channels.app && "In the app"].filter(Boolean).join(" and "),
    approval: kinds.map((k) => `${k.label}: ${r.approval[k.key] === "ask" ? "ask me first" : "go ahead"}`),
    noReply: r.ifNoReply === "wait" ? "Wait for me" : "Go ahead after 24 hours",
  };
}
