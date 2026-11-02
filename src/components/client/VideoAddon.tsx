"use client";

import { VideoCamera } from "@phosphor-icons/react";
import { useState } from "react";
import { Badge, Button, Card, useConfirm, useTask } from "@/components/ui";
import { date, money } from "@/lib/format";
import { act, type Contract } from "@/lib/mock";

export type Maker = NonNullable<Contract["videoAddon"]>["maker"];

export const makerLabel: Record<Maker, string> = {
  client: "I will supply the videos",
  bluecut: "Bluecut makes the videos",
  both: "Both, depending on the video",
};

const makerHelp: Record<Maker, string> = {
  client: "You record clips, with a short guide from us on what to shoot each time.",
  bluecut: "We film with you in person or make the video with AI tools, then post it with your approval.",
  both: "We agree each video with you: some you record, some we make.",
};

/**
 * C4 and C13: the video add-on. Off by default; on, it asks who makes the videos. Videos are made off the
 * platform; any client can always use their own clips in posts without the add-on.
 */
export function VideoAddonPicker({ on, maker, priceCents, onChange }: { on: boolean; maker: Maker; priceCents: number; onChange: (on: boolean, maker: Maker) => void }) {
  return (
    <div className={`flex flex-col gap-4 rounded-lg border p-4 ${on ? "border-primary-600 bg-primary-50" : "border-border"}`}>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked, maker)} className="mt-1 size-4 accent-primary-600 focus-visible:focus-ring" />
        <span className="flex flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-body font-medium text-primary">
              <VideoCamera className="size-5 text-primary-600" aria-hidden /> Add video
            </span>
            <span className="text-body font-medium text-primary">+{money(priceCents)} a month</span>
          </span>
          <span className="text-body-sm text-secondary">Short videos become part of your plan, chosen to serve your goal. You can add or remove this later in Contract.</span>
        </span>
      </label>
      {on && (
        <fieldset className="flex flex-col gap-2 pl-7">
          <legend className="mb-2 text-body-sm font-medium text-primary">Who makes the videos?</legend>
          {(Object.keys(makerLabel) as Maker[]).map((m) => (
            <label key={m} className={`flex cursor-pointer items-start gap-3 rounded-md border bg-card p-3 ${maker === m ? "border-primary-600" : "border-border hover:border-primary-300"}`}>
              <input type="radio" name="video-maker" checked={maker === m} onChange={() => onChange(true, m)} className="mt-1 size-4 accent-primary-600 focus-visible:focus-ring" />
              <span className="flex flex-col gap-1">
                <span className="text-body font-medium text-primary">{makerLabel[m]}</span>
                <span className="text-body-sm text-secondary">{makerHelp[m]}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}

/** What the client pays each month: the plan, plus the video add-on when it is on. */
export const monthlyTotal = (contract: Pick<Contract, "monthlyCents" | "videoAddon">, addonCents: number) => contract.monthlyCents + (contract.videoAddon ? addonCents : 0);

/** C13 Contract: the video add-on, on or off, who makes the videos, and the controls to change it. */
export function VideoAddonCard({ clientId, contract, priceCents }: { clientId: string; contract: Contract; priceCents: number }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{ on: boolean; maker: Maker }>({ on: true, maker: contract.videoAddon?.maker ?? "client" });
  const addon = contract.videoAddon;
  const ended = ["cancelled", "completed"].includes(contract.status);

  return (
    <Card title="Video add-on" action={<Badge status={addon ? "success" : "neutral"}>{addon ? "On" : "Off"}</Badge>}>
      <div className="flex flex-col gap-4">
        {addon ? (
          <p className="text-body text-primary">
            {makerLabel[addon.maker]}. {money(priceCents)} a month on top of your plan, since {date(addon.since)}.
          </p>
        ) : (
          <p className="text-body-sm text-secondary">
            Add short videos to your plan for {money(priceCents)} a month. You can always use your own clips in posts without it.
          </p>
        )}
        {editing && <VideoAddonPicker on={draft.on} maker={draft.maker} priceCents={priceCents} onChange={(on, maker) => setDraft({ on, maker })} />}
        {!ended && (
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button
                  size="sm"
                  disabled={!draft.on}
                  loading={pending("save")}
                  onClick={async () => {
                    if (await run("save", () => act.setVideoAddon(clientId, draft.maker), addon ? "Video add-on updated. Your manager is told." : "Video add-on added. Your manager will talk it through with you.")) setEditing(false);
                  }}
                >
                  {addon ? "Save" : "Add video"}
                </Button>
                <Button variant="cancel" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                  {addon ? "Change who makes them" : "Add video"}
                </Button>
                {addon && (
                  <Button
                    variant="remove"
                    size="sm"
                    onClick={() =>
                      confirm({
                        title: "Remove the video add-on?",
                        body: `It ends with this month's payment. Videos already planned are finished, and you can still use your own clips in posts.`,
                        warning: "Videos Bluecut was making for you stop.",
                        confirmLabel: "Remove",
                        tone: "danger",
                        action: () => act.setVideoAddon(clientId, null),
                        success: "Video add-on removed. Your manager is told.",
                      })
                    }
                  >
                    Remove
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
