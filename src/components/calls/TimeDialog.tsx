"use client";

import { useState } from "react";
import { Banner, Button, Dialog, Textarea } from "@/components/ui";
import { TimePicker } from "./TimePicker";

/** Pick a time from a manager's open slots in a dialog, with an optional note. Used to propose or reschedule a call. */
export function TimeDialog({
  open,
  onClose,
  times,
  onPick,
  pending,
  title = "Suggest another time",
  submitLabel = "Suggest time",
  noteLabel,
}: {
  open: boolean;
  onClose: () => void;
  times: string[];
  onPick: (at: string, note: string) => void | Promise<void>;
  pending?: boolean;
  title?: string;
  submitLabel?: string;
  /** When set, shows a note field with this label. */
  noteLabel?: string;
}) {
  const [at, setAt] = useState<string | null>(null);
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        {times.length ? (
          <>
            <TimePicker times={times} value={at} onChange={setAt} maxDays={5} />
            {noteLabel && <Textarea label={noteLabel} value={note} onChange={(e) => setNote(e.target.value)} />}
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
              <Button loading={pending} onClick={() => at && onPick(at, note.trim())} disabled={!at}>
                {submitLabel}
              </Button>
              <Button variant="cancel" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <Banner tone="info">No open times to offer right now. Open more availability, or agree a time in messages first.</Banner>
            <Button variant="secondary" className="self-start" onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </div>
    </Dialog>
  );
}
