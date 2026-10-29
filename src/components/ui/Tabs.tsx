"use client";

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

/** Underline tabs, like LinkedIn's. Same active treatment as the top bar (brand blue with a short line). */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} onKeyDown={(e) => onTabKey(e, tabs.map((t) => t.value), value, onChange)} className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            data-tab={t.value}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.value)}
            className={`relative flex shrink-0 items-center gap-2 px-3 py-3 text-body-sm font-medium transition-colors focus-visible:focus-ring ${
              active ? "text-primary-700 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary-700" : "text-secondary hover:text-primary"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`rounded-full px-2 text-caption ${active ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-secondary"}`}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
