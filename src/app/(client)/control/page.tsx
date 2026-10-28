"use client";

import { LinkedinLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { PermissionsForm } from "@/components/client/PermissionsForm";
import { ReviewForm, reviewSummary } from "@/components/client/ReviewForm";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Button, Card, Dialog, Tabs, useToast } from "@/components/ui";
import { ago, agoIn } from "@/lib/format";
import { act, useMyClient, type Activity } from "@/lib/mock";

const who: Record<Activity["who"], string> = { you: "You", team: "Your account team", system: "Bluecut" };
type Filter = "all" | Activity["kind"];

/** C11 Control: what we do, how you review, requests, pause, LinkedIn connection and every action on the account. */
export default function ControlPage() {
  const { client, requests, activity } = useMyClient();
  const toast = useToast();
  const [editingReview, setEditingReview] = useState(false);
  const [confirm, setConfirm] = useState<"pause" | "disconnect" | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  if (!client) return null;

  const pending = requests.filter((r) => r.status === "pending");
  const sum = reviewSummary(client.review);
  const shown = activity.filter((a) => filter === "all" || a.kind === filter);

  return (
    <Columns {...rails.clientSettings}>
      {pending.length > 0 && (
        <Card title="Requests from your manager">
          <ul className="flex flex-col gap-4">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-body font-medium text-primary">{r.text}</span>
                  <span className="text-body-sm text-secondary">{r.why}</span>
                  <span className="text-caption text-secondary">Asked {agoIn(r.at)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      await act.answerRequest(r.id, true);
                      toast("Approved. Your manager can go ahead, this once.");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await act.answerRequest(r.id, false);
                      toast("Declined. Your manager will not do this.");
                    }}
                  >
                    Decline
                  </Button>
                </div>
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
            <button type="button" onClick={() => setEditingReview(true)} className="rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">
              Change
            </button>
          )
        }
      >
        {editingReview ? (
          <ReviewForm
            initial={client.review}
            onSave={async (r) => {
              await act.saveReview(client.id, r);
              setEditingReview(false);
              toast("Saved. This applies to new posts.");
            }}
          />
        ) : (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-caption text-secondary">How often</dt>
              <dd className="text-body text-primary">{sum.frequency}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-caption text-secondary">Where we tell you</dt>
              <dd className="text-body text-primary">{sum.channels}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-caption text-secondary">What needs your approval</dt>
              <dd className="flex flex-col text-body-sm text-primary">
                {sum.approval.map((a) => (
                  <span key={a}>{a}</span>
                ))}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-caption text-secondary">If you do not reply</dt>
              <dd className="text-body text-primary">{sum.noReply}</dd>
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
            <p className="text-body-sm text-secondary">Need a quiet week? Pause all posting in one tap. Scheduled posts are held, not lost.</p>
          )}
          <Button
            variant="secondary"
            className="self-start"
            onClick={async () => {
              if (!client.postingPaused) return setConfirm("pause");
              await act.setPostingPaused(client.id, false);
              toast("Posting is back on. Held posts are scheduled again.");
            }}
          >
            {client.postingPaused ? "Turn posting back on" : "Pause all posting"}
          </Button>
        </div>
      </Card>

      <Card title="LinkedIn connection">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <LinkedinLogo className="size-8 text-primary-600" aria-hidden />
            <div className="flex flex-col">
              <span className="text-body font-medium text-primary">LinkedIn</span>
              <span className="text-body-sm text-secondary">Connected through LinkedIn&apos;s own sign-in. We never see your password.</span>
            </div>
            <span className="ml-auto">
              <Badge status={client.linkedin === "connected" ? "success" : "warning"}>
                {{ connected: "Connected", expired: "Expired", disconnected: "Disconnected", "not-connected": "Not connected" }[client.linkedin]}
              </Badge>
            </span>
          </div>
          {client.linkedin === "connected" ? (
            <Button variant="ghost" className="self-start" onClick={() => setConfirm("disconnect")}>
              Disconnect LinkedIn
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="self-start"
              onClick={async () => {
                await act.setLinkedIn(client.id, "connected");
                toast("LinkedIn connected again.");
              }}
            >
              Reconnect LinkedIn
            </Button>
          )}
        </div>
      </Card>

      <Card title="Activity" padding="none">
        <div className="px-6">
          <Tabs
            label="Filter activity"
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: "all", label: "All" },
              { value: "post", label: "Posts" },
              { value: "engagement", label: "Engagement" },
              { value: "setting", label: "Settings" },
              { value: "account", label: "Account" },
            ]}
          />
        </div>
        <ul className="flex flex-col">
          {shown.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-4 border-b border-border px-6 py-4 last:border-b-0">
              <span className="flex flex-col gap-1">
                <span className="text-body-sm text-primary">{a.text}</span>
                <span className="text-caption text-secondary">{who[a.who]}</span>
              </span>
              <span className="shrink-0 text-caption text-secondary">{ago(a.at)}</span>
            </li>
          ))}
          {shown.length === 0 && <li className="px-6 py-6 text-body-sm text-secondary">Nothing here yet.</li>}
        </ul>
      </Card>

      <Card title="Something wrong?">
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-secondary">Tell us about a missed post, the quality of the work, something we did that you did not allow, or billing. The owner reads every one.</p>
          <Link href="/control/complaint" className="self-start rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">
            Raise a complaint
          </Link>
        </div>
      </Card>

      <Dialog open={confirm === "pause"} onClose={() => setConfirm(null)} title="Pause all posting?">
        <p className="text-body text-secondary">Scheduled posts are held, and nothing goes out on LinkedIn. Your contract keeps running. Turn it back on any time.</p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await act.setPostingPaused(client.id, true);
              setBusy(false);
              setConfirm(null);
              toast("All posting is paused.");
            }}
          >
            Pause posting
          </Button>
        </div>
      </Dialog>

      <Dialog open={confirm === "disconnect"} onClose={() => setConfirm(null)} title="Disconnect LinkedIn?">
        <p className="text-body text-secondary">We stop posting and engaging at once. Scheduled posts are held. You can reconnect any time.</p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await act.setLinkedIn(client.id, "disconnected");
              setBusy(false);
              setConfirm(null);
              toast("LinkedIn disconnected.");
            }}
          >
            Disconnect
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
