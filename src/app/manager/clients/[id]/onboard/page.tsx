"use client";

import { CheckCircle, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { use, useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { OffLimitsBox } from "@/components/manager/ClientTabs";
import { rails } from "@/components/rails";
import { Badge, Banner, Breadcrumbs, Button, Card, EmptyState, Input, Stepper, Textarea, useToast } from "@/components/ui";
import { dayTime, fullName } from "@/lib/format";
import { clientBundle, useMyManager, type ClientBundle } from "@/lib/mock";

const steps = ["Prep", "Goals call", "Listening", "Strategy", "What we agreed", "Approved"];

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
  const toast = useToast();
  const { db } = useMyManager();
  const b = clientBundle(db, id);
  const [step, setStep] = useState(() => currentStep(b));
  const [direction, setDirection] = useState("");
  const [directions, setDirections] = useState<string[]>([]);
  if (!b.client || !b.user) return <EmptyState title="Client not found">Go back to Clients.</EmptyState>;

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
        <div className="flex flex-col gap-8">
          <div className="overflow-x-auto">
            <div className="min-w-xl">
              <Stepper steps={steps} current={step} />
            </div>
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-display-lg text-primary">Prep sheet for the goals call</h3>
              {goals && <p className="text-body-sm text-secondary">{dayTime(goals.at)}. {goals.recording ? "Recorded with consent." : "Not recorded: you write the notes."}</p>}
              <div className="flex flex-col gap-2 rounded-md bg-neutral-25 p-4">
                <span className="text-body-sm font-medium text-primary">Their LinkedIn today</span>
                <p className="text-body-sm text-primary">Headline: &ldquo;Founder&rdquo;. 1,240 followers. Last post 8 months ago (a product launch, 40 reactions). About section is two lines. No featured posts.</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-1 text-body-sm font-medium text-primary">
                  <Sparkle className="size-4 text-primary-600" aria-hidden /> Questions to ask
                </span>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-primary">
                  {(goals?.prep ?? ["What do you want to be known for?", "Who do you most want to reach?", "What would success look like in 6 months?", "What is off limits: topics, people, companies?"]).map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                  <li>Which 3 people would you most like to see your posts?</li>
                </ul>
              </div>
              <Button className="self-start" onClick={() => setStep(1)}>
                The call is done
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-display-lg text-primary">After the goals call</h3>
              <Banner tone="info" title={goals?.recording ? "The transcript has arrived" : "Not recorded: write up your notes"}>
                {goals?.recording ? "The summary below is drafted from it. Correct anything, then confirm." : "Write what you heard. The summary below fills in from your notes."}
              </Banner>
              {!goals?.recording && <Textarea label="Your notes" rows={4} defaultValue={goals?.summary} />}
              <div className="grid grid-cols-1 gap-4">
                <Textarea label="Goals" rows={2} defaultValue={b.client.goal} />
                <Textarea label="Audience" rows={2} defaultValue={s?.audience ?? "Distribution partners, retail buyers and food journalists in Lagos and Abuja."} />
                <Textarea label="Tone" rows={2} defaultValue={s?.tone ?? "Warm, practical, proud of local sourcing."} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-body-sm font-medium text-primary">Off limits (saved to their Brand, where they can see and edit it)</span>
                <OffLimitsBox b={b} />
                <Input label="Add to off limits" placeholder="For example: never name competitors" />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    toast("Confirmed. Off limits saved to their Brand.");
                    setStep(2);
                  }}
                >
                  Confirm summary
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-display-lg text-primary">Set up listening</h3>
              <p className="text-body-sm text-secondary">Create a Google Alert for each suggested topic, then paste each alert&apos;s feed link here.</p>
              <ul className="flex flex-wrap gap-2">
                {(s?.topics.map((t) => t.name) ?? ["Local sourcing", "Food distribution Nigeria", "Lagos food startups", "Agriculture policy"]).map((t) => (
                  <li key={t} className="rounded-full bg-primary-50 px-3 py-1 text-body-sm text-primary-700">
                    {t}
                  </li>
                ))}
              </ul>
              <p className="text-body-sm text-primary">
                {b.alerts.length ? `${b.alerts.filter((a) => a.working).length} of ${b.alerts.length} feeds working.` : "No feeds yet."}{" "}
                <Link href={`/manager/clients/${id}?tab=listening`} className="rounded-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                  Add feeds in Listening
                </Link>
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-display-lg text-primary">Research, audit and strategy</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  ["Research", "12 sources on their field, with links"],
                  ["Profile audit", "Headline, About, featured, activity"],
                  ["Strategy draft", `Version ${s?.version ?? 1}, framework v3`],
                ].map(([t, d]) => (
                  <div key={t} className="flex flex-col gap-1 rounded-md border border-border p-3">
                    <span className="flex items-center gap-1 text-body-sm font-medium text-primary">
                      <CheckCircle className="size-4 text-success" aria-hidden /> {t}
                    </span>
                    <span className="text-caption text-secondary">{d}</span>
                  </div>
                ))}
              </div>
              {s && (
                <div className="flex flex-col gap-3 rounded-md bg-neutral-25 p-4">
                  <p className="text-body font-medium text-primary">{s.goal}</p>
                  <ol className="flex flex-col gap-1 text-body-sm text-primary">
                    {s.topics.map((t, i) => (
                      <li key={t.name}>
                        {i + 1}. {t.name}: <span className="text-secondary">{t.why}</span>
                      </li>
                    ))}
                  </ol>
                  {s.targets.map((t) => (
                    <p key={t.period} className="text-body-sm text-primary">
                      {t.period}: {t.posts} posts, {t.comments} comments, {t.connections} connection requests a week.
                    </p>
                  ))}
                </div>
              )}
              {directions.length > 0 && (
                <ul className="flex flex-col gap-1 text-body-sm text-secondary">
                  {directions.map((d, i) => (
                    <li key={i}>
                      Version {(s?.version ?? 1) + i + 1}: &ldquo;{d}&rdquo; applied.
                    </li>
                  ))}
                </ul>
              )}
              <form
                className="flex flex-col gap-2 sm:flex-row sm:items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!direction.trim()) return;
                  setDirections((d) => [...d, direction.trim()]);
                  setDirection("");
                }}
              >
                <div className="flex-1">
                  <Input label="Direct the strategy" placeholder={'For example: "make topic 2 about policy", "the tone is too formal"'} value={direction} onChange={(e) => setDirection(e.target.value)} />
                </div>
                <Button type="submit" variant="secondary">
                  Apply
                </Button>
              </form>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    toast(`Shared with ${first}, to read before the strategy call.`);
                    setStep(4);
                  }}
                >
                  Share with {first}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-display-lg text-primary">After the strategy call</h3>
              {stratCall && <p className="text-body-sm text-secondary">Strategy call: {dayTime(stratCall.at)}.</p>}
              {stratCall?.summary && <p className="rounded-md bg-neutral-25 p-4 text-body-sm text-primary">{stratCall.summary}</p>}
              <p className="text-body-sm text-secondary">Adjust the strategy with anything changed on the call, then send it as &ldquo;What we agreed&rdquo;. Nothing starts until {first} approves.</p>
              <span className="self-start">
                <Badge status={s?.status === "agreed-sent" ? "info" : s?.status === "change-asked" ? "warning" : "neutral"}>
                  {s?.status === "agreed-sent" ? `Sent. Waiting for ${first} to approve` : s?.status === "change-asked" ? `${first} asked for a change` : "Not sent yet"}
                </Badge>
              </span>
              {s?.changeNote && <blockquote className="rounded-md bg-warning-bg p-4 text-body-sm text-primary">&ldquo;{s.changeNote}&rdquo;</blockquote>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button variant={s?.status === "agreed-sent" ? "secondary" : "primary"} onClick={() => toast(`"What we agreed" sent to ${first}.`)}>
                  {s?.status === "agreed-sent" ? "Send again" : "Send What we agreed"}
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="size-8 text-success" aria-hidden />
                <p className="font-display text-display-lg text-primary">Approved. Work has started.</p>
              </div>
              <p className="text-body-sm text-secondary">The approved strategy set the content plan and weekly targets. They drive your Home, engagement and the weekly update.</p>
              <Link href={`/manager/clients/${id}/content?tab=ideas`} className="self-start rounded-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                Plan the first posts
              </Link>
            </div>
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
