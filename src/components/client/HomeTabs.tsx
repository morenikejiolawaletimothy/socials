"use client";

import {
  Article,
  CalendarStar,
  ChatCircleText,
  ClockCounterClockwise,
  FadersHorizontal,
  MagnifyingGlass,
  Target,
  UserCircleGear,
  UsersThree,
  VideoCamera,
  type Icon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToCalendar } from "@/components/calls/AddToCalendar";
import { plainText } from "@/components/content/PostText";
import { callTitle } from "@/components/rails/NextCallCard";
import { Avatar, Button, buttonClass, Card, Meta, Pill, Select, Tabs, TextButton, TextLink, useTask } from "@/components/ui";
import { agoIn, date, dateTime, fullName, money } from "@/lib/format";
import { act, type Call, type ClientBundle, type Post, type QuickTask } from "@/lib/mock";
import { contractTotalCents } from "@/lib/pricing";
import { FeedCard, SlotChips, type FeedStatus } from "./FeedCard";
import { UpcomingCard, UpdateCard } from "./HomeCards";
import { PayDialog } from "./PayDialog";
import { ShareDialog } from "./ShareDialog";

type Tab = "feed" | "calls" | "coming" | "reports" | "history";
type Range = "any" | "today" | "week" | "month";
/** `at` is the date shown (due); `sent` orders the feed (newest first = most recently sent). */
type Item =
  | { key: string; type: "post"; status: FeedStatus; at: string; sent: string; title: string; post: Post }
  | { key: string; type: "task"; status: FeedStatus; at: string; sent: string; title: string; task: QuickTask }
  | { key: string; type: "strategy"; status: FeedStatus; at: string; sent: string; title: string };

const CUTOFF_MS = 30 * 60_000;
const DAY = 86_400_000;

const taskIcon: Record<string, Icon> = { profile: UserCircleGear, connect: UsersThree, event: CalendarStar, video: VideoCamera };
const iconFor = (i: Item): Icon => (i.type === "post" ? Article : i.type === "strategy" ? Target : (taskIcon[i.task.kind] ?? ChatCircleText));

/** What each post status means in the feed. */
function postStatus(p: Post, premium: boolean): FeedStatus | null {
  if (p.status === "awaiting-client") return "pending";
  if (p.status === "changes-requested") return "changes";
  if (p.status === "draft" || p.status === "manager-review") return "drafting";
  if (p.status === "approved" && !premium) return "ready";
  return null;
}

/** Everything the client acts on or should know, as one feed (Figma Feed tab). */
function buildFeed(b: ClientBundle, premium: boolean): Item[] {
  const out: Item[] = [];
  for (const p of b.posts) {
    const status = postStatus(p, premium);
    if (status) {
      const at = p.dueAt ?? p.sentAt ?? p.scheduledFor ?? new Date().toISOString();
      out.push({ key: `post-${p.id}`, type: "post", status, at, sent: p.sentAt ?? at, title: p.topic, post: p });
    }
  }
  const recent = Date.now() - 14 * DAY;
  for (const t of b.tasks) {
    if (t.done && new Date(t.sentAt).getTime() < recent) continue;
    out.push({ key: `task-${t.id}`, type: "task", status: t.done ? "completed" : "ready", at: t.dueAt, sent: t.sentAt, title: t.title, task: t });
  }
  const s = b.strategy;
  if (s && (s.status === "shared" || s.status === "agreed-sent")) out.push({ key: "strategy", type: "strategy", status: "pending", at: new Date().toISOString(), sent: new Date().toISOString(), title: s.status === "agreed-sent" ? "Approve your strategy" : "Your strategy is ready" });
  return out;
}

const inRange = (iso: string, r: Range) => {
  if (r === "any") return true;
  const d = Math.abs(new Date(iso).getTime() - Date.now());
  return d <= (r === "today" ? DAY : r === "week" ? 7 * DAY : 31 * DAY);
};

