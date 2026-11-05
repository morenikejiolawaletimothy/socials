// Managers' open call slots (M10). Two kinds of slot key, read the same way everywhere:
// - a date and hour the manager picked on the calendar: "2026-11-12T10" (local time)
// - the older weekly pattern: "mon-morning" (every Monday morning), still used when a manager first signs up
// Screens call `slotTimes` to get real bookable times and never read the keys themselves.

const DAY = 86_400_000;
const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Bookable hours for each part of the day. Calls start on the hour; 12pm is lunch. */
export const dayParts = [
  { key: "morning", label: "Morning", hours: [9, 10, 11] },
  { key: "afternoon", label: "Afternoon", hours: [13, 14, 15, 16] },
  { key: "evening", label: "Evening", hours: [17, 18] },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-11-12": the local calendar date of a Date. */
export function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2026-11-12T10": one hour on one date. */
export function slotKey(d: Date, hour: number) {
  return `${dateKey(d)}T${pad(hour)}`;
}

const isDateSlot = (s: string) => /^\d{4}-\d{2}-\d{2}T\d{2}$/.test(s);

function slotDate(s: string) {
  const [y, m, rest] = s.split("-");
  const [d, h] = rest.split("T");
  return new Date(Number(y), Number(m) - 1, Number(d), Number(h));
}

/** Every open time from tomorrow up to `days` ahead, as ISO strings, oldest first. */
export function slotTimes(slots: string[], from: number, days = 14) {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const first = start.getTime() + DAY;
  const last = start.getTime() + (days + 1) * DAY;
  const out = new Set<string>();
  for (const s of slots.filter(isDateSlot)) {
    const t = slotDate(s).getTime();
    if (t >= first && t < last) out.add(new Date(t).toISOString());
  }
  const weekly = slots.filter((s) => !isDateSlot(s));
  for (let d = 1; d <= days; d++) {
    const date = new Date(start.getTime() + d * DAY);
    const wd = weekdays[date.getDay()];
    for (const s of weekly.filter((x) => x.startsWith(wd))) {
      for (const h of dayParts.find((p) => p.key === s.split("-")[1])?.hours ?? []) {
        const t = new Date(date);
        t.setHours(h, 0, 0, 0);
        out.add(t.toISOString());
      }
    }
  }
  return [...out].sort();
}

/** Turns a weekly pattern into calendar slots for the next `days` days, so the calendar shows them as open. */
export function weeklyToDates(slots: string[], from: number, days = 28) {
  const dated = slots.filter(isDateSlot);
  const times = slotTimes(slots.filter((s) => !isDateSlot(s)), from, days).map((iso) => {
    const d = new Date(iso);
    return slotKey(d, d.getHours());
  });
  return [...new Set([...dated, ...times])].sort();
}
