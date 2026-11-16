"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { Banner, Button, Textarea, useTask } from "@/components/ui";
import { agoIn } from "@/lib/format";
import { act, type Call } from "@/lib/mock";

/**
 * After a call's time has passed, the manager records the outcome: it held (transcript if the bot joined,
 * plus insights that feed the strategy) or it did not hold (with a short note). Shown on past calls only.
 */
export function CallFeedback({ call }: { call: Call }) {
  const { run, pending } = useTask();
  const past = new Date(call.at).getTime() < Date.now();
  const done = call.status === "done";
  const [held, setHeld] = useState<boolean | null>(done ? call.outcome === "held" : null);
  const [transcript, setTranscript] = useState(call.transcript ?? "");
  const [insights, setInsights] = useState(call.insights ?? "");
  const [note, setNote] = useState(call.outcomeNote ?? "");
  const [error, setError] = useState<string>();
  const shared = !!call.sharedAt;

  if (!past && !done) return null;

  const choices = [
    { v: true, label: "It held" },
    { v: false, label: "Did not hold" },
  ];

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4">
      <div className="flex flex-col gap-2">
        <span className="text-body-sm font-medium text-primary">Did the call hold?</span>
        <div className="flex flex-wrap gap-2">
          {choices.map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={held === o.v}
              onClick={() => setHeld(o.v)}
              className={`min-h-9 rounded-md border px-3 text-body-sm font-medium transition-colors focus-visible:focus-ring ${held === o.v ? "border-primary-600 bg-primary-50 text-primary-700" : "border-border-strong bg-card text-secondary hover:border-primary-300"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {held === true && (
        <>
          {call.recording ? (
            <Textarea label="Transcript" help="Paste the raw transcript from the notetaker bot. The client can read it." rows={4} value={transcript} onChange={(e) => { setTranscript(e.target.value); setError(undefined); }} />
          ) : (
            <Banner tone="neutral" icon={false}>No bot on this call, so there is no transcript. Share the insights only.</Banner>
          )}
          <Textarea label="Insights" help="The key points, synthesized. These shape the strategy, and the client reads them." rows={4} value={insights} onChange={(e) => { setInsights(e.target.value); setError(undefined); }} error={error} />
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary" disabled={!insights.trim()} loading={pending("save")} onClick={() => run("save", () => act.recordCallOutcome(call.id, { held: true, transcript: call.recording ? transcript : undefined, insights }), "Feedback saved.")}>
              Save
            </Button>
            <Button
              size="sm"
              disabled={!insights.trim()}
              loading={pending("share")}
              onClick={async () => {
                if (!insights.trim()) return setError("Add the insights before you share.");
                await run("save", () => act.recordCallOutcome(call.id, { held: true, transcript: call.recording ? transcript : undefined, insights }), undefined);
                await run("share", () => act.shareCallNotes(call.id), shared ? "Updated notes shared with the client." : "Notes shared with the client.");
              }}
            >
              {shared ? "Share again" : "Share with client"}
            </Button>
            {shared && (
              <span className="flex items-center gap-1 text-caption text-success">
                <CheckCircle className="size-4" aria-hidden /> Shared {agoIn(call.sharedAt!)}
              </span>
            )}
          </div>
        </>
      )}

      {held === false && (
        <>
          <Textarea label="What happened? (optional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} help="The client is told the call did not hold." />
          <Button size="sm" variant="remove" className="self-start" loading={pending("miss")} onClick={() => run("miss", () => act.recordCallOutcome(call.id, { held: false, note }), "Marked as not held.")}>
            Mark as not held
          </Button>
        </>
      )}
    </div>
  );
}
