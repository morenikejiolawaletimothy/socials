"use client";

import { PencilSimple } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PermissionsForm } from "@/components/client/PermissionsForm";
import { ReviewForm, reviewSummary } from "@/components/client/ReviewForm";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Button, buttonClass, Card, Pill, Tabs, TextButton, Tile, TileFooter, useConfirm, useTask } from "@/components/ui";
import { agoIn, dayTime } from "@/lib/format";
import { act, useMyClient, type Activity } from "@/lib/mock";

const who: Record<Activity["who"], string> = { you: "You", team: "Your account team", system: "Bluecut" };
type Filter = "all" | "post" | "engagement" | "profile" | "events" | "settings";
/** Each tab covers a group of activity kinds, so every action shows under one tab. */
const groups: { value: Filter; label: string; kinds?: Activity["kind"][] }[] = [
  { value: "all", label: "All" },
  { value: "post", label: "Posts", kinds: ["post"] },
  { value: "engagement", label: "Engagement", kinds: ["engagement", "connection", "follow-up", "message"] },
  { value: "profile", label: "Profile", kinds: ["profile"] },
  { value: "events", label: "Events and calls", kinds: ["event", "call"] },
  { value: "settings", label: "Settings", kinds: ["setting", "account"] },
];
const inGroup = (a: Activity, f: Filter) => {
  const kinds = groups.find((g) => g.value === f)?.kinds;
  return !kinds || kinds.includes(a.kind);
};
/** How many activities the card shows before "View all". */
const RECENT = 10;

