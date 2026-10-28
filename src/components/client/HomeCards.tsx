"use client";

import { CalendarBlank, CheckCircle, Circle, LinkedinLogo, UserPlus, VideoCamera } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PostPreview } from "@/components/content/PostPreview";
import { Avatar, Banner, Button, Card, ProgressBar, useToast } from "@/components/ui";
import { ago, date, day, dayIn, dayTime, dayTimeIn, daysFrom, fullName, money, plural, time } from "@/lib/format";
import type { ClientBundle } from "@/lib/mock";
import { LivePostActions } from "./LivePostActions";
import { PayDialog } from "./PayDialog";
import { nextSetupStep, setupSteps } from "./setup";

const linkClass = "rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring";
const buttonLink = (primary: boolean) =>
  `inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md border px-5 py-3 text-body font-medium leading-none transition-colors focus-visible:focus-ring ${
    primary ? "border-transparent bg-primary-600 text-inverse hover:bg-primary-700" : "border-border-strong bg-card text-primary-700 hover:border-primary-300 hover:bg-primary-50"
  }`;

/* ---------- States at the top of Home ---------- */

/** C16: the account is paused. The one thing to do is pay. */
export function PausedCard({ b }: { b: ClientBundle }) {
  const toast = useToast();
  const [paying, setPaying] = useState(false);
  const { client, contract, posts } = b;
  if (client?.status !== "paused") return null;
  const daysPaused = client.pausedAt ? -daysFrom(client.pausedAt) : 0;
  const waiting = posts.filter((p) => ["on-hold", "scheduled", "approved", "awaiting-client"].includes(p.status)).length;
  const why = client.pausedReason === "contract-ended" ? "Your contract ended." : "Your free 2 weeks ended before we received payment.";

  return (
    <Card title="Your account is paused">
      <div className="flex flex-col gap-4">
        <p className="text-body text-primary">
          {why} Nothing is being posted or engaged with. Pay to pick up where you left off, with the same account manager.
        </p>
        <ul className="flex flex-col gap-2 text-body-sm text-secondary">
          <li>Paused for {plural(daysPaused, "day")}.</li>
          <li>{waiting ? `Waiting for you: ${plural(waiting, "post")}, your strategy and your settings.` : "Your strategy, brand and settings are kept."} Nothing is lost.</li>
          {contract && <li>Amount due: {money(contract.monthlyCents)} for month 1.</li>}
        </ul>
        {daysPaused >= 15 && (
          <Banner tone="warning" title="Your account will be removed in 30 days">
            If your account stays paused for 30 days, we remove it and delete your data. To come back after that, you would start again.
          </Banner>
        )}
        <Button className="self-start" onClick={() => setPaying(true)}>
          {client.pausedReason === "contract-ended" ? "Renew" : "Pay now"}
        </Button>
      </div>
      {contract && (
        <PayDialog
          open={paying}
          onClose={() => setPaying(false)}
          onPaid={() => toast("Your account is active again. Scheduled posts are back on.")}
          clientId={client.id}
          amountCents={contract.monthlyCents}
        />
      )}
    </Card>
  );
}

/** C1 states: free 2 weeks, reconnect LinkedIn, posting paused. */
export function StateBanners({ b }: { b: ClientBundle }) {
  const { client, contract } = b;
  if (!client || client.status === "paused") return null;
  const daysLeft = contract ? daysFrom(contract.freeEndsAt) : 99;
  return (
    <>
      {client.linkedin === "expired" && (
        <Banner tone="warning" title="Your LinkedIn connection has expired" action={<Link href="/control" className={linkClass}>Reconnect</Link>}>
          Nothing can be posted until you reconnect. It takes a minute.
        </Banner>
      )}
      {client.postingPaused && (
        <Banner tone="warning" title="You paused all posting" action={<Link href="/control" className={linkClass}>Turn it back on</Link>}>
          Scheduled posts are held until you turn posting back on.
        </Banner>
      )}
      {client.status === "free" && contract && !contract.paid && daysLeft <= 5 && (
        <Banner tone="warning" title={`Pay to keep going. Your free 2 weeks end ${dayIn(contract.freeEndsAt)}.`} action={<Link href="/contract" className={linkClass}>Pay now</Link>}>
          If we have not received payment by {date(contract.freeEndsAt)}, your account pauses until you pay. You can pull out any time.
        </Banner>
      )}
      {client.status === "free" && contract && (contract.paid || daysLeft > 5) && (
        <Banner tone="info" title={`Your first 2 weeks are free, until ${date(contract.freeEndsAt)}`}>
          {contract.paid ? "You have paid already, so nothing changes when they end." : "You get the full service. We will remind you before they end."}
        </Banner>
      )}
    </>
  );
}

