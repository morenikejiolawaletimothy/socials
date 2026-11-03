"use client";

import { CalendarBlank, Clock, LinkSimple, Plus, Sparkle, Trash } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge, Banner, Button, buttonClass, Card, Dialog, IconButton, Input, Meta, Pill, ProgressBar, Row, Rows, RowText, Textarea, TextButton, TextLink, Tile, TileFooter, useConfirm, useTask, useToast } from "@/components/ui";
import { ago, agoIn, dayIn, dayTime, fullName, plural } from "@/lib/format";
import { MediaThumb } from "@/components/content/MediaThumb";
import { duration } from "@/lib/linkedin";
import { act, type ClientBundle, type Lead, type Update } from "@/lib/mock";


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
    <Banner tone="danger" title="Off limits">
      <ul className="flex flex-col gap-1">
        {b.brand.offLimits.map((o) => (
          <li key={o.id}>
            <span className="capitalize">{o.kind}</span>: {o.text}
          </li>
        ))}
      </ul>
    </Banner>
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
      <Card
        title="This week"
        action={
          b.week && (
            <Pill>
              {b.week.posts.done + b.week.comments.done + b.week.connections.done} of {b.week.posts.target + b.week.comments.target + b.week.connections.target} done
            </Pill>
          )
        }
      >
        <Targets b={b} />
      </Card>
      <Card title="What they let us do">
        <Rows>
          {(
            [
              ["Post for them", p.post],
              ["Like and comment", p.engage],
              ["Company Page", p.companyPage],
              ["Draft connection requests", p.connectionDrafts],
              ["Draft profile updates", p.profileDrafts],
            ] as const
          ).map(([label, on]) => (
            <Row key={label}>
              <RowText title={label} />
              <Badge status={on ? "success" : "neutral"}>{on ? "Allowed" : "Not allowed"}</Badge>
            </Row>
          ))}
        </Rows>
      </Card>
      <Card title="How they review">
        <Rows>
          <Row>
            <RowText title="How often" />
            <span className="text-body-sm text-primary">{{ weekly: "Once a week", "twice-weekly": "Twice a week", "every-post": "Every post" }[r.frequency]}</span>
          </Row>
          <Row>
            <RowText title="How they are told" />
            <span className="text-body-sm text-primary">
              {[r.channels.email && "Email", r.channels.whatsapp && b.user?.whatsapp?.confirmed && "WhatsApp", r.channels.app && "In the app"].filter(Boolean).join(", ")}
            </span>
          </Row>
          <Row>
            <RowText title="If no reply" />
            <span className="text-body-sm text-primary">{r.ifNoReply === "wait" ? "Wait for them" : "Go ahead after 24 hours"}</span>
          </Row>
          <Row>
            <RowText title="Likes and comments" />
            <span className="text-body-sm text-primary">{r.approval.comments === "go" ? "Go ahead" : "Ask first"}</span>
          </Row>
        </Rows>
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
          <Banner tone="info">No strategy yet. It is drafted after the goals call.</Banner>
          <Link href={`/manager/clients/${id}/onboard`} className={`${buttonClass("primary")} self-start`}>
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
        <section className="flex flex-col gap-2">
          <h3 className="text-body font-medium text-primary">Topics</h3>
          <Rows>
            {s.topics.map((t, i) => (
              <Row key={t.name}>
                <RowText title={`${i + 1}. ${t.name}`} sub={t.why} />
              </Row>
            ))}
          </Rows>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-body font-medium text-primary">Weekly targets</h3>
          <Rows>
            {s.targets.map((t) => (
              <Row key={t.period}>
                <RowText title={t.period} sub={t.extra} />
                <span className="text-body-sm text-primary">
                  {t.posts} posts{t.videos ? ` (${t.videos} video)` : ""} · {t.comments} comments · {t.connections} connections
                </span>
              </Row>
            ))}
          </Rows>
        </section>
        <Banner tone="neutral">Built on framework {s.frameworkVersion}.</Banner>
        <TextLink href={`/manager/clients/${id}/onboard`} className="self-start text-body-sm">
          Open onboarding and strategy
        </TextLink>
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
    <Card title="Content" action={<Pill>{plural(b.posts.length, "post")}</Pill>}>
      <div className="flex flex-col gap-6">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {groups.map(([label, n]) => (
            <li key={label}>
              <Tile className="gap-1">
                <span className="font-display text-display-xl text-primary">{n}</span>
                <span className="text-body-sm text-secondary">{label}</span>
              </Tile>
            </li>
          ))}
        </ul>
        <Link href={`/manager/clients/${id}/content`} className={`${buttonClass("primary")} self-start`}>
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
    <li>
      <Tile done={l.status === "done" || l.status === "dropped"}>
        <span className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 flex-col gap-1">
            <a href={l.url} target="_blank" rel="noreferrer" className="rounded-sm text-body font-medium text-primary hover:text-primary-700 hover:underline focus-visible:focus-ring">
              {l.name}
            </a>
            <span className="text-body-sm text-secondary">{l.detail}</span>
          </span>
          <Badge status={fitTone[l.fit]}>{l.fit[0].toUpperCase() + l.fit.slice(1)} fit</Badge>
        </span>
        <Banner tone="info">Why: {l.why}</Banner>
        {l.warning && <Banner tone="danger">{l.warning}</Banner>}
        {l.draft && <blockquote className="rounded-md bg-neutral-25 px-4 py-3 text-body-sm text-primary">{l.draft}</blockquote>}
        <TileFooter>
          <Badge status={l.status === "done" ? "success" : l.status === "dropped" ? "neutral" : l.status === "kept" ? "info" : "neutral"}>
            {{ suggested: "Suggested", kept: "Kept", done: "Done", dropped: "Dropped" }[l.status]}
          </Badge>
          {l.status === "done" ? null : l.status === "dropped" ? (
            <TextButton onClick={() => run("undo", () => act.setLead(l.id, "suggested"), "Back on the list.")}>Bring back</TextButton>
          ) : (
            <span className="flex flex-wrap gap-2">
              <Button
                variant="remove"
                size="sm"
                loading={pending("drop")}
                onClick={() => run("drop", () => act.setLead(l.id, "dropped"), { text: "Dropped.", action: { label: "Undo", onClick: () => act.setLead(l.id, l.status) } })}
              >
                Drop
              </Button>
              {!l.warning && (
                <Button
                  size="sm"
                  variant={l.status === "kept" ? "primary" : "secondary"}
                  loading={pending("keep")}
                  onClick={() => run("keep", () => act.setLead(l.id, l.status === "kept" ? "done" : "kept"), l.status === "kept" ? "Marked as done. It counts toward this week's target." : "Kept. The comment follows the client's review setting.")}
                >
                  {l.status === "kept" ? "Mark as done" : "Keep"}
                </Button>
              )}
            </span>
          )}
        </TileFooter>
      </Tile>
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
      <Card title="This week's brief" action={<Pill>Suggested</Pill>}>
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
          <Tile className="mt-4">
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0 truncate text-body-sm text-secondary">{checked}</span>
              <Badge status="success">Strong fit</Badge>
            </span>
            <Banner tone="info">Why: A fintech investor in Lagos, posting about payments infrastructure twice a week. Matches topic 1 and the investor list. Nothing on the off-limits list.</Banner>
            <TileFooter>
              <span />
              <span className="flex gap-2">
                <Button variant="remove" size="sm" onClick={() => setChecked(null)}>
                  Drop
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={pending("add")}
                  onClick={async () => {
                    if (await run("add", () => act.addLead(b.client!.id, checked), "Kept. A comment is drafted in the client's voice.")) setChecked(null);
                  }}
                >
                  Keep
                </Button>
              </span>
            </TileFooter>
          </Tile>
        )}
      </Card>
      <Card title="Comments and connections" action={b.leads.length > 0 && <Pill label={`${plural(b.leads.length, "lead")}, drafted in ${firstName}'s voice`}>{plural(b.leads.length, "lead")}</Pill>}>
        {b.leads.length ? (
          <ul className="flex flex-col gap-3">
            {b.leads.map((l) => (
              <LeadRow key={l.id} l={l} />
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-secondary">Nothing yet this week.</p>
        )}
      </Card>
      <Card title="Quick tasks for the client" action={b.tasks.length > 0 && <Pill>{b.tasks.filter((t) => t.done).length} of {b.tasks.length} done</Pill>}>
        <div className="flex flex-col gap-4">
          {b.tasks.length ? (
            <ul className="flex flex-col gap-3">
              {b.tasks.map((t) => {
                const sent = t.people?.filter((p) => p.done).length ?? (t.done ? 1 : 0);
                const total = t.people?.length ?? 1;
                const helper = t.handoff && !t.handoff.endedAt ? b.assistants.find((a) => a.id === t.handoff?.assistantId) : undefined;
                return (
                  <li key={t.id}>
                    <Tile done={t.done}>
                      <span className="flex flex-col gap-1">
                        <span className="text-body font-medium text-primary">{t.title}</span>
                        <span className="text-body-sm text-secondary">
                          {sent} of {total} done · Sent {agoIn(t.sentAt)}
                        </span>
                        <span className="max-w-xs pt-1">
                          <ProgressBar value={sent} max={total} />
                        </span>
                      </span>
                      <TileFooter>
                        <Meta icon={CalendarBlank}>Due {dayIn(t.dueAt)}</Meta>
                        <Badge status={t.done ? "success" : "info"}>{t.done ? (t.doneBy ? `Done by ${t.doneBy.split(" ")[0]}` : "Done") : helper ? `With ${helper.name.split(" ")[0]} (${helper.role})` : "With the client"}</Badge>
                      </TileFooter>
                    </Tile>
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
    <Rows>
      {list.map((s) => (
        <Row key={s.id} className="items-start">
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <a href={s.url} target="_blank" rel="noreferrer" className="rounded-sm text-body-sm font-medium text-primary hover:text-primary-700 hover:underline focus-visible:focus-ring">
              {s.title}
            </a>
            <span className="text-caption text-secondary">
              {s.source}, {agoIn(s.at)} · {s.topic}
            </span>
          </span>
          {removable && (
            <IconButton
              icon={Trash}
              tone="danger"
              label={`Remove ${s.title}`}
              onClick={async () => {
                try {
                  await act.removeSignal(s.id);
                  toast("Signal removed. It will not shape new ideas.");
                } catch {
                  toast("That did not go through. Check your connection and try again.", "danger");
                }
              }}
            />
          )}
        </Row>
      ))}
    </Rows>
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
      <Card title="Listening topics" action={<Pill>{plural(topics.length + (b.client?.country ? 1 : 0), "topic")}</Pill>}>
        <div className="flex flex-col gap-3">
          <ul className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <li key={t}>
                <Pill>{t}</Pill>
              </li>
            ))}
            {b.client?.country && (
              <li>
                <Pill>
                  {b.client.industry} in {b.client.country}
                </Pill>
              </li>
            )}
          </ul>
          <p className="flex items-center gap-1 text-caption text-secondary">
            <Sparkle className="size-4 text-primary-600" aria-hidden /> Suggested from the strategy, including location. Edit any time.
          </p>
        </div>
      </Card>
      <Card title="Google Alert feeds" action={<Pill>{b.alerts.filter((a) => a.working).length} of {b.alerts.length} working</Pill>}>
        <div className="flex flex-col gap-4">
          {b.alerts.length > 0 && (
          <Rows>
            {b.alerts.map((a) => (
              <Row key={a.id}>
                <LinkSimple className="size-5 shrink-0 text-primary-600" aria-hidden />
                <RowText title={a.topic} sub={`Last item ${agoIn(a.lastItemAt)}`} />
                <Badge status={a.working ? "success" : "danger"}>{a.working ? "Working" : "Not working"}</Badge>
                <IconButton
                  icon={Trash}
                  tone="danger"
                  label={`Remove ${a.topic}`}
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
                />
              </Row>
            ))}
          </Rows>
          )}
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
      <Card title="Latest signals" action={b.signals.length > 0 && <Pill>{plural(b.signals.length, "signal")}</Pill>}>
        <SignalList b={b} removable />
      </Card>
    </>
  );
}

/* ---------- Brand ---------- */

export function BrandTab({ b }: { b: ClientBundle }) {
  return (
    <>
      <Card title="Moments" action={b.moments.length > 0 && <Pill>{plural(b.moments.length, "Moment")}</Pill>}>
        {b.moments.length ? (
          <ul className="flex flex-col gap-3">
            {b.moments.map((m) => (
              <li key={m.id}>
                <Tile>
                <p className="text-body-sm text-primary">{m.note}</p>
                {(m.photos.length > 0 || (m.videos?.length ?? 0) > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {m.photos.map((p) => (
                      <span key={p} className="relative size-16 overflow-hidden rounded-sm">
                        <Image src={p} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                    ))}
                    {m.videos?.map((v) => (
                      <span key={v.src} className="relative size-16 overflow-hidden rounded-sm">
                        <Image src={v.poster} alt="Video" fill sizes="64px" className="object-cover" />
                        <span className="absolute bottom-1 left-1 rounded-sm bg-neutral-900/70 px-1 text-caption text-inverse">{duration(v.seconds)}</span>
                      </span>
                    ))}
                  </div>
                )}
                <TileFooter>
                  <Meta icon={CalendarBlank}>Added {agoIn(m.at)}</Meta>
                  <Badge status={m.status === "new" ? "info" : m.status === "post-drafted" ? "success" : "neutral"}>{{ new: "New", seen: "Seen", "post-drafted": "Post drafted" }[m.status]}</Badge>
                </TileFooter>
                </Tile>
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
              {f.video || f.carousel ? (
                <MediaThumb file={f} />
              ) : (
                <span className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-neutral-50">
                  {f.src ? <Image src={f.src} alt={f.name} fill sizes="160px" className="object-cover" /> : <span className="text-caption text-secondary">{f.section}</span>}
                </span>
              )}
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
    <Card title="Calls and notes" action={b.calls.length > 0 && <Pill>{plural(b.calls.length, "call")}</Pill>}>
      {b.calls.length ? (
        <ul className="flex flex-col gap-3">
          {b.calls.map((c) => (
            <li key={c.id}>
              <Tile done={c.status === "cancelled"}>
                <span className="flex flex-col gap-1">
                  <span className="text-body font-medium text-primary">{callName[c.kind]}</span>
                  <span className="text-body-sm text-secondary">{c.recording ? "Recorded, transcript in the notetaker." : "Not recorded. Written notes."}</span>
                </span>
                {c.summary && <Banner tone="neutral">{c.summary}</Banner>}
                {c.prep && (
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-primary">
                    {c.prep.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
                <TileFooter>
                  <Meta icon={Clock}>{dayTime(c.at)} · {c.minutes} min</Meta>
                  <Badge status={c.status === "done" ? "success" : c.status === "cancelled" ? "neutral" : "info"}>{c.status === "done" ? "Done" : c.status === "cancelled" ? "Cancelled" : "Booked"}</Badge>
                </TileFooter>
              </Tile>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-secondary">No calls booked yet.</p>
      )}
    </Card>
  );
}

/* ---------- Updates (M8) ---------- */

export function UpdatesTab({ b }: { b: ClientBundle }) {
  const confirm = useConfirm();
  const draft = b.updates.find((u) => u.status === "draft");
  const [note, setNote] = useState(draft?.note ?? "");
  const sent = b.updates.filter((u) => u.status === "sent").sort((x, y) => (y.sentAt ?? "").localeCompare(x.sentAt ?? ""));
  const { run, pending } = useTask();
  const [correcting, setCorrecting] = useState<Update | null>(null);
  const [fix, setFix] = useState({ headline: "", note: "" });
  const first = b.user?.firstName ?? "the client";
  return (
    <>
      {correcting && (
        <Dialog open onClose={() => setCorrecting(null)} title={`Correct ${correcting.title.toLowerCase()}`}>
          <p className="text-body-sm text-secondary">{first} is told that you corrected it. The numbers come from the week&apos;s work and cannot be changed here.</p>
          <Input label="Headline" defaultValue={correcting.headline} onChange={(e) => setFix({ ...fix, headline: e.target.value })} />
          <Textarea label="Your personal note" rows={3} defaultValue={correcting.note} onChange={(e) => setFix({ ...fix, note: e.target.value })} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setCorrecting(null)}>
              Cancel
            </Button>
            <Button
              loading={pending("correct")}
              onClick={async () => {
                const headline = (fix.headline || correcting.headline).trim();
                const note = fix.note || correcting.note;
                if (await run("correct", () => act.correctUpdate(correcting.id, headline, note), `Corrected. ${first} is told.`)) {
                  setCorrecting(null);
                  setFix({ headline: "", note: "" });
                }
              }}
            >
              Save correction
            </Button>
          </div>
        </Dialog>
      )}
      {draft && (
        <Card title={`${draft.title}, ready to send`} action={<Badge status="info">Draft</Badge>}>
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-1 text-caption text-secondary">
              <Sparkle className="size-4" aria-hidden /> Drafted from this week&apos;s work. Check it, add your note, send.
            </p>
            <p className="font-display text-display-lg text-primary">{draft.headline}</p>
            <Rows>
              {draft.did.map((d) => (
                <Row key={d.label}>
                  <RowText title={d.label} />
                  <span className="text-body-sm text-primary">
                    {d.done} of {d.target}
                  </span>
                </Row>
              ))}
            </Rows>
            <Rows>
              <Row>
                <RowText title="Progress" sub={draft.progress} />
              </Row>
              {draft.held.length > 0 && (
                <Row>
                  <RowText title="Held back" sub={draft.held.join(". ")} />
                </Row>
              )}
              <Row>
                <RowText title="In their field" sub={draft.field} />
              </Row>
              <Row>
                <RowText title="Next week" sub={draft.next} />
              </Row>
            </Rows>
            <Textarea label="Your personal note" placeholder={`A line from you to ${b.user?.firstName ?? "the client"}.`} value={note} onChange={(e) => setNote(e.target.value)} />
            <Button
              className="self-start"
              onClick={() =>
                confirm({
                  title: `Send the update to ${b.user?.firstName ?? "the client"}?`,
                  body: "They get it in the app and by email. You can still correct it after it is sent, and they are told.",
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
      <Card title="Sent" action={sent.length > 0 && <Pill>{plural(sent.length, "update")}</Pill>}>
        {sent.length ? (
          <ul className="flex flex-col gap-3">
            {sent.map((u) => (
              <li key={u.id}>
                <Tile>
                  <span className="flex flex-col gap-1">
                    <span className="text-body font-medium text-primary">{u.title}</span>
                    <span className="text-body-sm text-secondary">{u.headline}</span>
                  </span>
                  <TileFooter>
                    <Meta icon={CalendarBlank}>{u.correctedAt ? `Corrected ${agoIn(u.correctedAt)}` : `Sent ${agoIn(u.sentAt!)}`}</Meta>
                    <span className="flex items-center gap-4">
                      <TextLink href={`/progress/${u.id}`} className="text-body-sm">
                        View
                      </TextLink>
                      <Button variant="secondary" size="sm" onClick={() => setCorrecting(u)}>
                        Correct
                      </Button>
                    </span>
                  </TileFooter>
                </Tile>
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
    <Card title="Activity" padding="none" action={<Pill>{plural(b.activity.length, "action")}</Pill>}>
      {b.activity.length ? (
        <Rows flush>
          {b.activity.map((a) => (
            <Row key={a.id} className="items-start justify-between">
              <RowText title={a.text} sub={who[a.who]} />
              <span className="shrink-0 text-caption text-secondary">{ago(a.at)}</span>
            </Row>
          ))}
        </Rows>
      ) : (
        <p className="px-6 py-4 text-body-sm text-secondary">Nothing yet.</p>
      )}
    </Card>
  );
}

