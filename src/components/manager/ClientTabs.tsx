"use client";

import { BookmarkSimple, Buildings, CalendarBlank, ChatCircle, CheckCircle, Clock, EnvelopeSimple, LinkSimple, MapPin, Newspaper, Repeat, Timer, Trash, UserCirclePlus, UserPlus, XCircle } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Avatar, Badge, Banner, Button, buttonClass, Card, Dialog, EmptyState, IconButton, InfoTip, Input, Meta, Pill, ProgressBar, Row, Rows, RowText, Select, Tabs, Textarea, TextButton, textActionClass, TextLink, Tile, TileFooter, useConfirm, useTask, useToast } from "@/components/ui";
import { ago, agoIn, dayTime, dayTimeIn, fullName, plural } from "@/lib/format";
import { MediaThumb } from "@/components/content/MediaThumb";
import { duration } from "@/lib/linkedin";
import { act, type ClientBundle, type Lead, type LinkedInReaction, type Update } from "@/lib/mock";
import { ReactionLabel } from "@/components/client/EngageItemTile";
import { progressWord, reactions, taskProgress } from "@/lib/engage";
import { pageScore, profileScore, type ScoreRow } from "@/lib/scorecard";


function ScoreLines({ rows }: { rows: ScoreRow[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((r) => (
        <li key={r.key} className="flex flex-col gap-2">
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

function Targets({ b }: { b: ClientBundle }) {
  if (!b.week) return <p className="text-body-sm text-secondary">Targets start once the strategy is approved.</p>;
  const page = pageScore(b.week);
  return (
    <div className="flex flex-col gap-4">
      {page.length > 0 && <span className="text-caption font-medium text-secondary">Profile</span>}
      <ScoreLines rows={profileScore(b.week)} />
      {page.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <span className="text-caption font-medium text-secondary">Company Page</span>
          <ScoreLines rows={page} />
        </div>
      )}
    </div>
  );
}

/** What the client has said never to touch, as a bordered list (as on the client's Your brand and contract pages). Title it where it is used. */
export function OffLimitsBox({ b }: { b: ClientBundle }) {
  if (!b.brand?.offLimits.length) return <p className="text-body-sm text-secondary">Nothing off limits yet.</p>;
  return (
    <Rows>
      {b.brand.offLimits.map((o) => (
        <Row key={o.id}>
          <span className="min-w-0 flex-1 text-body-sm text-primary">{o.text}</span>
          <Badge status="danger">{o.kind[0].toUpperCase() + o.kind.slice(1)}</Badge>
        </Row>
      ))}
    </Rows>
  );
}

/* ---------- Overview ---------- */

/** C20: the manager's view of a full-service client. Read-only contract, access log, log a session, pause warning. */
function FullServiceCard({ b }: { b: ClientBundle }) {
  const fs = b.client?.fullService;
  const { run, pending } = useTask();
  const [action, setAction] = useState("");
  const [minutes, setMinutes] = useState("15");
  const [note, setNote] = useState("");
  if (!fs) return null;
  const first = b.user?.firstName ?? "the client";
  const access = fs.access;
  const session = access?.session;
  const canSignIn = access?.credentials === "set" && !fs.paused;
  return (
    <Card
      title="Account access"
      action={<Badge status={fs.paused ? "warning" : "success"}>{fs.paused ? "Paused by client" : "Active"}</Badge>}
      info={fs.paused ? undefined : "You manage this account directly. Follow their permission contract exactly. You cannot change their settings. If you need them to do something, message them, do not create a task."}
    >
      {/* As on the client's Full-service page: sections top to bottom, each under a line, with notes in tooltips. */}
      <div className="flex flex-col gap-6">
        {fs.paused && (
          <Banner tone="danger" title="Do not work on this account">The client has paused your access. Wait until they resume before doing anything on their LinkedIn or Page.</Banner>
        )}

        {canSignIn && (
          <section className="flex flex-col gap-3" aria-labelledby="fs-signin">
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <h3 id="fs-signin" className="text-body font-semibold text-primary">
                  Delegated sign-in
                </h3>
                <InfoTip label="About delegated sign-in">You must notify {first} before you sign in. They approve on their phone, then you can work. Every session is recorded for them.</InfoTip>
              </span>
              {session?.state === "requested" && <Badge status="warning">Waiting for approval</Badge>}
              {session?.state === "active" && <Badge status="success">Session active</Badge>}
            </span>
            {session?.state === "requested" ? (
              <p className="text-body-sm text-secondary">Waiting for {first} to approve on their phone. You can sign in once they approve.</p>
            ) : session?.state === "active" ? (
              <form
                className="flex flex-col gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (await run("end", () => act.endSession(b.client!.id, action, Number(minutes) || 0), "Session ended and recorded. The client can see it.")) setAction("");
                }}
              >
                <p className="text-body-sm text-secondary">You are signed in. When you finish, write what you did and end the session.</p>
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Input label="What you did" value={action} onChange={(e) => setAction(e.target.value)} placeholder="Posted the weekly update and replied to comments" />
                  </div>
                  <MinutesSelect value={minutes} onChange={setMinutes} />
                </div>
                <Button type="submit" variant="secondary" className="self-start" loading={pending("end")}>
                  End session
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <Input label="Tell them why (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Weekly posting and engagement" />
                <Button className="self-start" loading={pending("req")} onClick={() => run("req", () => act.requestSession(b.client!.id, note.trim()), `${first} has been asked to approve. You can sign in once they do.`)}>
                  Notify and request sign-in
                </Button>
              </div>
            )}
          </section>
        )}

        {b.client?.companyPage && (
          <section className={`flex flex-col gap-3 ${canSignIn ? "border-t border-border pt-6" : ""}`} aria-labelledby="fs-page">
            <h3 id="fs-page" className="text-body font-semibold text-primary">
              Company Page
            </h3>
            <Rows>
              <Row>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <Buildings className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-body-sm text-secondary">You manage their company Page through their delegated access.</span>
                <Badge status="success">On</Badge>
              </Row>
            </Rows>
          </section>
        )}

        {!fs.paused && (
          <form
            className={`flex flex-col gap-4 ${canSignIn || b.client?.companyPage ? "border-t border-border pt-6" : ""}`}
            aria-labelledby="fs-log"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!action.trim()) return;
              if (await run("log", () => act.logManagementSession(b.client!.id, action.trim(), Number(minutes) || 0), "Session logged. The client can see it.")) setAction("");
            }}
          >
            <span className="flex items-center gap-2">
              <h3 id="fs-log" className="text-body font-semibold text-primary">
                Log a session
              </h3>
              <InfoTip label="About logging a session">Record what you did on their account. It goes in their account log, so they can see it.</InfoTip>
            </span>
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Input label="What you did" value={action} onChange={(e) => setAction(e.target.value)} placeholder="Posted the weekly Page update and replied to comments" />
              </div>
              <MinutesSelect value={minutes} onChange={setMinutes} />
            </div>
            <Button type="submit" className="self-start" loading={pending("log")}>
              Log session
            </Button>
          </form>
        )}

        {b.accessLog.length > 0 && (
          <section className="flex flex-col gap-3 border-t border-border pt-6" aria-labelledby="fs-recent">
            <span className="flex items-center justify-between gap-3">
              <h3 id="fs-recent" className="text-body font-semibold text-primary">
                Recent sessions
              </h3>
              <Pill>{plural(b.accessLog.length, "session")}</Pill>
            </span>
            {/* As in the client's "What your team has done": clock, what was done, then who, when and how long. */}
            <Rows>
              {b.accessLog.slice(0, 6).map((a) => (
                <Row key={a.id}>
                  <span className="flex min-w-0 flex-1 items-start gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-body-sm text-secondary">{a.action}</span>
                      <span className="text-caption text-secondary">{`${a.who} · ${agoIn(a.at)}${a.minutes ? ` · ${a.minutes} min` : ""}`}</span>
                    </span>
                  </span>
                </Row>
              ))}
            </Rows>
          </section>
        )}
      </div>
    </Card>
  );
}

function MinutesSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select label="Minutes" value={value} onChange={(e) => onChange(e.target.value)}>
      {["5", "10", "15", "20", "30", "45", "60"].map((m) => (
        <option key={m} value={m}>
          {m} min
        </option>
      ))}
    </Select>
  );
}

export function OverviewTab({ b }: { b: ClientBundle }) {
  const p = b.client!.permissions;
  const r = b.client!.review;
  const fullService = b.client?.service === "full-service";
  return (
    <>
      {fullService && <FullServiceCard b={b} />}
      <Card title="Goal">
        {/* The goal, then what is off limits under a line. */}
        <div className="flex flex-col gap-6">
          <p className="text-body text-primary">{b.strategy?.goal ?? b.client!.goal}</p>
          <section className="flex flex-col gap-3 border-t border-border pt-6" aria-labelledby="ov-off">
            <span className="flex items-center gap-2">
              <h3 id="ov-off" className="text-body font-semibold text-primary">
                Off limits
              </h3>
              <InfoTip label="About off limits">Never post about, name or engage with these. The client sets them in Your brand.</InfoTip>
            </span>
            <OffLimitsBox b={b} />
          </section>
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
      <Card title="What they let us do" info="Set by the client in Control. Follow it exactly; only they can change it.">
        <Rows>
          {(
            [
              ["Post for them", p.post],
              ["Prepare engagement tasks", p.engage],
              ["Company Page", p.companyPage],
              ["Draft connection requests", p.connectionDrafts],
              ["Draft profile updates", p.profileDrafts],
            ] as const
          ).map(([label, on]) => (
            <Row key={label}>
              <span className="min-w-0 flex-1 text-body-sm text-secondary">{label}</span>
              <Badge status={on ? "success" : "neutral"}>{on ? "Allowed" : "Not allowed"}</Badge>
            </Row>
          ))}
        </Rows>
      </Card>
      <Card title="How they review" info="Set by the client in Control.">
        <Rows>
          {(
            [
              ["How often", { weekly: "Once a week", "twice-weekly": "Twice a week", "every-post": "Every post" }[r.frequency]],
              ["How they are told", [r.channels.email && "Email", r.channels.whatsapp && b.user?.whatsapp?.confirmed && "WhatsApp", r.channels.app && "In the app"].filter(Boolean).join(", ")],
              ["If no reply", r.ifNoReply === "wait" ? "Wait for them" : "Go ahead after 24 hours"],
              ["Posts", r.approval.posts === "go" ? "Go ahead" : "Ask first"],
            ] as const
          ).map(([label, value]) => (
            <Row key={label}>
              <span className="min-w-0 flex-1 text-body-sm text-secondary">{label}</span>
              <span className="text-body-sm font-medium text-primary">{value}</span>
            </Row>
          ))}
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
    <Card
      title="Strategy and plan"
      info={`Built on framework ${s.frameworkVersion}.`}
      action={<Badge status={s.status === "approved" ? "success" : "info"}>{s.status === "approved" ? `Approved, version ${s.version}` : "Not approved yet"}</Badge>}
    >
      {/* Sections top to bottom, each under a line: the goal, the topics, the weekly targets, then the button. */}
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2" aria-labelledby="plan-goal">
          <h3 id="plan-goal" className="text-body font-semibold text-primary">
            Goal
          </h3>
          <p className="text-body text-primary">{s.goal}</p>
        </section>
        <section className="flex flex-col gap-3 border-t border-border pt-6" aria-labelledby="plan-topics">
          <h3 id="plan-topics" className="text-body font-semibold text-primary">
            Topics
          </h3>
          <Rows>
            {s.topics.map((t, i) => (
              <Row key={t.name}>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-caption font-medium text-primary-700">{i + 1}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-body-sm font-medium text-primary">{t.name}</span>
                  <span className="text-body-sm text-secondary">{t.why}</span>
                </span>
              </Row>
            ))}
          </Rows>
        </section>
        <section className="flex flex-col gap-3 border-t border-border pt-6" aria-labelledby="plan-targets">
          <h3 id="plan-targets" className="text-body font-semibold text-primary">
            Weekly targets
          </h3>
          {/* As in the client's update report: a plain table with grey headings and a line between rows. It scrolls inside the card on phones. */}
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-md text-left text-body-sm">
              <thead className="bg-neutral-25 text-caption text-secondary">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Weeks
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Posts
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Comments
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Connections
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.targets.map((t) => (
                  <tr key={t.period} className="border-t border-border align-top">
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="flex flex-col gap-1">
                        <span className="font-medium text-primary">{t.period}</span>
                        {t.extra && <span className="text-secondary">{t.extra}</span>}
                      </span>
                    </th>
                    <td className="px-4 py-3 text-right font-medium text-primary">
                      <span className="inline-flex items-center justify-end gap-2">
                        {t.videos ? <Pill label={`${t.videos} of them video`}>{t.videos} video</Pill> : null}
                        {t.posts}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-primary">{t.comments}</td>
                    <td className="px-4 py-3 text-right font-medium text-primary">{t.connections}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="border-t border-border pt-6">
          <Link href={`/manager/clients/${id}/onboard`} className={buttonClass("secondary")}>
            Open onboarding and strategy
          </Link>
        </div>
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
const actionLabels: Record<Lead["action"], string> = { comment: "Comment", react: "React", reshare: "Repost", save: "Save", follow: "Follow", message: "Message", connect: "Connect" };
const hasText = (a: Lead["action"]) => ["comment", "reshare", "message", "connect"].includes(a);

/** What to do with a suggestion, as a line with a blue icon (the reaction has its own line, ReactionLabel). */
const actionLines: Record<Exclude<Lead["action"], "react">, { icon: Icon; text: string }> = {
  comment: { icon: ChatCircle, text: "Comment on the post" },
  reshare: { icon: Repeat, text: "Repost with thoughts" },
  save: { icon: BookmarkSimple, text: "Save the post" },
  follow: { icon: UserCirclePlus, text: "Follow" },
  message: { icon: EnvelopeSimple, text: "Send a message" },
  connect: { icon: UserPlus, text: "Send a connection request" },
};

function ActionLabel({ action }: { action: Exclude<Lead["action"], "react"> }) {
  const { icon: I, text } = actionLines[action];
  return (
    <span className="inline-flex items-center gap-2 text-body-sm font-medium text-primary">
      <I className="size-5 text-primary-600" aria-hidden /> {text}
    </span>
  );
}

/**
 * One suggestion. The manager opens it on LinkedIn with their own account to check it is right, adjusts the
 * text or reaction, then marks it checked so it goes out in the next batch of quick tasks.
 */
function LeadTile({ l, fullService }: { l: Lead; fullService?: boolean }) {
  const { run, pending } = useTask();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(l.draft ?? "");
  const [reaction, setReaction] = useState<LinkedInReaction>(l.reaction ?? "like");
  const closed = l.status === "sent" || l.status === "done" || l.status === "dropped";
  return (
    <li>
      <Tile done={closed}>
        {/* Who: 56px avatar with name and role (centred on the avatar), tags on the right; tags drop under on phones. */}
        <span className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <span className="flex min-w-0 flex-1 items-start gap-4">
            <Avatar name={l.name} src={l.photo} size="lg" />
            <span className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
              <span className="text-body font-medium text-primary">{l.name}</span>
              <span className="text-body-sm text-secondary">{l.detail}</span>
            </span>
          </span>
          <span className="shrink-0 sm:pt-3.5">
            <Badge status={fitTone[l.fit]}>{l.fit[0].toUpperCase() + l.fit.slice(1)} fit</Badge>
          </span>
        </span>
        {l.post && <blockquote className="rounded-md bg-neutral-25 px-4 py-3 text-body-sm text-secondary">&ldquo;{l.post}&rdquo;</blockquote>}
        <Banner tone="info">Why: {l.why}</Banner>
        {l.warning && <Banner tone="danger">{l.warning}</Banner>}
        {editing ? (
          <div className="flex flex-col gap-3">
            {l.action === "react" ? (
              <Select label="Reaction" value={reaction} onChange={(e) => setReaction(e.target.value as LinkedInReaction)}>
                {Object.entries(reactions).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            ) : (
              <Textarea label={l.action === "comment" ? "Comment" : l.action === "reshare" ? "Thoughts on the repost" : l.action === "connect" ? "Connection note" : "Message"} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={l.action === "connect" ? 300 : 1250} help={l.action === "connect" ? `${draft.length} of 300 characters. LinkedIn allows 300.` : undefined} />
            )}
            <span className="flex gap-2">
              <Button
                size="sm"
                loading={pending("save")}
                onClick={async () => {
                  if (hasText(l.action) && !draft.trim()) return toast("Write the text first, or cancel.", "danger");
                  if (await run("save", () => act.editLead(l.id, l.action === "react" ? { reaction } : { draft: draft.trim() }), "Saved.")) setEditing(false);
                }}
              >
                Save
              </Button>
              <Button size="sm" variant="cancel" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </span>
          </div>
        ) : (
          <>
            {/* The expected action, in the same line style as the reaction: icon and what to do. */}
            {l.action === "react" ? <ReactionLabel reaction={l.reaction ?? "like"} /> : <ActionLabel action={l.action} />}
            {l.draft && <p className="text-body-sm text-primary">{l.draft}</p>}
          </>
        )}
        {!editing && (
          <TileFooter>
            <span className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a href={l.url} target="_blank" rel="noreferrer" className={textActionClass}>
                <LinkSimple className="size-4" aria-hidden /> Open on LinkedIn
              </a>
              {!closed && (hasText(l.action) || l.action === "react") && <TextButton onClick={() => setEditing(true)}>Edit</TextButton>}
            </span>
            {l.status === "dropped" ? (
              <TextButton onClick={() => run("undo", () => act.setLead(l.id, "suggested"), "Back on the list.")}>Bring back</TextButton>
            ) : l.status === "sent" ? (
              <Badge status="info">{fullService ? "Done by you" : "In a quick task"}</Badge>
            ) : l.status === "done" ? (
              <Badge status="success">Done by the client</Badge>
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
                {l.status === "kept" ? (
                  <Button size="sm" variant="cancel" loading={pending("keep")} onClick={() => run("keep", () => act.setLead(l.id, "suggested"), "Moved back to check.")}>
                    Not checked
                  </Button>
                ) : (
                  !l.warning && (
                    <Button size="sm" variant="secondary" loading={pending("keep")} onClick={() => run("keep", () => act.setLead(l.id, "kept"), fullService ? "Checked. Do it from their account, then mark it done below." : "Checked. It goes out with the next quick tasks.")}>
                      Checked, add
                    </Button>
                  )
                )}
              </span>
            )}
          </TileFooter>
        )}
      </Tile>
    </li>
  );
}

const dueOptions = () => {
  const at = (days: number) => {
    const d = new Date(Date.now() + days * 86_400_000);
    d.setHours(17, 0, 0, 0);
    return d.toISOString();
  };
  const toFriday = (5 - new Date().getDay() + 7) % 7 || 7;
  return [
    { label: "In 2 days", value: at(2) },
    { label: "Friday", value: at(toFriday) },
    { label: "In a week", value: at(7) },
  ];
};

type EngageView = "check" | "add" | "ready" | "tasks" | "closed" | "progress";

export function EngagementTab({ b }: { b: ClientBundle }) {
  const { run, pending } = useTask();
  const fullService = b.client?.service === "full-service";
  const [url, setUrl] = useState("");
  const [action, setAction] = useState<Lead["action"]>("comment");
  const [urlError, setUrlError] = useState<string>();
  const [view, setView] = useState<EngageView>("add");
  const [due, setDue] = useState(() => dueOptions()[1].value);
  const firstName = b.user?.firstName ?? "the client";
  const ready = b.leads.filter((l) => l.status === "kept");
  const closed = b.leads.filter((l) => l.status === "sent" || l.status === "done" || l.status === "dropped");
  const kinds = new Set(ready.map((l) => l.action)).size;
  return (
    <>
      <Card
        title="This week's brief"
        action={<Pill>Suggested</Pill>}
        info={
          fullService
            ? `${firstName} is on full-service, so you engage from their account. Use these topics to guide your own research on LinkedIn, bring what you find into Add what you find and we grade it, then do it while signed in as them and mark it done. Each action is logged for ${firstName} to see.`
            : `${firstName} is on self-serve. Use these topics to guide your research on LinkedIn with your own account, bring what you find into Add what you find and we grade it, then send it to ${firstName} as a quick task.`
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body text-primary">
            Topics and signals to guide your research: investors and bank partners talking about cross-border payments and the new mobile money report. Join conversations where {firstName} can add data. Skip anything on the off-limits list.
          </p>
        </div>
      </Card>

      {/* One card at a time under the brief, picked from this row. Same tab card as the client sections row above (scrolls sideways on phones). */}
      <div className="rounded-lg border border-border bg-card p-2">
        <Tabs<EngageView>
          label="Engagement sections"
          value={view}
          onChange={setView}
          className="max-w-none w-full bg-neutral-50!"
          tabs={[
            { value: "add", label: "Add new" },
            { value: "ready", label: fullService ? "To do" : "To send", count: ready.length },
            ...(fullService ? [] : [{ value: "tasks" as const, label: "Quick tasks", count: b.tasks.filter((t) => !t.done).length }]),
            { value: "closed", label: "Past items", count: closed.length },
            { value: "progress", label: "Weekly progress" },
          ]}
        />
      </div>

      {view === "add" && (
      <Card title="Add what you find" info={`Paste a LinkedIn post or profile link and pick what ${firstName} should do. We draft any text in their voice and put it in ${fullService ? "To do" : "To send"}.`}>
        {/* Link and action side by side (stacked on phones), then the button under a line. */}
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!/^https?:\/\/(www\.)?linkedin\.com\//.test(url.trim())) return setUrlError("Paste a LinkedIn profile or post link, starting with https://www.linkedin.com/");
            const person = /\/(in|company)\//.test(url);
            if (person && ["comment", "react", "reshare", "save"].includes(action)) return setUrlError(`To ${actionLabels[action].toLowerCase()}, paste a post link, not a profile.`);
            if (!person && ["follow", "message", "connect"].includes(action)) return setUrlError(`To ${actionLabels[action].toLowerCase()}, paste a profile or Page link, not a post.`);
            setUrlError(undefined);
            if (await run("add", () => act.addLead(b.client!.id, url.trim(), action), `Added to ${fullService ? "To do" : "To send"}, with text in ${firstName}'s voice. Adjust it if needed.`)) {
              setUrl("");
              setView("ready");
            }
          }}
        >
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input label="LinkedIn link" placeholder="https://www.linkedin.com/..." value={url} onChange={(e) => { setUrl(e.target.value); setUrlError(undefined); }} error={urlError} />
            </div>
            <Select label="What to do" value={action} onChange={(e) => setAction(e.target.value as Lead["action"])}>
              {Object.entries(actionLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="border-t border-border pt-4">
            <Button type="submit" loading={pending("add")}>
              {pending("add") ? "Adding" : "Add"}
            </Button>
          </div>
        </form>
      </Card>
      )}

      {view === "ready" && (
      <Card title="Ready to send" action={ready.length > 0 && <Pill>{plural(ready.length, "item")}</Pill>}>
        <div className="flex flex-col gap-4">
          {ready.length ? (
            <ul className="flex flex-col gap-3">
              {ready.map((l) => (
                <LeadTile key={l.id} l={l} fullService={fullService} />
              ))}
            </ul>
          ) : (
            <EmptyState title="Nothing ready yet">Bring what you find into Add new. It waits here until you {fullService ? "do it" : "send it"}.</EmptyState>
          )}
          {ready.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
              <Select label="Due" value={due} onChange={(e) => setDue(e.target.value)} wrapperClassName="sm:w-48">
                {dueOptions().map((o) => (
                  <option key={o.label} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Button
                loading={pending("send")}
                onClick={() => run("send", () => (fullService ? act.doEngagementForClient(b.client!.id) : act.sendLeads(b.client!.id, due)), fullService ? `Marked ${plural(ready.length, "action")} as done and logged to ${firstName}'s account.` : `Sent to ${firstName} as ${plural(kinds, "quick task")}. ${firstName} is told by ${[b.user?.channels?.email !== false && "email", b.user?.channels?.whatsapp && "WhatsApp"].filter(Boolean).join(" and ") || "email"}.`)}
              >
                {pending("send") ? (fullService ? "Saving" : "Sending") : fullService ? `Mark ${plural(ready.length, "item")} as done by you` : `Send ${plural(ready.length, "item")} to ${firstName}`}
              </Button>
            </div>
          )}
        </div>
      </Card>
      )}

      {!fullService && view === "tasks" && (
      <Card title="Quick tasks for the client" action={b.tasks.length > 0 && <Pill>{b.tasks.filter((t) => t.done).length} of {b.tasks.length} done</Pill>}>
        {b.tasks.length ? (
          <ul className="flex flex-col gap-3">
            {b.tasks.map((t) => {
              const { done, total } = taskProgress(t);
              const helper = t.handoff && !t.handoff.endedAt ? b.assistants.find((a) => a.id === t.handoff?.assistantId) : undefined;
              return (
                <li key={t.id}>
                  <Tile done={t.done}>
                    <span className="flex flex-col gap-1">
                      <span className="text-body font-medium text-primary">{t.title}</span>
                      <span className="text-body-sm text-secondary">
                        {done} of {total} {progressWord(t)} · Sent {agoIn(t.sentAt)}
                      </span>
                      <span className="max-w-xs pt-1">
                        <ProgressBar value={done} max={total} />
                      </span>
                    </span>
                    <TileFooter>
                      <Meta icon={Timer}>Due {dayTimeIn(t.dueAt)}</Meta>
                      <Badge status={t.done ? "success" : "info"}>{t.done ? (t.doneBy ? `Done by ${t.doneBy.split(" ")[0]}` : "Done") : helper ? `With ${helper.name.split(" ")[0]} (${helper.role})` : "With the client"}</Badge>
                    </TileFooter>
                  </Tile>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="No quick tasks yet">Send checked suggestions from To send and they show here with the client&apos;s progress.</EmptyState>
        )}
      </Card>
      )}

      {view === "closed" && (
        <Card title={fullService ? "Done and dropped" : "Sent, done and dropped"} action={closed.length > 0 && <Pill>{plural(closed.length, "suggestion")}</Pill>}>
          {closed.length ? (
            <ul className="flex flex-col gap-3">
              {closed.map((l) => (
                <LeadTile key={l.id} l={l} fullService={fullService} />
              ))}
            </ul>
          ) : (
            <EmptyState title="Nothing here yet">{fullService ? "Suggestions you did on their account, or dropped, show here." : "Suggestions in quick tasks, done by the client, or dropped show here."}</EmptyState>
          )}
        </Card>
      )}

      {view === "progress" && (
        <Card title="Progress">
          <Targets b={b} />
        </Card>
      )}
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
        <Row key={s.id}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <Newspaper className="size-5" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <a href={s.url} target="_blank" rel="noreferrer" className="rounded-sm text-body-sm font-medium text-primary hover:text-primary-700 hover:underline focus-visible:focus-ring">
              {s.title}
            </a>
            <span className="text-body-sm text-secondary">
              {s.source} · {agoIn(s.at)}
            </span>
          </span>
          <Pill>{s.topic}</Pill>
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
  const [topicError, setTopicError] = useState<string>();
  const [found, setFound] = useState("");
  const topics: { name: string; why?: string }[] = b.strategy?.topics ?? [{ name: "Their field" }, { name: "Their company" }, { name: "Their city" }];
  return (
    <>
      <Card
        title="Listening topics"
        info="Taken from the strategy topics, plus their industry and location. Set up a Google Alert for each one."
        action={<Pill>{plural(topics.length + (b.client?.country ? 1 : 0), "topic")}</Pill>}
      >
        {/* As on the client's Strategy page (Your topics): numbered, name with the reason under it; location last with a pin. */}
        <ol className="flex flex-col gap-3">
          {topics.map((t, i) => (
            <li key={t.name} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-caption text-primary-700">{i + 1}</span>
              <span className="flex flex-col">
                <span className="text-body font-medium text-primary">{t.name}</span>
                {t.why && <span className="text-body-sm text-secondary">{t.why}</span>}
              </span>
            </li>
          ))}
          {b.client?.country && (
            <li className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <MapPin className="size-4" aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className="text-body font-medium text-primary">
                  {b.client.industry} in {b.client.country}
                </span>
                <span className="text-body-sm text-secondary">Their industry and location</span>
              </span>
            </li>
          )}
        </ol>
      </Card>
      <Card
        title="Google Alert feeds"
        action={<Pill>{b.alerts.filter((a) => a.working).length} of {b.alerts.length} working</Pill>}
      >
        {/* Problem first, then the feeds. */}
        <div className="flex flex-col gap-4">
          {!b.alerts.some((a) => a.working) && (
            <Banner tone="warning" title="No working feeds">
              Nothing is coming in from this client&apos;s field yet. Add a feed for each topic in Add a feed.
            </Banner>
          )}
          {b.alerts.length > 0 ? (
            <Rows>
              {b.alerts.map((a) => (
                <Row key={a.id}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                    <LinkSimple className="size-5" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-body-sm font-medium text-primary">{a.topic}</span>
                    <span className="text-body-sm text-secondary">Last item {agoIn(a.lastItemAt)}</span>
                  </span>
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
          ) : (
            <p className="text-body-sm text-secondary">No feeds yet. Add one in Add a feed.</p>
          )}
        </div>
      </Card>
      <Card title="Add a feed" info="Create a Google Alert for the topic, choose RSS feed as the delivery, then paste the feed link here. We check it works.">
        {/* Link and topic side by side (stacked on phones), then the button under a line, as in Add what you find. */}
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!/^https:\/\/www\.google\.com\/alerts\/feeds\//.test(feed.trim())) return setFeedError("Paste the feed link from Google Alerts. It starts with https://www.google.com/alerts/feeds/");
            if (!topic.trim()) return setTopicError("Add the alert topic.");
            setFeedError(undefined);
            setTopicError(undefined);
            if (await run("feed", () => act.addAlert(b.client!.id, topic.trim(), feed.trim()), "Feed added. We checked it and it is working.")) {
              setTopic("");
              setFeed("");
            }
          }}
        >
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input label="Feed link" placeholder="https://www.google.com/alerts/feeds/..." value={feed} onChange={(e) => { setFeed(e.target.value); setFeedError(undefined); }} error={feedError} />
            </div>
            <Input label="Alert topic" placeholder="Lagos fintech" value={topic} onChange={(e) => { setTopic(e.target.value); setTopicError(undefined); }} error={topicError} />
          </div>
          <div className="border-t border-border pt-4">
            <Button type="submit" loading={pending("feed")}>
              {pending("feed") ? "Checking the feed" : "Add feed"}
            </Button>
          </div>
        </form>
      </Card>
      <Card title="Latest signals" action={b.signals.length > 0 && <Pill>{plural(b.signals.length, "signal")}</Pill>}>
        <SignalList b={b} removable />
      </Card>
      <Card title="Add what I found" info="A link or a short note from their field. It shapes the next post ideas.">
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!found.trim()) return;
            if (await run("found", () => act.addFinding(b.client!.id, found.trim()), "Added. It will shape the next ideas.")) setFound("");
          }}
        >
          <Textarea label="A link, or a short note" rows={3} placeholder="3 founders in Lagos are debating instant settlement this week." value={found} onChange={(e) => setFound(e.target.value)} />
          <div className="border-t border-border pt-4">
            <Button type="submit" loading={pending("found")}>
              Add
            </Button>
          </div>
        </form>
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
        {/* As on the client's Your brand page: the voice, then green "use" and red "avoid" word chips, then off limits under a line. */}
        <div className="flex flex-col gap-4">
          <p className="text-body text-primary">{b.brand?.voice || "Not written yet."}</p>
          {(
            [
              { label: "Words they use", words: b.brand?.wordsUse ?? [], bg: "bg-success-bg", icon: <CheckCircle className="size-4 shrink-0 text-success" aria-hidden /> },
              { label: "Words they avoid", words: b.brand?.wordsAvoid ?? [], bg: "bg-danger-bg", icon: <XCircle className="size-4 shrink-0 text-danger" aria-hidden /> },
            ] as const
          ).map(({ label, words, bg, icon }) => (
            <div key={label} className="flex flex-col gap-2">
              <span className="text-caption text-secondary">{label}</span>
              <ul className="flex flex-wrap gap-2">
                {words.map((w) => (
                  <li key={w} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-body-sm text-primary ${bg}`}>
                    {icon}
                    {w}
                  </li>
                ))}
                {!words.length && <li className="text-body-sm text-secondary">None yet</li>}
              </ul>
            </div>
          ))}
          <section className="flex flex-col gap-3 border-t border-border pt-4" aria-label="Off limits">
            <h3 className="text-body font-semibold text-primary">Off limits</h3>
            <OffLimitsBox b={b} />
          </section>
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

/** #42: after a call, the AM pastes the transcript (only if recorded) and the insights, then shares them with the client. */
function CallNoteEditor({ call }: { call: ClientBundle["calls"][number] }) {
  const { run, pending } = useTask();
  const [transcript, setTranscript] = useState(call.transcript ?? "");
  const [insights, setInsights] = useState(call.insights ?? "");
  const [error, setError] = useState<string>();
  const dirty = transcript !== (call.transcript ?? "") || insights !== (call.insights ?? "");
  const shared = !!call.sharedAt;
  const saveNotes = () => act.saveCallNotes(call.id, { transcript: call.recording ? transcript : undefined, insights });
  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4">
      {call.recording ? (
        <Textarea label="Transcript" help="Paste the raw transcript from your own notetaker. The client can read it." rows={4} value={transcript} onChange={(e) => { setTranscript(e.target.value); setError(undefined); }} />
      ) : (
        <Banner tone="neutral" icon={false}>
          This call was not recorded, so there is no transcript. Share the insights only.
        </Banner>
      )}
      <Textarea label="Insights" help="The key points, synthesized. These shape the strategy, and the client reads them." rows={4} value={insights} onChange={(e) => { setInsights(e.target.value); setError(undefined); }} error={error} />
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="secondary" disabled={!dirty} loading={pending("save")} onClick={() => run("save", saveNotes, "Notes saved.")}>
          Save
        </Button>
        <Button
          size="sm"
          disabled={!insights.trim()}
          loading={pending("share")}
          onClick={async () => {
            if (!insights.trim()) return setError("Add the insights before you share.");
            await run("save", saveNotes, undefined);
            await run("share", () => act.shareCallNotes(call.id), shared ? "Updated notes shared with the client." : "Notes shared with the client.");
          }}
        >
          {shared ? "Share again" : "Share with client"}
        </Button>
        {shared && (
          <span className="flex items-center gap-1 text-caption text-success">
            <CheckCircle className="size-4" aria-hidden /> Shared {agoIn(call.sharedAt!)}
          </span>
        )}
      </div>
    </div>
  );
}

export function CallsTab({ b }: { b: ClientBundle }) {
  const callStatus = (c: ClientBundle["calls"][number]) =>
    c.status === "done" ? { tone: "success" as const, label: "Done" }
    : c.status === "cancelled" ? { tone: "neutral" as const, label: "Cancelled" }
    : c.status === "pending" ? (c.pending?.awaiting === "manager" ? { tone: "warning" as const, label: "Needs you" } : { tone: "info" as const, label: "Waiting on client" })
    : { tone: "info" as const, label: "Booked" };
  return (
    <Card title="Calls and notes" action={b.client && <TextLink href={`/manager/clients/${b.client.id}/book-call`}>Book a call</TextLink>}>
      {b.calls.length ? (
        <ul className="flex flex-col gap-3">
          {b.calls.map((c) => {
            const s = callStatus(c);
            return (
            <li key={c.id}>
              <Tile done={c.status === "cancelled"}>
                <span className="flex flex-col gap-1">
                  <span className="text-body font-medium text-primary">{c.kind === "check-in" ? c.title ?? callName[c.kind] : callName[c.kind]}</span>
                  {c.agenda && <span className="text-body-sm text-secondary">{c.agenda}</span>}
                  <span className="text-body-sm text-secondary">{c.recording ? "Notetaker bot joins (with the client's consent)." : "No bot. Write what you heard."}</span>
                </span>
                {c.prep && (
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-primary">
                    {c.prep.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
                <TileFooter>
                  <Meta icon={Clock}>{dayTime(c.at)} · {c.minutes} min</Meta>
                  <Badge status={s.tone}>{s.label}</Badge>
                </TileFooter>
                {c.status === "done" && <CallNoteEditor call={c} />}
              </Tile>
            </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-body-sm text-secondary">No calls yet. Book one with {b.user?.firstName ?? "the client"} after you agree a time in messages.</p>
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
            <p className="text-caption text-secondary">Drafted from this week&apos;s work. Check it, add your note, send.</p>
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

