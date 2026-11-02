import type { Activity, Update } from "@/lib/mock";

/** The groups a report lists activity under, in this order. "setting" and "account" are housekeeping, so reports leave them out. */
export const activityGroups: { label: string; kinds: Activity["kind"][] }[] = [
  { label: "Posts", kinds: ["post"] },
  { label: "Reactions, comments and reposts", kinds: ["engagement"] },
  { label: "Connections", kinds: ["connection"] },
  { label: "Follow-ups and messages", kinds: ["follow-up", "message"] },
  { label: "Events and programs", kinds: ["event"] },
  { label: "Profile", kinds: ["profile"] },
  { label: "Calls", kinds: ["call"] },
];

const DAY = 86_400_000;

/** The time a report covers: the 7 days (weekly) or 30 days (monthly) up to when it was sent, or up to now for a draft. */
export function reportPeriod(u: Update) {
  const to = u.sentAt ? new Date(u.sentAt).getTime() : Date.now();
  return { from: to - (u.kind === "monthly" ? 30 : 7) * DAY, to };
}

/** Everything done in the report's period, by the client and by the team, oldest first, grouped. Empty groups are left out. */
export function reportActivity(u: Update, activity: Activity[]) {
  const { from, to } = reportPeriod(u);
  const inPeriod = activity
    .filter((a) => {
      const t = new Date(a.at).getTime();
      return t >= from && t <= to;
    })
    .sort((a, b) => a.at.localeCompare(b.at));
  const groups = activityGroups
    .map((g) => ({ label: g.label, items: inPeriod.filter((a) => g.kinds.includes(a.kind)) }))
    .filter((g) => g.items.length > 0);
  return { groups, total: groups.reduce((n, g) => n + g.items.length, 0) };
}
