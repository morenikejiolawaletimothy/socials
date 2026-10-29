/**
 * Downloads a calendar file (.ics) for a call, which every calendar app can open.
 * Phase 2 also sends a Google Calendar invite from the manager's connected calendar.
 */
export function downloadCall({ title, start, minutes, url, description }: { title: string; start: string; minutes: number; url?: string; description?: string }) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const from = new Date(start);
  const to = new Date(from.getTime() + minutes * 60_000);
  const text = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bluecut Socials//Calls//EN",
    "BEGIN:VEVENT",
    `UID:${stamp(from)}-${Math.random().toString(36).slice(2)}@bluecut`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(from)}`,
    `DTEND:${stamp(to)}`,
    `SUMMARY:${text(title)}`,
    description ? `DESCRIPTION:${text(description)}` : "",
    url ? `LOCATION:${url}` : "",
    url ? `URL:${url}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${text(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const link = Object.assign(document.createElement("a"), { href, download: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics` });
  link.click();
  URL.revokeObjectURL(href);
}
