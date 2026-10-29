"use client";

import { Check, CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PayDialog } from "@/components/client/PayDialog";
import { SetupFrame } from "@/components/client/SetupFrame";
import { Banner, Button, Input, useTask } from "@/components/ui";
import { date, fullName, money } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";
import { included, plans, type PlanId } from "@/lib/pricing";

const DAY = 86_400_000;

/** C4 Choose a plan, sign, pay now or later. The free 2 weeks start the day the contract is signed. */
export default function PlanPage() {
  const router = useRouter();
  const { client, user, contract } = useMyClient();
  const [step, setStep] = useState(contract && client?.setupDone.includes("plan") ? 2 : 0);
  const [planId, setPlanId] = useState<PlanId>("6m");
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
                className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors ${planId === p.id ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}
              >
                <input type="radio" name="plan" className="sr-only" checked={planId === p.id} onChange={() => setPlanId(p.id)} />
                <span className="flex items-center justify-between">
                  <span className="text-body font-medium text-primary">{p.label}</span>
                  {planId === p.id && <CheckCircle className="size-5 text-primary-600" aria-hidden />}
                </span>
                <span className="font-display text-display-xl text-primary">
                  {money(p.monthlyUsdCents)}
                  <span className="text-body-sm font-normal text-secondary"> a month</span>
                </span>
                <span className="text-body-sm text-secondary">{p.summary}</span>
              </label>
            ))}
          </div>
          <ul className="flex flex-col gap-2">
            {included.map((i) => (
              <li key={i} className="flex items-center gap-2 text-body-sm text-primary">
                <Check className="size-4 text-success" aria-hidden /> {i}
              </li>
            ))}
          </ul>
          <Button className="self-start" onClick={() => setStep(1)}>
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
                await act.signContract(client.id, plan.months, plan.monthlyUsdCents, name.trim());
                await act.completeSetupStep(client.id, "plan");
              },
              "Signed. Your free 2 weeks have started.",
            );
            if (ok) setStep(2);
          }}
        >
          <dl className="grid grid-cols-1 gap-4 rounded-md border border-border p-4 sm:grid-cols-2">
            {[
              ["Plan", `${plan.label}, ${money(plan.monthlyUsdCents)} a month`],
              ["Free 2 weeks", `Today to ${date(freeEnds)}, with the full service`],
              ["Contract", `${date(freeEnds)} to ${date(ends)}`],
              ["Total", money(plan.monthlyUsdCents * plan.months)],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <dt className="text-caption text-secondary">{k}</dt>
                <dd className="text-body text-primary">{v}</dd>
              </div>
            ))}
          </dl>
          <Banner tone="info" title="You can pull out any time">
            We refund every paid month that has not started. If we have not received payment by {date(freeEnds)}, your account pauses until you pay, and picks up again as soon as you do.
          </Banner>
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
          <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-primary">
            <li>Your free 2 weeks run to {date(contract?.freeEndsAt ?? freeEnds)}.</li>
            <li>{paid ? "Your receipt is in Contract, and we emailed it to you." : "Pay any time from Contract. We will remind you."}</li>
            <li>You can pull out any time from Contract.</li>
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
        amountCents={plan.monthlyUsdCents}
      />
    </SetupFrame>
  );
}
