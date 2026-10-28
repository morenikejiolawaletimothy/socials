"use client";

import { CheckCircle, Clock, Image as ImageIcon, Sparkle, WarningCircle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import { PostPreview } from "@/components/content/PostPreview";
import { Columns } from "@/components/layout/Columns";
import { OffLimitsBox } from "@/components/manager/ClientTabs";
import { rails } from "@/components/rails";
import { Badge, Banner, Breadcrumbs, Button, Card, EmptyState, Tabs, Textarea, useToast } from "@/components/ui";
import { ago, dayTime, dayTimeIn, fullName, time } from "@/lib/format";
import { act, clientBundle, useMyManager, type ClientBundle, type Post } from "@/lib/mock";

type Tab = "ideas" | "drafts" | "changes" | "client" | "schedule" | "scheduled" | "live";

// Staff only: proposed ideas, each with its reason. Phase 2 generates these per client from the strategy and listening.
const ideas = [
  { title: "What the mobile money report gets wrong about settlement", reason: "Signal: the central bank report, and 3 investors on the list wrote about it. Fits topic 1.", format: "Opinion" },
  { title: "The question from the student at Lagos Fintech Week", reason: "Moment the client added, with photos. Event posts do best within a week.", format: "Story" },
  { title: "5 questions to ask a payments partner before you sign", reason: "Goal: investor and partner conversations. How-to posts got saves last month.", format: "How-to" },
  { title: "Our first Ghana merchants, one year on", reason: "Past preference: the client approved every customer story so far.", format: "Story" },
];

const checkKind = { "off-limits": "Off limits", claim: "Claim", phrase: "Banned phrase", generic: "Generic", repeat: "Repeat", "alt-text": "Image description" };

/** M4 one draft: direct it, edit it, see versions and checks, then send to the client with a why-note and due time. */
function DraftEditor({ post, b }: { post: Post; b: ClientBundle }) {
  const toast = useToast();
  const [text, setText] = useState(post.text);
  const [direction, setDirection] = useState("");
  const [why, setWhy] = useState(post.why);
  const [version, setVersion] = useState(post.version ?? 1);
  const [busy, setBusy] = useState(false);
  const open = (post.checks ?? []).filter((k) => k.state === "open");
  const blocked = open.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-caption text-secondary">
          {post.topic} · {post.format} · version {version}
        </span>
        <Badge status={blocked ? "warning" : "success"}>{blocked ? `${open.length} check${open.length > 1 ? "s" : ""} to clear` : "Checks clear"}</Badge>
      </div>

      <Textarea label="Draft" rows={7} value={text} onChange={(e) => setText(e.target.value)} help={`${text.length} characters. LinkedIn shows about 210 before "See more".`} />

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!direction.trim()) return;
          setVersion((v) => v + 1);
          setText((t) => (direction.toLowerCase().includes("short") ? t.split("\n\n").slice(0, 2).join("\n\n") : `${t}\n\nWhat would you add?`));
          toast(`Version ${version + 1} ready: "${direction.trim()}"`);
          setDirection("");
        }}
      >
        <label className="flex flex-1 flex-col gap-2">
          <span className="flex items-center gap-1 text-body-sm font-medium text-primary">
            <Sparkle className="size-4 text-primary-600" aria-hidden /> Direct the draft
          </span>
          <input
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            placeholder="Shorter. Open with the story. Less formal."
            className="min-h-11 rounded-sm border border-border-strong bg-card px-4 text-body text-primary placeholder:text-neutral-400 focus-visible:border-primary-600 focus-visible:focus-ring"
          />
        </label>
        <Button type="submit" variant="secondary">
          Rewrite
        </Button>
      </form>

      <div className="flex items-start gap-3 rounded-md bg-neutral-25 p-4">
        <ImageIcon className="mt-0.5 size-5 shrink-0 text-primary-600" aria-hidden />
        <div className="flex flex-col gap-1">
          <span className="text-body-sm font-medium text-primary">Visual</span>
          <span className="text-body-sm text-secondary">
            {post.image
              ? `Attached: ${post.image.alt}.`
              : "Suggested: the stage photo from the client's Brand, or text on a brand-coloured card. A quote card from the template library would also work."}
          </span>
          <button type="button" onClick={() => toast("Choose from Brand, templates or upload.")} className="self-start rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
            {post.image ? "Change visual" : "Add a visual"}
          </button>
        </div>
      </div>

      {(post.checks ?? []).length > 0 && (
        <ul className="flex flex-col gap-2">
          {post.checks!.map((k) => (
            <li key={k.id} className={`flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center ${k.state === "open" ? (k.kind === "off-limits" ? "border-danger bg-danger-bg" : "border-warning bg-warning-bg") : "border-border"}`}>
              <span className="flex flex-1 items-center gap-2 text-body-sm text-primary">
                {k.state === "open" ? <WarningCircle className="size-5 shrink-0 text-danger" aria-hidden /> : <CheckCircle className="size-5 shrink-0 text-success" aria-hidden />}
                <span>
                  <span className="font-medium">{checkKind[k.kind]}: </span>
                  {k.label}
                  {k.state === "dismissed" && <span className="text-secondary"> (dismissed)</span>}
                </span>
              </span>
              {k.state === "open" && (
                <span className="flex gap-2">
                  <Button variant="secondary" onClick={() => act.setCheck(post.id, k.id, "fixed")}>
                    Fixed
                  </Button>
                  {k.kind !== "off-limits" && (
                    <Button variant="ghost" onClick={() => act.setCheck(post.id, k.id, "dismissed")}>
                      Dismiss
                    </Button>
                  )}
                </span>
              )}
            </li>
          ))}
          {open.some((k) => k.kind === "off-limits") && <li className="text-caption text-secondary">Off-limits flags cannot be dismissed. Change the draft, then mark it fixed.</li>}
        </ul>
      )}

      <Textarea label={`Why this post (${b.user?.firstName ?? "the client"} sees this)`} rows={2} value={why} onChange={(e) => setWhy(e.target.value)} />

      <Button
        className="self-start"
        disabled={blocked || busy}
        onClick={async () => {
          setBusy(true);
          await act.setPostStatus(post.id, "awaiting-client", { text, why, version, dueAt: new Date(Date.now() + 2 * 86_400_000).toISOString() });
          setBusy(false);
          toast(`Sent to ${b.user?.firstName}. Due in 2 days.`);
        }}
      >
        {blocked ? "Clear the checks to send" : busy ? "Sending" : `Send to ${b.user?.firstName ?? "client"}`}
      </Button>
    </div>
  );
}

