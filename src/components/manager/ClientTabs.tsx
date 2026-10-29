"use client";

import { CheckCircle, LinkSimple, Plus, Sparkle, Trash, WarningCircle, XCircle } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge, Banner, Button, Card, Input, ProgressBar, Textarea, useConfirm, useTask, useToast } from "@/components/ui";
import { ago, agoIn, dayTime, fullName, plural } from "@/lib/format";
import { act, type ClientBundle, type Lead } from "@/lib/mock";

const linkClass = "rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring";
const primaryLink =
  "inline-flex min-h-11 items-center justify-center self-start rounded-md border border-transparent bg-primary-600 px-5 py-3 text-body font-medium leading-none text-inverse transition-colors hover:bg-primary-700 focus-visible:focus-ring";

function Targets({ b }: { b: ClientBundle }) {
  if (!b.week) return <p className="text-body-sm text-secondary">Targets start once the strategy is approved.</p>;
  return (
    <ul className="flex flex-col gap-4">
      {[
        { label: "Posts", ...b.week.posts },
        { label: "Comments", ...b.week.comments },
        { label: "Connection requests", ...b.week.connections },
      ].map((r) => (
        <li key={r.label} className="flex flex-col gap-2">
          <span className="flex justify-between text-body-sm">
            <span className="text-primary">{r.label}</span>
            <span className="text-secondary">
              {r.done} of {r.target}
            </span>
          </span>
          <ProgressBar value={r.done} max={r.target} tone={r.done >= r.target ? "success" : "brand"} />
        </li>
      ))}
    </ul>
  );
}

