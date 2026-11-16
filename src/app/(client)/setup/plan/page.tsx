"use client";

import { Briefcase, Buildings, Check, CheckCircle, GraduationCap, Target } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PayForm } from "@/components/client/PayDialog";
import { CheckRow, OptionCard, SetupFrame } from "@/components/client/SetupFrame";
import { Button, Input, Select, useTask } from "@/components/ui";
import { date, fullName, money } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";
import { accountTypes, addOns, contractTotalCents, included, plans, type AddOnId, type PlanId } from "@/lib/pricing";

const DAY = 86_400_000;
const addOnIcon: Record<AddOnId, typeof Buildings> = { "company-page": Buildings, "sales-navigator": Target, recruiter: Briefcase, learning: GraduationCap };
const sections = ["Select account type", "Select contract duration", "Review and sign contract", "Payment", ""];

/**
 * Figma "Choose your preferred plan": account type and add-ons → contract length → review and sign → pay
 * now or later → done. Signing starts the free 2 weeks and assigns the account manager.
 */
export default function PlanPage() {
  const router = useRouter();
  const { client, user, contract } = useMyClient();
  const planDone = Boolean(contract && client?.setupDone.includes("plan"));
  const [step, setStep] = useState(planDone ? (contract?.paid ? 4 : 3) : 0);
  const [service, setService] = useState<"self-serve" | "full-service">(client?.service ?? "self-serve");
  const [chosen, setChosen] = useState<Partial<Record<AddOnId, number>>>(client?.companyPage ? { "company-page": 1 } : {});
  const [planId, setPlanId] = useState<PlanId>("6m");
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [paid, setPaid] = useState(Boolean(contract?.paid));
  const { run, pending } = useTask();
  const [now] = useState(() => Date.now());
  if (!client || !user) return null;

  const plan = plans.find((p) => p.id === planId)!;
  const type = accountTypes.find((t) => t.id === service)!;
  const lines = addOns.filter((a) => chosen[a.id]).map((a) => ({ ...a, qty: chosen[a.id]!, total: a.cents * chosen[a.id]! }));
  const freeEnds = contract?.freeEndsAt ?? new Date(now + 14 * DAY).toISOString();
  const ends = contract?.endsAt ?? new Date(now + 14 * DAY + plan.months * 30 * DAY).toISOString();
  const total = contract ? contractTotalCents(contract) : plan.monthlyUsdCents * plan.months + lines.reduce((s, l) => s + l.total, 0);
  const percent = [0, 25, 50, 75, 100][step];

  const toggle = (id: AddOnId, on: boolean) => setChosen((c) => ({ ...c, [id]: on ? (c[id] ?? 1) : undefined }));

  async function sign(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().toLowerCase() !== fullName(user!).toLowerCase()) return setError(`Type your full name as it is on your account: ${fullName(user!)}.`);
    const ok = await run(
      "sign",
      () => act.choosePlan(client!.id, { service, addOns: lines.map((l) => ({ id: l.id, qty: l.qty })), months: plan.months, monthlyCents: plan.monthlyUsdCents, signedName: name.trim() }),
      "Signed. Your free 2 weeks have started.",
    );
    if (ok) setStep(3);
  }

  const back = (to: number) => (
    <Button variant="ghost" onClick={() => setStep(to)}>
      Back
    </Button>
  );

  return (
    <SetupFrame
      title="Choose your preferred plan"
      info={`Your first 2 weeks are free, with the full service. Your contract starts after that. If we have not received payment by ${date(freeEnds)}, your account pauses until you pay. We remind you 5 days and 3 days before, and on the last day.`}
      crumb="Choose your preferred plan"
      percent={percent}
      stepsLeft={4 - Math.min(step, 4)}
      section={sections[step] || undefined}
      sectionInfo={
        step === 0
          ? "Regular: we prepare everything and you post it yourself. Premium: we do it all on your LinkedIn, with your approval. You can switch later from Contract."
          : step === 1
            ? "A longer contract costs less a month. Every plan includes the same service."
            : step === 2
              ? "Check the details, then type your full name to sign."
              : step === 3
                ? "Payments are handled by Stripe. We never store your card number."
                : undefined
      }
      footer={
        step === 0 ? (
          <>
            <Button variant="ghost" onClick={() => router.push("/home")}>
              Back
            </Button>
            <Button onClick={() => setStep(1)}>Proceed</Button>
          </>
        ) : step === 1 ? (
          <>
            {back(0)}
            <Button onClick={() => setStep(2)}>Proceed</Button>
          </>
        ) : step === 2 ? (
          <>
            {back(1)}
            <Button type="submit" form="sign-form" loading={pending("sign")}>
              {pending("sign") ? "Signing" : "Sign the contract"}
            </Button>
          </>
        ) : step === 3 ? undefined : (
          <Button onClick={() => router.push("/home")}>Continue onboarding</Button>
        )
      }
    >
      {step === 0 && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {accountTypes.map((t) => (
              <OptionCard key={t.id} name="account-type" checked={service === t.id} onChange={() => setService(t.id)} eyebrow={t.label} title={t.tagline}>
                {t.summary}
              </OptionCard>
            ))}
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-body font-semibold text-primary">Add-ons</legend>
            {addOns.map((a) => {
              const Icon = addOnIcon[a.id];
              const on = Boolean(chosen[a.id]);
              return (
                <CheckRow
                  key={a.id}
                  checked={on}
                  onChange={(v) => toggle(a.id, v)}
                  icon={<Icon className="size-5" aria-hidden />}
                  label={`${a.label} (+${money(a.cents)}${a.perPage ? " per page" : ""})`}
                  help={a.summary}
                  extra={
                    a.perPage && on ? (
                      <Select label="How many pages?" value={String(chosen[a.id])} onChange={(e) => setChosen((c) => ({ ...c, [a.id]: Number(e.target.value) }))} wrapperClassName="w-full sm:w-40">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "page" : "pages"}
                          </option>
                        ))}
                      </Select>
                    ) : undefined
                  }
                />
              );
            })}
          </fieldset>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {plans.map((p) => (
              <OptionCard
                key={p.id}
                name="duration"
                checked={planId === p.id}
                onChange={() => setPlanId(p.id)}
                eyebrow={p.tier}
                title={
                  <span className="flex flex-col gap-1">
                    <span>{p.label}</span>
                    <span>
                      <span className="font-display text-display-xl">{money(p.monthlyUsdCents)}</span>
                      <span className="text-body-sm font-normal text-secondary">/mo</span>
                    </span>
                  </span>
                }
              >
                {p.summary}
              </OptionCard>
            ))}
          </div>
          <section className="flex flex-col rounded-md border border-border">
            <h4 className="border-b border-border px-4 py-3 text-body font-semibold text-primary">Every plan includes</h4>
            <ul className="flex flex-col gap-3 px-4 py-4">
              {included.map((i) => (
                <li key={i} className="flex items-center gap-3 text-body-sm text-primary">
                  <Check className="size-4 shrink-0 text-primary-600" aria-hidden />
                  {i}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {step === 2 && (
        <form id="sign-form" noValidate onSubmit={sign} className="flex flex-col gap-6">
          <dl className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border">
            {[
              { label: "Account type", value: `${type.label} (${type.tagline})` },
              { label: `${plan.tier} plan`, value: `${plan.label}, ${money(plan.monthlyUsdCents)}/mo` },
              ...lines.map((l) => ({ label: `Add-on (${l.label})`, value: `${money(l.total)} (x${l.qty})` })),
              { label: "Free 2 weeks", value: `From today to ${date(freeEnds)}` },
              { label: "Contract", value: `${date(freeEnds)} to ${date(ends)}` },
            ].map((row) => (
              <div key={row.label} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3">
                <dt className="text-body-sm text-secondary">{row.label}</dt>
                <dd className="text-right text-body-sm font-medium text-primary">{row.value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-6 bg-neutral-25 px-4 py-3">
              <dt className="text-body font-semibold text-primary">Total</dt>
              <dd className="text-right font-display text-display-lg text-primary">{money(total)}</dd>
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
        </form>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <PayForm
            clientId={client.id}
            amountCents={total}
            onPaid={() => {
              setPaid(true);
              setStep(4);
            }}
            actions={(busy) => (
              <>
                <p className="text-body-sm text-secondary">Pay now, or later before your free 2 weeks end on {date(freeEnds)}.</p>
                <div className="-mx-4 -mb-4 flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:-mx-6 sm:px-6">
                  <Button variant="ghost" disabled={busy} onClick={() => setStep(4)}>
                    Pay later
                  </Button>
                  <Button type="submit" loading={busy}>
                    {busy ? "Paying" : `Pay ${money(total)}`}
                  </Button>
                </div>
              </>
            )}
          />
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle className="size-12 text-success" weight="regular" aria-hidden />
          <p className="font-display text-display-lg text-primary">{paid ? "Signed and paid" : "Your plan is set"}</p>
          <p className="max-w-sm text-body-sm text-secondary">
            {paid ? "Your receipt is in Contract, and we emailed it to you." : `Your free 2 weeks run to ${date(freeEnds)}. Pay any time from Contract.`} Next, set up access to your LinkedIn.
          </p>
        </div>
      )}
    </SetupFrame>
  );
}
