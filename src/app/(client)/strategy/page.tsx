"use client";

import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Button, Card, Dialog, EmptyState, Textarea, useToast } from "@/components/ui";
import { date } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-6">
      <h3 className="font-display text-display-lg text-primary">{title}</h3>
      {children}
    </section>
  );
}

const statusLabel = {
  drafting: { label: "Being written", tone: "neutral" as const },
  shared: { label: "Ready to read", tone: "info" as const },
  "agreed-sent": { label: "Waiting for your approval", tone: "info" as const },
  "change-asked": { label: "Change asked", tone: "warning" as const },
  approved: { label: "Approved", tone: "success" as const },
};

/**
 * C6 Your strategy. Before the strategy call: read it. After the call: "What we agreed", with Approve or
 * Ask for a change. Work starts only once the client approves.
 */
export default function StrategyPage() {
  const { client, strategy, brand } = useMyClient();
  const toast = useToast();
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (!strategy || !client) {
    return (
      <Columns {...rails.clientMain}>
        <EmptyState title="Your strategy is not ready yet">Your manager writes it after your goals call. We will tell you as soon as it is ready.</EmptyState>
      </Columns>
    );
  }

  const s = statusLabel[strategy.status];
  const agreed = strategy.status === "agreed-sent";

  return (
    <Columns {...rails.clientMain}>
      <Card title={agreed ? "What we agreed" : "Your strategy"} action={<Badge status={s.tone}>{s.label}</Badge>}>
        <div className="flex flex-col gap-6">
          {agreed && (
            <Banner tone="info" title="Your manager added what you changed on the call">
              Read it once more. Work starts as soon as you approve. If something is not right, ask for a change.
            </Banner>
          )}
          {strategy.status === "shared" && (
            <Banner tone="info" title="Read it before your strategy call">
              We will walk through it together and change anything you want. You approve it after the call.
            </Banner>
          )}
          {strategy.status === "change-asked" && (
            <Banner tone="warning" title="You asked for a change">
              &ldquo;{strategy.changeNote}&rdquo; Your manager will send a new version soon.
            </Banner>
          )}

          <section className="flex flex-col gap-2">
            <span className="text-caption text-secondary">Your goal</span>
            <p className="font-display text-display-xl text-primary">{strategy.goal}</p>
          </section>

          <Section title="Who you want to reach">
            <p className="text-body text-primary">{strategy.audience}</p>
          </Section>

          <Section title="Your topics">
            <ol className="flex flex-col gap-3">
              {strategy.topics.map((t, i) => (
                <li key={t.name} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-caption text-primary-700">{i + 1}</span>
                  <span className="flex flex-col">
                    <span className="text-body font-medium text-primary">{t.name}</span>
                    <span className="text-body-sm text-secondary">{t.why}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Your tone">
            <p className="text-body text-primary">{strategy.tone}</p>
          </Section>

          {brand && brand.offLimits.length > 0 && (
            <Section title="Off limits">
              <ul className="flex flex-wrap gap-2">
                {brand.offLimits.map((o) => (
                  <li key={o.id} className="rounded-full bg-danger-bg px-3 py-1 text-body-sm text-primary">
                    {o.text}
                  </li>
                ))}
              </ul>
              <p className="text-caption text-secondary">We check every post and every comment against this. Change it any time in Your brand.</p>
            </Section>
          )}

          <Section title="The plan in numbers">
            <div className="overflow-x-auto">
              <table className="w-full min-w-96 text-left text-body-sm">
                <thead className="text-caption text-secondary">
                  <tr>
                    <th className="py-2 font-medium">When</th>
                    <th className="py-2 font-medium">Posts a week</th>
                    <th className="py-2 font-medium">Comments a week</th>
                    <th className="py-2 font-medium">Connections a week</th>
                  </tr>
                </thead>
                <tbody>
                  {strategy.targets.map((t) => (
                    <tr key={t.period} className="border-t border-border">
                      <td className="py-3 text-primary">
                        {t.period}
                        {t.extra && <span className="block text-caption text-secondary">{t.extra}</span>}
                      </td>
                      <td className="py-3 text-primary">{t.posts}</td>
                      <td className="py-3 text-primary">{t.comments}</td>
                      <td className="py-3 text-primary">{t.connections}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="How we measure progress">
            <ul className="flex list-disc flex-col gap-1 pl-5 text-body text-primary">
              {strategy.measures.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </Section>

          {agreed ? (
            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
              <Button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await act.approveStrategy(client.id);
                  setBusy(false);
                  toast("Approved. Your manager starts on your first posts.");
                }}
              >
                {busy ? "Approving" : "Approve"}
              </Button>
              <Button variant="ghost" onClick={() => setAsking(true)}>
                Ask for a change
              </Button>
            </div>
          ) : (
            strategy.status === "approved" && (
              <p className="border-t border-border pt-6 text-body-sm text-secondary">
                You approved this on {date(strategy.approvedAt!)}. Version {strategy.version}. Want to change something? Message your manager.
              </p>
            )
          )}
        </div>
      </Card>

      <Dialog open={asking} onClose={() => setAsking(false)} title="Ask for a change">
        <Textarea
          label="What should change?"
          placeholder="For example: I would rather post 3 times a week from the start."
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError(undefined);
          }}
          error={error}
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setAsking(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!note.trim()) return setError("Write what should change.");
              await act.askStrategyChange(client.id, note.trim());
              setAsking(false);
              toast("Sent. Your manager will send a new version.");
            }}
          >
            Send
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
