"use client";

import { useState } from "react";
import { WhatsAppDialog } from "@/components/account/NotifySettings";
import { Button, InfoTip, Switch, TextButton, useTask } from "@/components/ui";
import { useMyClient, type ReviewSettings } from "@/lib/mock";

const freq: { value: ReviewSettings["frequency"]; label: string }[] = [
  { value: "weekly", label: "Once a week" },
  { value: "twice-weekly", label: "Twice a week" },
  { value: "every-post", label: "Every post" },
];

const kinds: { key: keyof ReviewSettings["approval"]; label: string }[] = [
  { key: "posts", label: "Posts" },
];

function Choice({ name, checked, onChange, label }: { name: string; checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors ${checked ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
      <span className="text-body text-primary">{label}</span>
    </label>
  );
}

function Question({ title, info, children }: { title: string; info?: React.ReactNode; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 flex items-center gap-2 font-display text-display-lg text-primary">
        {title}
        {info && <InfoTip label={`About ${title}`}>{info}</InfoTip>}
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
  const { user } = useMyClient();
  const [addingWa, setAddingWa] = useState(false);
  const waReady = !!user?.whatsapp?.confirmed;

  return (
    <div className="flex flex-col gap-8">
      <Question title="How often do you want to review?">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {freq.map((f) => (
            <Choice key={f.value} name="frequency" checked={r.frequency === f.value} onChange={() => setR({ ...r, frequency: f.value })} label={f.label} />
          ))}
        </div>
      </Question>

      <Question title="Where should we tell you?">
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          <li className="px-4 py-4">
            <Switch label="Email" checked={r.channels.email} onChange={(v) => { setR({ ...r, channels: { ...r.channels, email: v } }); setError(undefined); }} />
          </li>
          <li className="px-4 py-4">
            {waReady ? (
              <div className="flex flex-col gap-1">
                <Switch label="WhatsApp" checked={!!r.channels.whatsapp} onChange={(v) => { setR({ ...r, channels: { ...r.channels, whatsapp: v } }); setError(undefined); }} />
                <span className="flex flex-wrap items-center gap-3 text-body-sm text-secondary">
                  {user?.whatsapp?.number}
                  <TextButton onClick={() => setAddingWa(true)}>Change</TextButton>
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-body text-primary">WhatsApp</span>
                  <span className="text-body-sm text-secondary">Add your number to get a message with a link to each review.</span>
                </span>
                <Button size="sm" variant="secondary" className="shrink-0" onClick={() => setAddingWa(true)}>
                  Add number
                </Button>
              </div>
            )}
          </li>
          <li className="px-4 py-4">
            <Switch label="In the app" checked={r.channels.app} onChange={(v) => { setR({ ...r, channels: { ...r.channels, app: v } }); setError(undefined); }} />
          </li>
        </ul>
        {user && <WhatsAppDialog key={String(addingWa)} user={user} open={addingWa} onClose={() => { setAddingWa(false); setR((x) => ({ ...x, channels: { ...x.channels, whatsapp: true } })); }} />}
        {error && <p className="text-body-sm text-danger">{error}</p>}
      </Question>

      <Question
        title="What needs your approval?"
        info="Reactions, comments, follows and connection requests come to you as quick tasks, ready to do in seconds. LinkedIn only lets you send them, so nothing goes out without you."
      >
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

      <Question title="If you do not reply within 24 hours">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Choice
            name="noreply"
            checked={r.ifNoReply === "wait"}
            onChange={() => setR({ ...r, ifNoReply: "wait" })}
            label="Wait for me"
          />
          <Choice
            name="noreply"
            checked={r.ifNoReply === "go"}
            onChange={() => setR({ ...r, ifNoReply: "go" })}
            label="Go ahead"
          />
        </div>
      </Question>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {onCancel && (
          <Button variant="cancel" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          loading={pending("save")}
          onClick={async () => {
            if (!r.channels.email && !r.channels.app && !(r.channels.whatsapp && waReady)) return setError("Choose at least one, so you know when posts are ready.");
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
    channels: [r.channels.email && "Email", r.channels.whatsapp && "WhatsApp", r.channels.app && "In the app"].filter(Boolean).join(", ").replace(/, ([^,]*)$/, " and $1"),
    approval: kinds.map((k) => ({ label: k.label, ask: r.approval[k.key] === "ask" })),
    noReply: r.ifNoReply === "wait" ? "Wait for me" : "Go ahead after 24 hours",
  };
}
