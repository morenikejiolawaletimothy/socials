/**
 * #47 Account manager performance report.
 *
 * Bluecut does not record or process manager pay on the platform — managers are
 * paid off the platform. The owner downloads this report as a guide for what to
 * pay: it gathers the performance numbers the platform does track, in one file.
 */

import type { Manager } from "./mock/types";

export type ReportInput = {
  /** Display name of the manager. */
  name: string;
  /** Number of clients currently assigned. */
  clients: number;
};

const gradeWord = (g: Manager["stats"]["avgGrade"]) => (g ? g : "not rated yet");

/** Builds the performance report as plain text and saves it to the owner's device. */
export function downloadManagerReport(m: Manager, input: ReportInput) {
  const active = m.status === "active";
  const now = new Date();
  const lines = [
    "BLUECUT SOCIALS — ACCOUNT MANAGER PERFORMANCE REPORT",
    `Manager: ${input.name}`,
    `Generated: ${now.toLocaleString()}`,
    `Status: ${m.status}`,
    "",
    "This report is a guide for pay, which is handled off the platform.",
    "Bluecut does not record manager payments.",
    "",
    "WORKLOAD",
    `  Clients: ${input.clients} of ${m.maxClients}`,
    "",
    "DELIVERY",
    `  On time this month: ${active ? `${m.stats.onTime}%` : "no data yet"}`,
    `  Approved first time: ${active ? `${m.stats.firstTimeApproval}%` : "no data yet"}`,
    `  Missed due times this month: ${active ? m.stats.missed : "no data yet"}`,
    "",
    "QUALITY",
    `  Average content grade: ${active ? gradeWord(m.stats.avgGrade) : "no data yet"}`,
    `  Responds to clients in: ${m.stats.responseHours != null ? `${m.stats.responseHours} hours` : "no data yet"}`,
    `  Open complaints: ${m.stats.complaints}`,
    "",
    "CONDUCT",
    `  Access strikes: ${m.stats.strikes ?? 0} of 2`,
    "",
  ];
  const href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const stamp = now.toISOString().slice(0, 10);
  const link = Object.assign(document.createElement("a"), {
    href,
    download: `bluecut-performance-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${stamp}.txt`,
  });
  link.click();
  URL.revokeObjectURL(href);
}
