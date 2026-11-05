"use client";

import { CalendarBlank, Check, CheckCircle, CreditCard, Receipt, ShieldCheck } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PayDialog } from "@/components/client/PayDialog";
import { SetupFrame } from "@/components/client/SetupFrame";
import { VideoAddonPicker, addonCents, addonReady, type AddonChoice } from "@/components/client/VideoAddon";
import { Button, Input, useTask } from "@/components/ui";
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
    <SetupFrame
      title="Choose your plan and sign"
      step="Plan"
      steps={["Choose", "Review and sign", "Pay", "Done"]}
      current={step}
      info={`Your first 2 weeks are free, with the full service. Your contract starts after that. We refund every paid month that has not started. If we have not received payment by ${date(contract?.freeEndsAt ?? freeEnds)}, your account pauses until you pay, and picks up again as soon as you do. We remind you 5 days and 3 days before, and on the last day.`}
    >
      {step === 0 && (
        <div className="flex flex-col gap-6">
          {/* Same arrangement as the service choice: the chosen plan sits in a light blue frame with a label above and a note below. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
            {plans.map((p) => {
              const on = planId === p.id;
              const card = (
                <div
                  onClick={on ? undefined : () => setPlanId(p.id)}
                  className={`flex flex-col gap-5 rounded-lg border bg-card p-5 transition-colors ${on ? "border-primary-600" : "cursor-pointer border-border hover:border-primary-300"}`}
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="text-body-lg font-semibold text-primary">{p.label}</h3>
                    <p className="text-primary">
                      <span className="font-display text-display-xl">{money(p.monthlyUsdCents)}</span>
                      <span className="text-body-sm text-secondary"> a month</span>
                    </p>
                  </div>
                  {!on && (
                    <Button variant="secondary" fullWidth className="border-primary-600!" onClick={() => setPlanId(p.id)}>
                      Choose this
                    </Button>
                  )}
                  <p className="text-body-sm text-secondary">{p.summary}</p>
                </div>
              );

              if (!on) return <div key={p.id}>{card}</div>;

              return (
                <div key={p.id} className="flex flex-col rounded-xl border border-primary-200 bg-primary-50 p-1">
                  <p className="py-2 text-center text-caption font-medium uppercase tracking-wide text-primary-700">{p.tier}</p>
                  {card}
                  <p className="px-4 py-3 text-center text-body-sm text-primary-700">
                    Contract {date(freeEnds)} to {date(ends)}
                  </p>
                </div>
              );
            })}
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
          <dl className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border">
            {[
              { label: "Plan", value: `${plan.label}, ${money(plan.monthlyUsdCents)} a month` },
              { label: "Video add-on", value: !video.on ? "Not added" : video.maker === "bluecut" ? "Quoted after your onboarding call" : `${money(videoPrice)} a month` },
              { label: "Free 2 weeks", value: `Today to ${date(freeEnds)}` },
              { label: "Contract", value: `${date(freeEnds)} to ${date(ends)}` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-6 px-5 py-4">
                <dt className="text-body-sm text-secondary">{row.label}</dt>
                <dd className="text-right text-body-sm font-medium text-primary">{row.value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-6 bg-neutral-25 px-5 py-4">
              <dt className="text-body font-semibold text-primary">Total</dt>
              <dd className="text-right font-display text-display-lg text-primary">{money((plan.monthlyUsdCents + videoMonthly) * plan.months)}</dd>
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
          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
            <Button type="submit" loading={pending("sign")}>
              {pending("sign") ? "Signing" : "Sign the contract"}
            </Button>
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <p className="text-body text-primary">Pay now, or later before your free 2 weeks end on {date(contract?.freeEndsAt ?? freeEnds)}. It is up to you.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button onClick={() => setPaying(true)}>
              Pay now
            </Button>
            <Button variant="secondary" onClick={() => setStep(3)}>
              Skip for now
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-3 text-center">
            <p className="font-display text-display-lg text-primary">{paid ? "Signed and paid" : "Signed"}</p>
            <CheckCircle className="size-8 shrink-0 text-success" aria-hidden />
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
