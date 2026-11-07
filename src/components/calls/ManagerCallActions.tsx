"use client";

import { useState } from "react";
import { Button, Dialog, Input, TextButton, Textarea, useTask } from "@/components/ui";
import { dayTimeIn } from "@/lib/format";
import { act, type Call } from "@/lib/mock";
import { TimeDialog } from "./TimeDialog";

/**
 * The manager's actions on an ad-hoc check-in call: confirm with a Meet link, propose another open time,
 * decline, or cancel. Shared by the manager Calls page and a client's Calls tab.
 */
export function ManagerCallActions({ call, times, clientName }: { call: Call; times: string[]; clientName: string }) {
  const { run, pending } = useTask();
  const [approving, setApproving] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [link, setLink] = useState(call.meetUrl || "");
  const [linkError, setLinkError] = useState<string>();
  const [reason, setReason] = useState("");

  const awaitingManager = call.status === "pending" && call.pending?.awaiting === "manager";
  const awaitingClient = call.status === "pending" && call.pending?.awaiting === "client";
  const booked = call.status === "booked";

  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {awaitingManager && (
        <>
          <Button size="sm" onClick={() => { setLink(call.meetUrl || ""); setApproving(true); }}>
            Confirm and add link
          </Button>
          <TextButton onClick={() => setProposing(true)}>Propose another time</TextButton>
          <TextButton onClick={() => setDeclining(true)}>Decline</TextButton>
        </>
      )}

      {awaitingClient && (
        <>
          <span className="text-body-sm text-secondary">Waiting for {clientName} to accept {dayTimeIn(call.at)}.</span>
          <TextButton onClick={() => setProposing(true)}>Change time</TextButton>
          <TextButton onClick={() => setDeclining(true)}>Cancel</TextButton>
        </>
      )}

      {booked && call.kind === "check-in" && (
        <>
          <TextButton onClick={() => setProposing(true)}>Change time</TextButton>
          <TextButton onClick={() => setDeclining(true)}>Cancel</TextButton>
        </>
      )}

      {/* Confirm + add the Google Meet link. */}
      <Dialog open={approving} onClose={() => setApproving(false)} title="Confirm the call" info="Add the Google Meet link you created for this time. The client is told and sees the link.">
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-secondary">{clientName} · {dayTimeIn(call.at)}</p>
          <Input
            label="Google Meet link"
            value={link}
            onChange={(e) => { setLink(e.target.value); setLinkError(undefined); }}
            placeholder="https://meet.google.com/..."
            error={linkError}
            help="Create it in Google Calendar for this date and time, then paste it here."
          />
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
            <Button
              loading={pending("approve")}
              onClick={async () => {
                if (!/^https?:\/\/\S+$/.test(link.trim())) return setLinkError("Paste a valid meeting link (starts with https://).");
                if (await run("approve", () => act.approveCall(call.id, link.trim()), `Confirmed. ${clientName} has the link.`)) setApproving(false);
              }}
            >
              {pending("approve") ? "Confirming" : "Confirm and send"}
            </Button>
            <Button variant="cancel" onClick={() => setApproving(false)}>Cancel</Button>
          </div>
        </div>
      </Dialog>

      {/* Propose / reschedule to another open time. */}
      <TimeDialog
        open={proposing}
        onClose={() => setProposing(false)}
        times={times}
        title="Propose another time"
        submitLabel="Send proposed time"
        noteLabel="Add a note (optional)"
        pending={pending("propose")}
        onPick={async (at, note) => {
          if (await run("propose", () => act.proposeCallTime(call.id, "manager", at, { note }), `Proposed ${dayTimeIn(at)}. ${clientName} will confirm.`)) setProposing(false);
        }}
      />

      {/* Decline / cancel with a reason. */}
      <Dialog open={declining} onClose={() => setDeclining(false)} title={booked ? "Cancel this call" : "Decline this call"}>
        <div className="flex flex-col gap-4">
          <Textarea label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} help={`${clientName} is told this.`} />
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
            <Button
              variant="remove"
              loading={pending("decline")}
              onClick={async () => {
                if (await run("decline", () => act.declineCall(call.id, "manager", reason), booked ? "Call cancelled." : "Call declined.")) setDeclining(false);
              }}
            >
              {booked ? "Cancel call" : "Decline call"}
            </Button>
            <Button variant="cancel" onClick={() => setDeclining(false)}>Keep it</Button>
          </div>
        </div>
      </Dialog>
    </span>
  );
}
