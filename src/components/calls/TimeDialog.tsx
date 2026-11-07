"use client";

import { useState } from "react";
import { Banner, Button, Dialog, Textarea } from "@/components/ui";
import { TimePicker } from "./TimePicker";

/**
 * Suggest times: the only way to turn a time down. The person gives a short reason and picks one or more
 * alternative times from the manager's open slots. Used by both the client and the manager, for a pending
 * call or to reschedule a booked one.
 */
export function TimeDialog({
  open,
  onClose,
  times,
  onSubmit,
  pending,
  title = "Suggest other times",
  submitLabel = "Send suggestion",
}: {
  open: boolean;
  onClose: () => void;
  times: string[];
  onSubmit: (times: string[], note: string) => void | Promise<void>;
  pending?: boolean;
  title?: string;
  submitLabel?: string;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<{ note?: string; times?: string }>({});

  const toggle = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  return (
    <Dialog open={open} onClose={onClose} title={title} info="Give a reason and offer one or more times that work for you. The other person accepts one or suggests again.">
      <div className="flex flex-col gap-4">
        {times.length ? (
          <>
            <Textarea
              label="Reason"
              value={note}
              onChange={(e) => { setNote(e.target.value); setError({ ...error, note: undefined }); }}
              placeholder="Something came up at that time."
              help="A short note, so the other person knows why."
              error={error.note}
            />
            <div className="flex flex-col gap-2">
              <span className="text-body-sm font-medium text-primary">Offer one or more times</span>
              <TimePicker times={times} selected={picked} onChange={toggle} maxDays={5} />
              {error.times && <p className="text-body-sm text-danger">{error.times}</p>}
            </div>
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
              <Button
                loading={pending}
                onClick={() => {
                  const next: typeof error = {};
                  if (note.trim().length < 3) next.note = "Add a short reason.";
                  if (!picked.length) next.times = "Pick at least one time.";
                  setError(next);
                  if (Object.keys(next).length) return;
                  onSubmit(picked, note.trim());
                }}
              >
                {submitLabel}
              </Button>
              <Button variant="cancel" onClick={onClose}>
                Back
              </Button>
            </div>
          </>
        ) : (
          <>
            <Banner tone="info">No open times to offer right now. The manager opens more availability each week.</Banner>
            <Button variant="secondary" className="self-start" onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </div>
    </Dialog>
  );
}
