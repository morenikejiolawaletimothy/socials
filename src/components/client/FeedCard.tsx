"use client";

import { Clock } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useLayoutEffect, useRef, useState } from "react";
import { Badge, InfoTip, TextButton } from "@/components/ui";

/** The five statuses from the Figma board. Every feed item, on both sides, uses one of them. */
export type FeedStatus = "drafting" | "pending" | "changes" | "ready" | "completed";
export const feedStatus: Record<FeedStatus, { tone: "neutral" | "warning" | "danger" | "info" | "success"; label: string }> = {
  drafting: { tone: "neutral", label: "Drafting" },
  pending: { tone: "warning", label: "Pending review" },
  changes: { tone: "danger", label: "Changes requested" },
  ready: { tone: "info", label: "Ready for action" },
  completed: { tone: "success", label: "Completed" },
};

/** Long bodies clamp to a few lines with "more", like the Figma card. */
function Clamp({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !open) setLong(el.scrollHeight > el.clientHeight + 2);
  }, [children, open]);
  return (
    <div className="flex flex-col items-start gap-1">
      <div ref={ref} className={`w-full whitespace-pre-line text-body-sm text-secondary ${open ? "" : "line-clamp-6"}`}>
        {children}
      </div>
      {(long || open) && <TextButton onClick={() => setOpen((o) => !o)}>{open ? "less" : "more"}</TextButton>}
    </div>
  );
}

/**
 * One item in the feed (Figma task card), used for posts, tasks, calls and notices on every side:
 * status badge and time, a divider, the icon chip and title, the body (clamped with "more"),
 * an optional task resource, then the actions on a grey band at the bottom.
 */
export function FeedCard({
  status,
  label,
  time,
  icon: IconCmp,
  title,
  info,
  children,
  resource,
  resourceInfo = "The file or link your account manager shared for this.",
  footer,
}: {
  status: FeedStatus;
  /** Overrides the badge text (for example "Booked" on a call), keeping the status colour. */
  label?: string;
  time?: string;
  icon: Icon;
  title: React.ReactNode;
  info?: React.ReactNode;
  children?: React.ReactNode;
  resource?: { label: string; href: string };
  resourceInfo?: string;
  footer?: React.ReactNode;
}) {
  const s = feedStatus[status];
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <Badge status={s.tone}>{label ?? s.label}</Badge>
          {time && (
            <span className="flex items-center gap-1 text-caption text-secondary">
              <Clock className="size-4 text-primary-600" aria-hidden />
              {time}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <IconCmp className="size-5" aria-hidden />
          </span>
          <h3 className="flex min-w-0 items-center gap-2 text-body font-semibold text-primary">
            <span className="min-w-0">{title}</span>
            {info && <InfoTip>{info}</InfoTip>}
          </h3>
        </div>

        {children && <Clamp>{children}</Clamp>}

        {resource && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <span className="flex items-center gap-2 text-body-sm font-medium text-primary">
              Task resource <InfoTip>{resourceInfo}</InfoTip>
            </span>
            <a href={resource.href} target="_blank" rel="noreferrer" className="break-all rounded-sm text-body-sm text-primary-700 underline underline-offset-2 hover:text-primary-800 focus-visible:focus-ring">
              {resource.label}
            </a>
          </div>
        )}
      </div>

      {footer && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-neutral-25 px-4 py-3">{footer}</div>}
    </article>
  );
}

/** Time slots offered on a call: chips you pick one of (Figma "Time slots"). Read-only when no onChange. */
export function SlotChips({ times, value, onChange, format }: { times: string[]; value?: string; onChange?: (t: string) => void; format: (t: string) => string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-sm font-medium text-primary">Time slots</span>
      <div className="flex flex-wrap gap-2" role={onChange ? "radiogroup" : undefined} aria-label="Time slots">
        {times.map((t) =>
          onChange ? (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={value === t}
              onClick={() => onChange(t)}
              className={`rounded-full border px-3 py-2 text-body-sm transition-colors focus-visible:focus-ring ${value === t ? "border-primary-600 bg-primary-50 font-medium text-primary-700" : "border-border-strong text-primary hover:border-primary-300"}`}
            >
              {format(t)}
            </button>
          ) : (
            <span key={t} className="rounded-full border border-border px-3 py-2 text-body-sm text-primary">
              {format(t)}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