/** M5 changes asked: the client's feedback becomes a short list to tick off, then send back. */
function ChangesEditor({ post, b }: { post: Post; b: ClientBundle }) {
  const toast = useToast();
  const latest = post.feedback?.[post.feedback.length - 1];
  const items = ["Soften the opening line", "Do not suggest dashboards are bad", "Keep the point about nurses' time"];
  const [done, setDone] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-4">
      {latest && (
        <blockquote className="rounded-md bg-warning-bg p-4 text-body-sm text-primary">
          <span className="font-medium">{b.user?.firstName}: </span>&ldquo;{latest.text}&rdquo; <span className="text-secondary">({ago(latest.at)})</span>
        </blockquote>
      )}
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1 text-body-sm font-medium text-primary">
          <Sparkle className="size-4 text-primary-600" aria-hidden /> Changes to make
        </span>
        {items.map((i) => (
          <label key={i} className="flex cursor-pointer items-center gap-3 text-body-sm text-primary">
            <input type="checkbox" checked={done.includes(i)} onChange={() => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))} className="size-4 accent-primary-600" />
            <span className={done.includes(i) ? "text-secondary line-through" : ""}>{i}</span>
          </label>
        ))}
      </div>
      <Textarea label="Draft" rows={4} defaultValue={post.text} />
      <Button
        className="self-start"
        disabled={done.length < items.length}
        onClick={async () => {
          await act.setPostStatus(post.id, "awaiting-client", { dueAt: new Date(Date.now() + 86_400_000).toISOString() });
          toast(`New version sent to ${b.user?.firstName}.`);
        }}
      >
        {done.length < items.length ? `${items.length - done.length} changes left` : "Send back"}
      </Button>
    </div>
  );
}

/** M5 approved: confirm or change the suggested time, with both time zones. */
function Scheduler({ post, b }: { post: Post; b: ClientBundle }) {
  const toast = useToast();
  const suggested = (() => {
    const d = new Date(Date.now() + 2 * 86_400_000);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  })();
  return (
    <div className="flex flex-col gap-3 rounded-md bg-neutral-25 p-4">
      <span className="flex items-center gap-2 text-body-sm font-medium text-primary">
        <Clock className="size-5 text-primary-600" aria-hidden /> Suggested: {dayTime(suggested)}
      </span>
      <span className="text-caption text-secondary">
        {time(suggested)} for {b.user?.firstName} ({b.user?.timeZone.replace("_", " ")}), {time(suggested)} for you. Weekday mornings do best for this audience.
      </span>
      <div className="flex gap-2">
        <Button
          onClick={async () => {
            await act.setPostStatus(post.id, "scheduled", { scheduledFor: suggested });
            toast(`Scheduled for ${dayTimeIn(suggested)}.`);
          }}
        >
          Schedule
        </Button>
        <Button variant="ghost" onClick={() => toast("Pick another time from the calendar.")}>
          Change time
        </Button>
      </div>
    </div>
  );
}

function ContentWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const tab = (useSearchParams().get("tab") as Tab) || "drafts";
  const { db } = useMyManager();
  const b = clientBundle(db, id);
  if (!b.client || !b.user) return <EmptyState title="Client not found">Go back to Clients.</EmptyState>;
  const author = { name: fullName(b.user), title: b.user.title };

  const groups: Record<Exclude<Tab, "ideas">, Post[]> = {
    drafts: b.posts.filter((p) => p.status === "draft" || p.status === "manager-review"),
    changes: b.posts.filter((p) => p.status === "changes-requested"),
    client: b.posts.filter((p) => p.status === "awaiting-client" || p.status === "on-hold"),
    schedule: b.posts.filter((p) => p.status === "approved"),
    scheduled: b.posts.filter((p) => p.status === "scheduled"),
    live: b.posts.filter((p) => ["published", "failed", "taken-down"].includes(p.status)),
  };

  return (
    <Columns {...rails.managerMain}>
      <Card
        title="Content"
        eyebrow={<Breadcrumbs items={[{ label: "Clients", href: "/manager/clients" }, { label: fullName(b.user), href: `/manager/clients/${id}` }, { label: "Content" }]} />}
        action={<span className="text-caption text-secondary">Reviews {b.client.review.frequency.replace("-", " ")}</span>}
        padding="none"
      >
        <div className="flex flex-col gap-4 px-6 pt-4">
          <OffLimitsBox b={b} />
          <Tabs
            label="Content stages"
            value={tab}
            onChange={(t) => router.replace(`/manager/clients/${id}/content?tab=${t}`, { scroll: false })}
            tabs={[
              { value: "ideas", label: "Ideas" },
              { value: "drafts", label: "Drafts", count: groups.drafts.length },
              { value: "changes", label: "Changes asked", count: groups.changes.length },
              { value: "client", label: "With client", count: groups.client.length },
              { value: "schedule", label: "To schedule", count: groups.schedule.length },
              { value: "scheduled", label: "Scheduled" },
              { value: "live", label: "Live", count: groups.live.filter((p) => p.status === "failed" || p.fixRequested).length },
            ]}
          />
        </div>

        {tab === "ideas" ? (
          <div className="flex flex-col gap-4 p-6">
            <p className="flex items-center gap-1 text-body-sm text-secondary">
              <Sparkle className="size-4 text-primary-600" aria-hidden /> Proposed for next week. Nothing here touches the off-limits list. Pick, change or ask for more.
            </p>
            <ul className="flex flex-col gap-3">
              {ideas.map((i) => (
                <li key={i.title} className="flex flex-col gap-2 rounded-md border border-border p-4">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-body font-medium text-primary">{i.title}</span>
                    <span className="shrink-0 text-caption text-secondary">{i.format}</span>
                  </span>
                  <span className="text-body-sm text-secondary">{i.reason}</span>
                  <span className="flex gap-2">
                    <Button variant="secondary" onClick={() => toast("Picked. A first draft is being written in the client's voice.")}>
                      Pick
                    </Button>
                    <Button variant="ghost" onClick={() => toast("Noted. The next ideas will avoid this.")}>
                      Not this
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="secondary" className="self-start" onClick={() => toast("4 more ideas on the way.")}>
              More ideas
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col">
            {groups[tab].length === 0 && (
              <li className="p-6">
                <EmptyState title="Nothing here">Posts move here as they reach this stage.</EmptyState>
              </li>
            )}
            {groups[tab].map((p) => (
              <li key={p.id} className="flex flex-col gap-4 border-t border-border p-6">
                {tab === "drafts" && <DraftEditor post={p} b={b} />}
                {tab === "changes" && <ChangesEditor post={p} b={b} />}
                {tab !== "drafts" && tab !== "changes" && (
                  <PostPreview post={p} author={author} meta={p.publishedAt ? ago(p.publishedAt) : p.scheduledFor ? dayTime(p.scheduledFor) : p.dueAt ? `Due ${dayTimeIn(p.dueAt)}` : "Approved"}>
                    {tab === "client" && (
                      <p className="text-body-sm text-secondary">
                        {p.status === "on-hold"
                          ? `Held: ${p.heldReason} It shows in the weekly update as waiting on the client.`
                          : b.client!.review.ifNoReply === "wait"
                            ? "If there is no reply by the due time, it is held."
                            : "If there is no reply in 24 hours, it is approved and scheduled automatically."}
                      </p>
                    )}
                    {tab === "schedule" && <Scheduler post={p} b={b} />}
                    {tab === "live" && p.fixRequested && (
                      <Banner tone="danger" title="Fix asked for" action={<Button variant="secondary" onClick={async () => { await act.setPostStatus(p.id, "published", { fixRequested: undefined }); toast(`Fixed. ${b.user!.firstName} is told.`); }}>Mark fixed</Button>}>
                        {p.fixRequested}
                      </Banner>
                    )}
                    {tab === "live" && p.status === "failed" && (
                      <Banner tone="danger" title="Did not post" action={<Button variant="secondary" onClick={async () => { await act.setPostStatus(p.id, "scheduled", { failedReason: undefined, scheduledFor: new Date(Date.now() + 3_600_000).toISOString() }); toast("Fixed and scheduled for an hour from now."); }}>Fix and retry</Button>}>
                        {p.failedReason}
                      </Banner>
                    )}
                    {tab === "live" && p.status === "taken-down" && <p className="text-body-sm text-secondary">The client took this post down.</p>}
                  </PostPreview>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Columns>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <ContentWorkspace id={id} />
    </Suspense>
  );
}
