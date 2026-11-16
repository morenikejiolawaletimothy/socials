// Single source of plan prices. Phase 1: dummy USD amounts.
// Phase 2: amounts come from Stripe, which shows each visitor their local currency
// (and fixed NGN prices for Nigeria). Screens only call these functions.

export type PlanId = "3m" | "6m" | "12m";

export type Plan = {
  id: PlanId;
  months: 3 | 6 | 12;
  label: string;
  /** Short tier name shown above the chosen plan card. */
  tier: string;
  /** Monthly price in minor units (cents), USD base. */
  monthlyUsdCents: number;
  summary: string;
};

export const plans: Plan[] = [
  { id: "3m", months: 3, label: "3 months", tier: "Starter", monthlyUsdCents: 90000, summary: "Get set up and build a steady presence." },
  { id: "6m", months: 6, label: "6 months", tier: "Standard", monthlyUsdCents: 80000, summary: "Time to build real momentum toward your goal." },
  { id: "12m", months: 12, label: "12 months", tier: "Steady", monthlyUsdCents: 70000, summary: "Become a known voice in your field." },
];

export const included = [
  "A dedicated account manager",
  "Audit and strategy, with weekly targets you can track",
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

/** Figma "Add-ons": optional extras chosen with the plan. Charged once, on top of the contract total. */
export type AddOnId = "company-page" | "sales-navigator" | "recruiter" | "learning";
export type AddOn = { id: AddOnId; label: string; summary: string; cents: number; perPage?: boolean };

export const addOns: AddOn[] = [
  { id: "company-page", label: "Company page", summary: "We run your company page too", cents: 40000, perPage: true },
  { id: "sales-navigator", label: "Sales Navigator", summary: "Find and reach the right buyers", cents: 30000 },
  { id: "recruiter", label: "Recruiter tools", summary: "Hire through LinkedIn Recruiter", cents: 20000 },
  { id: "learning", label: "LinkedIn Learning and creator", summary: "Courses, creator mode and newsletters", cents: 100000 },
];

/** Account types, as the Figma names them. Regular = self-serve, Premium = full-service. */
export const accountTypes = [
  { id: "self-serve" as const, label: "Regular", tagline: "You do it yourself", summary: "We prepare everything. You post, comment and update yourself in a few taps." },
  { id: "full-service" as const, label: "Premium", tagline: "We do it for you", summary: "We prepare and do everything on your LinkedIn. You only approve what goes out." },
];

/** The whole contract, paid up front: the months plus any add-ons. */
export function contractTotalCents(k: { monthlyCents: number; months: number; addOns?: { cents: number }[] }) {
  return k.monthlyCents * k.months + (k.addOns ?? []).reduce((s, a) => s + a.cents, 0);
}