/* ---------- Setting up ---------- */

/** C1: setup progress with the six steps and one button. */
export function SetupCard({ b }: { b: ClientBundle }) {
  const { client } = b;
  if (!client || client.status !== "setting-up") return null;
  const next = nextSetupStep(client.setupDone);
  return (
    <Card title="Set up your account">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="flex items-center justify-between text-body-sm">
            <span className="text-primary">{client.setupProgress}% done</span>
            <span className="text-secondary">{plural(setupSteps.length - client.setupDone.length, "step")} left, about 8 minutes</span>
          </span>
          <ProgressBar value={client.setupProgress} />
        </div>
        <ol className="flex flex-col">
          {setupSteps.map((s, i) => {
            const done = client.setupDone.includes(s.step);
            const isNext = next?.step === s.step;
            return (
              <li key={s.step} className={`flex items-center gap-3 py-3 ${i < setupSteps.length - 1 ? "border-b border-border" : ""}`}>
                {done ? <CheckCircle className="size-6 shrink-0 text-success" aria-label="Done" /> : <Circle className={`size-6 shrink-0 ${isNext ? "text-primary-600" : "text-neutral-300"}`} aria-label="Not done" />}
                <span className={`flex-1 text-body ${done ? "text-secondary line-through" : "text-primary"}`}>{s.label}</span>
                <span className="text-caption text-secondary">{done ? "Done" : s.minutes}</span>
              </li>
            );
          })}
        </ol>
        {next && (
          <Link href={next.href} className={buttonLink(true)}>
            Continue setup
          </Link>
        )}
        <p className="text-body-sm text-secondary">Do it now or come back later. We save your progress and remind you by email.</p>
      </div>
    </Card>
  );
}

/* ---------- Before the calls ---------- */

const callInfo = {
  goals: { name: "Goals call", covers: "We agree what you want from LinkedIn: who you want to reach and what success looks like." },
  strategy: { name: "Strategy call", covers: "We walk you through your strategy and content plan, and agree it together." },
  "check-in": { name: "Check-in call", covers: "How things are going, and what to change." },
};

