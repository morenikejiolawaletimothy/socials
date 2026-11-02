"use client";

import { CalendarBlank, Check, CheckCircle, Circle, CreditCard, Receipt, ShieldCheck } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PayDialog } from "@/components/client/PayDialog";
import { SetupFrame } from "@/components/client/SetupFrame";
import { VideoAddonPicker, addonCents, addonReady, makerLabel, needsQuote, type AddonChoice } from "@/components/client/VideoAddon";
import { Banner, Button, Input, useTask } from "@/components/ui";
import { date, fullName, money } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";
import { included, plans, type PlanId } from "@/lib/pricing";

const DAY = 86_400_000;

/** C4 Choose a plan, sign, pay now or later. The free 2 weeks start the day the contract is signed. */
export default function PlanPage() {
  const router = useRouter();
  const { client, user, contract } = useMyClient();
  const [step, setStep] = useState(contract && client?.setupDone.includes("plan") ? 2 : 0);
  const [planId, setPlanId] = useState<PlanId>("6m");
  const [video, setVideo] = useState<AddonChoice>({ on: false, maker: "client", understood: false });
  const [videoError, setVideoError] = useState(false);
  const videoPrice = useData().settings.videoAddonCents;
  const videoMonthly = video.on ? addonCents(video.maker, videoPrice) : 0;
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const { run, pending } = useTask();
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [now] = useState(() => Date.now());
  if (!client || !user) return null;

  const plan = plans.find((p) => p.id === planId)!;
  const freeEnds = new Date(now + 14 * DAY).toISOString();
  const ends = new Date(now + 14 * DAY + plan.months * 30 * DAY).toISOString();

  return (
    <SetupFrame title="Choose your plan and sign" step="Plan" steps={["Choose", "Review and sign", "Pay", "Done"]} current={step}>
      {step === 0 && (
        <div className="flex flex-col gap-6">
          <Banner tone="success">Your first 2 weeks are free, with the full service. Your contract starts after that.</Banner>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {plans.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer flex-col rounded-lg border transition-colors has-focus-visible:focus-ring ${planId === p.id ? "border-primary-600 bg-primary-50" : "border-border bg-card hover:border-primary-300"}`}
              >
                <input type="radio" name="plan" className="sr-only" checked={planId === p.id} onChange={() => setPlanId(p.id)} />
                <span className="flex flex-col gap-2 p-4">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-body font-medium text-primary">{p.label}</span>
                    {planId === p.id ? <CheckCircle className="size-5 shrink-0 text-primary-600" aria-hidden /> : <Circle className="size-5 shrink-0 text-neutral-300" aria-hidden />}
                  </span>
                  <span className="font-display text-display-xl text-primary">
                    {money(p.monthlyUsdCents)}
                    <span className="text-body-sm font-normal text-secondary"> a month</span>
                  </span>
                </span>
                <span className={`border-t p-4 text-body-sm text-secondary ${planId === p.id ? "border-primary-200" : "border-border"}`}>{p.summary}</span>
              </label>
            ))}
          </div>
          <VideoAddonPicker value={video} priceCents={videoPrice} onChange={setVideo} />
          <section className="flex flex-col rounded-md border border-border">
            <h3 className="border-b border-border px-4 py-3 text-body font-medium text-primary">Every plan includes</h3>
            <ul className="flex flex-col divide-y divide-border">
              {included.map((i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3 text-body-sm text-primary">
                  <Check className="size-4 shrink-0 text-primary-600" aria-hidden />
                  {i}
                </li>
              ))}
            </ul>
          </section>
          {videoError && !addonReady(video) && <p className="text-body-sm text-danger">Tick that you understand video production is quoted separately, or choose &ldquo;I will supply the videos&rdquo;.</p>}
          <Button className="self-start" onClick={() => (addonReady(video) ? setStep(1) : setVideoError(true))}>
            Continue
          </Button>
        </div>
      )}

      {step === 1 && (
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (name.trim().toLowerCase() !== fullName(user).toLowerCase()) return setError(`Type your full name as it appears on your account: ${fullName(user)}.`);
            const ok = await run(
              "sign",
              async () => {
                await act.signContract(client.id, plan.months, plan.monthlyUsdCents, name.trim(), video.on ? video.maker : undefined);
                await act.completeSetupStep(client.id, "plan");
              },
              "Signed. Your free 2 weeks have started.",
            );
            if (ok) setStep(2);
          }}
        >
          <Banner tone="info" title="You can pull out any time">
            We refund every paid month that has not started. If we have not received payment by {date(freeEnds)}, your account pauses until you pay, and picks up again as soon as you do.
          </Banner>
          <dl className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border">
            {[
              { label: "Plan", value: `${plan.label}, ${money(plan.monthlyUsdCents)} a month` },
              {
                label: "Video add-on",
                value: !video.on ? "Not added" : video.maker === "bluecut" ? "Quoted after your onboarding call" : `${money(videoPrice)} a month`,
                note: video.on ? `${makerLabel[video.maker]}${video.maker === "both" ? ". Production quoted after your onboarding call" : ""}` : undefined,
              },
              { label: "Free 2 weeks", value: `Today to ${date(freeEnds)}`, note: "With the full service" },
              { label: "Contract", value: `${date(freeEnds)} to ${date(ends)}` },
            ].map((row) => (
              <div key={row.label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-body-sm text-secondary">{row.label}</dt>
                <dd className="flex flex-col gap-1 sm:items-end sm:text-right">
                  <span className="text-body-sm font-medium text-primary">{row.value}</span>
                  {row.note && <span className="text-caption text-primary-600">{row.note}</span>}
                </dd>
              </div>
            ))}
            <div className="flex flex-col gap-1 bg-neutral-25 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <dt className="text-body font-medium text-primary">Total</dt>
              <dd className="flex flex-col gap-1 sm:items-end sm:text-right">
                <span className="text-body-lg font-medium text-primary">{money((plan.monthlyUsdCents + videoMonthly) * plan.months)}</span>
                {video.on && needsQuote(video.maker) && <span className="text-caption text-secondary">Plus video production once you agree a quote</span>}
              </dd>
            </div>
          </dl>
          <Input
            label="Sign with your full name"
            placeholder={fullName(user)}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
            error={error}
            help="Typing your name signs the contract."
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="submit" loading={pending("sign")}>
              {pending("sign") ? "Signing" : "Sign the contract"}
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <p className="text-body text-primary">Pay now, or later before your free 2 weeks end on {date(contract?.freeEndsAt ?? freeEnds)}. It is up to you.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => setPaying(true)}>
              Pay now
            </Button>
            <Button variant="secondary" onClick={() => setStep(3)}>
              Skip for now
            </Button>
          </div>
          <p className="text-caption text-secondary">We remind you 5 days and 3 days before, and on the last day.</p>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-8 text-success" aria-hidden />
            <p className="font-display text-display-lg text-primary">{paid ? "Signed and paid" : "Signed"}</p>
          </div>
          <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
            {[
              { icon: CalendarBlank, text: `Your free 2 weeks run to ${date(contract?.freeEndsAt ?? freeEnds)}.` },
              { icon: paid ? Receipt : CreditCard, text: paid ? "Your receipt is in Contract, and we emailed it to you." : "Pay any time from Contract. We will remind you." },
              { icon: ShieldCheck, text: "You can pull out any time from Contract." },
            ].map((row) => (
              <li key={row.text} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <row.icon className="size-4" aria-hidden />
                </span>
                <span className="text-body-sm text-primary">{row.text}</span>
              </li>
            ))}
          </ul>
          <Button className="self-start" onClick={() => router.push("/home")}>
            Continue setup
          </Button>
        </div>
      )}

      <PayDialog
        open={paying}
        onClose={() => setPaying(false)}
        onPaid={() => {
          setPaid(true);
          setStep(3);
        }}
        clientId={client.id}
        amountCents={plan.monthlyUsdCents + videoMonthly}
      />
    </SetupFrame>
  );
}
