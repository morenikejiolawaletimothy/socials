import type { ClientStatus } from "./mock/types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

/** One label and color for each client status, used everywhere. */
export const statusBadge: Record<ClientStatus, { label: string; tone: Tone }> = {
  "setting-up": { label: "Setting up", tone: "neutral" },
  free: { label: "Free 2 weeks", tone: "info" },
  active: { label: "Active", tone: "success" },
  paused: { label: "Paused", tone: "warning" },
  removed: { label: "Removed", tone: "danger" },
};
