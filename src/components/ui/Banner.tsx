"use client";

import { CheckCircle, Info, Warning, WarningCircle, X } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

type Tone = "info" | "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: "bg-info-bg border-primary-200", icon: "text-primary-600", Icon: Info },
  success: { box: "bg-success-bg border-success", icon: "text-success", Icon: CheckCircle },
  warning: { box: "bg-warning-bg border-warning", icon: "text-warning", Icon: Warning },
  danger: { box: "bg-danger-bg border-danger", icon: "text-danger", Icon: WarningCircle },
  neutral: { box: "bg-neutral-25 border-border", icon: "text-secondary", Icon: Info },
};

/** Notes closed during this visit. Kept in memory only, so a full page reload clears it. */
const closedThisVisit = new Set<string>();

/**
 * Notice: says what is happening and what to do next. Use it, not grey text, for anything the person
 * should act on or know before they act. With a title for page-level notices; without one for a short
 * note inside a card. The icon lines up with the first line of text.
 * Pass `closeKey` to let people close a note they have read; it stays closed until the page is reloaded.
 * Info notes (tone "info") can always be closed: without a `closeKey` they remember being closed by their title or text.
 * Keep warnings and errors open: only notes that explain how something works should be closeable.
 */
export function Banner({
  tone = "info",
  title,
  children,
  action,
  closeKey,
  className = "",
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  /** Shows a close button. It stays closed across tabs and pages until the page is reloaded. */
  closeKey?: string;
  className?: string;
}) {
  const t = tones[tone];
  // Info notes are always closeable. Their key falls back to the title or plain text, so a closed note stays closed on other pages.
  const closable = !!closeKey || tone === "info";
  const key = closeKey ?? (title || (typeof children === "string" ? children : undefined));
  const [closed, setClosed] = useState(() => (key ? closedThisVisit.has(key) : false));

  if (closed) return null;

  // Closed notes stay closed while the person moves around the app (tabs, pages) and come back on a full reload,
  // so the reminder returns while there is still something to do.
  const close = () => {
    if (key) closedThisVisit.add(key);
    setClosed(true);
  };

  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex flex-col gap-3 rounded-md border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8 ${t.box} ${className}`}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className={`flex shrink-0 items-center ${title ? "h-6" : "h-5"}`}>
          <t.Icon className={`size-5 ${t.icon}`} aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {title && <p className="text-body font-semibold text-neutral-900">{title}</p>}
          {children && <div className="text-body-sm text-neutral-700">{children}</div>}
        </div>
        {closable && !action && (
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={`-mr-1 flex size-6 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-neutral-900/5 hover:text-primary focus-visible:focus-ring ${title ? "" : "-my-0.5"}`}
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 pl-8 sm:pl-0">
          {action}
          {closable && (
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-6 items-center justify-center rounded-full text-secondary transition-colors hover:bg-neutral-900/5 hover:text-primary focus-visible:focus-ring"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
