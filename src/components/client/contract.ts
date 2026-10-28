import type { Contract, Invoice } from "@/lib/mock";

const MONTH = 30 * 86_400_000;

/**
 * C13 refund rule. During the free 2 weeks: everything stops, and anything paid is refunded.
 * After the contract starts: service runs to the end of the current month, and every paid month not yet started is refunded.
 */
export function pullOutTerms(contract: Contract, invoices: Invoice[]) {
  const paidCents = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amountCents, 0);
  if (contract.status === "free" || Date.now() < new Date(contract.startsAt).getTime()) {
    return {
      inFree: true,
      currentMonth: 0,
      endsAt: new Date().toISOString(),
      refundCents: paidCents,
      explain: paidCents ? "You are in your free 2 weeks, so everything stops now and you get back everything you paid." : "You are in your free 2 weeks and have not paid, so there is nothing to refund.",
    };
  }
  const currentMonth = Math.min(contract.months, Math.floor((Date.now() - new Date(contract.startsAt).getTime()) / MONTH) + 1);
  const endsAt = new Date(new Date(contract.startsAt).getTime() + currentMonth * MONTH).toISOString();
  const paidMonths = Math.round(paidCents / contract.monthlyCents);
  const refundMonths = Math.max(0, paidMonths - currentMonth);
  return {
    inFree: false,
    currentMonth,
    endsAt,
    refundCents: refundMonths * contract.monthlyCents,
    explain: refundMonths
      ? `Service runs to the end of month ${currentMonth}. You paid for ${refundMonths} more ${refundMonths === 1 ? "month" : "months"} that will not start, so we refund them.`
      : `Service runs to the end of month ${currentMonth}. Nothing more is charged after that. You have not paid ahead, so there is nothing to refund.`,
  };
}
