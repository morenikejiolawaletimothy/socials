"use client";

import { useState } from "react";
import { Badge, Dialog, Meta, TextButton } from "@/components/ui";
import { Robot, Timer } from "@phosphor-icons/react";
import { dayTimeIn } from "@/lib/format";
import { callTitle } from "@/components/rails/NextCallCard";
import type { Call } from "@/lib/mock";

/** "View details": opens the call's full purpose, description, proposed times and reason, so long notes stay out of the card. */
export function CallDetails({ call, who }: { call: Call; who: string }) {
  const [open, setOpen] = useState(false);
  const options = call.pending?.options ?? [call.at];
  return (
    <>
      <TextButton onClick={() => setOpen(true)}>View details</TextButton>
      <Dialog open={open} onClose={() => setOpen(false)} title={callTitle(call)}>
        <div className="flex flex-col gap-4">
          <span className="flex flex-wrap items-center gap-2">
            <Badge status="neutral">{who}</Badge>
            <Badge status={call.recording ? "info" : "neutral"}>{call.recording ? "Bot joins" : "No bot"}</Badge>
          </span>
          {call.agenda && (
            <section className="flex flex-col gap-1">
              <h3 className="text-body-sm font-semibold text-primary">What to discuss</h3>
              <p className="whitespace-pre-line text-body-sm text-secondary">{call.agenda}</p>
            </section>
          )}
          <section className="flex flex-col gap-2">
            <h3 className="text-body-sm font-semibold text-primary">{call.status === "booked" ? "Agreed time" : options.length > 1 ? "Proposed times" : "Proposed time"}</h3>
            <ul className="flex flex-col gap-1">
              {options.map((t) => (
                <li key={t}>
                  <Meta icon={Timer}>{dayTimeIn(t)}</Meta>
                </li>
              ))}
            </ul>
          </section>
          {call.pending?.note && (
            <section className="flex flex-col gap-1">
              <h3 className="text-body-sm font-semibold text-primary">Reason</h3>
              <p className="whitespace-pre-line text-body-sm text-secondary">{call.pending.note}</p>
            </section>
          )}
          <Meta icon={Robot}>{call.recording ? "The notetaker bot will join and take notes." : "No bot. Notes are written by hand."}</Meta>
        </div>
      </Dialog>
    </>
  );
}