/** C11 Control: what we do, how you review, requests, pause, LinkedIn connection and every action on the account. */
export default function ControlPage() {
  const { client, requests, activity } = useMyClient();
  const confirm = useConfirm();
  const { run, pending: isPending } = useTask();
  const [editingReview, setEditingReview] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);
  if (!client) return null;

  const pending = requests.filter((r) => r.status === "pending");
  const approved = requests.filter((r) => r.status === "approved");
  const sum = reviewSummary(client.review);
  // Newest first; the card shows the latest 10 until "View all" is pressed.
  const shown = activity.filter((a) => inGroup(a, filter)).sort((a, b) => b.at.localeCompare(a.at));
  const listed = showAll ? shown : shown.slice(0, RECENT);

  return (
    <Columns {...rails.clientSettings}>
      {(pending.length > 0 || approved.length > 0) && (
        <Card title="Requests from your manager" action={pending.length > 0 && <Pill>{pending.length === 1 ? "1 to answer" : `${pending.length} to answer`}</Pill>}>
          <ul className="flex flex-col gap-4">
            {pending.map((r) => (
              <li key={r.id}>
                <Tile>
                  <div className="flex flex-col gap-1">
                    <span className="text-body font-medium text-primary">{r.text}</span>
                    {r.why && <span className="text-body-sm text-secondary">{r.why}</span>}
                  </div>
                  <TileFooter>
                    <span className="text-caption text-secondary">Asked {agoIn(r.at)}</span>
                    <span className="flex gap-2">
                      <Button
                        variant="cancel"
                        size="sm"
                        onClick={() =>
                          confirm({
                            title: "Decline this request?",
                            body: <>Your manager will not {r.text.charAt(0).toLowerCase() + r.text.slice(1)}. They are told, and can ask again with more detail.</>,
                            confirmLabel: "Decline",
                            action: () => act.answerRequest(r.id, false),
                            success: "Declined. Your manager will not do this.",
                          })
                        }
                      >
                        Decline
                      </Button>
                      <Button size="sm" loading={isPending(`yes-${r.id}`)} onClick={() => run(`yes-${r.id}`, () => act.answerRequest(r.id, true), "Approved. Your manager can go ahead, this once.")}>
                        {isPending(`yes-${r.id}`) ? "Approving" : "Approve"}
                      </Button>
                    </span>
                  </TileFooter>
                </Tile>
              </li>
            ))}
            {approved.map((r) => (
              <li key={r.id}>
                <Tile done>
                  <span className="text-body font-medium text-primary">{r.text}</span>
                  <TileFooter>
                    <Badge status="success">You approved this, once</Badge>
                    <Button
                      variant="remove"
                      size="sm"
                      onClick={() =>
                        confirm({
                          title: "Withdraw your approval?",
                          body: "Your manager is told at once not to go ahead.",
                          warning: "If they have already done it, it stays done. Ask them in Messages to undo it.",
                          confirmLabel: "Withdraw approval",
                          action: () => act.withdrawApproval(r.id),
                          success: "Approval withdrawn. Your manager will not go ahead.",
                        })
                      }
                    >
                      Withdraw
                    </Button>
                  </TileFooter>
                </Tile>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="What we do for you">
        <PermissionsForm client={client} />
      </Card>

      <Card
        title="How you review"
        action={
          !editingReview && (
            <Button variant="secondary" size="sm" onClick={() => setEditingReview(true)}>
              <PencilSimple className="size-4" aria-hidden /> Edit
            </Button>
          )
        }
      >
        {editingReview ? (
          <ReviewForm
            initial={client.review}
            onSave={(r) => act.saveReview(client.id, r)}
            success="Saved. This applies to new posts. Your manager is told."
            onSaved={() => setEditingReview(false)}
            onCancel={() => setEditingReview(false)}
          />
        ) : (
          <dl className="flex flex-col divide-y divide-border">
            {/* Question on the left, answer on the right, so every answer lines up on one edge. */}
            {[
              { label: "How often", value: sum.frequency },
              { label: "Where we tell you", value: sum.channels },
              { label: "If you do not reply", value: sum.noReply },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <dt className="text-body-sm text-secondary">{row.label}</dt>
                <dd className="text-right text-body-sm font-medium text-primary">{row.value}</dd>
              </div>
            ))}
            {/* Approvals: the question, then one line per kind with its answer as a tag on the same right edge. */}
            <div className="flex flex-col gap-3 pt-4">
              <dt className="text-body-sm text-secondary">What needs your approval</dt>
              <dd>
                <ul className="flex flex-col rounded-md border border-border">
                  {sum.approval.map((a) => (
                    <li key={a.label} className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0">
                      <span className="text-body-sm text-primary">{a.label}</span>
                      <Badge status={a.ask ? "info" : "neutral"}>{a.ask ? "Ask me first" : "Go ahead"}</Badge>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        )}
      </Card>

      <Card title="Posting">
        <div className="flex flex-col gap-4">
          {client.postingPaused ? (
            <Banner tone="warning" title="All posting is paused">
              Scheduled posts are held. Nothing goes out until you turn posting back on.
            </Banner>
          ) : (
            <Banner tone="info">Need a quiet week? Pause all posting in one tap. Scheduled posts are held, not lost.</Banner>
          )}
          <Button
            className="self-start"
            loading={isPending("resume")}
            onClick={() =>
              client.postingPaused
                ? run("resume", () => act.setPostingPaused(client.id, false), "Posting is back on. Held posts are scheduled again.")
                : confirm({
                    title: "Pause all posting?",
                    body: "Scheduled posts are held, and nothing goes out on LinkedIn. Your manager is told. Turn it back on any time.",
                    warning: "Your contract keeps running while posting is paused, and held posts count as waiting on you.",
                    confirmLabel: "Pause posting",
                    action: () => act.setPostingPaused(client.id, true),
                    success: "All posting is paused.",
                  })
            }
          >
            {client.postingPaused ? "Turn posting back on" : "Pause all posting"}
          </Button>
        </div>
      </Card>

      <Card title="LinkedIn connection">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Image src="/brand/linkedin.svg" alt="" width={40} height={40} unoptimized className="size-10 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-body font-medium text-primary">LinkedIn</span>
                <Badge status={client.linkedin === "connected" ? "success" : "warning"}>
                  {{ connected: "Connected", expired: "Expired", disconnected: "Disconnected", "not-connected": "Not connected" }[client.linkedin]}
                </Badge>
              </span>
              <span className="text-body-sm text-secondary">Connected through LinkedIn&apos;s own sign-in. We never see your password.</span>
            </div>
          </div>
          {client.linkedin === "connected" ? (
            <Button
              variant="remove"
              className="self-start"
              onClick={() =>
                confirm({
                  title: "Disconnect LinkedIn?",
                  body: "We stop posting and engaging at once. Scheduled posts are held. Your manager is told.",
                  warning: "Nothing can go out until you reconnect. You can reconnect any time.",
                  confirmLabel: "Disconnect",
                  tone: "danger",
                  action: () => act.setLinkedIn(client.id, "disconnected"),
                  success: "LinkedIn disconnected.",
                })
              }
            >
              Disconnect
            </Button>
          ) : (
            <Button className="self-start" loading={isPending("reconnect")} onClick={() => run("reconnect", () => act.setLinkedIn(client.id, "connected"), "LinkedIn connected again.")}>
              {isPending("reconnect") ? "Reconnecting" : "Reconnect LinkedIn"}
            </Button>
          )}
        </div>
      </Card>

      <Card title="Activity" padding="none" action={<Pill>{activity.length === 1 ? "1 action" : `${activity.length} actions`}</Pill>}>
        <div className="px-6 pt-4 pb-2">
          <Tabs
            label="Filter activity"
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setShowAll(false);
            }}
            showZero
            className="w-full max-w-none gap-1 bg-neutral-50!"
            tabs={groups.map((g) => ({ value: g.value, label: g.label, count: activity.filter((a) => inGroup(a, g.value)).length }))}
          />
        </div>
        <ul className="flex flex-col">
          {listed.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-4 border-b border-border px-6 py-4 last:border-b-0">
              <span className="flex flex-col gap-1">
                <span className="text-body-sm text-primary">{a.text}</span>
                <span className="text-caption text-secondary">{who[a.who]}</span>
              </span>
              <time dateTime={a.at} className="shrink-0 text-caption text-secondary">{dayTime(a.at)}</time>
            </li>
          ))}
          {shown.length === 0 && <li className="px-6 py-6 text-body-sm text-secondary">Nothing here yet.</li>}
        </ul>
        {shown.length > RECENT && (
          <div className="flex items-center gap-3 border-t border-border px-6 py-3">
            <TextButton onClick={() => setShowAll((v) => !v)}>{showAll ? "Show the latest 10" : `View all ${shown.length}`}</TextButton>
          </div>
        )}
      </Card>

      <Card title="Something wrong?">
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-secondary">Tell us about a missed post, the quality of the work, something we did that you did not allow, or billing.</p>
          <Link href="/control/complaint" className={`self-start ${buttonClass("secondary")}`}>
            Raise a complaint
          </Link>
        </div>
      </Card>

    </Columns>
  );
}
