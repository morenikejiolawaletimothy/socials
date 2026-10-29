"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type MenuItem = { label: string; href?: string; onSelect?: () => void };

/** Small dropdown menu. Closes on outside click, Escape or selection. */
export function Menu({
  trigger,
  label,
  items,
  header,
  triggerClassName = "flex items-center rounded-full focus-visible:focus-ring",
  align = "end",
}: {
  trigger: React.ReactNode;
  label: string;
  items: MenuItem[];
  header?: React.ReactNode;
  triggerClassName?: string;
  /** Which edge of the trigger the menu lines up with. "start" for menus on the left of a card. */
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass =
    "block w-full rounded-sm px-3 py-2 text-left text-body-sm text-primary hover:bg-primary-50 focus-visible:focus-ring";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute ${align === "end" ? "right-0" : "left-0"} z-40 mt-2 w-60 rounded-md border border-border bg-card p-2 shadow-lg`}
        >
          {header && <div className="border-b border-border px-3 pb-3 pt-1 mb-2">{header}</div>}
          {items.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
