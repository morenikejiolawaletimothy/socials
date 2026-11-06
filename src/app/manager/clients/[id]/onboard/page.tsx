"use client";

import { CheckCircle, Clock } from "@phosphor-icons/react";
import Link from "next/link";
import { use, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { OffLimitsBox } from "@/components/manager/ClientTabs";
import { rails } from "@/components/rails";
import { Badge, Banner, Breadcrumbs, Button, buttonClass, Card, EmptyState, InfoTip, Input, Meta, Pill, Row, Rows, RowText, Stepper, Textarea, useConfirm, useTask } from "@/components/ui";
import { dateTime, fullName } from "@/lib/format";
import { act, clientBundle, useMyManager, type ClientBundle } from "@/lib/mock";

const steps = ["Prep", "Goals call", "Listening", "Strategy", "What we agreed", "Approved"];

/** One step's body: under a line below the Stepper, with 24px between sections. */
function Step({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6 border-t border-border pt-6">{children}</div>;
}

/** The step's title, an optional info icon after it, and key info (the call time) on the right. */
function StepHead({ title, info, children }: { title: string; info?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <h3 className="text-body font-semibold text-primary">{title}</h3>
        {info && <InfoTip label={`About ${title.toLowerCase()}`}>{info}</InfoTip>}
      </span>
      {children}
    </div>
  );
}

/** A titled section of a step: a small heading (with an optional action on the right), then its content 12px below. */
function Section({ title, info, action, children }: { title: React.ReactNode; info?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <h4 className="text-body-sm font-semibold text-primary">{title}</h4>
          {info && <InfoTip label="More about this section">{info}</InfoTip>}
        </span>
        {action}
      </div>
      {children}
    </section>
  );
}

/** The step's buttons under a line: the main action first, then Back. */
function StepFooter({ onBack, children }: { onBack?: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
      {children}
      {onBack && (
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      )}
    </div>
  );
}

function currentStep(b: ClientBundle) {
  const goals = b.calls.find((c) => c.kind === "goals");
  if (!goals || goals.status !== "done") return 0;
  if (b.strategy?.status === "approved") return 5;
  if (b.strategy?.status === "agreed-sent" || b.strategy?.status === "change-asked") return 4;
  if (!b.alerts.length) return 2;
  return 3;
}

/** M3 Onboard a client: from goals call to approved strategy in about a week, with the research done for you. */
function Onboard({ id }: { id: string }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const { db } = useMyManager();
  const b = clientBundle(db, id);
  const [step, setStep] = useState(() => currentStep(b));
  const [direction, setDirection] = useState("");
  const [directions, setDirections] = useState<string[]>([]);
  const [summary, setSummary] = useState(() => ({
    notes: b.client?.onboarding?.notes ?? b.calls.find((c) => c.kind === "goals")?.insights ?? "",
    goal: b.client?.goal ?? "",
    audience: b.client?.onboarding?.audience ?? b.strategy?.audience ?? "Distribution partners, retail buyers and food journalists in Lagos and Abuja.",
    tone: b.client?.onboarding?.tone ?? b.strategy?.tone ?? "Warm, practical, proud of local sourcing.",
    offLimit: "",
  }));
  const [summaryError, setSummaryError] = useState<string>();
  const field = (k: keyof typeof summary) => ({ value: summary[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setSummary({ ...summary, [k]: e.target.value }); setSummaryError(undefined); } });
  if (!b.client || !b.user) return <EmptyState title="Client not found" action={<Link href="/manager/clients" className={buttonClass("secondary")}>Go to Clients</Link>}>This client is not on your list.</EmptyState>;

  const goals = b.calls.find((c) => c.kind === "goals");
  const stratCall = b.calls.find((c) => c.kind === "strategy");
  const s = b.strategy;
  const first = b.user.firstName;

  return (
    <Columns {...rails.managerMain}>
      <Card
        title="Onboarding"
        eyebrow={<Breadcrumbs items={[{ label: "Clients", href: "/manager/clients" }, { label: fullName(b.user), href: `/manager/clients/${id}` }, { label: "Onboarding" }]} />}
      >
        <div className="flex flex-col gap-6">
          <div role="region" aria-label="Steps" tabIndex={0} className="overflow-x-auto rounded-sm focus-visible:focus-ring">
            <div className="min-w-xl">
              <Stepper steps={steps} current={step} />
            </div>
          </div>

          {step === 0 && (
            <Step>
              <StepHead
                title="Prep sheet for the goals call"
                info={goals ? (goals.recording ? "Recorded with the client's consent, on your own notetaker. You paste the transcript and insights after the call." : "Not recorded. You write what you heard after the call.") : undefined}
              >
                {goals && (
                  <Meta icon={Clock}>
                    {dateTime(goals.at)} · {goals.minutes} min
                  </Meta>
                )}
              </StepHead>
              <Section title="Their LinkedIn today">
                <Rows>
                  {[
                    ["Headline", "“Founder”"],
                    ["Followers", "1,240"],
                    ["Last post", "8 months ago, a product launch with 40 reactions"],
                    ["About", "Two lines"],
                    ["Featured", "None"],
                  ].map(([k, v]) => (
                    <Row key={k}>
                      <span className="w-24 shrink-0 text-body-sm text-secondary">{k}</span>
                      <span className="min-w-0 flex-1 text-body-sm text-primary">{v}</span>
                    </Row>
                  ))}
                </Rows>
              </Section>
              <Section title="Suggested questions">
                <Rows>
                  {[...(goals?.prep ?? ["What do you want to be known for?", "Who do you most want to reach?", "What would success look like in 6 months?", "What is off limits: topics, people, companies?"]), "Which 3 people would you most like to see your posts?"].map((q, i) => (
                    <Row key={q}>
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-caption font-medium text-primary-700">{i + 1}</span>
                      <span className="min-w-0 flex-1 text-body-sm text-primary">{q}</span>
                    </Row>
                  ))}
                </Rows>
              </Section>
              <StepFooter>
                <Button onClick={() => setStep(1)}>The call is done</Button>
              </StepFooter>
            </Step>
          )}

          {step === 1 && (
            <Step>
              <StepHead
                title="After the goals call"
                info={goals?.recording ? "Paste the insights from your own notetaker, then confirm. These shape the strategy." : "Write what you heard, then confirm. These shape the strategy."}
              />
              {!goals?.recording && <Textarea label="Your notes" rows={4} {...field("notes")} />}
              <Section title="Insights">
                <div className="flex flex-col gap-4">
                  <Textarea label="Goals" rows={2} {...field("goal")} error={summaryError} />
                  <Textarea label="Audience" rows={2} {...field("audience")} />
                  <Textarea label="Tone" rows={2} {...field("tone")} />
                </div>
              </Section>
              <Section title="Off limits" info="Saved to their Brand, where they can see and edit it.">
                <div className="flex flex-col gap-4">
                  <OffLimitsBox b={b} />
                  <Input label="Add to off limits (optional)" placeholder="For example: never name competitors" {...field("offLimit")} />
                </div>
              </Section>
              <StepFooter onBack={() => setStep(0)}>
                <Button
                  loading={pending("summary")}
                  onClick={async () => {
                    if (!summary.goal.trim() || !summary.audience.trim()) return setSummaryError("Add their goal and audience. The strategy is built from them.");
                    const off = summary.offLimit.trim();
                    if (
                      await run(
                        "summary",
                        () => act.confirmGoalsSummary(b.client!.id, { goal: summary.goal.trim(), audience: summary.audience.trim(), tone: summary.tone.trim(), notes: summary.notes.trim() || undefined, offLimit: off || undefined }),
                        off ? `Confirmed. "${off}" added to ${first}'s off limits.` : "Summary confirmed.",
                      )
                    ) {
                      setSummary({ ...summary, offLimit: "" });
                      setStep(2);
                    }
                  }}
                >
                  Confirm insights
                </Button>
              </StepFooter>
            </Step>
          )}

          {step === 2 && (() => {
            // One row per suggested topic, with the state of its Google Alert feed.
            const topics = s?.topics.map((t) => t.name) ?? ["Local sourcing", "Food distribution Nigeria", "Lagos food startups", "Agriculture policy"];
            const feedFor = (t: string) => b.alerts.find((a) => a.topic.toLowerCase() === t.toLowerCase());
            const ready = topics.filter((t) => feedFor(t)?.working).length;
            return (
              <Step>
                <StepHead title="Set up listening" info="Create a Google Alert for each topic, then paste each alert's feed link in Listening.">
                  <Pill>
                    {ready} of {topics.length} set up
                  </Pill>
                </StepHead>
                <Section
                  title="Topics to follow"
                  action={
                    <Link href={`/manager/clients/${id}?tab=listening`} className={buttonClass("secondary", "sm")}>
                      Add feeds
                    </Link>
                  }
                >
                  <Rows>
                    {topics.map((t, i) => {
                      const feed = feedFor(t);
                      return (
                        <Row key={t}>
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-caption font-medium text-primary-700">{i + 1}</span>
                          <span className="min-w-0 flex-1 text-body-sm text-primary">{t}</span>
                          {feed ? (
                            <Badge status={feed.working ? "success" : "warning"}>{feed.working ? "Feed working" : "Feed not working"}</Badge>
                          ) : (
                            <Badge status="neutral">No feed yet</Badge>
                          )}
                        </Row>
                      );
                    })}
                  </Rows>
                </Section>
                <StepFooter onBack={() => setStep(1)}>
                  <Button onClick={() => setStep(3)}>Continue</Button>
                </StepFooter>
              </Step>
            );
          })()}

          {step === 3 && (
            <Step>
              <StepHead title="Research, audit and strategy" />
              <Rows>
                {[
                  ["Research", "12 sources on their field, with links"],
                  ["Profile audit", "Headline, About, featured, activity"],
                  ["Strategy draft", `Version ${s?.version ?? 1}, framework v3`],
                ].map(([t, d]) => (
                  <Row key={t}>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-success-bg text-success">
                      <CheckCircle className="size-5" aria-hidden />
                    </span>
                    <RowText title={t} sub={d} size="md" />
                    <Badge status="success">Ready</Badge>
                  </Row>
                ))}
              </Rows>
              {s && (
                <>
                  <Section title="Goal">
                    <p className="text-body text-primary">{s.goal}</p>
                  </Section>
                  <Section title="Topics">
                    <Rows>
                      {s.topics.map((t, i) => (
                        <Row key={t.name}>
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-caption font-medium text-primary-700">{i + 1}</span>
                          <RowText title={t.name} sub={t.why} />
                        </Row>
                      ))}
                    </Rows>
                  </Section>
                  <Section title="Weekly targets">
                    <Rows>
                      {s.targets.map((t) => (
                        <Row key={t.period}>
                          <span className="min-w-0 flex-1 text-body-sm font-medium text-primary">{t.period}</span>
                          <span className="text-body-sm text-secondary">
                            {t.posts} posts · {t.comments} comments · {t.connections} connections
                          </span>
                        </Row>
                      ))}
                    </Rows>
                  </Section>
                </>
              )}
              <Section title="Direct the strategy" info="Say what should change in plain words. Each change makes a new version of the strategy.">
                <form
                  className="flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!direction.trim()) return;
                    const text = direction.trim();
                    run("direct", () => act.save(), `Strategy updated: "${text}"`).then((ok) => {
                      if (!ok) return;
                      setDirections((d) => [...d, text]);
                      setDirection("");
                    });
                  }}
                >
                  <Textarea
                    label="What should change?"
                    rows={2}
                    placeholder={'For example: "make topic 2 about policy", "the tone is too formal"'}
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                  />
                  <Button type="submit" variant="secondary" size="sm" className="self-start" disabled={!direction.trim()} loading={pending("direct")}>
                    {pending("direct") ? "Updating" : "Apply change"}
                  </Button>
                </form>
                {directions.length > 0 && (
                  <Rows label="Changes applied">
                    {[...directions].reverse().map((d, i) => {
                      const version = (s?.version ?? 1) + directions.length - i;
                      return (
                        <Row key={version}>
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-body-sm font-medium text-primary-700">v{version}</span>
                          <RowText title={`“${d}”`} sub={`Version ${version}`} />
                          <Badge status="success">Applied</Badge>
                        </Row>
                      );
                    })}
                  </Rows>
                )}
              </Section>
              <StepFooter onBack={() => setStep(2)}>
                <Button
                  onClick={async () => {
                    const ok = await confirm({
                      title: `Share the strategy with ${first}?`,
                      body: `${first} is told and can read it before the strategy call. You can still change it after the call.`,
                      confirmLabel: "Share",
                      action: () => act.save(),
                      success: `Shared with ${first}, to read before the strategy call.`,
                    });
                    if (ok) setStep(4);
                  }}
                >
                  Share with {first}
                </Button>
              </StepFooter>
            </Step>
          )}

          {step === 4 && (
            <Step>
              <StepHead title="After the strategy call" info={`Adjust the strategy with anything changed on the call, then send it as “What we agreed”. Nothing starts until ${first} approves.`}>
                {stratCall && (
                  <Meta icon={Clock}>
                    {dateTime(stratCall.at)} · {stratCall.minutes} min
                  </Meta>
                )}
              </StepHead>
              {stratCall?.insights && (
                <Section title="Call insights">
                  <Banner tone="neutral" icon={false}>{stratCall.insights}</Banner>
                </Section>
              )}
              <Section title="What we agreed">
                <Rows>
                  <Row>
                    <span className="min-w-0 flex-1 text-body-sm text-secondary">Status</span>
                    <Badge status={s?.status === "agreed-sent" ? "info" : s?.status === "change-asked" ? "warning" : "neutral"}>
                      {s?.status === "agreed-sent" ? `Sent. Waiting for ${first} to approve` : s?.status === "change-asked" ? `${first} asked for a change` : "Not sent yet"}
                    </Badge>
                  </Row>
                </Rows>
                {s?.changeNote && (
                  <Banner tone="warning" title={`${first} asked for a change`}>
                    &ldquo;{s.changeNote}&rdquo;
                  </Banner>
                )}
              </Section>
              <StepFooter onBack={() => setStep(3)}>
                <Button
                  variant={s?.status === "agreed-sent" ? "secondary" : "primary"}
                  onClick={() =>
                    confirm({
                      title: s?.status === "agreed-sent" ? `Send "What we agreed" again?` : `Send "What we agreed" to ${first}?`,
                      body: `${first} reads it and approves, or asks for a change. Nothing starts until they approve.`,
                      confirmLabel: "Send",
                      action: () => act.save(),
                      success: `"What we agreed" sent to ${first}.`,
                    })
                  }
                >
                  {s?.status === "agreed-sent" ? "Send again" : "Send What we agreed"}
                </Button>
              </StepFooter>
            </Step>
          )}

          {step === 5 && (
            <Step>
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                  <CheckCircle className="size-6" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <h3 className="text-body font-semibold text-primary">Approved. Work has started.</h3>
                    <InfoTip label="About what happens next">The approved strategy set the content plan and weekly targets. They drive your Home, engagement and the weekly update.</InfoTip>
                  </span>
                  <p className="text-body-sm text-secondary">{first} approved the strategy. Plan the first posts next.</p>
                </div>
              </div>
              <StepFooter>
                <Link href={`/manager/clients/${id}/content?tab=ideas`} className={buttonClass("primary")}>
                  Plan the first posts
                </Link>
              </StepFooter>
            </Step>
          )}
        </div>
      </Card>
    </Columns>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Onboard id={id} />;
}
