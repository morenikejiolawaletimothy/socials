"use client";

import { useState } from "react";
import { Button, Dialog, TextButton, useTask } from "@/components/ui";
import { dayTimeIn, time } from "@/lib/format";
import { act, type Call } from "@/lib/mock";
import { TimeDialog } from "./TimeDialog";

const CUTOFF_MS = 30 * 60_000;

/**
 * The client's moves on an ad-hoc call: accept one of the times the manager offered, or suggest other
 * times (from the manager's open slots) with a reason. A booked call can change up to 30 minutes before.
 */
export function ClientCallActions({ call, times, managerName }: { call: Call; times: string[]; managerName: string }) {
  const { run, pending } = useTask();
  const [picking, setPicking] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const options = call.pending?.options ?? [call.at];
  const [chosen, setChosen] = useState(options[0]);

  const awaitingClient = call.status === "pending" && call.pending?.awaiting === "client";
  const awaitingManager = call.status === "pending" && call.pending?.awaiting === "manager";
  const booked = call.status === "booked";
  const locked = booked && new Date(call.at).getTime() - Date.now() < CUTOFF_MS;

  const accept = (at: string) => run(`accept-${call.id}`, () => act.acceptTime(call.id, at), "Time accepted. Your manager adds the link to confirm.");

  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {awaitingClient && (
        <>
          <Button size="sm" loading={pending(`accept-${call.id}`)} onClick={() => (options.length > 1 ? (setChosen(options[0]), setPicking(true)) : accept(options[0]))}>
            {options.length > 1 ? "Accept a time" : `Accept ${time(options[0])}`}
          </Button>
          <TextButton onClick={() => setSuggesting(true)}>Suggest times</TextButton>
        </>
      )}

      {awaitingManager && (
        <>
          <span className="text-body-sm text-secondary">Waiting for {managerName} to reply.</span>
          <TextButton onClick={() => setSuggesting(true)}>Change times</TextButton>
        </>
      )}

      {booked && call.kind === "check-in" && (locked ? (
        <span className="text-body-sm text-secondary">Starts soon — the time is locked.</span>
      ) : (
        <TextButton onClick={() => setSuggesting(true)}>Change time</TextButton>
      ))}

      {/* Pick one of several offered times. */}
      <Dialog open={picking} onClose={() => setPicking(false)} title="Pick a time">
        <div className="flex flex-col gap-4">
          <span className="text-body-sm font-medium text-primary">{managerName} offered these times</span>
          <div className="flex flex-wrap gap-2">
            {options.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={chosen === t}
                onClick={() => setChosen(t)}
                className={`min-h-11 rounded-md border px-3 text-body-sm font-medium transition-colors focus-visible:focus-ring ${chosen === t ? "border-primary-600 bg-primary-600 text-inverse" : "border-border-strong bg-card text-primary-700 hover:border-primary-300 hover:bg-primary-50"}`}
              >
                {dayTimeIn(t)}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
            <Button loading={pending(`accept-${call.id}`)} onClick={async () => { if (await accept(chosen)) setPicking(false); }}>
              Accept {time(chosen)}
            </Button>
            <Button variant="cancel" onClick={() => setPicking(false)}>Back</Button>
          </div>
        </div>
      </Dialog>

      <TimeDialog
        open={suggesting}
        onClose={() => setSuggesting(false)}
        times={times}
        title={booked ? "Change the time" : "Suggest other times"}
        submitLabel="Send to your manager"
        pending={pending("suggest")}
        onSubmit={async (picked, note) => {
          if (await run("suggest", () => act.proposeTimes(call.id, "client", picked, note), `Sent ${picked.length > 1 ? `${picked.length} times` : time(picked[0])} to ${managerName}.`)) setSuggesting(false);
        }}
      />
    </span>
  );
}
