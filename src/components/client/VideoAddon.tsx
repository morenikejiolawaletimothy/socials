"use client";

import { VideoCamera } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { Badge, Button, Card, InfoTip, useConfirm, useTask } from "@/components/ui";
import { date, money } from "@/lib/format";
import { act, type Contract } from "@/lib/mock";

export type Maker = NonNullable<Contract["videoAddon"]>["maker"];

export const makerLabel: Record<Maker, string> = {
  client: "I will supply the videos",
  bluecut: "Bluecut makes the videos",
  both: "Both: I supply some, Bluecut makes some",
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
  const checkboxId = useId();
  return (
    <div className={`flex flex-col rounded-lg border bg-card transition-colors ${on ? "border-primary-600" : "border-border hover:border-primary-300"}`}>
      {/* htmlFor ties the label to the checkbox, so the info button inside it does not take over the label. */}
      <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-4 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
          <VideoCamera className="size-5" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2 text-body font-medium text-primary">
            Add video
            <InfoTip label="About video production">
              Video production is a separate service. {on && maker === "both" ? `The ${money(priceCents)} a month covers the videos you supply. ` : ""}
              Bluecut making your videos is priced on its own. Your account manager talks it through with you on your onboarding call, then sends you a quote. You pay nothing for production until you agree to the quote.
            </InfoTip>
          </span>
          <span className="text-body-sm text-secondary">{on ? priceTag(maker, priceCents) : `From ${money(priceCents)} a month`}</span>
        </span>
        <input id={checkboxId} type="checkbox" checked={on} onChange={(e) => onChange({ ...value, on: e.target.checked })} className="size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
      </label>
      {on && (
        <div className="border-t border-border p-4">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-body font-medium text-primary">Who makes the videos?</legend>
            {(Object.keys(makerLabel) as Maker[]).map((m) => (
              <label key={m} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${maker === m ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                <input type="radio" name="video-maker" checked={maker === m} onChange={() => onChange({ on: true, maker: m, understood: false })} className="mt-1 size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-body font-medium text-primary">{makerLabel[m]}</span>
                  <span className="text-body-sm text-secondary">{priceTag(m, priceCents)}</span>
                </span>
              </label>
            ))}
            {needsQuote(maker) && (
              <div className="mt-1 flex flex-col gap-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={understood} onChange={(e) => onChange({ ...value, understood: e.target.checked })} className="mt-1 size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
                  <span className="text-body-sm text-primary">I understand that video production by Bluecut is a separate service, quoted after my onboarding call.</span>
                </label>
              </div>
            )}
          </fieldset>
        </div>
      )}
    </div>
  );
}

/** What the client pays each month: the plan, plus the video add-on when it is on. */
export const monthlyTotal = (contract: Pick<Contract, "monthlyCents" | "videoAddon">, priceCents: number) => contract.monthlyCents + (contract.videoAddon ? addonCents(contract.videoAddon.maker, priceCents) : 0);

/** What the client pays for the whole contract, at once and up front: the monthly total times 3, 6 or 12 months. */
export const contractTotal = (contract: Pick<Contract, "monthlyCents" | "videoAddon" | "months">, priceCents: number) => monthlyTotal(contract, priceCents) * contract.months;

/** C13 Contract: the video add-on, on or off, who makes the videos, and the controls to change it. */
export function VideoAddonCard({ clientId, contract, priceCents }: { clientId: string; contract: Contract; priceCents: number }) {
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AddonChoice>({ on: true, maker: contract.videoAddon?.maker ?? "client", understood: !!contract.videoAddon && needsQuote(contract.videoAddon.maker) });
  const addon = contract.videoAddon;
  const ended = ["cancelled", "completed"].includes(contract.status);

  return (
    <Card
      title="Video add-on"
      action={<Badge status={addon ? "success" : "neutral"}>{addon ? "On" : "Off"}</Badge>}
      info={addon && needsQuote(addon.maker) && !editing ? "Your account manager agrees the video production with you and sends a quote. You pay nothing for production until you agree to it." : undefined}
    >
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
