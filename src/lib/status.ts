import type { ClientStatus, PostStatus } from "./mock/types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

/** One label and color for each client status, used everywhere. */
export const statusBadge: Record<ClientStatus, { label: string; tone: Tone }> = {
  "setting-up": { label: "Setting up", tone: "neutral" },
  free: { label: "Free 2 weeks", tone: "info" },
  active: { label: "Active", tone: "success" },
  paused: { label: "Paused", tone: "warning" },
  removed: { label: "Removed", tone: "danger" },
};


/** One label and colour for each post state, in plain words. Clients see the client labels; staff see more detail. */
export const postBadge: Record<PostStatus, { label: string; tone: Tone; staff?: string }> = {
  draft: { label: "Being written", tone: "neutral", staff: "Draft" },
  "manager-review": { label: "Being written", tone: "neutral", staff: "In your review" },
  "awaiting-client": { label: "Waiting for you", tone: "info", staff: "With the client" },
  "changes-requested": { label: "Changes asked", tone: "warning", staff: "Changes asked" },
  approved: { label: "Approved", tone: "success" },
  scheduled: { label: "Scheduled", tone: "success" },
  "on-hold": { label: "Held", tone: "warning" },
  published: { label: "Live", tone: "success" },
  failed: { label: "Did not post", tone: "danger", staff: "Failed" },
  "taken-down": { label: "Taken down", tone: "neutral" },
};
