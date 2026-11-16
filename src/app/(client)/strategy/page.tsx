"use client";

import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Button, Card, Dialog, EmptyState, InfoTip, Textarea, useTask } from "@/components/ui";
import { date } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

function Section({ title, info, children }: { title: string; info?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t border-border pt-6">
      <div className="flex items-center gap-2">
        <h3 className="font-display text-display-lg text-primary">{title}</h3>
        {info && <InfoTip label={`About ${title}`}>{info}</InfoTip>}
      </div>
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
  const { run, pending } = useTask();
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();

  if (!strategy || !client) {
    return (
      <Columns {...rails.clientMain}>
        <EmptyState title="Your strategy is not ready yet">Your manager writes it after your discovery call. We will tell you as soon as it is ready.</EmptyState>
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
            <Section title="Off limits" info="We check every post and every comment against this. Change it any time in Your brand.">
              <ul className="flex flex-wrap gap-2">
                {brand.offLimits.map((o) => (
                  <li key={o.id} className="flex items-center gap-1.5 rounded-full bg-danger-bg px-3 py-1 text-body-sm text-primary">
                    <XCircle className="size-4 shrink-0 text-danger" aria-hidden />
                    {o.text}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="The plan in numbers">
            <p className="text-body-sm text-secondary">What we do for you each week, at each stage of the plan.</p>
            <ul className="mt-2 flex flex-col rounded-md border border-border">
              {strategy.targets.map((t) => (
                <li key={t.period} className="flex flex-col gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-body font-medium text-primary">{t.period}</span>
                    {t.extra && <span className="text-caption text-secondary">{t.extra}</span>}
                  </span>
                  <dl className={`grid shrink-0 gap-6 ${t.videos ? "grid-cols-4" : "grid-cols-3"}`}>
                    {[
                      { label: "Posts", value: t.posts },
                      ...(t.videos ? [{ label: "Videos", value: t.videos }] : []),
                      { label: "Comments", value: t.comments },
                      { label: "Connections", value: t.connections },
                    ].map((n) => (
                      <div key={n.label} className="flex flex-col gap-1 sm:items-end">
                        <dt className="text-caption text-secondary">{n.label}</dt>
                        <dd className="text-body font-medium text-primary">{n.value}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="How we measure progress">
            <ul className="flex flex-col gap-2 text-body text-primary">
              {strategy.measures.map((m) => (
                <li key={m} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                  {m}
                </li>
              ))}
            </ul>
          </Section>

          {agreed ? (
            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
              <Button loading={pending("approve")} onClick={() => run("approve", () => act.approveStrategy(client.id), "Approved. Your manager starts on your first posts.")}>
                {pending("approve") ? "Approving" : "Approve"}
              </Button>
              <Button variant="secondary" onClick={() => setAsking(true)}>
                Ask for a change
              </Button>
            </div>
          ) : (
            strategy.status === "approved" && (
              <Banner tone="success">
                You approved this on {date(strategy.approvedAt!)}. Version {strategy.version}. Want to change something? Message your manager.
              </Banner>
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
          <Button variant="cancel" onClick={() => setAsking(false)}>
            Cancel
          </Button>
          <Button
            loading={pending("change")}
            onClick={async () => {
              if (!note.trim()) return setError("Write what should change.");
              if (await run("change", () => act.askStrategyChange(client.id, note.trim()), "Sent. Your manager will send a new version.")) setAsking(false);
            }}
          >
            {pending("change") ? "Sending" : "Send"}
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
