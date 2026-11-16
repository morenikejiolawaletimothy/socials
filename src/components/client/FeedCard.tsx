"use client";

import { Clock, Info } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { Badge, Tooltip } from "@/components/ui";

/** The status taxonomy from the Figma board, mapped to our badge tones. */
export type FeedStatus = "drafting" | "pending" | "changes" | "ready" | "completed";
export const feedStatus: Record<FeedStatus, { tone: "neutral" | "warning" | "danger" | "info" | "success"; label: string }> = {
  drafting: { tone: "neutral", label: "Drafting" },
  pending: { tone: "warning", label: "Pending review" },
  changes: { tone: "danger", label: "Changes requested" },
  ready: { tone: "info", label: "Ready for action" },
  completed: { tone: "success", label: "Done" },
};

/**
 * One item in the client's Home feed, matching the Figma task card: a status badge and time on top,
 * an icon chip with the title, the body (description/steps), an optional resource link, and one action.
 */
export function FeedCard({
  status,
  time,
  icon: IconCmp,
  title,
  info,
  children,
  resource,
  action,
}: {
  status: FeedStatus;
  time?: string;
  icon: Icon;
  title: string;
  info?: React.ReactNode;
  children?: React.ReactNode;
  resource?: { label: string; href: string };
  action?: React.ReactNode;
}) {
  const s = feedStatus[status];
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge status={s.tone}>{s.label}</Badge>
        {time && (
          <span className="flex items-center gap-1.5 text-caption text-secondary">
            <Clock className="size-4" aria-hidden />
            {time}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <IconCmp className="size-5" aria-hidden />
        </span>
        <h3 className="flex items-center gap-2 pt-2 text-body font-semibold text-primary">
          {title}
          {info && (
            <Tooltip label={typeof info === "string" ? info : "More about this"}>
              <span className="text-info"><Info className="size-4" aria-hidden /></span>
            </Tooltip>
          )}
        </h3>
      </div>

      {children && <div className="flex flex-col gap-2 text-body-sm text-secondary">{children}</div>}

      {resource && (
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <span className="text-body-sm font-medium text-primary">Task resource</span>
          <Link href={resource.href} className="break-all text-body-sm text-primary-700 hover:underline focus-visible:focus-ring">
            {resource.label}
          </Link>
        </div>
      )}

      {action && <div className="flex justify-end border-t border-border pt-3">{action}</div>}
    </article>
  );
}
