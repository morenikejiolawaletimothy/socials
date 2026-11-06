/** A calendar event for a call: the title, when it starts (ISO), how long, and an optional join link and note. */
export type CalEvent = { title: string; start: string; minutes: number; url?: string; description?: string };

const stampUTC = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** The event's details line, with the join link added when we have it. */
function details({ url, description }: CalEvent) {
  return [description, url ? `Join on Google Meet: ${url}` : ""].filter(Boolean).join("\n\n");
}

/** One-click "add to Google Calendar" link, prefilled. Opens in a new tab. */
export function googleCalendarUrl(e: CalEvent) {
  const from = new Date(e.start);
  const to = new Date(from.getTime() + e.minutes * 60_000);
  const params = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${stampUTC(from)}/${stampUTC(to)}`, details: details(e), location: e.url ?? "" });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** One-click "add to Outlook" link, prefilled. Opens in a new tab. */
export function outlookCalendarUrl(e: CalEvent) {
  const from = new Date(e.start);
  const to = new Date(from.getTime() + e.minutes * 60_000);
  const params = new URLSearchParams({ path: "/calendar/action/compose", rru: "addevent", subject: e.title, startdt: from.toISOString(), enddt: to.toISOString(), body: details(e), location: e.url ?? "" });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Downloads a calendar file (.ics) for a call, which every calendar app can open (Apple Calendar and others).
 * Phase 2 also attaches the .ics to the confirmation email and sends a calendar invite.
 */
export function downloadCall({ title, start, minutes, url, description }: CalEvent) {
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
