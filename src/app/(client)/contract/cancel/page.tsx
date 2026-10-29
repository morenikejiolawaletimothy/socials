"use client";

import { CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { pullOutTerms } from "@/components/client/contract";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Banner, Breadcrumbs, Button, Card, EmptyState, Stepper, Textarea, buttonClass, useTask } from "@/components/ui";
import { date, money } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

const reasons = ["Not seeing results", "Too expensive", "Not enough time to review", "Not happy with my manager", "No longer need it", "Other"];

/** One offer per reason, never more than one screen. */
const offers: Record<string, { title: string; text: string; yes: string; href: string }> = {
  "Not seeing results": { title: "Talk to the owner first?", text: "A 15-minute call with Fola, who runs Bluecut, to look at your results and what to change.", yes: "Book a call with the owner", href: "/messages" },
  "Too expensive": { title: "Talk to the owner first?", text: "Fola can look at a plan that fits better.", yes: "Book a call with the owner", href: "/messages" },
  "Not enough time to review": { title: "Let your manager go ahead instead?", text: "Choose \"Go ahead if I have not replied within 24 hours\", and review only when you can.", yes: "Change how I review", href: "/control" },
  "Not happy with my manager": { title: "Change your manager instead?", text: "We hand everything over to a new manager, so nothing is lost.", yes: "Ask for a different manager", href: "/contract" },
  "No longer need it": { title: "Pause posting instead?", text: "Take a quiet break without losing your strategy or your manager.", yes: "Pause posting", href: "/control" },
  Other: { title: "Talk to the owner first?", text: "Tell Fola what is wrong. Most things can be fixed.", yes: "Message us", href: "/messages" },
};

/** C13 Pull out, in 3 short steps: why, can we fix this, what happens. */
export default function CancelPage() {
  const { client, contract, invoices } = useMyClient();
  const { run, pending } = useTask();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  if (!client) return null;
  if (!contract || (contract.status === "cancelled" && !done))
    return (
      <Columns {...rails.clientSettings}>
        <EmptyState
          title={contract ? "You have already pulled out" : "You do not have a contract yet"}
          action={
            <Link href={contract ? "/contract" : "/setup/plan"} className={buttonClass("secondary")}>
              {contract ? "Go to Contract" : "Choose a plan"}
            </Link>
          }
        >
          {contract ? "Your service runs to the end date shown in Contract. You can still change your mind there." : "There is nothing to pull out of. You can choose a plan when you are ready."}
        </EmptyState>
      </Columns>
    );
  const terms = pullOutTerms(contract, invoices);
  const offer = offers[reason] ?? offers.Other;

  return (
    <Columns {...rails.clientSettings}>
      <Card title="Pull out of your contract" eyebrow={<Breadcrumbs items={[{ label: "Contract", href: "/contract" }, { label: "Pull out" }]} />}>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="size-12 text-success" aria-hidden />
            <p className="font-display text-display-lg text-primary">You have pulled out</p>
            <p className="max-w-md text-body-sm text-secondary">
              {terms.inFree ? "Everything has stopped." : `Service runs to ${date(terms.endsAt)}.`} {terms.refundCents ? `Your refund of ${money(terms.refundCents)} is on its way. We email you when it is paid.` : ""}
            </p>
            <Link href="/home" className="rounded-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <Stepper steps={["Why", "Can we fix it", "What happens"]} current={step} />

            {step === 0 && (
              <div className="flex flex-col gap-4">
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 font-display text-display-lg text-primary">Why are you leaving?</legend>
                  {reasons.map((r) => (
                    <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${reason === r ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-300"}`}>
                      <input type="radio" name="reason" checked={reason === r} onChange={() => { setReason(r); setError(undefined); }} className="size-4 accent-primary-600" />
                      <span className="text-body text-primary">{r}</span>
                    </label>
                  ))}
                  {error && <p className="text-body-sm text-danger">{error}</p>}
                </fieldset>
                <Textarea label="Anything else? (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                <Button className="self-start" onClick={() => (reason ? setStep(1) : setError("Choose a reason. It helps us get better."))}>
                  Continue
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-display-lg text-primary">{offer.title}</h3>
                <p className="text-body text-primary">{offer.text}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={offer.href}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-strong bg-card px-5 py-3 text-body font-medium text-primary-700 transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:focus-ring"
                  >
                    {offer.yes}
                  </Link>
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    No, continue to pull out
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <h3 className="font-display text-display-lg text-primary">Here is what happens</h3>
                <dl className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <dt className="text-caption text-secondary">Service ends</dt>
                    <dd className="text-body text-primary">{terms.inFree ? "Now" : date(terms.endsAt)}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-caption text-secondary">What stops</dt>
                    <dd className="text-body text-primary">Posts, engagement and quick tasks. Scheduled posts after the end date are cancelled.</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-caption text-secondary">Your refund</dt>
                    <dd className="text-body text-primary">{money(terms.refundCents)}</dd>
                    <dd className="text-body-sm text-secondary">{terms.explain}</dd>
                  </div>
                </dl>
                <Banner tone="info" title="Your data">
                  Your account stays open until the end date. Download anything you want to keep from Account.
                </Banner>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="danger"
                    loading={pending("cancel")}
                    onClick={async () => {
                      if (await run("cancel", () => act.cancelContract(client.id, reason, note.trim() || undefined), "You have pulled out. We have emailed you the details.")) setDone(true);
                    }}
                  >
                    {pending("cancel") ? "Confirming" : "Confirm and pull out"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </Columns>
  );
}
