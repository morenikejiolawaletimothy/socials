"use client";

import { LockSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { Button, Dialog, Input, useToast } from "@/components/ui";
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
    <Dialog open={open} onClose={onClose} title={title}>
      <form
        noValidate
        className="flex flex-col gap-4"
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
        <p className="text-body text-primary">
          Amount: <span className="font-medium">{money(amountCents)}</span>
        </p>
        <Input label="Card number" inputMode="numeric" autoComplete="cc-number" value={card} onChange={(e) => setCard(e.target.value)} error={error} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Expiry" autoComplete="cc-exp" value={exp} onChange={(e) => setExp(e.target.value)} />
          <Input label="Security code" inputMode="numeric" autoComplete="cc-csc" value={cvc} onChange={(e) => setCvc(e.target.value)} />
        </div>
        <p className="flex items-center gap-2 text-caption text-secondary">
          <LockSimple className="size-4" aria-hidden /> Payments are handled by Stripe. We never store your card number.
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {busy ? "Paying" : `Pay ${money(amountCents)}`}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
