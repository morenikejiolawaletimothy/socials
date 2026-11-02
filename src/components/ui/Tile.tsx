import Link from "next/link";

const box = "flex flex-col gap-4 rounded-md border border-border p-4";
const linked = "group transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:focus-ring";

/**
 * An item inside a card (a task, a post to review, a person, a call): hairline border, 16px padding.
 * With `href` the whole tile is the link and turns light blue on hover. `done` greys the background
 * for items that are finished but still listed (a sent connection request).
 */
export function Tile({
  href,
  done = false,
  className = "",
  children,
}: {
  href?: string;
  done?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const tone = done ? "bg-neutral-25" : "bg-card";
  if (href) {
    return (
      <Link href={href} className={`${box} ${linked} ${tone} ${className}`}>
        {children}
      </Link>
    );
  }
  return <div className={`${box} ${tone} ${className}`}>{children}</div>;
}

/**
 * The bottom row of a tile, under a divider: key info (Meta) on the left, the action on the right.
 * Inside a linked tile, pass the action as `TileAction` text so the tile stays one link.
 */
export function TileFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 group-hover:border-primary-200 ${className}`}>{children}</div>;
}

/** The action word at the bottom right of a linked tile ("Start", "Review", "View details"). Not its own link. */
export function TileAction({ children }: { children: React.ReactNode }) {
  return <span className="shrink-0 text-body-sm font-medium text-primary-600 group-hover:text-primary-700">{children}</span>;
}

/** A picture slot at the start of a tile, for an icon when there is no photo. Square matches a post thumbnail (64px), round matches a large avatar (56px). */
export function TileIcon({ children, round = false }: { children: React.ReactNode; round?: boolean }) {
  return (
    <span className={`flex shrink-0 items-center justify-center bg-primary-50 text-primary-700 group-hover:bg-card ${round ? "size-14 rounded-full" : "size-16 rounded-lg"}`}>
      {children}
    </span>
  );
}
