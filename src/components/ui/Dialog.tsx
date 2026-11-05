"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { InfoTip } from "./InfoTip";

/**
 * Modal dialog on the native <dialog> element (focus trap and Escape for free).
 * `variant="sheet"` slides in from the left, used for the mobile menu.
 */
export function Dialog({
  open,
  onClose,
  title,
  info,
  infoIcon,
  children,
  variant = "center",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Explains the action: an info icon after the title, with the text in a tooltip. */
  info?: React.ReactNode;
  /** Another icon for the info tooltip, such as a padlock for payment security. */
  infoIcon?: React.ComponentProps<typeof InfoTip>["icon"];
  children: React.ReactNode;
  variant?: "center" | "sheet";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const position =
    variant === "sheet"
      ? "m-0 h-dvh max-h-dvh w-80 max-w-full rounded-none rounded-r-lg"
      : "m-auto w-full max-w-md rounded-lg";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={`border border-border bg-card p-0 text-primary shadow-lg backdrop:bg-neutral-900/40 ${position}`}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          {variant === "center" ? (
            <div className="flex min-w-0 items-center gap-2">
              {/* Long titles stay on one line, cut with an ellipsis; the full title shows on hover. */}
              <h2 title={title} className="min-w-0 truncate font-display text-display-xl text-primary">
                {title}
              </h2>
              {info && (
                <InfoTip label={`About ${title}`} icon={infoIcon}>
                  {info}
                </InfoTip>
              )}
            </div>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-2 flex size-10 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