/** C1 after setup: the two booked calls with the manager. */
export function CallsCard({ b }: { b: ClientBundle }) {
  const { client, calls, managerUser } = b;
  if (!client || client.stage === "running" || client.status === "setting-up" || client.status === "paused") return null;
  const intro = calls.filter((c) => c.kind !== "check-in");
  return (
    <Card title="Your two calls">
      <div className="flex flex-col gap-4">
        {managerUser && (
          <div className="flex items-center gap-3">
            <Avatar name={fullName(managerUser)} size="md" />
            <p className="text-body-sm text-secondary">
              You will meet <span className="font-medium text-primary">{fullName(managerUser)}</span>, your account manager. 30 minutes each, on Google Meet.
            </p>
          </div>
        )}
        <ul className="flex flex-col gap-3">
          {intro.map((c) => {
            const soon = c.status === "booked" && Math.abs(new Date(c.at).getTime() - Date.now()) < 3_600_000 * 6 && day(c.at) === "Today";
            return (
              <li key={c.id} className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-start">
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <CalendarBlank className="size-5" aria-hidden />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-body font-medium text-primary">{callInfo[c.kind].name}</span>
                    {c.status === "done" && <span className="text-caption text-success">Done</span>}
                  </span>
                  <span className="text-body-sm text-primary">{dayTime(c.at)}</span>
                  <span className="text-body-sm text-secondary">{c.status === "done" ? c.summary : callInfo[c.kind].covers}</span>
                  {c.status === "booked" && (
                    <span className="mt-1 flex flex-wrap gap-4">
                      {soon ? (
                        <a href={c.meetUrl} className={linkClass}>
                          <span className="inline-flex items-center gap-1">
                            <VideoCamera className="size-4" aria-hidden /> Join the call
                          </span>
                        </a>
                      ) : (
                        <Link href="/setup/calls" className={linkClass}>
                          Reschedule
                        </Link>
                      )}
                      <span className="text-caption text-secondary">{c.recording ? "Recorded with your consent" : "Not recorded. Your manager takes notes."}</span>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}

/** C6: the strategy is ready to read before the strategy call. */
export function StrategyReadyCard({ b }: { b: ClientBundle }) {
  const { strategy, calls } = b;
  if (!strategy || (strategy.status !== "shared" && strategy.status !== "agreed-sent")) return null;
  const call = calls.find((c) => c.kind === "strategy");
  return (
    <Card title={strategy.status === "agreed-sent" ? "What we agreed is ready to approve" : "Your strategy is ready"}>
      <div className="flex flex-col gap-4">
        <p className="text-body text-primary">{strategy.goal}</p>
        <p className="text-body-sm text-secondary">
          {strategy.status === "agreed-sent"
            ? "Your manager added what you changed on the call. Work starts once you approve."
            : `Read it before your strategy call${call ? ` ${dayTimeIn(call.at)}` : ""}. Bring any questions.`}
        </p>
        <Link href="/strategy" className={buttonLink(true)}>
          Read your strategy
        </Link>
      </div>
    </Card>
  );
}

/* ---------- The feed (after the calls) ---------- */

/** C17: quick tasks only the client can do. */
export function TasksCard({ b }: { b: ClientBundle }) {
  const open = b.tasks.filter((t) => !t.done);
  if (!open.length || b.client?.stage !== "running") return null;
  return (
    <Card title="Quick tasks for you" action={<span className="text-caption text-secondary">About {open.length * 3} minutes</span>}>
      <ul className="flex flex-col">
        {open.map((t, i) => {
          const sent = t.people?.filter((p) => p.done).length ?? 0;
          const total = t.people?.length ?? 1;
          return (
            <li key={t.id} className={i < open.length - 1 ? "border-b border-border" : ""}>
              <Link href={`/tasks/${t.id}`} className="flex items-center gap-4 py-3 hover:bg-neutral-25 focus-visible:focus-ring">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                  {t.kind === "connect" ? <UserPlus className="size-5" aria-hidden /> : <LinkedinLogo className="size-5" aria-hidden />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-body font-medium text-primary">{t.title}</span>
                  <span className="text-body-sm text-secondary">
                    {t.kind === "connect" ? `${sent} of ${total} sent` : "Copy and paste, 1 minute"} · Due {dayIn(t.dueAt)}
                  </span>
                  {t.kind === "connect" && <ProgressBar value={sent} max={total} />}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="pt-3 text-caption text-secondary">LinkedIn only lets you do these yourself. We prepare everything, so each one is quick.</p>
    </Card>
  );
}

/** C7 entry: posts waiting for the client's review. */
export function ReviewCard({ b, primary }: { b: ClientBundle; primary: boolean }) {
  const waiting = b.posts.filter((p) => p.status === "awaiting-client");
  if (!waiting.length) return null;
  const due = waiting[0].dueAt;
  const wait = b.client?.review.ifNoReply === "wait";
  return (
    <Card title={`${plural(waiting.length, "post")} ready for your review`} action={due && <span className="text-caption text-secondary">Due {dayTimeIn(due)}</span>}>
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {waiting.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              {p.image ? (
                <span className="relative size-12 shrink-0 overflow-hidden rounded-sm">
                  <Image src={p.image.src} alt="" fill sizes="48px" className="object-cover" />
                </span>
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-neutral-50 text-caption text-secondary">Text</span>
              )}
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-body-sm font-medium text-primary">{p.text.split("\n")[0]}</span>
                <span className="text-caption text-secondary">{p.topic}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-body-sm text-secondary">
          {wait ? "If you do not reply by then, we hold them and nothing goes out." : "If you do not reply within 24 hours, your manager posts them. You can still take any post down."}
        </p>
        <Link href="/content/review" className={buttonLink(primary)}>
          Review now
        </Link>
      </div>
    </Card>
  );
}

/** C9 entry: the latest weekly update. */
export function UpdateCard({ b }: { b: ClientBundle }) {
  const u = b.updates.filter((x) => x.status === "sent").sort((x, y) => (y.sentAt ?? "").localeCompare(x.sentAt ?? ""))[0];
  if (!u) return null;
  return (
    <Card title={u.title} action={<span className="text-caption text-secondary">{ago(u.sentAt!)}</span>}>
      <div className="flex flex-col gap-4">
        <p className="text-body text-primary">{u.headline}</p>
        <ul className="grid grid-cols-3 gap-3">
          {u.did.map((d) => (
            <li key={d.label} className="flex flex-col gap-1 rounded-md bg-neutral-25 p-3">
              <span className="font-display text-display-xl text-primary">
                {d.done}
                <span className="text-body-sm font-normal text-secondary"> / {d.target}</span>
              </span>
              <span className="text-caption text-secondary">{d.label}</span>
            </li>
          ))}
        </ul>
        <Link href={`/progress/${u.id}`} className={linkClass}>
          Read the update
        </Link>
      </div>
    </Card>
  );
}

/** C8: the latest live post, with take down and fix. */
export function LiveCard({ b }: { b: ClientBundle }) {
  const live = b.posts.filter((p) => p.status === "published").sort((x, y) => (y.publishedAt ?? "").localeCompare(x.publishedAt ?? ""))[0];
  if (!live || !b.user) return null;
  return (
    <Card title="Live on LinkedIn" action={<Link href="/content?tab=live" className={linkClass}>All live posts</Link>}>
      <PostPreview post={live} author={{ name: fullName(b.user), title: b.user.title }} meta={ago(live.publishedAt!)}>
        <LivePostActions post={live} />
      </PostPreview>
    </Card>
  );
}

/** Upcoming scheduled posts. */
export function UpcomingCard({ b }: { b: ClientBundle }) {
  const next = b.posts.filter((p) => p.status === "scheduled").sort((x, y) => (x.scheduledFor ?? "").localeCompare(y.scheduledFor ?? ""));
  if (!next.length) return null;
  return (
    <Card title="Coming up" action={<Link href="/content?tab=scheduled" className={linkClass}>See all</Link>}>
      <ul className="flex flex-col">
        {next.map((p, i) => (
          <li key={p.id} className={`flex items-start gap-4 py-3 ${i < next.length - 1 ? "border-b border-border" : ""}`}>
            <span className="flex w-16 shrink-0 flex-col">
              <span className="text-body-sm font-medium text-primary">{day(p.scheduledFor!)}</span>
              <span className="text-caption text-secondary">{time(p.scheduledFor!)}</span>
            </span>
            <span className="text-body-sm text-primary">{p.text.split("\n")[0]}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** C10 entry: the latest message from the manager. */
export function MessageCard({ b }: { b: ClientBundle }) {
  const m = [...b.messages].reverse().find((x) => x.fromUserId === b.managerUser?.id);
  if (!m || !b.managerUser) return null;
  return (
    <Card title={`From ${b.managerUser.firstName}`} action={<span className="text-caption text-secondary">{ago(m.at)}</span>}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Avatar name={fullName(b.managerUser)} size="sm" />
          <p className="rounded-md bg-neutral-25 px-4 py-3 text-body-sm text-primary">{m.text}</p>
        </div>
        <Link href="/messages" className={linkClass}>
          Reply
        </Link>
      </div>
    </Card>
  );
}
