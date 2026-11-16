"use client";

import { BookmarkSimple, CalendarBlank, CalendarStar, ChatCircleText, CheckCircle, Circle,  GraduationCap, LinkedinLogo, MagnifyingGlass, PaperPlaneTilt, Repeat, ThumbsUp, Timer, UserCirclePlus, UserPlus, VideoCamera, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PostThumb } from "@/components/content/PostMedia";
import { plainText } from "@/components/content/PostText";
import { PostPreview } from "@/components/content/PostPreview";
import { callTitle, upcomingCalls } from "@/components/rails/NextCallCard";
import { Avatar, Badge, Banner, Button, buttonClass, Card, Meta, Pill, ProgressBar, Select, TextButton, textActionClass, Tile, TileAction, TileFooter, TileIcon, useTask, useToast } from "@/components/ui";
import { contractTotalCents } from "@/lib/pricing";
import { isOverdue } from "@/lib/status";
import { isEngage, progressWord, taskProgress } from "@/lib/engage";
import { ago, agoIn, day, dayIn, dayTimeIn, daysFrom, fullName, money, plural, time } from "@/lib/format";
import { act, type ClientBundle, type Post, type QuickTask, type TaskEvent } from "@/lib/mock";
import { LivePostActions } from "./LivePostActions";
import { PayDialog } from "./PayDialog";
import { reportActivity } from "./reportActivity";
import { nextSetupStep, stepsFor } from "./setup";

const linkClass = textActionClass;

/* ---------- States at the top of Home ---------- */

/** C16: the account is paused. The one thing to do is pay. */
export function PausedCard({ b }: { b: ClientBundle }) {
  const toast = useToast();
  const [paying, setPaying] = useState(false);
  const { client, contract, posts } = b;
  if (client?.status !== "paused") return null;
  const daysPaused = client.pausedAt ? -daysFrom(client.pausedAt) : 0;
  const waiting = posts.filter((p) => ["on-hold", "scheduled", "approved", "awaiting-client"].includes(p.status)).length;
  const why = client.pausedReason === "contract-ended" ? "Your contract ended." : "Your free period ended before we received payment.";
  const facts = [
    { label: "Paused for", value: plural(daysPaused, "day") },
    { label: "Waiting for you", value: waiting ? plural(waiting, "post") : "Nothing" },
    ...(contract ? [{ label: "Amount due", value: `${money(contract.monthlyCents * contract.months)} for ${contract.months} months` }] : []),
  ];

  return (
    <Card
      title="Account paused"
      padding="none"
      action={<Badge status="warning">Paused</Badge>}
      info="Your strategy, brand and settings are kept while you are paused. Nothing is lost. The contract is paid once, up front."
    >
      {/* What happened, the key facts as two-sided rows, any warning, then Pay under a divider. */}
      <div className="flex flex-col divide-y divide-border">
        <p className="px-6 py-5 text-body text-primary">
          {why} Nothing is being posted or engaged with. Pay to pick up where you left off, with the same account manager.
        </p>
        <ul className="flex flex-col divide-y divide-border">
          {facts.map((f) => (
            <li key={f.label} className="flex items-center justify-between gap-4 px-6 py-4">
              <span className="text-body-sm text-secondary">{f.label}</span>
              <span className="text-right text-body-sm font-medium text-primary">{f.value}</span>
            </li>
          ))}
        </ul>
        {daysPaused >= 15 && (
          <div className="px-6 py-5">
            <Banner tone="warning" title="Your account will be removed in 30 days">
              If your account stays paused for 30 days, we remove it and delete your data. To come back after that, you would start again.
            </Banner>
          </div>
        )}
        <div className="px-6 py-5">
          <Button onClick={() => setPaying(true)}>{client.pausedReason === "contract-ended" ? "Renew" : "Pay now"}</Button>
        </div>
      </div>
      {contract && (
        <PayDialog
          open={paying}
          onClose={() => setPaying(false)}
          onPaid={() => toast("Your account is active again. Scheduled posts are back on.")}
          clientId={client.id}
          amountCents={contractTotalCents(contract)}
        />
      )}
    </Card>
  );
}