/** Figma: "Your free period is ending" card, first in the column until the contract is paid. */
function FreePeriodCard({ b }: { b: ClientBundle }) {
  const [paying, setPaying] = useState(false);
  const k = b.contract;
  if (!b.client || !k || k.paid || b.client.status !== "free") return null;
  const total = contractTotalCents(k);
  return (
    <Card title="Your free period is ending" action={<Meta icon={ClockCounterClockwise}>Ends {date(k.freeEndsAt)}</Meta>} padding="none">
      <div className="flex flex-col gap-4 px-6 py-4">
        <p className="text-body-sm text-secondary">Pay to keep going after your free 2 weeks. If we have not received payment by then, your account pauses until you pay.</p>
        <dl className="flex flex-col divide-y divide-border rounded-md border border-border">
          {[
            ["Free until", date(k.freeEndsAt)],
            ["Contract duration", `${k.months} months`],
            ["Amount due", money(total)],
          ].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-body-sm text-secondary">{l}</dt>
              <dd className="text-body-sm font-medium text-primary">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
        <Link href="/contract" className={buttonClass("ghost")}>
          View contract
        </Link>
        <Button onClick={() => setPaying(true)}>Pay now</Button>
      </div>
      <PayDialog open={paying} onClose={() => setPaying(false)} clientId={b.client.id} amountCents={total} />
    </Card>
  );
}

/** One feed item with its actions. Regular clients do the work; Premium clients only approve, and see the rest as notices. */
function FeedItem({ item, b, premium }: { item: Item; b: ClientBundle; premium: boolean }) {
  const { run, pending } = useTask();
  const [sharing, setSharing] = useState(false);
  const first = b.managerUser?.firstName ?? "your account manager";

  if (item.type === "strategy") {
    return (
      <FeedCard status={item.status} icon={Target} title={item.title} footer={<Link href="/strategy" className={buttonClass("primary", "sm")}>Read your strategy</Link>}>
        {b.strategy?.goal}
      </FeedCard>
    );
  }

  if (item.type === "post") {
    const p = item.post;
    const last = p.feedback?.at(-1);
    return (
      <FeedCard
        status={item.status}
        icon={Article}
        title={p.topic}
        time={p.dueAt ? dateTime(p.dueAt) : undefined}
        info={p.why || undefined}
        footer={
          item.status === "pending" ? (
            <>
              <Link href={`/home/request-change?post=${p.id}`} className={buttonClass("secondary", "sm")}>
                Request changes
              </Link>
              <Button size="sm" loading={pending("approve")} onClick={() => run("approve", () => act.approvePost(p.id), premium ? "Approved. We post it at the planned time." : "Approved. It is ready for you to publish.")}>
                Approve
              </Button>
            </>
          ) : item.status === "ready" ? (
            <Link href={`/content/publish?post=${p.id}`} className={buttonClass("primary", "sm")}>
              Publish
            </Link>
          ) : undefined
        }
      >
        {item.status === "changes" && last ? `You asked: “${last.text}”\n\n${first} is updating it.` : item.status === "drafting" ? `${first} is writing this post. You will see it here when it is ready for review.` : plainText(p.text)}
      </FeedCard>
    );
  }

  const t = item.task;
  const steps = t.items || t.people || t.event || t.video;
  const body =
    t.body ??
    (t.kind === "profile" && t.text ? `${t.where ?? ""}\n\n“${t.text}”` : t.event ? t.event.why : t.people ? `${t.people.length} people picked for you, each with a short note to send.` : t.items ? `${t.items.length} posts and people picked for you.` : undefined);

  return (
    <>
      <FeedCard
        status={item.status}
        icon={iconFor(item)}
        title={t.title}
        time={dateTime(t.dueAt)}
        resource={t.resource}
        footer={
          t.done || premium ? undefined : (
            <>
              {t.handoff && !t.handoff.endedAt ? (
                <span className="text-body-sm text-secondary">With your assistant</span>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setSharing(true)}>
                  Share with assistant
                </Button>
              )}
              {steps ? (
                <Link href={`/tasks/${t.id}`} className={buttonClass("primary", "sm")}>
                  Open task
                </Link>
              ) : (
                <Button size="sm" loading={pending("done")} onClick={() => run("done", () => act.markTaskDone(t.id), "Marked as done. Thank you.")}>
                  Mark as done
                </Button>
              )}
            </>
          )
        }
      >
        {body}
      </FeedCard>
      {!premium && b.client && <ShareDialog task={t} clientId={b.client.id} open={sharing} onClose={() => setSharing(false)} />}
    </>
  );
}

