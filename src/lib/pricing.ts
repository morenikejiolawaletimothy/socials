// Single source of plan prices. Phase 1: dummy USD amounts.
// Phase 2: amounts come from Stripe, which shows each visitor their local currency
// (and fixed NGN prices for Nigeria). Screens only call these functions.

export type PlanId = "3m" | "6m" | "12m";

export type Plan = {
  id: PlanId;
  months: 3 | 6 | 12;
  label: string;
  /** Monthly price in minor units (cents), USD base. */
  monthlyUsdCents: number;
  summary: string;
};

export const plans: Plan[] = [
  { id: "3m", months: 3, label: "3 months", monthlyUsdCents: 90000, summary: "Get set up and build a steady presence." },
  { id: "6m", months: 6, label: "6 months", monthlyUsdCents: 80000, summary: "Time to build real momentum toward your goal." },
  { id: "12m", months: 12, label: "12 months", monthlyUsdCents: 70000, summary: "Become a known voice in your field." },
];

export const included = [
  "A dedicated account manager",
  "Your strategy, with weekly targets you can track",
  "Posts written in your voice, approved by you",
  "Engagement with the right people",
  "Weekly and monthly progress updates",
];

/** Currency shown to the visitor. Phase 2 reads this from Stripe. */
export function displayCurrency(): string {
  return "USD";
}

export function formatPrice(cents: number, currency = displayCurrency()) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export function planTotalCents(plan: Plan) {
  return plan.monthlyUsdCents * plan.months;
}