export function OffLimitsBox({ b }: { b: ClientBundle }) {
  if (!b.brand?.offLimits.length) return null;
  return (
    <div className="flex flex-col gap-2 rounded-md border border-danger bg-danger-bg p-4">
      <span className="flex items-center gap-2 text-body font-medium text-primary">
        <WarningCircle className="size-5 text-danger" aria-hidden /> Off limits
      </span>
      <ul className="flex flex-col gap-1 text-body-sm text-primary">
        {b.brand.offLimits.map((o) => (
          <li key={o.id}>
            <span className="text-secondary">{o.kind}: </span>
            {o.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Overview ---------- */

export function OverviewTab({ b }: { b: ClientBundle }) {
  const p = b.client!.permissions;
  const r = b.client!.review;
  return (
    <>
      <Card title="Goal">
        <div className="flex flex-col gap-4">
          <p className="text-body text-primary">{b.strategy?.goal ?? b.client!.goal}</p>
          <OffLimitsBox b={b} />
        </div>
      </Card>
      <Card title="This week">
        <Targets b={b} />
      </Card>
      <Card title="What they let us do">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ["Post for them", p.post],
            ["Like and comment", p.engage],
            ["Company Page", p.companyPage],
            ["Draft connection requests", p.connectionDrafts],
            ["Draft profile updates", p.profileDrafts],
          ].map(([label, on]) => (
            <li key={label as string} className="flex items-center gap-2 text-body-sm text-primary">
              {on ? <CheckCircle className="size-5 text-success" aria-label="On" /> : <XCircle className="size-5 text-neutral-300" aria-label="Off" />}
              {label as string}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="How they review">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <dt className="text-caption text-secondary">How often</dt>
            <dd className="text-body text-primary">{{ weekly: "Once a week", "twice-weekly": "Twice a week", "every-post": "Every post" }[r.frequency]}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-caption text-secondary">If no reply</dt>
            <dd className="text-body text-primary">{r.ifNoReply === "wait" ? "Wait for them" : "Go ahead after 24 hours"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-caption text-secondary">Likes and comments</dt>
            <dd className="text-body text-primary">{r.approval.comments === "go" ? "Go ahead" : "Ask first"}</dd>
          </div>
        </dl>
      </Card>
      <Card title="In their field this week">
        <SignalList b={b} limit={3} />
      </Card>
    </>
  );
}

/* ---------- Plan ---------- */

export function PlanTab({ b, id }: { b: ClientBundle; id: string }) {
  const s = b.strategy;
  if (!s) {
    return (
      <Card title="Plan">
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-secondary">No strategy yet. It is drafted after the goals call.</p>
          <Link href={`/manager/clients/${id}/onboard`} className={primaryLink}>
            Open onboarding
          </Link>
        </div>
      </Card>
    );
  }
  return (
    <Card title="Strategy and plan" action={<Badge status={s.status === "approved" ? "success" : "info"}>{s.status === "approved" ? `Approved, version ${s.version}` : "Not approved yet"}</Badge>}>
      <div className="flex flex-col gap-6">
        <p className="text-body text-primary">{s.goal}</p>
        <div className="flex flex-col gap-2">
          <span className="text-caption text-secondary">Topics</span>
          <ol className="flex flex-col gap-2">
            {s.topics.map((t, i) => (
              <li key={t.name} className="text-body-sm text-primary">
                {i + 1}. <span className="font-medium">{t.name}</span>. <span className="text-secondary">{t.why}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-caption text-secondary">Weekly targets</span>
          {s.targets.map((t) => (
            <p key={t.period} className="text-body-sm text-primary">
              <span className="font-medium">{t.period}:</span> {t.posts} posts, {t.comments} comments, {t.connections} connection requests. {t.extra}
            </p>
          ))}
        </div>
        <p className="text-caption text-secondary">Built on framework {s.frameworkVersion}.</p>
        <Link href={`/manager/clients/${id}/onboard`} className={linkClass}>
          Open onboarding and strategy
        </Link>
      </div>
    </Card>
  );
}

/* ---------- Content summary ---------- */

export function ContentTab({ b, id }: { b: ClientBundle; id: string }) {
  const groups: [string, number][] = [
    ["Drafts", b.posts.filter((p) => p.status === "draft" || p.status === "manager-review").length],
    ["Changes asked", b.posts.filter((p) => p.status === "changes-requested").length],
    ["With the client", b.posts.filter((p) => p.status === "awaiting-client").length],
    ["To schedule", b.posts.filter((p) => p.status === "approved").length],
    ["Scheduled", b.posts.filter((p) => p.status === "scheduled").length],
    ["Held", b.posts.filter((p) => p.status === "on-hold").length],
    ["Live", b.posts.filter((p) => p.status === "published").length],
    ["Needs fixing", b.posts.filter((p) => p.status === "failed" || p.request?.kind === "fix").length],
  ];
  return (
    <Card title="Content">
      <div className="flex flex-col gap-6">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {groups.map(([label, n]) => (
            <li key={label} className="flex flex-col gap-1 rounded-md bg-neutral-25 p-3">
              <span className="font-display text-display-xl text-primary">{n}</span>
              <span className="text-caption text-secondary">{label}</span>
            </li>
          ))}
        </ul>
        <Link href={`/manager/clients/${id}/content`} className={primaryLink}>
          Open content
        </Link>
      </div>
    </Card>
  );
}

/* ---------- Engagement (M6) ---------- */

const fitTone = { strong: "success", good: "info", weak: "neutral" } as const;

function LeadRow({ l }: { l: Lead }) {
  const { run, pending } = useTask();
  return (
    <li className={`flex flex-col gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0 ${l.status === "dropped" ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <a href={l.url} target="_blank" rel="noreferrer" className="text-body font-medium text-primary hover:text-primary-700 hover:underline focus-visible:focus-ring">
            {l.name}
          </a>
          <span className="text-caption text-secondary">{l.detail}</span>
        </div>
        <Badge status={fitTone[l.fit]}>{l.fit[0].toUpperCase() + l.fit.slice(1)} fit</Badge>
      </div>
      <p className="text-body-sm text-secondary">{l.why}</p>
      {l.warning && (
        <p className="flex items-center gap-2 rounded-md bg-danger-bg px-3 py-2 text-body-sm text-primary">
          <WarningCircle className="size-4 shrink-0 text-danger" aria-hidden /> {l.warning}
        </p>
      )}
      {l.draft && <blockquote className="rounded-md bg-neutral-25 px-4 py-3 text-body-sm text-primary">{l.draft}</blockquote>}
      {l.status === "done" ? (
        <span className="text-caption text-success">Done</span>
      ) : l.status === "dropped" ? (
        <button type="button" onClick={() => run("undo", () => act.setLead(l.id, "suggested"), "Back on the list.")} className={`${linkClass} self-start`}>
          Bring back
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {!l.warning && (
            <Button
              variant="secondary"
              loading={pending("keep")}
              onClick={() => run("keep", () => act.setLead(l.id, l.status === "kept" ? "done" : "kept"), l.status === "kept" ? "Marked as done. It counts toward this week's target." : "Kept. The comment follows the client's review setting.")}
            >
              {l.status === "kept" ? "Mark as done" : "Keep"}
            </Button>
          )}
          <Button
            variant="ghost"
            loading={pending("drop")}
            onClick={() => run("drop", () => act.setLead(l.id, "dropped"), { text: "Dropped.", action: { label: "Undo", onClick: () => act.setLead(l.id, l.status) } })}
          >
            Drop
          </Button>
        </div>
      )}
    </li>
  );
}

export function EngagementTab({ b }: { b: ClientBundle }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string>();
  const [checked, setChecked] = useState<string | null>(null);
  const firstName = b.user?.firstName ?? "the client";
  return (
    <>
      <Card title="This week's brief">
        <p className="text-body text-primary">
          Look for investors and bank partners talking about cross-border payments and the new mobile money report. Join conversations where {firstName} can add data. Skip anything on the off-limits list.
        </p>
      </Card>
      <Card title="Add what you find">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!/^https?:\/\/(www\.)?linkedin\.com\//.test(url.trim())) return setUrlError("Paste a LinkedIn profile or post link, starting with https://www.linkedin.com/");
            setUrlError(undefined);
            if (await run("check", () => act.save())) {
              setChecked(url.trim());
              setUrl("");
            }
          }}
        >
          <div className="flex-1">
            <Input label="Profile or post link" placeholder="https://www.linkedin.com/..." value={url} onChange={(e) => { setUrl(e.target.value); setUrlError(undefined); }} error={urlError} />
          </div>
          <Button type="submit" variant="secondary" loading={pending("check")} className="sm:mb-auto sm:mt-7">
            {pending("check") ? "Checking" : "Check fit"}
          </Button>
        </form>
        {checked && (
          <div className="mt-4 flex flex-col gap-2 rounded-md border border-border p-4">
            <span className="flex items-center gap-2">
              <Badge status="success">Strong fit</Badge>
              <span className="truncate text-caption text-secondary">{checked}</span>
            </span>
            <p className="text-body-sm text-primary">A fintech investor in Lagos, posting about payments infrastructure twice a week. Matches topic 1 and the investor list. Nothing on the off-limits list.</p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                loading={pending("add")}
                onClick={async () => {
                  if (await run("add", () => act.addLead(b.client!.id, checked), "Kept. A comment is drafted in the client's voice.")) setChecked(null);
                }}
              >
                Keep
              </Button>
              <Button variant="ghost" onClick={() => setChecked(null)}>
                Drop
              </Button>
            </div>
          </div>
        )}
      </Card>
      <Card title="Comments and connections" action={<span className="text-caption text-secondary">Drafted in {firstName}&apos;s voice</span>}>
        {b.leads.length ? (
          <ul className="flex flex-col">
            {b.leads.map((l) => (
              <LeadRow key={l.id} l={l} />
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">Nothing yet this week.</p>
        )}
      </Card>
      <Card title="Quick tasks for the client">
        <div className="flex flex-col gap-4">
          {b.tasks.length ? (
            <ul className="flex flex-col gap-3">
              {b.tasks.map((t) => {
                const sent = t.people?.filter((p) => p.done).length ?? (t.done ? 1 : 0);
                const total = t.people?.length ?? 1;
                return (
                  <li key={t.id} className="flex flex-col gap-2">
                    <span className="flex justify-between text-body-sm">
                      <span className="text-primary">{t.title}</span>
                      <span className="text-secondary">
                        {sent} of {total} done
                      </span>
                    </span>
                    <ProgressBar value={sent} max={total} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">No quick tasks sent this week.</p>
          )}
          <Button
            variant="secondary"
            className="self-start"
            onClick={() =>
              confirm({
                title: `Send 3 connection requests to ${firstName}?`,
                body: `Prepared from this week's brief, with a note for each person. ${firstName} is told and sends them from LinkedIn in about 2 minutes.`,
                confirmLabel: "Prepare and send",
                action: () => act.prepareConnections(b.client!.id),
                success: `Sent to ${firstName} as a quick task.`,
              })
            }
          >
            <Plus className="size-4" aria-hidden /> Prepare connection requests
          </Button>
        </div>
      </Card>
      <Card title="Progress">
        <Targets b={b} />
      </Card>
    </>
  );
}

/* ---------- Listening (M7) ---------- */

function SignalList({ b, limit, removable }: { b: ClientBundle; limit?: number; removable?: boolean }) {
  const toast = useToast();
  const list = [...b.signals].sort((x, y) => y.at.localeCompare(x.at)).slice(0, limit);
  if (!list.length) return <p className="text-body-sm text-secondary">No signals yet. Add Google Alerts in Listening.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {list.map((s) => (
        <li key={s.id} className="flex items-start gap-3">
          <span className="flex flex-1 flex-col gap-1">
            <a href={s.url} target="_blank" rel="noreferrer" className="text-body font-medium text-primary hover:text-primary-700 hover:underline focus-visible:focus-ring">
              {s.title}
            </a>
            <span className="text-caption text-secondary">
              {s.source}, {agoIn(s.at)}. Topic: {s.topic}
            </span>
          </span>
          {removable && (
            <button
              type="button"
              aria-label={`Remove ${s.title}`}
              onClick={async () => {
                try {
                  await act.removeSignal(s.id);
                  toast("Signal removed. It will not shape new ideas.");
                } catch {
                  toast("That did not go through. Check your connection and try again.", "danger");
                }
              }}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-danger-bg hover:text-danger focus-visible:focus-ring"
            >
              <Trash className="size-4" aria-hidden />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ListeningTab({ b }: { b: ClientBundle }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [topic, setTopic] = useState("");
  const [feed, setFeed] = useState("");
  const [feedError, setFeedError] = useState<string>();
  const [found, setFound] = useState("");
  const topics = b.strategy?.topics.map((t) => t.name) ?? ["Their field", "Their company", "Their city"];
  return (
    <>
      {!b.alerts.some((a) => a.working) && (
        <Banner tone="warning" title="No working alerts">
          The platform has nothing from this client&apos;s field yet. Create Google Alerts for the suggested topics and paste each feed link below.
        </Banner>
      )}
      <Card title="Listening topics">
        <div className="flex flex-col gap-3">
          <ul className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <li key={t} className="rounded-full bg-primary-50 px-3 py-1 text-body-sm text-primary-700">
                {t}
              </li>
            ))}
            {b.client?.country && <li className="rounded-full bg-primary-50 px-3 py-1 text-body-sm text-primary-700">{b.client.industry} in {b.client.country}</li>}
          </ul>
          <p className="flex items-center gap-1 text-caption text-secondary">
            <Sparkle className="size-4" aria-hidden /> Suggested from the strategy, including location. Edit any time.
          </p>
        </div>
      </Card>
      <Card title="Google Alert feeds">
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col">
            {b.alerts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                <LinkSimple className="size-5 shrink-0 text-secondary" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body font-medium text-primary">{a.topic}</span>
                  <span className="text-caption text-secondary">Last item {agoIn(a.lastItemAt)}</span>
                </span>
                <Badge status={a.working ? "success" : "danger"}>{a.working ? "Working" : "Not working"}</Badge>
                <button
                  type="button"
                  aria-label={`Remove ${a.topic}`}
                  onClick={() =>
                    confirm({
                      title: `Remove the "${a.topic}" feed?`,
                      body: "The platform stops reading it. Signals already found are kept.",
                      warning: "Delete the alert in Google Alerts too, or it keeps emailing you.",
                      confirmLabel: "Remove feed",
                      tone: "danger",
                      action: () => act.removeAlert(a.id),
                      success: "Feed removed.",
                    })
                  }
                  className="flex size-9 items-center justify-center rounded-full text-secondary hover:bg-danger-bg hover:text-danger focus-visible:focus-ring">
                  <Trash className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="flex flex-col gap-3 rounded-md bg-neutral-25 p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!topic.trim()) return setFeedError("Add the alert topic.");
              if (!/^https:\/\/www\.google\.com\/alerts\/feeds\//.test(feed.trim())) return setFeedError("Paste the feed link from Google Alerts. It starts with https://www.google.com/alerts/feeds/");
              setFeedError(undefined);
              if (await run("feed", () => act.addAlert(b.client!.id, topic.trim(), feed.trim()), "Feed added. We checked it and it is working.")) {
                setTopic("");
                setFeed("");
              }
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Alert topic" placeholder="Lagos fintech" value={topic} onChange={(e) => setTopic(e.target.value)} />
              <Input label="Feed link" placeholder="https://www.google.com/alerts/feeds/..." value={feed} onChange={(e) => { setFeed(e.target.value); setFeedError(undefined); }} error={feedError} />
            </div>
            <Button type="submit" variant="secondary" className="self-start" loading={pending("feed")}>
              {pending("feed") ? "Checking the feed" : "Add feed"}
            </Button>
          </form>
        </div>
      </Card>
      <Card title="Add what I found">
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!found.trim()) return;
            if (await run("found", () => act.addFinding(b.client!.id, found.trim()), "Added. It will shape the next ideas.")) setFound("");
          }}
        >
          <Textarea label="A link, or a short note" rows={2} placeholder="3 founders in Lagos are debating instant settlement this week." value={found} onChange={(e) => setFound(e.target.value)} />
          <Button type="submit" variant="secondary" className="self-start" loading={pending("found")}>
            Add
          </Button>
        </form>
      </Card>
      <Card title="Latest signals">
        <SignalList b={b} removable />
      </Card>
    </>
  );
}

/* ---------- Brand ---------- */

export function BrandTab({ b }: { b: ClientBundle }) {
  return (
    <>
      <Card title="Moments">
        {b.moments.length ? (
          <ul className="flex flex-col gap-4">
            {b.moments.map((m) => (
              <li key={m.id} className={`flex flex-col gap-3 rounded-md border p-4 ${m.status === "new" ? "border-primary-600 bg-primary-50" : "border-border"}`}>
                <span className="flex items-center justify-between gap-3">
                  <span className="text-caption text-secondary">Added {agoIn(m.at)}</span>
                  {m.status === "new" && <Badge status="info">New</Badge>}
                </span>
                <p className="text-body-sm text-primary">{m.note}</p>
                {m.photos.length > 0 && (
                  <div className="flex gap-2">
                    {m.photos.map((p) => (
                      <span key={p} className="relative size-16 overflow-hidden rounded-sm">
                        <Image src={p} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">No Moments yet.</p>
        )}
      </Card>
      <Card title="Voice and off limits">
        <div className="flex flex-col gap-4">
          <p className="text-body text-primary">{b.brand?.voice || "Not written yet."}</p>
          <p className="text-body-sm text-secondary">
            Uses: {b.brand?.wordsUse.join(", ") || "none"}. Avoids: {b.brand?.wordsAvoid.join(", ") || "none"}.
          </p>
          <OffLimitsBox b={b} />
        </div>
      </Card>
      <Card title="Files">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {b.files.map((f) => (
            <li key={f.id} className="flex flex-col gap-2">
              <span className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-neutral-50">
                {f.src ? <Image src={f.src} alt={f.name} fill sizes="160px" className="object-cover" /> : <span className="text-caption text-secondary">{f.section}</span>}
              </span>
              <span className="truncate text-caption text-secondary">{f.name}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

/* ---------- Calls and notes ---------- */

const callName = { goals: "Goals call", strategy: "Strategy call", "check-in": "Check-in" };

export function CallsTab({ b }: { b: ClientBundle }) {
  return (
    <Card title="Calls and notes">
      <ul className="flex flex-col">
        {b.calls.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-body font-medium text-primary">{callName[c.kind]}</span>
              <Badge status={c.status === "done" ? "success" : "info"}>{c.status === "done" ? "Done" : "Booked"}</Badge>
            </span>
            <span className="text-body-sm text-secondary">
              {dayTime(c.at)}. {c.recording ? "Recorded, transcript in the notetaker." : "Not recorded. Written notes."}
            </span>
            {c.summary && <p className="rounded-md bg-neutral-25 p-3 text-body-sm text-primary">{c.summary}</p>}
            {c.prep && (
              <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-primary">
                {c.prep.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {!b.calls.length && <li className="text-body-sm text-secondary">No calls booked yet.</li>}
      </ul>
    </Card>
  );
}

/* ---------- Updates (M8) ---------- */

export function UpdatesTab({ b }: { b: ClientBundle }) {
  const confirm = useConfirm();
  const draft = b.updates.find((u) => u.status === "draft");
  const [note, setNote] = useState(draft?.note ?? "");
  const sent = b.updates.filter((u) => u.status === "sent").sort((x, y) => (y.sentAt ?? "").localeCompare(x.sentAt ?? ""));
  return (
    <>
      {draft && (
        <Card title={`${draft.title}, ready to send`} action={<Badge status="info">Draft</Badge>}>
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-1 text-caption text-secondary">
              <Sparkle className="size-4" aria-hidden /> Drafted from this week&apos;s work. Check it, add your note, send.
            </p>
            <p className="font-display text-display-lg text-primary">{draft.headline}</p>
            <ul className="flex flex-col gap-1 text-body-sm text-primary">
              {draft.did.map((d) => (
                <li key={d.label}>
                  {d.label}: {d.done} of {d.target}
                </li>
              ))}
            </ul>
            <p className="text-body-sm text-primary">
              <span className="font-medium">Progress: </span>
              {draft.progress}
            </p>
            {draft.held.length > 0 && (
              <p className="text-body-sm text-primary">
                <span className="font-medium">Held back: </span>
                {draft.held.join(". ")}
              </p>
            )}
            <p className="text-body-sm text-primary">
              <span className="font-medium">In their field: </span>
              {draft.field}
            </p>
            <p className="text-body-sm text-primary">
              <span className="font-medium">Next week: </span>
              {draft.next}
            </p>
            <Textarea label="Your personal note" placeholder={`A line from you to ${b.user?.firstName ?? "the client"}.`} value={note} onChange={(e) => setNote(e.target.value)} />
            <Button
              className="self-start"
              onClick={() =>
                confirm({
                  title: `Send the update to ${b.user?.firstName ?? "the client"}?`,
                  body: "They get it in the app and by email. You cannot edit it after it is sent.",
                  confirmLabel: "Send update",
                  action: () => act.sendUpdate(draft.id, note),
                  success: `Update sent to ${b.user?.firstName ?? "the client"}.`,
                })
              }
            >
              Send update
            </Button>
          </div>
        </Card>
      )}
      <Card title="Sent">
        {sent.length ? (
          <ul className="flex flex-col">
            {sent.map((u) => (
              <li key={u.id} className="flex flex-col gap-1 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="flex justify-between gap-3">
                  <span className="text-body font-medium text-primary">{u.title}</span>
                  <span className="text-caption text-secondary">{ago(u.sentAt!)}</span>
                </span>
                <span className="text-body-sm text-secondary">{u.headline}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">No updates sent yet.</p>
        )}
      </Card>
    </>
  );
}

/* ---------- Activity ---------- */

export function ActivityTab({ b }: { b: ClientBundle }) {
  const team = fullName(b.managerUser) || "Account team";
  const who = { you: fullName(b.user), team, system: "Bluecut" };
  return (
    <Card title="Activity" action={<span className="text-caption text-secondary">{plural(b.activity.length, "action")}</span>}>
      <ul className="flex flex-col">
        {b.activity.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-4 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
            <span className="flex flex-col gap-1">
              <span className="text-body-sm text-primary">{a.text}</span>
              <span className="text-caption text-secondary">{who[a.who]}</span>
            </span>
            <span className="shrink-0 text-caption text-secondary">{ago(a.at)}</span>
          </li>
        ))}
        {!b.activity.length && <li className="text-body-sm text-secondary">Nothing yet.</li>}
      </ul>
    </Card>
  );
}

