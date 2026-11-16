"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonClass, Dialog, Select, Textarea, useTask } from "@/components/ui";
import { act, useData, type QuickTask } from "@/lib/mock";

/**
 * Figma "Share with assistant": send this task to the client's EA or PA as a private link (email or
 * WhatsApp). They need no account and see this task only. With no assistant yet, it offers to add one.
 */
export function ShareDialog({ task, clientId, open, onClose }: { task: QuickTask; clientId: string; open: boolean; onClose: () => void }) {
  const db = useData();
  const assistants = (db.assistants ?? []).filter((a) => a.clientId === clientId);
  const [pick, setPick] = useState(assistants[0]?.id ?? "");
  const [note, setNote] = useState("");
  const { run, pending } = useTask();

  return (
    <Dialog open={open} onClose={onClose} title="Share with assistant" info="We send them a private link to this task only. They do not need an account, and you see their progress here.">
      {assistants.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-secondary">Add your executive or personal assistant first. It takes a few seconds.</p>
          <div className="flex justify-end gap-3">
            <Button variant="cancel" onClick={onClose}>
              Cancel
            </Button>
            <Link href="/assistants/new" className={buttonClass("primary")}>
              Add an assistant
            </Link>
          </div>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const a = assistants.find((x) => x.id === pick);
            if (await run("share", () => act.handToAssistant(task.id, pick, note.trim() || undefined), `Sent to ${a?.name.split(" ")[0] ?? "your assistant"}.`)) onClose();
          }}
        >
          <Select label="Assistant" value={pick} onChange={(e) => setPick(e.target.value)}>
            {assistants.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.role})
              </option>
            ))}
          </Select>
          <Textarea label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          <div className="flex justify-end gap-3">
            <Button variant="cancel" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={pending("share")}>
              {pending("share") ? "Sending" : "Send"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
