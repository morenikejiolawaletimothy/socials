"use client";

import { CreditCard, LockSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { Button, Dialog, useToast } from "@/components/ui";
import { money } from "@/lib/format";
import { act } from "@/lib/mock";

/**
 * Card payment. Phase 1 fakes it: any card works except 4000 0000 0000 0002, which is declined, so the
 * "payment failed" state can be seen. Phase 2 uses Stripe's own card form.
 */
export function PayDialog({
  open,
  onClose,
  onPaid,
  clientId,
  amountCents,
  title = "Pay now",
}: {
  open: boolean;
  onClose: () => void;
  onPaid?: () => void;
  clientId: string;
  amountCents: number;
  title?: string;
}) {
  const toast = useToast();
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [exp, setExp] = useState("12 / 28");
  const [cvc, setCvc] = useState("123");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} title={title} info="Payments are handled by Stripe. We never store your card number." infoIcon={LockSimple}>
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(undefined);
          if (card.replace(/\s/g, "").length < 15) return setError("Enter the full card number.");
          setBusy(true);
          await new Promise((r) => setTimeout(r, 700));
          if (card.replace(/\s/g, "") === "4000000000000002") {
            setBusy(false);
            return setError("Your card was declined. Try again, or use another card.");
          }
          try {
            await act.payNow(clientId);
          } catch {
            setBusy(false);
            return setError("We could not reach the payment service. Nothing was charged. Try again in a moment.");
          }
          setBusy(false);
          onClose();
          onPaid?.();
          toast("Payment received. Your receipt is in Contract.");
        }}
      >
        {/* Standard checkout: what you pay, one grouped card field, the security note, then the pay button. */}
        <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-neutral-25 px-4 py-3">
          <span className="text-body-sm text-secondary">Amount due today</span>
          <span className="font-display text-display-lg text-primary">{money(amountCents)}</span>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-body-sm leading-5 font-medium text-primary">Card details</legend>
          <div className={`flex flex-col overflow-hidden rounded-sm border bg-card shadow-sm has-focus-visible:focus-ring ${error ? "border-danger" : "border-border-strong"}`}>
            <label className="flex items-center gap-3 border-b border-border px-4">
              <span className="sr-only">Card number</span>
              <input
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 1234 1234 1234"
                value={card}
                onChange={(e) => setCard(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "pay-error" : undefined}
                className="h-11 min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-neutral-400"
              />
              <CreditCard className="size-5 shrink-0 text-secondary" aria-hidden />
            </label>
            <div className="grid grid-cols-2 divide-x divide-border">
              <label className="flex px-4">
                <span className="sr-only">Expiry</span>
                <input autoComplete="cc-exp" placeholder="MM / YY" value={exp} onChange={(e) => setExp(e.target.value)} className="h-11 w-full bg-transparent text-body text-primary outline-none placeholder:text-neutral-400" />
              </label>
              <label className="flex px-4">
                <span className="sr-only">Security code</span>
                <input inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} className="h-11 w-full bg-transparent text-body text-primary outline-none placeholder:text-neutral-400" />
              </label>
            </div>
          </div>
          {error && (
            <span id="pay-error" className="text-body-sm text-danger">
              {error}
            </span>
          )}
        </fieldset>

        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" fullWidth loading={busy}>
            {busy ? "Paying" : `Pay ${money(amountCents)}`}
          </Button>
          <Button variant="cancel" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
