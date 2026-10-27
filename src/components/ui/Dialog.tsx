"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

/**
 * Modal dialog on the native <dialog> element (focus trap and Escape for free).
 * `variant="sheet"` slides in from the left, used for the mobile menu.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  variant = "center",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
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
          {variant === "center" ? <h2 className="font-display text-display-xl text-primary">{title}</h2> : <span />}
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
