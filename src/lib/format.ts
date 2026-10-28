// Plain date, time and number formats used across the app. One place, so every screen says it the same way.

const DAY = 86_400_000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** "9am", "5:30pm". */
export function time(iso: string) {
  const d = new Date(iso);
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes();
  return `${h}${m ? `:${String(m).padStart(2, "0")}` : ""}${d.getHours() < 12 ? "am" : "pm"}`;
}

/** "Today", "Tomorrow", "Yesterday", "Thu 6 Nov". */
export function day(iso: string) {
  const diff = Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** For use mid-sentence: "today", "tomorrow", or "Thu 6 Nov". */
export function dayIn(iso: string) {
  const d = day(iso);
  return ["Today", "Tomorrow", "Yesterday"].includes(d) ? d.toLowerCase() : d;
}

/** Mid-sentence: "tomorrow at 5pm", "Thu 6 Nov at 9am". */
export function dayTimeIn(iso: string) {
  return `${dayIn(iso)} at ${time(iso)}`;
}

/** "Tomorrow at 5pm". */
export function dayTime(iso: string) {
  return `${day(iso)} at ${time(iso)}`;
}

/** "6 Nov 2026". */
export function date(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** "Just now", "5 min ago", "3 hours ago", "Yesterday", "Thu 6 Nov". */
export function ago(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "Just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)} min ago`;
  if (ms < DAY && day(iso) === "Today") {
    const h = Math.floor(ms / 3_600_000);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  return day(iso);
}

/** Mid-sentence: "just now", "3 hours ago", "yesterday", or "Thu 6 Nov". */
export function agoIn(iso: string) {
  const a = ago(iso);
  return ["Just now", "Yesterday", "Today"].includes(a) ? a.toLowerCase() : a;
}

/** Whole days from now (negative if past). */
export function daysFrom(iso: string) {
  return Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / DAY);
}

/** "8,420". */
export function num(n: number) {
  return n.toLocaleString("en-US");
}

/** "$800". */
export function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

export const fullName = (u?: { firstName: string; lastName: string }) => (u ? `${u.firstName} ${u.lastName}` : "");

/** "1 post", "3 posts". */
export const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
