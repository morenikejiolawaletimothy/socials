"use client";

import { useState } from "react";
import { Button, Dialog, Input, TextButton, useTask } from "@/components/ui";
import { dayTimeIn, time } from "@/lib/format";
import { act, type Call } from "@/lib/mock";
import { TimeDialog } from "./TimeDialog";

const CUTOFF_MS = 30 * 60_000;

/**
 * The manager's moves on an ad-hoc call: confirm a time with a Meet link, or suggest other times with a
 * reason. A booked call can be rescheduled up to 30 minutes before it starts, not after. No outright cancel.
 */
export function ManagerCallActions({ call, times, clientName }: { call: Call; times: string[]; clientName: string }) {
  const { run, pending } = useTask();
  const [confirming, setConfirming] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const options = call.pending?.options ?? [call.at];
  const [chosen, setChosen] = useState(options[0]);
  const [link, setLink] = useState(call.meetUrl || "");
  const [linkError, setLinkError] = useState<string>();

  const awaitingManager = call.status === "pending" && call.pending?.awaiting === "manager";
  const awaitingClient = call.status === "pending" && call.pending?.awaiting === "client";
  const booked = call.status === "booked";
  const locked = booked && new Date(call.at).getTime() - Date.now() < CUTOFF_MS;

  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {awaitingManager && (
        <>
          <Button size="sm" onClick={() => { setChosen(options[0]); setLink(call.meetUrl || ""); setConfirming(true); }}>
            Confirm
          </Button>
          <TextButton onClick={() => setSuggesting(true)}>Suggest times</TextButton>
        </>
      )}

      {awaitingClient && (
        <>
          <span className="text-body-sm text-secondary">Waiting for {clientName} to reply.</span>
          <TextButton onClick={() => setSuggesting(true)}>Change times</TextButton>
        </>
      )}

      {booked && (locked ? (
        <span className="text-body-sm text-secondary">Starts soon — the time is locked.</span>
      ) : (
        <TextButton onClick={() => setSuggesting(true)}>Change time</TextButton>
      ))}

      {/* Confirm one time and add the Google Meet link. */}
      <Dialog open={confirming} onClose={() => setConfirming(false)} title="Confirm the call" info="Pick the time and add the Google Meet link you created for it. The client is told and sees the link.">
        <div className="flex flex-col gap-4">
          {options.length > 1 ? (
            <div className="flex flex-col gap-2">
              <span className="text-body-sm font-medium text-primary">{clientName} offered these times</span>
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
            </div>
          ) : (
            <p className="text-body-sm text-secondary">{clientName} · {dayTimeIn(chosen)}</p>
          )}
          <Input
            label="Google Meet link"
            value={link}
            onChange={(e) => { setLink(e.target.value); setLinkError(undefined); }}
            placeholder="https://meet.google.com/..."
            error={linkError}
            help="Create it in Google Calendar for this time, then paste it here."
          />
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
            <Button
              loading={pending("confirm")}
              onClick={async () => {
                if (!/^https?:\/\/\S+$/.test(link.trim())) return setLinkError("Paste a valid meeting link (starts with https://).");
                if (await run("confirm", () => act.confirmCall(call.id, chosen, link.trim()), `Confirmed for ${dayTimeIn(chosen)}. ${clientName} has the link.`)) setConfirming(false);
              }}
            >
              {pending("confirm") ? "Confirming" : "Confirm and send"}
            </Button>
            <Button variant="cancel" onClick={() => setConfirming(false)}>Back</Button>
          </div>
        </div>
      </Dialog>

      <TimeDialog
        open={suggesting}
        onClose={() => setSuggesting(false)}
        times={times}
        title={booked ? "Change the time" : "Suggest other times"}
        submitLabel="Send to client"
        pending={pending("suggest")}
        onSubmit={async (picked, note) => {
          if (await run("suggest", () => act.proposeTimes(call.id, "manager", picked, note), `Sent ${picked.length > 1 ? `${picked.length} times` : time(picked[0])} to ${clientName}.`)) setSuggesting(false);
        }}
      />
    </span>
  );
}