/** One call in the Calls tab: pick a time, wait for the other side, meeting details, or the call note. */
function CallItem({ call: c, b }: { call: Call; b: ClientBundle }) {
  const { run, pending } = useTask();
  const options = c.pending?.options ?? [c.at];
  const [chosen, setChosen] = useState(options[0]);
  const m = b.managerUser;
  const first = m?.firstName ?? "Your account manager";
  const awaitingYou = c.status === "pending" && c.pending?.awaiting === "client";
  const awaitingThem = c.status === "pending" && c.pending?.awaiting === "manager";
  // A booked call whose time has passed waits for the manager's notes, like a done call.
  const past = c.status === "booked" && new Date(c.at).getTime() + c.minutes * 60_000 < Date.now();
  const booked = c.status === "booked" && !past;
  const finished = c.status === "done" || past;
  const locked = booked && new Date(c.at).getTime() - Date.now() < CUTOFF_MS;
  const status: FeedStatus = awaitingYou ? "ready" : awaitingThem ? "pending" : "completed";
  const label = awaitingThem ? `Waiting for ${first}` : booked ? "Booked" : finished ? "Done" : undefined;
  const reschedule = (
    <Link href={`/calls/reschedule?call=${c.id}`} className={buttonClass("secondary", "sm")}>
      Reschedule
    </Link>
  );

  return (
    <FeedCard
      status={status}
      label={label}
      icon={VideoCamera}
      title={callTitle(c)}
      time={dateTime(c.at)}
      footer={
        awaitingYou ? (
          <>
            {reschedule}
            <Button size="sm" loading={pending("accept")} onClick={() => run("accept", () => act.acceptTime(c.id, chosen), c.meetUrl ? "Booked. It is in your calendar." : `Accepted. ${first} adds the meeting link to confirm.`)}>
              Accept
            </Button>
          </>
        ) : awaitingThem ? (
          c.previous ? (
            <Button variant="secondary" size="sm" loading={pending("revert")} onClick={() => run("revert", () => act.revertProposal(c.id), "Your new times are withdrawn.")}>
              Revert
            </Button>
          ) : (
            reschedule
          )
        ) : booked && !locked ? (
          reschedule
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4 whitespace-normal">
        {m && (
          <span className="flex items-center gap-3">
            <Avatar name={fullName(m)} src={m.photo} size="md" />
            <span className="flex flex-col">
              <span className="text-body font-medium text-primary">{fullName(m)}</span>
              <span className="text-body-sm text-secondary">Account manager</span>
            </span>
          </span>
        )}
        {c.agenda && <p>{c.agenda}</p>}
        {c.pending?.note && <p>Note: {c.pending.note}</p>}
        {awaitingYou && <SlotChips times={options} value={chosen} onChange={setChosen} format={dateTime} />}
        {awaitingThem && (
          <>
            <p>{c.pending?.by === "client" ? `You suggested ${options.length > 1 ? "these times" : "this time"}. ${first} confirms with a meeting link.` : `${first} is confirming the time.`}</p>
            <SlotChips times={options} format={dateTime} />
          </>
        )}
        {booked && (
          <div className="flex flex-col gap-2 rounded-md border border-border p-4">
            <span className="text-body-sm font-medium text-primary">Meeting details</span>
            <span>
              {dateTime(c.at)} · {c.minutes} min · Google Meet
            </span>
            <span className="flex flex-wrap items-center gap-4">
              {c.meetUrl && <TextLink href={c.meetUrl}>Join call</TextLink>}
              <AddToCalendar event={{ title: `${callTitle(c)} with ${m ? fullName(m) : "Bluecut"}`, start: c.at, minutes: c.minutes, url: c.meetUrl || undefined }} />
            </span>
            {locked && <span className="text-caption">Starts soon, so the time is locked.</span>}
          </div>
        )}
        {finished && (
          <div className="flex flex-col gap-2 rounded-md border border-border p-4">
            <span className="text-body-sm font-medium text-primary">Call note</span>
            {c.outcome === "missed" ? <span>The call did not hold. {c.outcomeNote}</span> : c.sharedAt ? <span className="whitespace-pre-line">{c.insights}</span> : <span>{first} will share the notes from this call soon.</span>}
            {c.sharedAt && c.transcript && <details><summary className="cursor-pointer text-body-sm font-medium text-primary-700">Read the transcript</summary><p className="mt-2 whitespace-pre-line">{c.transcript}</p></details>}
          </div>
        )}
      </div>
    </FeedCard>
  );
}

/** The search and filter row (Figma): Any time · Newest first · Keywords. */
function FilterRow({ range, setRange, sort, setSort, q, setQ }: { range: Range; setRange: (r: Range) => void; sort: string; setSort: (s: string) => void; q: string; setQ: (s: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 sm:grid-cols-3">
      <Select aria-label="When" value={range} onChange={(e) => setRange(e.target.value as Range)}>
        <option value="any">Any time</option>
        <option value="today">Today</option>
        <option value="week">This week</option>
        <option value="month">This month</option>
      </Select>
      <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="new">Newest first</option>
        <option value="old">Oldest first</option>
      </Select>
      <label className="col-span-2 flex items-center gap-2 rounded-sm border border-border-strong bg-card px-3 focus-within:border-primary-600 focus-within:focus-ring sm:col-span-1">
        <span className="sr-only">Search by word or topic</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keywords" className="min-h-11 min-w-0 flex-1 bg-transparent text-body-sm text-primary outline-none placeholder:text-neutral-400" />
        <MagnifyingGlass className="size-4 shrink-0 text-secondary" aria-hidden />
      </label>
    </div>
  );
}

/**
 * Figma Home after setup: a tab card (Feed · Calls · Coming up · Reports · History) and the chosen tab's card.
 * Regular (self-serve) clients act on posts and tasks; Premium (full-service) clients approve posts and see
 * the rest as notices of what we are about to do.
 */
export function HomeTabs({ b }: { b: ClientBundle }) {
  const [tab, setTab] = useState<Tab>("feed");
  const [filtering, setFiltering] = useState(false);
  const [range, setRange] = useState<Range>("any");
  const [sort, setSort] = useState("new");
  const [q, setQ] = useState("");
  const premium = b.client?.service === "full-service";

  const items = useMemo(() => buildFeed(b, premium), [b, premium]);
  const shown = items
    .filter((i) => inRange(i.at, range))
    .filter((i) => !q.trim() || `${i.title} ${i.type === "post" ? i.post.text : i.type === "task" ? (i.task.body ?? "") : ""}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, c) => (sort === "new" ? c.sent.localeCompare(a.sent) : a.sent.localeCompare(c.sent)));
  const open = items.filter((i) => i.status !== "completed" && i.status !== "drafting").length;
  const done = items.filter((i) => i.status === "completed").length;

  // What needs you first, then what waits on your manager, then booked calls soonest first, then past calls.
  const rank = (c: Call) => (c.status === "pending" ? (c.pending?.awaiting === "client" ? 0 : 1) : new Date(c.at).getTime() > Date.now() ? 2 : 3);
  const calls = b.calls
    .filter((c) => c.status !== "cancelled" && (new Date(c.at).getTime() > Date.now() - 30 * DAY || c.status === "pending"))
    .sort((a, c) => rank(a) - rank(c) || (rank(a) === 3 ? c.at.localeCompare(a.at) : a.at.localeCompare(c.at)));
  const callsOpen = calls.filter((c) => c.status === "pending" && c.pending?.awaiting === "client").length;
  const callsDone = calls.filter((c) => c.status === "booked" || c.status === "done").length;
  const coming = b.posts.filter((p) => p.status === "scheduled").length;
  const history = b.activity.slice(0, 20);

  return (
    <div className="flex flex-col gap-4">
      <FreePeriodCard b={b} />

      <Card padding="sm">
        <Tabs<Tab>
          label="Home sections"
          value={tab}
          onChange={setTab}
          showZero
          fill
          className="flex! w-full gap-1"
          tabs={[
            { value: "feed", label: "Feed", count: open },
            { value: "calls", label: "Calls", count: callsOpen },
            { value: "coming", label: "Coming up", count: coming },
            { value: "reports", label: "Reports" },
            { value: "history", label: "History", count: history.length },
          ]}
        />
      </Card>

      {tab === "feed" && (
        <Card
          title="Feed"
          info={premium ? "Posts to approve, and what we are about to do on your LinkedIn. Items stay here, marked Completed, once they are done." : "Everything that needs you: posts to approve and publish, and quick tasks. Items stay here, marked Completed, once they are done."}
          action={
            <span className="flex items-center gap-3">
              <TextButton onClick={() => setFiltering((f) => !f)} aria-expanded={filtering}>
                <FadersHorizontal className="size-4" aria-hidden /> Filter
              </TextButton>
              <Pill>{`${done} of ${items.length} done`}</Pill>
            </span>
          }
        >
          <div className="flex flex-col gap-3">
            {filtering && <FilterRow range={range} setRange={setRange} sort={sort} setSort={setSort} q={q} setQ={setQ} />}
            {shown.length ? (
              shown.map((i) => <FeedItem key={i.key} item={i} b={b} premium={premium} />)
            ) : (
              <p className="text-body-sm text-secondary">{items.length ? "Nothing matches. Try another word or time." : "When your account manager sends posts for your review, they show up here."}</p>
            )}
          </div>
        </Card>
      )}

      {tab === "calls" && (
        <Card
          title="Calls"
          info="Your calls with your account manager. Pick a time they offered, or suggest another. The call is booked once you both agree."
          action={
            <span className="flex items-center gap-3">
              <TextLink href="/calls/book">Book a call</TextLink>
              <Pill>{`${callsDone} of ${calls.length} done`}</Pill>
            </span>
          }
        >
          <div className="flex flex-col gap-3">
            {calls.length ? calls.map((c) => <CallItem key={c.id} call={c} b={b} />) : <p className="text-body-sm text-secondary">When your account manager offers times for a call, they show up here.</p>}
          </div>
        </Card>
      )}

      {tab === "coming" && (coming || b.calls.some((c) => c.status === "booked") ? <UpcomingCard b={b} /> : <Card title="Coming up"><p className="text-body-sm text-secondary">Posts on the schedule and booked calls show up here.</p></Card>)}

      {tab === "reports" && (b.updates.some((u) => u.status === "sent") ? <UpdateCard b={b} /> : <Card title="Reports"><p className="text-body-sm text-secondary">Your weekly and monthly reports show up here.</p></Card>)}

      {tab === "history" && (
        <Card title="History">
          {history.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {history.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-body-sm text-primary">{a.text}</span>
                  <span className="shrink-0 text-caption text-secondary">{agoIn(a.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">Nothing yet. What you and your team do shows up here.</p>
          )}
        </Card>
      )}
    </div>
  );
}
