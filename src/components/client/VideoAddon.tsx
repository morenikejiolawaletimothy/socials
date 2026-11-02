"use client";

import { VideoCamera } from "@phosphor-icons/react";
import { useState } from "react";
import { Badge, Banner, Button, Card, useConfirm, useTask } from "@/components/ui";
import { date, money } from "@/lib/format";
import { act, type Contract } from "@/lib/mock";

export type Maker = NonNullable<Contract["videoAddon"]>["maker"];

export const makerLabel: Record<Maker, string> = {
  client: "I will supply the videos",
  bluecut: "Bluecut makes the videos",
  both: "Both: I supply some, Bluecut makes some",
};

const makerHelp: Record<Maker, string> = {
  client: "You record the clips, with a short guide from us each time on what to shoot. We plan, caption and post them.",
  bluecut: "A separate video production service: we film with you in person, set up a content studio for you, or make the video with AI and video tools.",
  both: "You supply some clips yourself, and Bluecut produces others as a separate service.",
};

/** Video production by Bluecut happens off the platform and is priced on its own, after the onboarding call. */
export const needsQuote = (maker: Maker) => maker !== "client";
/** The monthly add-on covers videos the client supplies. Bluecut-only production is quoted instead. */
export const addonCents = (maker: Maker, priceCents: number) => (maker === "bluecut" ? 0 : priceCents);

const priceTag = (maker: Maker, priceCents: number) =>
  maker === "client" ? `+${money(priceCents)} a month` : maker === "bluecut" ? "Quoted after your call" : `+${money(priceCents)} a month, plus a quote`;

export type AddonChoice = { on: boolean; maker: Maker; understood: boolean };

/** Ready to go on: off, or on with a choice that does not need a quote, or one the client confirmed they understand. */
export const addonReady = (c: AddonChoice) => !c.on || !needsQuote(c.maker) || c.understood;

/**
 * C4 and C13: the video add-on. The monthly price covers videos the client supplies. Bluecut making the videos is a
 * separate production service, done off the platform and quoted by the manager after the onboarding call; the client
 * must confirm they understand that before going on. Any client can use their own clips in posts without the add-on.
 */
export function VideoAddonPicker({ value, priceCents, onChange }: { value: AddonChoice; priceCents: number; onChange: (v: AddonChoice) => void }) {
  const { on, maker, understood } = value;
  return (
    <div className={`flex flex-col gap-4 rounded-lg border p-4 ${on ? "border-primary-600 bg-primary-50" : "border-border"}`}>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={on} onChange={(e) => onChange({ ...value, on: e.target.checked })} className="mt-1 size-4 accent-primary-600 focus-visible:focus-ring" />
        <span className="flex flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-body font-medium text-primary">
              <VideoCamera className="size-5 text-primary-600" aria-hidden /> Add video
            </span>
            <span className="text-body font-medium text-primary">{on ? priceTag(maker, priceCents) : `From ${money(priceCents)} a month`}</span>
          </span>
          <span className="text-body-sm text-secondary">Short videos become part of your plan, chosen to serve your goal. You can add or remove this later in Contract.</span>
        </span>
      </label>
      {on && (
        <fieldset className="flex flex-col gap-2 pl-7">
          <legend className="mb-2 text-body-sm font-medium text-primary">Who makes the videos?</legend>
          {(Object.keys(makerLabel) as Maker[]).map((m) => (
            <label key={m} className={`flex cursor-pointer items-start gap-3 rounded-md border bg-card p-3 ${maker === m ? "border-primary-600" : "border-border hover:border-primary-300"}`}>
              <input type="radio" name="video-maker" checked={maker === m} onChange={() => onChange({ on: true, maker: m, understood: false })} className="mt-1 size-4 accent-primary-600 focus-visible:focus-ring" />
              <span className="flex flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-body font-medium text-primary">{makerLabel[m]}</span>
                  <span className="text-body-sm font-medium text-primary-700">{priceTag(m, priceCents)}</span>
                </span>
                <span className="text-body-sm text-secondary">{makerHelp[m]}</span>
              </span>
            </label>
          ))}
          {needsQuote(maker) && (
            <div className="mt-2 flex flex-col gap-3">
              <Banner tone="warning" title="Video production is a separate service">
                {maker === "both" ? `The ${money(priceCents)} a month covers the videos you supply. ` : ""}
                Bluecut making your videos is priced on its own. Your account manager talks it through with you on your onboarding call, then sends you a quote. You pay nothing for production until you agree to the quote.
              </Banner>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={understood} onChange={(e) => onChange({ ...value, understood: e.target.checked })} className="mt-1 size-4 accent-primary-600 focus-visible:focus-ring" />
                <span className="text-body-sm text-primary">I understand that video production by Bluecut is a separate service, quoted after my onboarding call.</span>
              </label>
            </div>
          )}
        </fieldset>
      )}
    </div>
  );
}

/** What the client pays each month: the plan, plus the video add-on when it is on. */
export const monthlyTotal = (contract: Pick<Contract, "monthlyCents" | "videoAddon">, priceCents: number) => contract.monthlyCents + (contract.videoAddon ? addonCents(contract.videoAddon.maker, priceCents) : 0);

/** C13 Contract: the video add-on, on or off, who makes the videos, and the controls to change it. */
export function VideoAddonCard({ clientId, contract, priceCents }: { clientId: string; contract: Contract; priceCents: number }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AddonChoice>({ on: true, maker: contract.videoAddon?.maker ?? "client", understood: !!contract.videoAddon && needsQuote(contract.videoAddon.maker) });
  const addon = contract.videoAddon;
  const ended = ["cancelled", "completed"].includes(contract.status);

  return (
    <Card title="Video add-on" action={<Badge status={addon ? "success" : "neutral"}>{addon ? "On" : "Off"}</Badge>}>
      <div className="flex flex-col gap-4">
        {addon ? (
          <p className="text-body text-primary">
            {makerLabel[addon.maker]}.{" "}
            {addon.maker === "bluecut" ? "Video production is quoted separately." : `${money(priceCents)} a month on top of your plan${addon.maker === "both" ? ", plus video production, quoted separately" : ""}.`} Since {date(addon.since)}.
          </p>
        ) : (
          <p className="text-body-sm text-secondary">
            Add short videos to your plan for {money(priceCents)} a month. You can always use your own clips in posts without it.
          </p>
        )}
        {addon && needsQuote(addon.maker) && !editing && (
          <Banner tone="info">Your account manager agrees the video production with you and sends a quote. You pay nothing for production until you agree to it.</Banner>
        )}
        {editing && <VideoAddonPicker value={draft} priceCents={priceCents} onChange={setDraft} />}
        {!ended && (
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button
                  size="sm"
                  disabled={!draft.on || !addonReady(draft)}
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