/** Must-know states at the top of Home. The free period has its own card in the feed (FreePeriodCard). */
export function StateBanners({ b }: { b: ClientBundle }) {
  const { client } = b;
  if (!client || client.status === "paused" || !client.postingPaused) return null;
  return (
    <Banner tone="warning" title="You paused all posting" action={<Link href="/control" className={linkClass}>Turn it back on</Link>}>
      Scheduled posts are held until you turn posting back on.
    </Banner>
  );
}

/* ---------- Setting up ---------- */

/**
 * Figma "Account setup": a short checklist joined by a line (done steps struck through), and one button.
 * At 100% the button is Complete setup, which opens the feed and asks the manager to offer call times.
 */
export function SetupCard({ b }: { b: ClientBundle }) {
  const { client } = b;
  const { run, pending } = useTask();
  if (!client || client.stage !== "setup") return null;
  const steps = stepsFor(client.service);
  const next = nextSetupStep(client.setupDone, client.service);
  return (
    <Card id="setup" title="Account setup" info="Two short steps. Do them now or come back later: we save your progress." padding="none">
      <ol className="flex flex-col px-6 py-2">
        {steps.map((s, i) => {
          const done = client.setupDone.includes(s.step);
          const last = i === steps.length - 1;
          return (
            <li key={s.step} className="relative">
              {!last && <span aria-hidden className={`absolute -bottom-3 left-3 top-9 w-px ${done ? "bg-success" : "bg-border-strong"}`} />}
              <Link href={s.href} className={`-mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-primary-50 focus-visible:focus-ring ${!last ? "border-b border-border" : ""}`}>
                {done ? <CheckCircle className="size-6 shrink-0 text-success" aria-label="Done" /> : <Circle className={`size-6 shrink-0 ${next?.step === s.step ? "text-primary-600" : "text-neutral-300"}`} aria-label="Not done" />}
                <span className={`flex-1 text-body-sm ${done ? "text-secondary line-through" : "text-primary"}`}>{s.label}</span>
                <span className="text-caption text-secondary">{done ? "Done" : s.minutes}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="flex justify-end border-t border-border px-6 py-4">
        {next ? (
          <Link href={next.href} className={buttonClass("primary")}>
            Continue setup
          </Link>
        ) : (
          <Button loading={pending("finish")} onClick={() => run("finish", () => act.finishSetup(client.id), "Setup complete. Your account manager will offer times for your first call.")}>
            Complete setup
          </Button>
        )}
      </div>
    </Card>
  );
}

/* ---------- The feed (after the calls) ---------- */

/** Events and programs the client has registered for that have not started yet. They show in Coming up; unregistered ones stay in Tasks. */
export function upcomingEvents(tasks: QuickTask[]) {
  return tasks.filter((t) => t.kind === "event" && t.done && t.event && new Date(t.event.startsAt).getTime() > Date.now());
}

/** "6 weeks" for a program, from its start and end. */
export function eventLength(e: TaskEvent) {
  if (!e.endsAt) return undefined;
  const days = Math.round((new Date(e.endsAt).getTime() - new Date(e.startsAt).getTime()) / 86_400_000);
  return days >= 7 ? plural(Math.round(days / 7), "week") : plural(Math.max(days, 1), "day");
}

/** The icon for a quick task. */
function TaskIcon({ t, className }: { t: QuickTask; className: string }) {
  if (t.kind === "connect") return <UserPlus className={className} aria-hidden />;
  if (isEngage(t.kind)) {
    const I = { comment: ChatCircleText, react: ThumbsUp, reshare: Repeat, save: BookmarkSimple, follow: UserCirclePlus, message: PaperPlaneTilt }[t.kind];
    return <I className={className} aria-hidden />;
  }
  if (t.kind === "event") return t.event?.type === "program" ? <GraduationCap className={className} aria-hidden /> : <CalendarStar className={className} aria-hidden />;
  if (t.kind === "video") return <VideoCamera className={className} aria-hidden />;
  return <LinkedinLogo className={className} aria-hidden />;
}

/**
 * The picture on a Quick tasks tile: the task type's icon, LinkedIn for profile tasks, the event's own picture.
 * No photos of people: LinkedIn does not share other members' photos, so tasks never depend on them.
 */
function TaskVisual({ t }: { t: QuickTask }) {
  if (t.kind === "event" && t.event?.image) return <Avatar name={t.event.name} src={t.event.image} size="lg" />;
  if (t.kind === "profile") return <Image src="/brand/linkedin.svg" alt="" width={56} height={56} unoptimized className="size-14 shrink-0" />;
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
      <TaskIcon t={t} className="size-7" />
    </span>
  );
}

/** The grey line under a task's title. */
function taskStatus(t: QuickTask) {
  if (t.kind === "connect" || isEngage(t.kind)) return `${taskProgress(t).done} of ${taskProgress(t).total} ${progressWord(t)}`;
  if (t.kind === "event" && t.event) return `${t.event.type === "program" ? "Program" : "Event"} ${dayIn(t.event.startsAt)} · ${t.event.place}`;
  if (t.kind === "video" && t.video) return `${t.video.idea}. ${t.video.length}`;
  return "Copy and paste in a minute";
}

/** C17: quick tasks only the client can do. */
export function TasksCard({ b }: { b: ClientBundle }) {
  const open = b.tasks.filter((t) => !t.done);
  if (!open.length || b.client?.stage !== "running") return null;
  const doneCount = b.tasks.length - open.length;
  return (
    <Card
      id="tasks"
      title="Quick tasks"
      action={<Pill label={`${doneCount} of ${b.tasks.length} tasks done`}>{doneCount} of {b.tasks.length} done</Pill>}
      info="Things LinkedIn only lets you do: reactions, comments, reposts, follows, messages and connection requests, plus events to sign up for. We prepare everything, so each takes seconds. Done tasks leave this list."
    >
      <ul className="flex flex-col gap-3">
        {open.map((t) => {
          const { done: sent, total } = taskProgress(t);
          return (
            <li key={t.id}>
              <Tile href={`/tasks/${t.id}`}>
                <span className="flex items-center gap-4">
                  <TaskVisual t={t} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-body font-medium text-primary">{t.title}</span>
                    <span className="text-body-sm text-secondary">
                      {taskStatus(t)} · Assigned {agoIn(t.sentAt)}
                    </span>
                    {(t.kind === "connect" || isEngage(t.kind)) && (
                      <span className="max-w-xs">
                        <ProgressBar value={sent} max={total} />
                      </span>
                    )}
                  </span>
                </span>
                <TileFooter>
                  <Meta icon={Timer}>
                    {t.kind === "event" ? "Closing by" : "Due"} {dayTimeIn(t.dueAt)}
                  </Meta>
                  <TileAction>{t.kind === "event" ? (t.event?.type === "program" ? "Apply" : "Register") : t.kind === "video" ? "See what to record" : sent > 0 ? "Continue" : "Start"}</TileAction>
                </TileFooter>
              </Tile>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/**
 * C7 entry: posts waiting for the client's review. Each post is a clickable tile with its own due time, like Quick tasks.
 * Overdue posts (not reviewed in time, so held) are listed after them with an Overdue tag: they can still be reviewed.
 * The Content page has its own Overdue tab, so it passes `overdue={false}`.
 */
export function ReviewCard({ b, overdue: withOverdue = true }: { b: ClientBundle; primary?: boolean; overdue?: boolean }) {
  const due = b.posts.filter((p) => p.status === "awaiting-client");
  const late = withOverdue ? b.posts.filter(isOverdue) : [];
  const waiting = [...due, ...late];
  if (!waiting.length) return null;
  const wait = b.client?.review.ifNoReply === "wait";
  // This review round: posts sent with the same due time. Reviewed ones count as done.
  const round = due.length ? b.posts.filter((p) => p.dueAt && p.dueAt === due[0].dueAt) : [];
  const total = Math.max(round.length, due.length);
  const reviewed = total - due.length;
  return (
    <Card
      title="Review posts"
      action={
        due.length ? (
          <Pill label={`${reviewed} of ${plural(total, "post")} reviewed`}>{reviewed} of {total} done</Pill>
        ) : (
          <Pill label={`${plural(late.length, "post")} overdue`}>{plural(late.length, "post")} overdue</Pill>
        )
      }
      info={
        wait
          ? "Any post you have not reviewed by its due time is held. Nothing goes out without your approval, and you can still review it at any time."
          : `Any post you have not reviewed by its due time is posted by ${b.managerUser?.firstName ?? "your manager"} as planned. You can still take a post down at any time.`
      }
    >
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {waiting.map((p) => {
            const isLate = isOverdue(p);
            return (
              <li key={p.id}>
                <Tile href={`/content/review?post=${p.id}`}>
                  <span className="flex items-start gap-4">
                    <PostThumb post={p} size="lg" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="line-clamp-2 text-body font-medium text-primary">{plainText(p.text).split("\n")[0]}</span>
                      <span className="text-body-sm text-secondary">
                        {p.topic}
                        {p.sentAt && ` · Assigned ${agoIn(p.sentAt)}`}
                      </span>
                    </span>
                  </span>
                  <TileFooter>
                    <span className="flex flex-wrap items-center gap-3">
                      <Meta icon={Timer}>{p.dueAt ? `${isLate ? "Was due" : "Due"} ${dayTimeIn(p.dueAt)}` : "No due date"}</Meta>
                      {isLate && <Badge status="danger">Overdue</Badge>}
                    </span>
                    <TileAction>Review</TileAction>
                  </TileFooter>
                </Tile>
              </li>
            );
          })}
        </ul>
        <Link href="/content/review" className={`self-start ${textActionClass}`}>
          Review all
        </Link>
      </div>
    </Card>
  );
}

/** C9 entry: the latest weekly update, as a short report: the headline and the same "what we did against the plan" table as the full report. */
export function UpdateCard({ b }: { b: ClientBundle }) {
  const u = b.updates.filter((x) => x.status === "sent").sort((x, y) => (y.sentAt ?? "").localeCompare(x.sentAt ?? ""))[0];
  if (!u) return null;
  const recorded = reportActivity(u, b.activity).total;
  return (
    <Card
      title={u.title}
      action={<Meta icon={CalendarBlank}>{day(u.sentAt!)}</Meta>}
    >
      <div className="flex flex-col gap-5">
        <p className="text-body text-neutral-500">{u.headline}</p>

        <table className="w-full text-left text-body-sm">
          <thead className="text-caption text-primary-600">
            <tr>
              <th className="py-2 font-medium">Work</th>
              <th className="w-20 py-2 font-medium sm:w-28">Planned</th>
              <th className="w-16 py-2 font-medium sm:w-20">Done</th>
            </tr>
          </thead>
          <tbody>
            {u.did.map((d) => (
              <tr key={d.label} className="border-t border-border">
                <td className="py-3 pr-6 text-primary">
                  <span className="flex flex-col gap-1">
                    {d.label}
                    <span className="max-w-56">
                      <ProgressBar value={d.done} max={d.target} />
                    </span>
                  </span>
                </td>
                <td className="py-3 text-secondary">{d.target}</td>
                <td className="py-3 font-medium text-primary">{d.done}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {recorded > 0 && (
          <p className="text-body-sm text-secondary">
            {plural(recorded, "activity", "activities")} recorded {u.kind === "monthly" ? "this month" : "this week"}, by you and {b.managerUser?.firstName ?? "your team"}.
          </p>
        )}

        <Link href={`/progress/${u.id}`} className={`self-start ${linkClass}`}>
          Read full details
        </Link>
      </div>
    </Card>
  );
}

const liveSince = {
  any: { label: "Any time", days: 0 },
  week: { label: "Past week", days: 7 },
  month: { label: "Past month", days: 30 },
  quarter: { label: "Past 3 months", days: 91 },
  year: { label: "Past year", days: 365 },
};
type LiveSince = keyof typeof liveSince;

const liveSorts = {
  newest: { label: "Newest first", by: (p: Post) => -new Date(p.publishedAt ?? 0).getTime() },
  oldest: { label: "Oldest first", by: (p: Post) => new Date(p.publishedAt ?? 0).getTime() },
  "most-reactions": { label: "Most reactions", by: (p: Post) => -(p.stats?.reactions ?? 0) },
  "fewest-reactions": { label: "Fewest reactions", by: (p: Post) => p.stats?.reactions ?? 0 },
  "most-impressions": { label: "Most impressions", by: (p: Post) => -(p.stats?.impressions ?? 0) },
  "most-comments": { label: "Most comments", by: (p: Post) => -(p.stats?.comments ?? 0) },
};
type LiveSort = keyof typeof liveSorts;

const livePageSize = 5;

/** C8: every live post, newest first, with search, a date range and a sort so an old post is easy to find. */
export function LiveCard({ b }: { b: ClientBundle }) {
  const [query, setQuery] = useState("");
  const [since, setSince] = useState<LiveSince>("any");
  const [sort, setSort] = useState<LiveSort>("newest");
  const [shown, setShown] = useState(livePageSize);

  const published = b.posts.filter((p) => p.status === "published");
  if (!published.length || !b.user) return null;

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const from = liveSince[since].days ? Date.now() - liveSince[since].days * 86_400_000 : 0;
  const results = published
    .filter((p) => words.every((w) => `${plainText(p.text)} ${p.topic}`.toLowerCase().includes(w)))
    .filter((p) => !from || new Date(p.publishedAt ?? 0).getTime() >= from)
    .sort((x, y) => liveSorts[sort].by(x) - liveSorts[sort].by(y));
  const filtered = words.length > 0 || since !== "any";
  const reset = () => {
    setQuery("");
    setSince("any");
    setShown(livePageSize);
  };
  const author = { name: fullName(b.user), title: b.user.title };

  return (
    <>
      <div role="search" aria-label="Live posts" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
        <label className="relative flex min-w-0 flex-1 items-center sm:order-last">
          <span className="sr-only">Search live posts</span>
          <MagnifyingGlass className="pointer-events-none absolute left-3 size-4 text-secondary" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(livePageSize);
            }}
            placeholder="Search by word or topic"
            className="min-h-10 w-full rounded-sm border border-border-strong bg-card pl-9 pr-10 text-body-sm text-primary placeholder:text-neutral-400 hover:border-neutral-500 focus-visible:border-primary-600 focus-visible:focus-ring [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 flex size-6 items-center justify-center rounded-full text-secondary hover:bg-neutral-100 hover:text-primary focus-visible:focus-ring"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>
        <div className="flex gap-3">
          <Select
            size="sm"
            aria-label="Posted"
            value={since}
            onChange={(e) => {
              setSince(e.target.value as LiveSince);
              setShown(livePageSize);
            }}
            wrapperClassName="flex-1 sm:flex-none"
          >
            {Object.entries(liveSince).map(([value, o]) => (
              <option key={value} value={value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select size="sm" aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as LiveSort)} wrapperClassName="flex-1 sm:flex-none">
            {Object.entries(liveSorts).map(([value, o]) => (
              <option key={value} value={value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card
        title="Live on LinkedIn"
        action={
          <Pill label={filtered ? `${results.length} of ${plural(published.length, "live post")} match` : `${plural(published.length, "post")} live`}>
            <span aria-live="polite">{filtered ? `${results.length} of ${published.length}` : plural(published.length, "post")}</span>
          </Pill>
        }
      >
        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-body font-medium text-primary">No live posts match</p>
            <p className="max-w-sm text-body-sm text-secondary">Try another word or a longer date range.</p>
            <TextButton onClick={reset} className="mt-1">
              Clear search
            </TextButton>
          </div>
        ) : (
          <div className="flex flex-col">
            <ul className="flex flex-col divide-y divide-border">
              {results.slice(0, shown).map((p) => (
                <li key={p.id} className="py-6 first:pt-2 last:pb-2">
                  <PostPreview post={p} author={author} meta={ago(p.publishedAt!)}>
                    <LivePostActions post={p} />
                  </PostPreview>
                </li>
              ))}
            </ul>
            {results.length > shown && (
              <div className="mt-2 flex justify-center border-t border-border pt-4">
                <TextButton onClick={() => setShown((n) => n + livePageSize)}>Show {Math.min(livePageSize, results.length - shown)} more</TextButton>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  );
}

/** Upcoming scheduled posts, booked calls, and events or programs the client has registered for, soonest first. */
export function UpcomingCard({ b }: { b: ClientBundle }) {
  const posts = b.posts.filter((p) => p.status === "scheduled");
  const events = upcomingEvents(b.tasks);
  const calls = upcomingCalls(b.calls);
  const items: UpcomingItem[] = [
    ...posts.map((p) => {
      const overdue = p.scheduledFor ? new Date(p.scheduledFor).getTime() < Date.now() : false;
      return {
        id: p.id,
        at: p.scheduledFor ?? "",
        when: overdue ? "Publish now" : "Publish by",
        href: "/content/publish",
        action: "Publish",
        thumb: <PostThumb post={p} size="lg" />,
        title: plainText(p.text).split("\n")[0],
        meta: `${p.topic}${overdue ? " · past the best time" : ""}`,
      };
    }),
    ...calls.map((c) => ({
      id: c.id,
      at: c.at,
      when: "Starts",
      href: "/calls",
      action: "View details",
      thumb: (
        <TileIcon>
          <VideoCamera className="size-6" aria-hidden />
        </TileIcon>
      ),
      title: callTitle(c),
      meta: `Call with ${b.managerUser?.firstName ?? "your manager"} · ${c.minutes} min · Google Meet`,
    })),
    ...events.map((t) => ({
      id: t.id,
      at: t.event!.startsAt,
      when: "Starts",
      href: `/tasks/${t.id}`,
      action: "View details",
      thumb: (
        <TileIcon>
          <TaskIcon t={t} className="size-6" />
        </TileIcon>
      ),
      title: t.event!.name,
      meta: `${t.event!.type === "program" ? `Program${eventLength(t.event!) ? `, ${eventLength(t.event!)}` : ""}` : "Event"} · ${t.event!.place}`,
    })),
  ].sort((x, y) => x.at.localeCompare(y.at));
  if (!items.length) return null;

  const count = [
    posts.length && plural(posts.length, "post"),
    calls.length && plural(calls.length, "call"),
    events.length && plural(events.length, "event"),
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Card
      title="Coming up"
      action={<Pill label={`${count} coming up`}>{count}</Pill>}
    >
      <ul className="flex flex-col gap-3">
        {items.map((it) => (
          <li key={it.id}>
            <Link
              href={it.href}
              className="group flex flex-col rounded-md border border-border transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:focus-ring"
            >
              <span className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 group-hover:border-primary-200">
                <Meta icon={CalendarBlank}>
                  {it.when} {dayIn(it.at)} · {time(it.at)}
                </Meta>
                <TileAction>{it.action}</TileAction>
              </span>
              <span className="flex items-start gap-4 p-4">
                {it.thumb}
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="line-clamp-2 text-body font-medium text-primary">{it.title}</span>
                  <span className="text-body-sm text-secondary">{it.meta}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

type UpcomingItem = { id: string; at: string; when: string; href: string; action: string; thumb: ReactNode; title: string; meta: string };

/** C10 entry: the latest message from the manager. */
export function MessageCard({ b }: { b: ClientBundle }) {
  const m = [...b.messages].reverse().find((x) => x.fromUserId === b.managerUser?.id);
  if (!m || !b.managerUser) return null;
  return (
    <Card title={`From ${b.managerUser.firstName}`} action={<span className="text-caption text-secondary">{ago(m.at)}</span>}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Avatar name={fullName(b.managerUser)} src={b.managerUser?.photo} size="md" />
          <p className="rounded-md bg-neutral-25 px-4 py-3 text-body-sm text-primary">{m.text}</p>
        </div>
        <Link href="/messages" className={linkClass}>
          Reply
        </Link>
      </div>
    </Card>
  );
}
