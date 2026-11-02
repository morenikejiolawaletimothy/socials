import type { Icon } from "@phosphor-icons/react";

/**
 * One line of key info with a blue icon: "Due Fri 6 Nov", "Goes live today · 9am", "Starts Thu 12 Nov".
 * Used in card headers (the action slot) and at the bottom left of tiles. Dates come from `dayIn`/`time` in lib/format.
 */
export function Meta({ icon: IconCmp, children, className = "" }: { icon: Icon; children: React.ReactNode; className?: string }) {
  return (
    <span className={`flex shrink-0 items-center gap-2 text-body-sm text-primary ${className}`}>
      <IconCmp className="size-4 shrink-0 text-primary-600" aria-hidden />
      {children}
    </span>
  );
}
