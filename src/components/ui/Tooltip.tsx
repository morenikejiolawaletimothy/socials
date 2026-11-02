/**
 * Short label that appears below an icon-only control on hover or keyboard focus.
 * The control itself must carry the accessible name (aria-label); the tooltip is visual only.
 */
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-dark px-2 py-1 text-caption text-inverse opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-hover/tooltip:delay-300 group-has-[:focus-visible]/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
