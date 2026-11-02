"use client";

import { useEffect, useRef } from "react";

/**
 * Keyboard for any tab row: Left and Right move to the next tab and select it, Home and End jump.
 * Only the selected tab is in the Tab order, as the ARIA tabs pattern expects.
 */
export function onTabKey<T extends string>(e: React.KeyboardEvent<HTMLElement>, values: T[], value: T, onChange: (v: T) => void) {
  const i = values.indexOf(value);
  const to = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? values.length - 1 : null;
  if (to === null) return;
  e.preventDefault();
  const next = values[(to + values.length) % values.length];
  onChange(next);
  const row = e.currentTarget;
  requestAnimationFrame(() => row.querySelector<HTMLElement>(`[data-tab="${next}"]`)?.focus());
}

/**
 * Segmented tabs, the same look as `Segmented` (manager Home's Feed / Board): a grey track with the
 * selected tab raised in white. The row scrolls sideways when the tabs do not fit (phones). `align="center"` centres them when they fit,
 * using auto margins so the first tab is never cut off when they do not. The selected tab scrolls into view.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  align = "start",
  showZero = false,
  className = "gap-1",
}: {
  /** `live` marks a "happening now" tab. Its count uses the same colours as the others. */
  tabs: { value: T; label: string; count?: number; live?: boolean }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  align?: "start" | "center";
  /** Show the count tag even when it is 0. */
  showZero?: boolean;
  className?: string;
}) {
  const row = useRef<HTMLDivElement>(null);

  // Keep the selected tab visible inside the row, without scrolling the page.
  useEffect(() => {
    const el = row.current;
    const tab = el?.querySelector<HTMLElement>(`[data-tab="${value}"]`);
    if (!el || !tab) return;
    const left = tab.offsetLeft - el.offsetLeft;
    if (left < el.scrollLeft) el.scrollTo({ left: left - 16, behavior: "smooth" });
    else if (left + tab.offsetWidth > el.scrollLeft + el.clientWidth) el.scrollTo({ left: left + tab.offsetWidth - el.clientWidth + 16, behavior: "smooth" });
  }, [value]);

  const centre = align === "center" ? "*:first:ml-auto *:last:mr-auto" : "";

  return (
    <div ref={row} role="tablist" aria-label={label} onKeyDown={(e) => onTabKey(e, tabs.map((t) => t.value), value, onChange)} className={`no-scrollbar inline-flex max-w-full overflow-x-auto rounded-md bg-neutral-100 p-1 ${centre} ${className}`}>
      {tabs.map((t) => {
        const active = t.value === value;
        const hasCount = t.count !== undefined && (t.count > 0 || showZero);
        const countTone = !t.count ? "bg-neutral-200 text-neutral-500" : active ? "bg-primary-600 text-inverse" : "bg-neutral-200 text-neutral-700";
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            data-tab={t.value}
            aria-selected={active}
            aria-label={t.count !== undefined ? `${t.label}, ${t.count}` : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.value)}
            className={`flex shrink-0 items-center gap-2 rounded-sm px-4 py-2 text-body-sm font-medium transition-colors focus-visible:focus-ring ${
              active ? "bg-card text-primary shadow-sm" : "text-secondary hover:text-primary"
            }`}
          >
            {t.label}
            {hasCount && <span className={`min-w-5 rounded-full px-2 text-center text-caption ${countTone}`}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
