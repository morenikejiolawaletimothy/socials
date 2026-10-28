"use client";

import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Breadcrumbs, Button, Card, Textarea, useToast } from "@/components/ui";
import { agoIn } from "@/lib/format";
import { act, useMyClient, type Complaint } from "@/lib/mock";

const kinds: { value: Complaint["kind"]; label: string }[] = [
  { value: "missed", label: "A post or task was missed" },
  { value: "quality", label: "The quality of the work" },
  { value: "not-allowed", label: "Something was done that I did not allow" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Something else" },
];
const statusTone = { open: "warning", "in-review": "info", resolved: "success" } as const;
const statusLabel = { open: "Received", "in-review": "Being looked at", resolved: "Resolved" };

/** C12 Raise a complaint: what went wrong, describe it, attach a file, send. Status shown afterwards. */
export default function ComplaintPage() {
  const { client, complaints } = useMyClient();
  const toast = useToast();
  const [kind, setKind] = useState<Complaint["kind"] | "">("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<{ kind?: string; text?: string }>({});
  const [busy, setBusy] = useState(false);
  if (!client) return null;

  return (
    <Columns {...rails.clientSettings}>
      <Card title="Raise a complaint" eyebrow={<Breadcrumbs items={[{ label: "Control", href: "/control" }, { label: "Raise a complaint" }]} />}>
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const next: typeof errors = {};
            if (!kind) next.kind = "Choose what went wrong.";
            if (text.trim().length < 10) next.text = "Tell us a little more, so we can look into it.";
            setErrors(next);
            if (Object.keys(next).length || !kind) return;
            setBusy(true);
            await act.raiseComplaint(client.id, kind, text.trim());
            setBusy(false);
            setKind("");
            setText("");
            toast("Sent. The owner will reply within 1 working day.");
          }}
        >
          <p className="text-body-sm text-secondary">The owner of Bluecut reads every complaint and replies within 1 working day.</p>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-body-sm font-medium text-primary">What went wrong?</legend>
            {kinds.map((k) => (
              <label key={k.value} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${kind === k.value ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                <input type="radio" name="kind" checked={kind === k.value} onChange={() => { setKind(k.value); setErrors({ ...errors, kind: undefined }); }} className="size-4 accent-primary-600" />
                <span className="text-body text-primary">{k.label}</span>
              </label>
            ))}
            {errors.kind && <p className="text-body-sm text-danger">{errors.kind}</p>}
          </fieldset>
          <Textarea label="Tell us what happened" rows={5} value={text} onChange={(e) => setText(e.target.value)} error={errors.text} />
          <label className="flex flex-col gap-2">
            <span className="text-body-sm font-medium text-primary">Attach a file (optional)</span>
            <input type="file" className="text-body-sm text-secondary file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-border-strong file:bg-card file:px-4 file:py-2 file:text-body-sm file:font-medium file:text-primary-700" />
            <span className="text-caption text-secondary">A screenshot or document, up to 25 MB.</span>
          </label>
          <Button type="submit" className="self-start" disabled={busy}>
            {busy ? "Sending" : "Send"}
          </Button>
        </form>
      </Card>

      {complaints.length > 0 && (
        <Card title="Your complaints">
          <ul className="flex flex-col">
            {complaints.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-body-sm font-medium text-primary">{kinds.find((k) => k.value === c.kind)?.label ?? "Manager"}</span>
                  <Badge status={statusTone[c.status]}>{statusLabel[c.status]}</Badge>
                </span>
                <span className="text-body-sm text-secondary">{c.text}</span>
                {c.outcome && <span className="text-body-sm text-primary">Outcome: {c.outcome}</span>}
                <span className="text-caption text-secondary">Sent {agoIn(c.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Columns>
  );
}
