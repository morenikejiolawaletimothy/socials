import type { WeekProgress } from "@/lib/mock";

/** #45: one rendered line of a scorecard. */
export type ScoreRow = { key: string; label: string; target: number; done: number };

type Line = { target: number; done: number };

const PROFILE: [string, string][] = [
  ["posts", "Posts"],
  ["comments", "Comments"],
  ["reactions", "Reactions"],
  ["follows", "Follows"],
  ["connections", "Connection requests"],
  ["saves", "Saved posts"],
  ["profileTasks", "Profile updates"],
];
const PAGE = PROFILE.filter(([k]) => k !== "profileTasks");

function build(card: Record<string, Line | undefined>, order: [string, string][]): ScoreRow[] {
  return order
    .map(([key, label]) => ({ key, label, target: card[key]?.target ?? 0, done: card[key]?.done ?? 0 }))
    .filter((r) => r.target > 0 || r.done > 0);
}

/** The personal-profile scorecard lines that have any target or activity this week. */
export function profileScore(week: WeekProgress): ScoreRow[] {
  return build(week as unknown as Record<string, Line>, PROFILE);
}

/** The company-Page scorecard lines, when the Page add-on is on. */
export function pageScore(week: WeekProgress): ScoreRow[] {
  return week.page ? build(week.page as unknown as Record<string, Line>, PAGE) : [];
}

/** Totals across both scorecards, for a single progress figure (owner/manager lists). */
export function scoreTotals(week: WeekProgress): { done: number; target: number } {
  return [...profileScore(week), ...pageScore(week)].reduce((acc, r) => ({ done: acc.done + r.done, target: acc.target + r.target }), { done: 0, target: 0 });
}
